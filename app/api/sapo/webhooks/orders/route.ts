import { NextRequest, NextResponse } from "next/server";
import { verifySapoWebhook, processWebhookPayload } from "@/packages/integrations/sapo/webhookService";

/**
 * POST /api/sapo/webhooks/orders
 * Endpoint chung cho orders webhooks — verify HMAC trên rawBody trước khi JSON.parse
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const hmacHeader = req.headers.get("x-sapo-hmac-sha256") || req.headers.get("X-Sapo-Hmac-Sha256") || "";
  const topic = req.headers.get("x-sapo-topic") || req.headers.get("X-Sapo-Topic") || "orders/create";

  if (!hmacHeader) {
    return NextResponse.json({ success: false, error: "Thiếu header X-Sapo-Hmac-Sha256" }, { status: 401 });
  }
  if (!verifySapoWebhook(rawBody, hmacHeader)) {
    return NextResponse.json({ success: false, error: "Chữ ký HMAC không hợp lệ" }, { status: 401 });
  }

  let payload: unknown;
  try {
    payload = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ success: false, error: "Body không phải JSON hợp lệ" }, { status: 400 });
  }

  const central = processWebhookPayload(topic, payload as Parameters<typeof processWebhookPayload>[1], rawBody);
  // Duplicate after dedup: still return 200 idempotently
  if (!central) {
    // Check if payload looked valid but was deduped
    const maybe = payload as Record<string, unknown>;
    const hasOrderId = typeof (maybe?.order as Record<string, unknown>)?.id === "number" || typeof maybe?.id === "number";
    if (hasOrderId) {
      return NextResponse.json({ success: true, topic, duplicate: true, message: "Webhook đã xử lý trước đó" }, { status: 200 });
    }
    return NextResponse.json({ success: false, error: "Payload không chứa SapoOrder hợp lệ" }, { status: 422 });
  }

  return NextResponse.json({ success: true, topic, central_order: central }, { status: 200 });
}

export async function GET() {
  return NextResponse.json({ success: true, message: "Sapo orders webhook endpoint — gửi POST với HMAC header" });
}
