import { NextRequest, NextResponse } from "next/server";
import { fetchEnrichedProducts } from "@/packages/integrations/sapo/productSync";

/**
 * GET /api/sapo/products
 * Lay danh sach san pham Sapo kem ma tran bang gia B2B 4 cap
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10) || 50, 100);
    const category = searchParams.get("category"); // MI_KHO | GA_POPCORN | VIEN_THA_LAU | TUONG_OT_XOT
    const search = (searchParams.get("search") || "").toLowerCase();

    let products = await fetchEnrichedProducts(limit);

    if (category) products = products.filter((p) => p.category === category);
    if (search) {
      products = products.filter(
        (p) => p.name.toLowerCase().includes(search) || p.sku.toLowerCase().includes(search),
      );
    }

    return NextResponse.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Loi lay danh sach san pham Sapo";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
