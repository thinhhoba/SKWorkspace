import { NextRequest, NextResponse } from "next/server";
import { generateZaloQuote } from "@/packages/modules/pricing/pricingService";
import type { PriceChannel } from "@/packages/modules/pricing/types";
import { PRICE_CHANNEL_LABEL } from "@/packages/modules/pricing/types";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const channel = body.channel as string | undefined;
    if (!channel || !(channel in PRICE_CHANNEL_LABEL)) {
      return NextResponse.json({ success: false, error: "Kênh không hợp lệ (nha_hang/bep_an/dai_ly/ban_le)" }, { status: 400 });
    }
    const text = generateZaloQuote(channel as PriceChannel);
    return NextResponse.json({ success: true, channel, text });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi sinh báo giá";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
