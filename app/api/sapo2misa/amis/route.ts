import { NextRequest, NextResponse } from "next/server";
import { fetchSapoOrders, normalizeToCentralOrders } from "@/packages/integrations/sapo/sapoClient";
import { syncOrderToAmis } from "@/packages/integrations/misa/amisOpenApiClient";
import type { CentralOrder } from "@/packages/integrations/sapo/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    let orders: CentralOrder[] = [];

    if (body && Array.isArray(body.orders) && body.orders.length > 0) {
      orders = body.orders as CentralOrder[];
    } else if (body && Array.isArray(body) && body.length > 0) {
      orders = body as CentralOrder[];
    } else {
      // Fallback: tự kéo từ Sapo nếu FE không gửi orders
      const sapoOrders = await fetchSapoOrders();
      orders = normalizeToCentralOrders(sapoOrders);
    }

    if (orders.length === 0) {
      return NextResponse.json({ success: false, error: "Không có đơn hàng để đồng bộ AMIS" }, { status: 400 });
    }

    const results = await Promise.all(orders.map((o) => syncOrderToAmis(o)));
    const vouchers = results.map((r, idx) => ({
      orderId: orders[idx].id,
      aliasCode: orders[idx].alias_code,
      orderCode: orders[idx].order_code,
      ...r,
    }));

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: true,
      count: successCount,
      total: orders.length,
      vouchers,
    });
  } catch (err: any) {
    console.error("[AMIS API ERROR]", err);
    return NextResponse.json({ success: false, error: err.message || "Lỗi đẩy AMIS Kế Toán" }, { status: 500 });
  }
}
