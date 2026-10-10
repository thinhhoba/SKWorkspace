import { NextRequest, NextResponse } from "next/server";
import { getStockTransfers, createStockTransfer, createInventoryAudit } from "@/packages/modules/inventory/inventoryService";

export async function GET() {
  try {
    return NextResponse.json({ success: true, transfers: getStockTransfers() });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const role = req.headers.get("x-user-role");
    if (role && role !== "ADMIN" && role !== "WAREHOUSE") {
      return NextResponse.json(
        { success: false, error: "Chỉ thủ kho và ban giám đốc mới có quyền lập phiếu điều chuyển hoặc kiểm kê kho" },
        { status: 403 }
      );
    }
    const body = await req.json();
    // Support audit: { audit: true, warehouse, items, note }
    if (body.audit) {
      const audit = createInventoryAudit({ warehouse: body.warehouse, items: body.items || [], note: body.note, createdBy: body.createdBy });
      return NextResponse.json({ success: true, message: `Đã lập phiếu kiểm kê ${audit.code}`, audit });
    }
    const { sku, quantity, from, to, note, createdBy } = body;
    if (!sku || !quantity || !from || !to) return NextResponse.json({ success: false, error: "Thiếu SKU/số lượng/kho xuất/kho nhận" }, { status: 400 });
    const transfer = createStockTransfer({ sku, quantity: Number(quantity), from, to, note, createdBy });
    return NextResponse.json({ success: true, message: `Đã tạo phiếu ${transfer.code}`, transfer });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Lỗi tạo phiếu" }, { status: 400 });
  }
}
