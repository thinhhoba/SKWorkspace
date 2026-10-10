import { NextRequest, NextResponse } from "next/server";
import { fetchSapoVariants, getLowStockWarnings, getOutOfStockVariants } from "@/packages/integrations/sapo/inventorySync";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(Math.max(parseInt(searchParams.get("limit") || "50", 10) || 50, 1), 250);
    const threshold = Math.max(parseInt(searchParams.get("threshold") || "10", 10) || 10, 1);

    const variants = await fetchSapoVariants(limit);
    const lowStock = getLowStockWarnings(variants, threshold);
    const outOfStock = getOutOfStockVariants(variants);

    return NextResponse.json({
      success: true,
      count: variants.length,
      variants,
      warnings: {
        low_stock_threshold: threshold,
        low_stock_count: lowStock.length,
        low_stock: lowStock,
        out_of_stock_count: outOfStock.length,
        out_of_stock: outOfStock,
      },
      synced_at: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi lấy tồn kho Sapo";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
