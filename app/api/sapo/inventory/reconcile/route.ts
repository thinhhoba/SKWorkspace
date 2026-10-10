import { NextRequest, NextResponse } from "next/server";
import { fetchSapoVariants, compareStockLevelsSync, WAREHOUSES } from "@/packages/integrations/sapo/inventorySync";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const warehouse = searchParams.get("warehouse") || "ALL"; // KHO_DINH_CONG | KHO_YEN_BINH | ALL
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10) || 50, 1), 250);

    // Tồn vật lý: nếu client gửi localInventory qua query (JSON), dùng nó; nếu không, lấy mặc định
    // Mặc định: thử lấy từ inventory module nếu có, fallback tạo bảng trống để đối soát với Sapo
    let localInventory: Array<{ sku: string; physicalQty: number }> = [];

    const localParam = searchParams.get("local");
    if (localParam) {
      try {
        const parsed = JSON.parse(localParam);
        if (Array.isArray(parsed)) {
          localInventory = parsed
            .filter((x) => x && typeof x.sku === "string")
            .map((x) => ({ sku: String(x.sku), physicalQty: Number(x.physicalQty ?? x.quantity ?? 0) }));
        }
      } catch {
        // ignore parse error
      }
    }

    const sapoVariants = await fetchSapoVariants(limit);
    const rows = compareStockLevelsSync(sapoVariants, localInventory);

    // Thống kê theo trạng thái
    const summary = {
      total_skus: rows.length,
      match: rows.filter((r) => r.status === "MATCH").length,
      over_stock: rows.filter((r) => r.status === "OVER_STOCK").length,
      under_stock: rows.filter((r) => r.status === "UNDER_STOCK").length,
      out_of_stock: rows.filter((r) => r.status === "OUT_OF_STOCK").length,
    };

    // Tổng chênh lệch
    const totalDiff = rows.reduce((sum, r) => sum + r.diff, 0);

    return NextResponse.json({
      success: true,
      warehouse,
      warehouses: WAREHOUSES,
      keeper: "TRẦN THỊ NGỌC THÚY",
      summary,
      total_diff: totalDiff,
      count: rows.length,
      rows,
      note: localInventory.length === 0
        ? "Chưa truyền tồn vật lý (query param 'local'). Đang hiển thị toàn bộ SKU Sapo với physicalQty=0 — hãy truyền local=[{sku, physicalQty}] để đối soát chính xác."
        : undefined,
      reconciled_at: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi đối soát tồn kho";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const warehouse = body.warehouse || "ALL";
    const localInventory: Array<{ sku: string; physicalQty: number }> = Array.isArray(body.localInventory)
      ? body.localInventory
          .filter((x: unknown) => x && typeof (x as { sku: unknown }).sku === "string")
          .map((x: { sku: string; physicalQty?: number; quantity?: number }) => ({
            sku: String(x.sku),
            physicalQty: Number(x.physicalQty ?? x.quantity ?? 0),
          }))
      : Array.isArray(body.items)
        ? body.items
            .filter((x: unknown) => x && typeof (x as { sku: unknown }).sku === "string")
            .map((x: { sku: string; physicalQty?: number; quantity?: number }) => ({
              sku: String(x.sku),
              physicalQty: Number(x.physicalQty ?? x.quantity ?? 0),
            }))
        : [];

    if (localInventory.length === 0) {
      return NextResponse.json(
        { success: false, error: "Thiếu localInventory hoặc items: [{ sku, physicalQty }]" },
        { status: 400 }
      );
    }

    const limit = Math.min(Math.max(Number(body.limit) || 50, 1), 250);
    const sapoVariants = await fetchSapoVariants(limit);
    const rows = compareStockLevelsSync(sapoVariants, localInventory);

    const summary = {
      total_skus: rows.length,
      match: rows.filter((r) => r.status === "MATCH").length,
      over_stock: rows.filter((r) => r.status === "OVER_STOCK").length,
      under_stock: rows.filter((r) => r.status === "UNDER_STOCK").length,
      out_of_stock: rows.filter((r) => r.status === "OUT_OF_STOCK").length,
    };

    return NextResponse.json({
      success: true,
      warehouse,
      warehouses: WAREHOUSES,
      keeper: "TRẦN THỊ NGỌC THÚY",
      summary,
      total_diff: rows.reduce((sum, r) => sum + r.diff, 0),
      count: rows.length,
      rows,
      reconciled_at: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi đối soát tồn kho";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
