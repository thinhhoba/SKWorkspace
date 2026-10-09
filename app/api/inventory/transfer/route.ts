import { NextRequest, NextResponse } from "next/server";
import { getStockTransfers, createStockTransfer } from "@/packages/modules/inventory/inventoryService";

export async function GET() {
  try {
    const transfers = getStockTransfers();
    return NextResponse.json({ success: true, transfers });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { sku, quantity, from, to, note, createdBy } = body;

    if (!sku || !quantity || !from || !to) {
      return NextResponse.json(
        { success: false, error: "Vui lòng nhập đầy đủ SKU, số lượng, kho xuất và kho nhận" },
        { status: 400 }
      );
    }

    const transfer = createStockTransfer({
      sku,
      quantity: Number(quantity),
      from,
      to,
      note,
      createdBy
    });

    return NextResponse.json({
      success: true,
      message: `Đã tạo phiếu điều chuyển ${transfer.code} thành công`,
      transfer
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Lỗi tạo phiếu điều chuyển kho" },
      { status: 400 }
    );
  }
}
