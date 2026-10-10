/**
 * SAPO WEBHOOK SERVICE — SK Workspace 2
 * Xác thực HMAC-SHA256 + chuẩn hóa SapoOrder → CentralOrder + log giám sát
 * Worker 2: HMAC timingSafeEqual, idempotency dedup, notifyDieuKho
 */
import crypto from "crypto";
import type { SapoOrder, CentralOrder } from "./types";
import { normalizeToCentralOrders } from "./sapoClient";
import type { SapoWebhookTopic, SapoWebhookLog, SapoWebhookPayload } from "./types";
import { upsertSapoOrder } from "../../modules/sales/salesService";

const WEBHOOK_SECRET = process.env.SAPO_API_SECRET || "e2cc59d4ace34a009a0704ab9f72a8b4";

// In-memory ring buffer cho webhook logs (tối đa 200 sự kiện)
const MAX_LOGS = 200;
const webhookLogs: SapoWebhookLog[] = [];
// Lưu CentralOrder đã chuẩn hóa gần nhất để GET /api/sapo/webhooks trả về
const processedOrders: CentralOrder[] = [];

// ---------------------------------------------------------------------------
// Idempotency dedup — ring buffer + Set cho O(1) lookup
// ---------------------------------------------------------------------------
const MAX_DEDUP = 500;
const DEDUP_TTL_MS = 10 * 60 * 1000; // 10 phút
interface DedupEntry { key: string; ts: number }
const dedupEntries: DedupEntry[] = [];
const dedupSet = new Set<string>();

function makeDedupKey(topic: string, orderId: number, rawBodyHash: string): string {
  return `${topic}:${orderId}:${rawBodyHash}`;
}

function hashRawBody(rawBody: string): string {
  return crypto.createHash("sha256").update(rawBody, "utf8").digest("hex").slice(0, 16);
}

function pruneDedup(): void {
  const now = Date.now();
  while (dedupEntries.length > 0 && now - dedupEntries[0].ts > DEDUP_TTL_MS) {
    const expired = dedupEntries.shift()!;
    dedupSet.delete(expired.key);
  }
  // Hard cap by size
  while (dedupEntries.length > MAX_DEDUP) {
    const oldest = dedupEntries.shift()!;
    dedupSet.delete(oldest.key);
  }
}

export function isDuplicateWebhook(topic: string, orderId: number, rawBody: string): boolean {
  pruneDedup();
  const key = makeDedupKey(topic, orderId, hashRawBody(rawBody));
  if (dedupSet.has(key)) return true;
  dedupEntries.push({ key, ts: Date.now() });
  dedupSet.add(key);
  return false;
}

/** For testing / manual clear */
export function clearDedup(): void {
  dedupEntries.length = 0;
  dedupSet.clear();
}

export function getDedupSize(): number {
  return dedupSet.size;
}

// ---------------------------------------------------------------------------
// Dieu-kho pub channel — in-memory event bus cho Chat #dieu-kho
// ---------------------------------------------------------------------------
export interface DieuKhoEvent {
  id: string;
  topic: SapoWebhookTopic;
  order_code: string;
  alias_code: string;
  channel: string;
  customer_name: string;
  total_amount: number;
  message: string;
  created_at: string;
  central_order?: CentralOrder;
}

const MAX_DIEU_KHO_EVENTS = 100;
const dieuKhoEvents: DieuKhoEvent[] = [];
type DieuKhoListener = (event: DieuKhoEvent) => void;
const dieuKhoListeners = new Set<DieuKhoListener>();

