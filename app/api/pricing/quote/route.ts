import { NextRequest, NextResponse } from "next/server";
import { generateZaloQuote } from "@/packages/modules/pricing/pricingService";
import type { PriceChannel } from "@/packages/modules/pricing/types";
import { PRICE_CHANNEL_LABEL } from "@/packages/modules/pricing/types";

export const dynamic = "force-dynamic";

// In-memory store cho quotes B2B
interface QuoteCustomer {
  name: string;
  phone: string;
  address: string;
}

interface QuoteLine {
  sku: string;
  name: string;
  dvt: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

interface Quote {
  id: string;
  customer: QuoteCustomer;
  lines: QuoteLine[];
  total: number;
  note?: string;
  validUntil?: string;
  createdAt: string;
}

const quotesStore: Quote[] = [];

export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      quotes: quotesStore.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi lấy danh sách báo giá";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    // Legacy mode: {channel} → generateZaloQuote (compat)
    if (body.channel && typeof body.channel === "string") {
      const channel = body.channel;
      if (!(channel in PRICE_CHANNEL_LABEL)) {
        return NextResponse.json({ success: false, error: "Kênh không hợp lệ" }, { status: 400 });
      }
      const text = generateZaloQuote(channel as PriceChannel);
      return NextResponse.json({ success: true, channel, text });
    }

    // New mode: {customer, lines} → lưu quote B2B
    if (body.customer && Array.isArray(body.lines)) {
      const customer = body.customer as QuoteCustomer;
      const lines = body.lines as QuoteLine[];

      if (!customer.name || !customer.phone) {
        return NextResponse.json({ success: false, error: "Thiếu thông tin khách hàng (name, phone)" }, { status: 400 });
      }

      if (lines.length === 0) {
        return NextResponse.json({ success: false, error: "Báo giá phải có ít nhất 1 dòng sản phẩm" }, { status: 400 });
      }

      const total = lines.reduce((sum, line) => sum + line.lineTotal, 0);
      const today = new Date();
      const validUntil = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // +7 ngày

      const quote: Quote = {
        id: `QUO-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`,
        customer,
        lines,
        total,
        note: body.note,
        validUntil: validUntil.toLocaleDateString("vi-VN"),
        createdAt: new Date().toISOString(),
      };

      quotesStore.push(quote);

      return NextResponse.json({ success: true, quote });
    }

    return NextResponse.json({ success: false, error: "Body không hợp lệ — cần {channel} hoặc {customer, lines}" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi sinh báo giá";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
