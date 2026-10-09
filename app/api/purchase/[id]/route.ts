import { NextRequest, NextResponse } from "next/server";
import { getPurchaseOrderById, updatePurchaseStatus, receivePurchaseOrder } from "@/packages/modules/purchase/purchaseService";
import type { PurchaseStatus } from "@/packages/modules/purchase/types";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const order = getPurchaseOrderById(id);
    if (!order) return NextResponse.json({ success: false, error: "Không tìm thấy đơn mua" }, { status: 404 });
    return NextResponse.json({ success: true, order });
  } catch (err: unknown) {
    const m = err instanceof Error ? err.message : "Lỗi";
    return NextResponse.json({ success: false, error: m }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();

    // receive action
    if (body?.action === "receive") {
      const items = body.items as Array<{ itemId: string; received_quantity: number; lot_number: string; expiry_date: string; location: string }>;
      if (!Array.isArray(items) || items.length === 0) {
        return NextResponse.json({ success: false, error: "Thiếu danh sách món nhập kho" }, { status: 400 });
      }
      for (const it of items) {
        if (!it.lot_number?.trim() || !it.expiry_date?.trim()) {
          return NextResponse.json({ success: false, error: `Thiếu lot_number/expiry_date cho ${it.itemId}` }, { status: 400 });
        }
        if (!it.received_quantity || Number(it.received_quantity) <= 0) {
          return NextResponse.json({ success: false, error: `SL thực nhận không hợp lệ: ${it.itemId}` }, { status: 400 });
        }
      }
      try {
        const order = receivePurchaseOrder(
          id,
          items.map((it) => ({
            itemId: it.itemId,
            received_quantity: Number(it.received_quantity),
            lot_number: String(it.lot_number).trim(),
            expiry_date: String(it.expiry_date).trim(),
            location: String(it.location ?? "").trim(),
          })),
        );
        return NextResponse.json({ success: true, order, message: "Đã nhập kho & tăng tồn FEFO" });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Lỗi nhập kho";
        const s = msg.includes("Không tìm thấy") ? 404 : 400;
        return NextResponse.json({ success: false, error: msg }, { status: s });
      }
    }

    // status update
    const rawStatus: string | undefined = body?.status ?? body?.newStatus;
    if (typeof rawStatus === "string") {
      const valid: PurchaseStatus[] = ["draft", "ordered", "received", "cancelled"];
      if (!valid.includes(rawStatus as PurchaseStatus)) {
        return NextResponse.json({ success: false, error: "Trạng thái không hợp lệ" }, { status: 400 });
      }
      try {
        const order = updatePurchaseStatus(id, rawStatus as PurchaseStatus);
        return NextResponse.json({ success: true, order });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Lỗi cập nhật";
        const s = msg.includes("Không tìm thấy") ? 404 : 400;
        return NextResponse.json({ success: false, error: msg }, { status: s });
      }
    }

    return NextResponse.json({ success: false, error: "Body phải chứa action:'receive' (+items) hoặc status" }, { status: 400 });
  } catch (err: unknown) {
    const m = err instanceof Error ? err.message : "Lỗi cập nhật đơn mua";
    return NextResponse.json({ success: false, error: m }, { status: 400 });
  }
}
