import { NextRequest, NextResponse } from "next/server";
import { getWebhookLogs, getWebhookStatus, getProcessedOrders, verifySapoWebhook, signPayload, processWebhookPayload } from "@/packages/integrations/sapo/webhookService";

/**
 * GET /api/sapo/webhooks
 * Trả về trạng thái hoạt động + danh sách sự kiện webhook gần nhất
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const limit = Math.min(parseInt(searchParams.get("limit") || "20", 10) || 20, 100);
  const status = getWebhookStatus();
  const logs = getWebhookLogs(limit);
  const orders = getProcessedOrders(limit);
  return NextResponse.json({ success: true, status, logs, orders });
}

/**
 * POST /api/sapo/webhooks
 * Endpoint tổng hợp — nhận webhook bất kỳ topic nào, xác thực HMAC, chuẩn hóa
 * Hỗ trợ ?ping=1 để self-test không cần gọi ra ngoài
 */
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  // Self-test ping: POST ?ping=1 với body JSON tùy ý → trả về HMAC để FE tự kiểm
  if (searchParams.get("ping") === "1") {
    const rawBody = await req.text();
    let parsed: unknown = null;
    try { parsed = rawBody ? JSON.parse(rawBody) : { ping: true }; } catch { parsed = { raw: rawBody }; }
    const hmac = signPayload(rawBody || JSON.stringify(parsed));
    return NextResponse.json({ success: true, ping: true, hmac, payload: parsed });
  }

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
  try { payload = JSON.parse(rawBody); } catch {
    return NextResponse.json({ success: false, error: "Body không phải JSON hợp lệ" }, { status: 400 });
  }

  const central = processWebhookPayload(topic, payload as Parameters<typeof processWebhookPayload>[1]);

  return NextResponse.json({ success: true, topic, central_order: central }, { status: 200 });
}
