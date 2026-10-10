import { NextRequest, NextResponse } from "next/server";
import { fetchSapoOrders } from "@/packages/integrations/sapo/sapoClient";
import { groupOrdersByRoute } from "@/packages/integrations/sapo/fulfillmentSync";
import type { SapoOrder } from "@/packages/integrations/sapo/types";

/**
 * GET /api/sapo/fulfillment
 * Lấy danh sách đơn Sapo đang chờ giao, phân nhóm theo tuyến.
 * Query: ?status=pending|all  (mặc định lọc đơn chưa fulfilled)
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get("status") || "pending";
  const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10) || 50, 100);

  let orders: SapoOrder[];
  try {
    orders = await fetchSapoOrders({ limit });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ success: false, error: `Không thể lấy đơn Sapo: ${msg}` }, { status: 500 });
  }

  // Lọc đơn chờ giao: fulfillment_status != fulfilled nếu status=pending
  const filtered =
    statusFilter === "all"
      ? orders
      : orders.filter((o) => (o.fulfillment_status || "").toLowerCase() !== "fulfilled");

  // Nếu filter ra rỗng nhưng client muốn xem gom tuyến demo → fallback dùng toàn bộ orders để minh họa
  const toGroup = filtered.length > 0 ? filtered : orders;
  const grouped = groupOrdersByRoute(toGroup);

  return NextResponse.json({
    success: true,
    total: toGroup.length,
    filtered_status: statusFilter,
    grouped: {
      NOI_THANH_HN: grouped.NOI_THANH_HN,
      CHANH_XE_TINH: grouped.CHANH_XE_TINH,
      byStation: grouped.byStation,
      details: grouped.details.map((d) => ({
        route: d.route,
        station: d.station,
        stationLabel: d.stationLabel,
        count: d.orders.length,
        orders: d.orders,
      })),
    },
  });
}
