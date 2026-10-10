import { NextRequest, NextResponse } from "next/server";
import { getPricingItemBySku, updateItemPrice } from "@/packages/modules/pricing/pricingService";
import type { PriceChannel } from "@/packages/modules/pricing/types";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ sku: string }> }) {
  const { sku } = await params;
  const item = getPricingItemBySku(decodeURIComponent(sku));
  if (!item) return NextResponse.json({ success: false, error: "Không tìm thấy SKU" }, { status: 404 });
  return NextResponse.json({ success: true, item });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ sku: string }> }) {
  try {
    const { sku } = await params;
    const body = await req.json();
    const channel = body.channel as PriceChannel | undefined;
    const price = body.price as number | undefined;
    if (!channel || price === undefined) return NextResponse.json({ success: false, error: "Thiếu channel / price" }, { status: 400 });
    const result = updateItemPrice(decodeURIComponent(sku), channel, Number(price));
    return NextResponse.json({ success: true, item: result.item, warning: result.warning });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi cập nhật giá";
    const status = message.includes("Không tìm thấy") ? 404 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
