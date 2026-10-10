import { NextRequest, NextResponse } from "next/server";
import { pushStockToSapo } from "@/packages/integrations/sapo/inventorySync";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Hỗ trợ 2 dạng: { sku, quantity } hoặc { items: [{ sku, quantity }] }
    const items: Array<{ sku: string; quantity: number }> = [];

    if (Array.isArray(body.items)) {
      for (const it of body.items) {
        if (it?.sku) items.push({ sku: String(it.sku), quantity: Number(it.quantity) });
      }
    } else if (body.sku) {
      items.push({ sku: String(body.sku), quantity: Number(body.quantity ?? body.available ?? 0) });
    } else {
      return NextResponse.json(
        { success: false, error: "Thiếu sku hoặc items. Gửi { sku, quantity } hoặc { items: [{ sku, quantity }] }" },
        { status: 400 }
      );
    }

    if (items.length === 0) {
      return NextResponse.json({ success: false, error: "Danh sách SKU rỗng" }, { status: 400 });
    }

    if (items.length > 100) {
      return NextResponse.json({ success: false, error: "Tối đa 100 SKU mỗi lần đẩy" }, { status: 400 });
    }

    const results = [];
    for (const item of items) {
      const r = await pushStockToSapo(item.sku, item.quantity);
      results.push(r);
    }

    const successCount = results.filter((r) => r.success).length;

    return NextResponse.json({
      success: successCount === results.length,
      total: results.length,
      success_count: successCount,
      failed_count: results.length - successCount,
      results,
      pushed_at: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi đẩy tồn lên Sapo";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
