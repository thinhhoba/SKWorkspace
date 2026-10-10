import { NextRequest, NextResponse } from "next/server";
import { getSalesOrders, getSalesStats, createSalesOrder, ensureSalesSynced } from "@/packages/modules/sales/salesService";
import type { OrderStatus } from "@/packages/modules/sales/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = (searchParams.get("status") || "ALL") as OrderStatus | "ALL";
    const warehouse = (searchParams.get("warehouse") || "ALL") as "Q7" | "Q12" | "ALL";
    const search = searchParams.get("search") || undefined;
    const phone = searchParams.get("phone") || undefined;
    const forceRefresh = searchParams.get("refresh") === "1" || searchParams.get("sync") === "1";

    await ensureSalesSynced(forceRefresh);

    const orders = getSalesOrders({ status, warehouse, search, phone });
    const stats = getSalesStats();

    return NextResponse.json({ success: true, stats, count: orders.length, orders });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi lấy danh sách đơn hàng";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const headerChannel = req.headers.get("x-channel") || undefined;
    const {
      customer_name,
      customer_phone,
      warehouse,
      items,
      payment_method,
      delivery_address,
      notes,
      channel: bodyChannel,
    } = body as {
      customer_name?: string;
      customer_phone?: string;
      warehouse?: string;
      items?: { sku: string; name: string; quantity: number; unit_price: number; dvt: string; category?: string }[];
      payment_method?: string;
      delivery_address?: string;
      notes?: string;
      channel?: string;
    };

    const channel = bodyChannel || headerChannel;

    if (!customer_name || !warehouse || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { success: false, error: "Thiếu thông tin: customer_name, warehouse, items là bắt buộc" },
        { status: 400 },
      );
    }
    if (warehouse !== "Q7" && warehouse !== "Q12") {
      return NextResponse.json({ success: false, error: "Kho không hợp lệ (Q7/Q12)" }, { status: 400 });
    }

    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const created_at = now.toLocaleDateString("vi-VN");
    const delivery_date = tomorrow.toLocaleDateString("vi-VN");

    const mappedItems = items.map((it) => ({
      sku: String(it.sku),
      name: String(it.name),
      category: String(it.category ?? "Thịt tươi"),
      dvt: String(it.dvt ?? "kg"),
      quantity: Number(it.quantity),
      unit_price: Number(it.unit_price),
    }));

    for (const it of mappedItems) {
      if (!it.sku || !it.name || !it.quantity || !it.unit_price) {
        return NextResponse.json(
          { success: false, error: `Dòng hàng thiếu sku/name/quantity/unit_price: ${JSON.stringify(it)}` },
          { status: 400 },
        );
      }
      if (it.quantity <= 0 || it.unit_price < 0) {
        return NextResponse.json({ success: false, error: `Số lượng/giá không hợp lệ: ${it.sku}` }, { status: 400 });
      }
    }

    const order = createSalesOrder({
      code: "",
      customer_id: "KH-B2B-NEW",
      customer_name: String(customer_name),
      customer_phone: customer_phone ? String(customer_phone) : undefined,
      warehouse: warehouse as "Q7" | "Q12",
      total_amount: 0,
      paid_amount: 0,
      payment_method: (payment_method as "COD_VIETQR" | "DEBT_B2B" | "TRANSFER") ?? "COD_VIETQR",
      status: "cho_duyet",
      created_at,
      delivery_date,
      delivery_address: delivery_address ? String(delivery_address) : undefined,
      notes: notes ? String(notes) : undefined,
      items: mappedItems,
      channel: channel || "web_order",
    } as Parameters<typeof createSalesOrder>[0]);

    return NextResponse.json({ success: true, order, alias_code: order.code }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi tạo đơn hàng";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
