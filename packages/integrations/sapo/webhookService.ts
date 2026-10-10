/**
 * SAPO WEBHOOK SERVICE — SK Workspace 2
 * Xác thực HMAC-SHA256 + chuẩn hóa SapoOrder → CentralOrder + log giám sát
 */
import crypto from "crypto";
import type { SapoOrder, CentralOrder } from "./types";
import { normalizeToCentralOrders } from "./sapoClient";
import type { SapoWebhookTopic, SapoWebhookLog, SapoWebhookPayload } from "./types";

const WEBHOOK_SECRET = process.env.SAPO_API_SECRET || "e2cc59d4ace34a009a0704ab9f72a8b4";

// In-memory ring buffer cho webhook logs (tối đa 200 sự kiện)
const MAX_LOGS = 200;
const webhookLogs: SapoWebhookLog[] = [];
// Lưu CentralOrder đã chuẩn hóa gần nhất để GET /api/sapo/webhooks trả về
const processedOrders: CentralOrder[] = [];

// ---------------------------------------------------------------------------
// HMAC verification
// ---------------------------------------------------------------------------
/**
 * Xác thực chữ ký HMAC-SHA256 chuẩn Sapo.
 * Sapo gửi header X-Sapo-Hmac-Sha256 = base64(HMAC-SHA256(rawBody, secret))
 */
export function verifySapoWebhook(rawBody: string, hmacHeader: string): boolean {
  if (!hmacHeader || !rawBody) return false;
  try {
    const digest = crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody, "utf8").digest("base64");
    // timingSafeEqual yêu cầu cùng độ dài
    const a = Buffer.from(digest, "utf8");
    const b = Buffer.from(hmacHeader, "utf8");
    if (a.length !== b.length) return false;
    return crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Helper: tạo chữ ký HMAC cho self-test / ping
 */
export function signPayload(rawBody: string, secret: string = WEBHOOK_SECRET): string {
  return crypto.createHmac("sha256", secret).update(rawBody, "utf8").digest("base64");
}

// ---------------------------------------------------------------------------
// Process webhook
// ---------------------------------------------------------------------------
export function processOrderWebhook(topic: string, orderData: SapoOrder): CentralOrder | null {
  const normalized = normalizeToCentralOrders([orderData]);
  const central = normalized[0] ?? null;

  const log: SapoWebhookLog = {
    id: `wh_${Date.now()}_${orderData.id}`,
    topic: topic as SapoWebhookTopic,
    order_id: orderData.id,
    order_code: String(orderData.order_number || orderData.code || orderData.id),
    alias_code: central?.alias_code ?? "",
    channel: central?.channel ?? "quan_an",
    received_at: new Date().toISOString(),
    central_order: central ?? undefined,
    raw_payload: orderData as unknown as Record<string, unknown>,
  };

  webhookLogs.unshift(log);
  if (webhookLogs.length > MAX_LOGS) webhookLogs.length = MAX_LOGS;

  if (central) {
    processedOrders.unshift(central);
    if (processedOrders.length > MAX_LOGS) processedOrders.length = MAX_LOGS;
  }

  return central;
}

/**
 * Xử lý payload tổng quát (object có thể là SapoOrder hoặc { order: SapoOrder })
 */
export function processWebhookPayload(topic: string, payload: SapoWebhookPayload | SapoOrder): CentralOrder | null {
  const orderData = (payload as SapoWebhookPayload).order ?? (payload as SapoOrder);
  if (!orderData || typeof orderData.id !== "number") return null;
  return processOrderWebhook(topic, orderData as SapoOrder);
}

// ---------------------------------------------------------------------------
// Logs & status
// ---------------------------------------------------------------------------
export function getWebhookLogs(limit = 20): SapoWebhookLog[] {
  return webhookLogs.slice(0, limit);
}

export function getProcessedOrders(limit = 20): CentralOrder[] {
  return processedOrders.slice(0, limit);
}

export function getWebhookStatus() {
  return {
    active: true,
    shop_domain: "sonkhang.mysapo.net",
    secret_configured: !!WEBHOOK_SECRET,
    topics: ["orders/create", "orders/updated", "orders/paid", "orders/cancelled", "orders/fulfilled"] as SapoWebhookTopic[],
    total_received: webhookLogs.length,
    last_event_at: webhookLogs[0]?.received_at ?? null,
  };
}

export function clearWebhookLogs(): void {
  webhookLogs.length = 0;
  processedOrders.length = 0;
}
