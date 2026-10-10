import { NextRequest, NextResponse } from "next/server";
import { getPricingItems, getPricingStats } from "@/packages/modules/pricing/pricingService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "ALL";
    const search = searchParams.get("search") || undefined;
    const items = getPricingItems({ category, search });
    const stats = getPricingStats();
    return NextResponse.json({ success: true, stats, count: items.length, items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi lấy bảng giá";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
