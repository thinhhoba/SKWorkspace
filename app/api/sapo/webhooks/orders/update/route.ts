import { NextRequest, NextResponse } from "next/server";
import { verifySapoWebhook, processWebhookPayload } from "@/packages/integrations/sapo/webhookService";

/**
 * POST /api/sapo/webhooks/orders/update
 * Nhận cập nhật trạng thái đơn (chờ duyệt, đã thanh toán, đã hủy)
 */
export async function POST(req: NextRequest) {
  const rawBody = await req.text();
  const hmacHeader = req.headers.get("x-sapo-hmac-sha256") || req.headers.get("X-Sapo-Hmac-Sha256") || "";
  const topic = req.headers.get("x-sapo-topic") || req.headers.get("X-Sapo-Topic") || "orders/updated";

  if (!hmacHeader) {
    return NextResponse.json({ success: false, error: "Thiếu header X-Sapo-Hmac-Sha256" }, { status: 401 });
  }
  if (!verifySapoWebhook(rawBody, hmacHeader)) {
    return NextResponse.json({ success: false, error: "Chữ ký HMAC không hợp lệ" }, { status: 401 });
  }

  let payload: unknown;
  try { payload = JSON.parse(rawBody); } catch {
    return NextResponse.json({ success: false, error: "Body không phải JSON hợp lệ" }, { status: 400 });
  }

  const central = processWebhookPayload(topic, payload as Parameters<typeof processWebhookPayload>[1]);
  if (!central) {
    return NextResponse.json({ success: false, error: "Payload không chứa SapoOrder hợp lệ" }, { status: 422 });
  }

  return NextResponse.json({ success: true, topic, central_order: central }, { status: 200 });
}
