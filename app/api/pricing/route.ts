import { NextRequest, NextResponse } from "next/server";
import { getPricingItems, getPricingStats } from "@/packages/modules/pricing/pricingService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "ALL";
    const search = searchParams.get("search") || undefined;
    
    // RBAC: Chỉ ADMIN và ACCOUNTANT mới được xem giá vốn (cost_price) và biên lợi nhuận
    const role = req.headers.get("x-user-role");
    const isFinancialRole = role === "ADMIN" || role === "ACCOUNTANT";

    const rawItems = getPricingItems({ category, search });
    const items = rawItems.map((item) => {
      if (isFinancialRole) return item;
      // Shielding giá vốn đối với nhân viên sales / kho / tài xế
      const { cost_price: _cost, min_margin_pct: _margin, ...publicItem } = item;
      return publicItem;
    });

    const rawStats = getPricingStats();
    const stats = isFinancialRole
      ? rawStats
      : {
          total_skus: rawStats.total_skus,
          avg_margin_pct: 0, // Che giấu tỷ suất lợi nhuận
          fresh_meat_count: rawStats.fresh_meat_count,
          frozen_meat_count: rawStats.frozen_meat_count,
          last_updated: rawStats.last_updated,
        };

    return NextResponse.json({ success: true, stats, count: items.length, items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi lấy bảng giá";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
