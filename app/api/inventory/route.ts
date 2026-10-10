import { NextRequest, NextResponse } from "next/server";
import { getInventoryList, getWarehouseMetrics, getFefoWarnings } from "@/packages/modules/inventory/inventoryService";
import { WarehouseCode, StorageTempZone, StockStatus } from "@/packages/modules/inventory/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const warehouse = (searchParams.get("warehouse") || "ALL") as WarehouseCode | "ALL";
    const tempZone = (searchParams.get("tempZone") || "ALL") as StorageTempZone | "ALL";
    const status = (searchParams.get("status") || "ALL") as StockStatus | "ALL";
    const search = searchParams.get("search") || "";
    const items = getInventoryList({ warehouse, tempZone, status, search });
    const metrics = getWarehouseMetrics();
    const fefo = getFefoWarnings(30);
    return NextResponse.json({ success: true, metrics, count: items.length, items, fefo_count: fefo.length });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message || "Lỗi lấy dữ liệu kho lạnh" }, { status: 500 });
  }
}
