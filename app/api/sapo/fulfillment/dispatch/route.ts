import { NextRequest, NextResponse } from "next/server";
import { fetchSapoOrders } from "@/packages/integrations/sapo/sapoClient";
import {
  groupOrdersByRoute,
  generateChanhXePackingSlip,
  DRIVER_INFO,
} from "@/packages/integrations/sapo/fulfillmentSync";
import { generateBusinessCode } from "@/packages/core/aliases";

/**
 * POST /api/sapo/fulfillment/dispatch
 * Gom các đơn Sapo đã chọn thành chuyến giao SK-DO-... cho tài xế Ngô Văn Tân.
 * Body: { orderIds: number[] }  — danh sách Sapo order id
 * Nếu không truyền orderIds → gom tất cả đơn pending hiện tại.
 */
export async function POST(req: NextRequest) {
  let body: { orderIds?: number[] } = {};
  try {
    const text = await req.text();
    if (text) body = JSON.parse(text) as typeof body;
  } catch {
    return NextResponse.json({ success: false, error: "Body JSON không hợp lệ" }, { status: 400 });
  }

  let orders = await fetchSapoOrders({ limit: 100 });

  if (body.orderIds && body.orderIds.length > 0) {
    const idSet = new Set(body.orderIds);
    orders = orders.filter((o) => idSet.has(o.id));
    if (orders.length === 0) {
      return NextResponse.json({ success: false, error: "Không tìm thấy đơn nào khớp orderIds" }, { status: 404 });
    }
  } else {
    // Mặc định lấy đơn chưa fulfilled
    const pending = orders.filter((o) => (o.fulfillment_status || "").toLowerCase() !== "fulfilled");
    if (pending.length > 0) orders = pending;
  }

  const seq = Math.floor(Math.random() * 9000) + 1;
  const deliveryCode = generateBusinessCode("DELIVERY_ORDER", seq);

  const grouped = groupOrdersByRoute(orders);
  const packingSlips = orders.map((o) => generateChanhXePackingSlip(o));

  return NextResponse.json({
    success: true,
    deliveryCode,
    driver: DRIVER_INFO,
    totalOrders: orders.length,
    grouped: {
      noiThanhCount: grouped.NOI_THANH_HN.length,
      chanhXeCount: grouped.CHANH_XE_TINH.length,
      byStation: grouped.byStation,
      details: grouped.details.map((d) => ({
        route: d.route,
        station: d.station,
        stationLabel: d.stationLabel,
        count: d.orders.length,
      })),
    },
    packingSlips,
    orders: orders.map((o) => ({
      id: o.id,
      code: o.order_number || o.code || o.name,
      customer: o.customer?.name,
      address: o.customer?.address,
      total: o.total_price,
    })),
  });
}
