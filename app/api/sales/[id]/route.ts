import { NextRequest, NextResponse } from "next/server";
import {
  getSalesOrderById,
  updateOrderStatus,
  toggleItemPicked,
  completeOrderPicking,
} from "@/packages/modules/sales/salesService";
import type { OrderStatus } from "@/packages/modules/sales/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const order = getSalesOrderById(id);
    if (!order) {
      return NextResponse.json({ success: false, error: "Không tìm thấy đơn hàng" }, { status: 404 });
    }
    return NextResponse.json({ success: true, order });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi lấy đơn hàng";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await req.json();

    // 1) action: complete -> completeOrderPicking
    if (body?.action === "complete") {
      try {
        const order = completeOrderPicking(id);
        return NextResponse.json({ success: true, order, message: "Đã soạn xong - san sang giao" });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Loi hoan tat soan hang";
        const status = msg.includes("Không tìm thấy") ? 404 : 400;
        return NextResponse.json({ success: false, error: msg }, { status });
      }
    }

    // 2) toggle picked: support both { itemId, picked } and { action:"toggle", itemId, picked }
    if (typeof body?.itemId === "string" && (body.action === "toggle" || "picked" in body)) {
      const picked = Boolean(body.picked);
      try {
        const order = toggleItemPicked(id, body.itemId, picked);
        return NextResponse.json({ success: true, order });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Loi cap nhat dong hang";
        const status = msg.includes("Không tìm thấy") ? 404 : 400;
        return NextResponse.json({ success: false, error: msg }, { status });
      }
    }

    // 3) status -> updateOrderStatus (support { status } and { newStatus } and { action:"status", status })
    const rawStatus: string | undefined = body?.status ?? body?.newStatus;
    if (typeof rawStatus === "string") {
      const valid: OrderStatus[] = ["cho_duyet", "cho_soan", "dang_soan", "da_soan", "dang_giao", "hoan_tat", "huy"];
      if (!valid.includes(rawStatus as OrderStatus)) {
        return NextResponse.json({ success: false, error: "Trang thai khong hop le" }, { status: 400 });
      }
      try {
        const order = updateOrderStatus(id, rawStatus as OrderStatus);
        return NextResponse.json({ success: true, order });
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : "Loi cap nhat trang thai";
        const httpStatus = msg.includes("Không tìm thấy") ? 404 : 400;
        return NextResponse.json({ success: false, error: msg }, { status: httpStatus });
      }
    }

    return NextResponse.json(
      { success: false, error: "Body phai chua status | itemId+picked | action:'complete'" },
      { status: 400 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi cập nhật đơn hàng";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