export function notifyDieuKho(order: CentralOrder, topic: SapoWebhookTopic = "orders/create"): DieuKhoEvent {
  const event: DieuKhoEvent = {
    id: `dk_${Date.now()}_${order.order_code}`,
    topic,
    order_code: order.order_code,
    alias_code: order.alias_code,
    channel: order.channel,
    customer_name: order.customer_name,
    total_amount: order.total_amount,
    message: `[Sapo ${topic}] Đơn #${order.order_code} (${order.alias_code}) — ${order.customer_name} — ${order.total_amount.toLocaleString("vi-VN")}đ — ${order.items.length} dòng hàng. Kênh: ${order.channel}.`,
    created_at: new Date().toISOString(),
    central_order: order,
  };
  dieuKhoEvents.unshift(event);
  if (dieuKhoEvents.length > MAX_DIEU_KHO_EVENTS) dieuKhoEvents.length = MAX_DIEU_KHO_EVENTS;
  // Notify in-memory subscribers
  for (const listener of dieuKhoListeners) {
    try { listener(event); } catch { /* ignore listener errors */ }
  }
  // Best-effort: persist to DB if ChatMessage / prisma available (dynamic import to avoid hard dep)
  tryPersistChatMessage(event).catch(() => {});
  return event;
}

async function tryPersistChatMessage(event: DieuKhoEvent): Promise<void> {
  try {
    const mod = await import("../../modules/chat/chatService").catch(() => null) as unknown as { createChatMessage?: (p: Record<string, unknown>) => Promise<unknown> } | null;
    if (mod?.createChatMessage) {
      await mod.createChatMessage({
        channelId: "dieu-kho",
        sender: "Sapo Bot",
        senderRole: "Hệ thống",
        text: event.message,
        metadata: { topic: event.topic, order_code: event.order_code, alias_code: event.alias_code },
      });
    }
  } catch { /* swallow */ }
}

export function getDieuKhoEvents(limit = 20): DieuKhoEvent[] {
  return dieuKhoEvents.slice(0, limit);
}

export function subscribeDieuKho(listener: DieuKhoListener): () => void {
  dieuKhoListeners.add(listener);
  return () => dieuKhoListeners.delete(listener);
}

export function clearDieuKhoEvents(): void {
  dieuKhoEvents.length = 0;
}

// ---------------------------------------------------------------------------
// HMAC verification — MUST use rawBody string, no JSON.parse before
// ---------------------------------------------------------------------------
/**
 * Xác thực chữ ký HMAC-SHA256 chuẩn Sapo.
 * Sapo gửi header X-Sapo-Hmac-Sha256 = base64(HMAC-SHA256(rawBody, secret))
 * @param rawBody - chuỗi raw body chưa parse (req.text())
 * @param hmacHeader - giá trị header X-Sapo-Hmac-Sha256
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
// Process webhook — with idempotency
// ---------------------------------------------------------------------------
export function processOrderWebhook(topic: string, orderData: SapoOrder, rawBody?: string): CentralOrder | null {
  // Idempotency: if rawBody provided, dedup by topic+orderId+bodyHash
  if (rawBody && isDuplicateWebhook(topic, orderData.id, rawBody)) {
    // Return already-processed central order if available
    const existing = processedOrders.find((o) => o.id === `SAPO-${orderData.order_number ?? orderData.code ?? orderData.id}`);
    if (existing) return existing;
    // Still return null to signal duplicate (caller should return 200 without re-processing)
    return null;
  }

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
    try {
      upsertSapoOrder(orderData);
    } catch (e) {
      console.warn("Failed to upsert order into salesStore from webhook:", e);
    }
    // Notify điều kho channel
    try { notifyDieuKho(central, topic as SapoWebhookTopic); } catch { /* ignore */ }
  }

  return central;
}

/**
 * Xử lý payload tổng quát (object có thể là SapoOrder hoặc { order: SapoOrder })
 * @param topic - webhook topic
 * @param payload - parsed JSON payload
 * @param rawBody - optional raw body for idempotency hashing
 */
export function processWebhookPayload(topic: string, payload: SapoWebhookPayload | SapoOrder, rawBody?: string): CentralOrder | null {
  const orderData = (payload as SapoWebhookPayload).order ?? (payload as SapoOrder);
  if (!orderData || typeof orderData.id !== "number") return null;
  return processOrderWebhook(topic, orderData as SapoOrder, rawBody);
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
