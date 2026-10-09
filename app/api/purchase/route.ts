import { NextRequest, NextResponse } from "next/server";
import { getPurchaseOrders, getPurchaseStats, createPurchaseOrder, getSuppliers } from "@/packages/modules/purchase/purchaseService";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") || "ALL") as "draft" | "ordered" | "received" | "cancelled" | "ALL";
    const warehouse = (searchParams.get("warehouse") || "ALL") as "Q7" | "Q12" | "ALL";
    const search = searchParams.get("search") || undefined;
    const orders = getPurchaseOrders({ status, warehouse, search });
    const stats = getPurchaseStats();
    const suppliers = getSuppliers();
    return NextResponse.json({ success: true, stats, suppliers, count: orders.length, orders });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi lấy danh sách đơn mua";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { supplier_id, warehouse, items, invoice_no, notes } = body as {
      supplier_id?: string;
      warehouse?: string;
      items?: { sku: string; name: string; quantity: number; unit_price: number; dvt: string }[];
      invoice_no?: string;
      notes?: string;
    };
    if (!supplier_id || !warehouse || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ success: false, error: "Thiếu supplier_id / warehouse / items" }, { status: 400 });
    }
    if (warehouse !== "Q7" && warehouse !== "Q12") {
      return NextResponse.json({ success: false, error: "Kho không hợp lệ (Q7/Q12)" }, { status: 400 });
    }
    const mapped = items.map((it) => ({
      sku: String(it.sku),
      name: String(it.name),
      dvt: String(it.dvt ?? "kg"),
      quantity: Number(it.quantity),
      unit_price: Number(it.unit_price),
    }));
    for (const it of mapped) {
      if (!it.sku || !it.name || !it.quantity || it.unit_price < 0) {
        return NextResponse.json({ success: false, error: `Dòng hàng thiếu sku/name/quantity/unit_price: ${JSON.stringify(it)}` }, { status: 400 });
      }
      if (it.quantity <= 0) return NextResponse.json({ success: false, error: `Số lượng không hợp lệ: ${it.sku}` }, { status: 400 });
    }
    const suppliers = getSuppliers();
    const sup = suppliers.find((s) => s.id === supplier_id);
    if (!sup) return NextResponse.json({ success: false, error: "Nhà cung cấp không tồn tại" }, { status: 400 });

    const order = createPurchaseOrder({
      supplier_id: sup.id,
      supplier_name: sup.name,
      warehouse: warehouse as "Q7" | "Q12",
      paid_amount: 0,
      order_date: new Date().toLocaleDateString("vi-VN"),
      invoice_no: invoice_no ? String(invoice_no) : undefined,
      notes: notes ? String(notes) : undefined,
      items: mapped as unknown as Parameters<typeof createPurchaseOrder>[0]["items"],
    });
    return NextResponse.json({ success: true, order }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi tạo đơn mua";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
