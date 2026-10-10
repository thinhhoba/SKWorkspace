import { SapoOrder, CentralOrder, SapoOrderChannel } from "./types";
import { generateBusinessCode, BusinessScope } from "@/packages/core/aliases";

const DEFAULT_SAPO_ENDPOINT = "https://sonkhang.mysapo.net/admin/orders.json";
const DEFAULT_SAPO_API_KEY = "0166bd3c4bb745edb301413aec771b2b";
const DEFAULT_SAPO_API_SECRET = "e2cc59d4ace34a009a0704ab9f72a8b4";

/**
 * Fetch orders trực tiếp từ Live Sapo API qua Basic Auth.
 * Khi offline hoặc lỗi mạng, trả về [] (không trả dữ liệu mẫu giả lập).
 */
export async function fetchSapoOrders(options?: {
  sinceDate?: string;
  limit?: number;
}): Promise<SapoOrder[]> {
  const apiKey = process.env.SAPO_API_KEY || DEFAULT_SAPO_API_KEY;
  const apiSecret = process.env.SAPO_API_SECRET || DEFAULT_SAPO_API_SECRET;
  const baseUrl = process.env.SAPO_API_URL || DEFAULT_SAPO_ENDPOINT;
  const limit = options?.limit || 50;

  try {
    const authHeader = "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const fetchUrl = `${baseUrl.replace(/\/admin\/orders\.json.*$/, "")}/admin/orders.json?limit=${limit}`;

    const res = await fetch(fetchUrl, {
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.orders)) {
        return data.orders;
      }
    } else {
      console.warn(`[SAPO API] Phản hồi HTTP ${res.status}`);
    }
  } catch (err) {
    console.warn("[SAPO API] Không thể kết nối live API Sapo:", err);
  }

  return [];
}

/**
 * Phân loại kênh bán hàng từ nguồn đơn Sapo (source_name, note, address)
 */
export function inferOrderChannel(order: SapoOrder): { channel: SapoOrderChannel; scope: BusinessScope } {
  const src = (order.source_name || "").toLowerCase();
  const note = (order.note || "").toLowerCase();
  const addr = (order.customer?.address || order.customer?.default_address?.address1 || "").toLowerCase();

  if (src === "web" || src === "website" || src === "web_order") {
    return { channel: "web_order", scope: "SALES_WEB" };
  }
  if (src === "pos" || src === "retail") {
    return { channel: "pos", scope: "SALES_POS" };
  }
  if (note.includes("chành xe") || note.includes("gửi xe") || addr.includes("bến xe") || addr.includes("tỉnh") || addr.includes("nam định") || addr.includes("hải phòng") || addr.includes("quảng ninh") || addr.includes("bắc ninh")) {
    return { channel: "dai_ly", scope: "SALES_DAI_LY" };
  }
  if (note.includes("căn tin") || note.includes("trường học") || note.includes("bếp ăn")) {
    return { channel: "bep_an", scope: "SALES_BEP_AN" };
  }
  if (note.includes("quán") || note.includes("xiên bẩn") || note.includes("mì trộn") || addr.includes("hà nội")) {
    return { channel: "quan_an", scope: "SALES_QUAN_AN" };
  }

  return { channel: "quan_an", scope: "SALES_GENERAL" };
}

/**
 * Chuẩn hóa Sapo Orders thành Central Orders chuẩn SK Workspace
 */
export function normalizeToCentralOrders(sapoOrders: SapoOrder[]): CentralOrder[] {
  const now = new Date();
  const dateStr = now.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return sapoOrders.map((so, idx) => {
    const code = String(so.order_number || so.code || so.name || so.id);
    const { channel, scope } = inferOrderChannel(so);
    const aliasCode = generateBusinessCode(scope, so.order_number || idx + 1);

    const custName = so.customer
      ? so.customer.name || `${so.customer.first_name || ""} ${so.customer.last_name || ""}`.trim()
      : "Khách lẻ vãng lai";

    const custAddr = so.customer
      ? so.customer.address || so.customer.default_address?.address1 || "Hà Nội, Việt Nam"
      : "Tại kho Định Công, Hà Nội";

    return {
      id: `SAPO-${code}`,
      order_code: code,
      alias_code: aliasCode,
      business_scope: scope,
      channel,
      created_date: so.created_at ? new Date(so.created_at).toLocaleDateString("vi-VN") : dateStr,
      accounting_date: dateStr,
      customer_code: so.customer?.code || `KH-${so.customer?.id || "LE"}`,
      customer_name: custName,
      customer_tax_code: so.customer?.tax_number || "",
      customer_address: custAddr,
      customer_phone: so.customer?.phone || so.customer?.default_address?.phone || "",
      branch: "Kho Định Công (HN)",
      items: (so.line_items || []).map((li) => ({
        sku: li.sku || "UNKNOWN-SKU",
        name: li.product_name || li.name || "Sản phẩm Sơn Khang",
        dvt: li.unit || "Gói",
        quantity: li.quantity,
        price: li.price,
        tax_rate: `${li.tax_rate ?? 8}%`,
        lot_number: `L${code}`,
        expiry_date: "10/10/2027",
      })),
      total_amount: so.total_price,
      note: so.note || `Đơn hàng Sapo #${code}`,
      source: "Sapo",
      sync_status: "pending",
      last_synced_at: new Date().toISOString(),
    };
  });
}

function getSapoAuthHeaders() {
  const apiKey = process.env.SAPO_API_KEY || DEFAULT_SAPO_API_KEY;
  const apiSecret = process.env.SAPO_API_SECRET || DEFAULT_SAPO_API_SECRET;
  return {
    Authorization: "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64"),
    "Content-Type": "application/json",
  };
}

/**
 * Tạo mới đơn hàng trực tiếp trên Sapo API (Đồng bộ 2 chiều)
 */
export async function createSapoOrder(orderPayload: any): Promise<{ success: boolean; order?: SapoOrder; error?: string }> {
  const baseUrl = process.env.SAPO_API_URL || DEFAULT_SAPO_ENDPOINT;
  const url = `${baseUrl.replace(/\/admin\/.*$/, "")}/admin/orders.json`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: getSapoAuthHeaders(),
      body: JSON.stringify({ order: orderPayload }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.order) {
      return { success: true, order: data.order };
    }
    return { success: false, error: data.error || data.errors || `Sapo HTTP ${res.status}` };
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi kết nối Sapo API" };
  }
}

/**
 * Cập nhật đơn hàng trên Sapo API (Đồng bộ 2 chiều)
 */
export async function updateSapoOrder(orderId: number, orderPayload: any): Promise<{ success: boolean; order?: SapoOrder; error?: string }> {
  const baseUrl = process.env.SAPO_API_URL || DEFAULT_SAPO_ENDPOINT;
  const url = `${baseUrl.replace(/\/admin\/.*$/, "")}/admin/orders/${orderId}.json`;

  try {
    const res = await fetch(url, {
      method: "PUT",
      headers: getSapoAuthHeaders(),
      body: JSON.stringify({ order: orderPayload }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok && data.order) {
      return { success: true, order: data.order };
    }
    return { success: false, error: data.error || data.errors || `Sapo HTTP ${res.status}` };
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi kết nối Sapo API" };
  }
}

/**
 * Hủy đơn hàng trên Sapo API (Đồng bộ 2 chiều)
 */
export async function cancelSapoOrder(orderId: number, reason: string = "customer"): Promise<{ success: boolean; error?: string }> {
  const baseUrl = process.env.SAPO_API_URL || DEFAULT_SAPO_ENDPOINT;
  const url = `${baseUrl.replace(/\/admin\/.*$/, "")}/admin/orders/${orderId}/cancel.json`;

  try {
    const res = await fetch(url, {
      method: "POST",
      headers: getSapoAuthHeaders(),
      body: JSON.stringify({ reason }),
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      return { success: true };
    }
    return { success: false, error: data.error || data.errors || `Sapo HTTP ${res.status}` };
  } catch (err: any) {
    return { success: false, error: err.message || "Lỗi kết nối Sapo API" };
  }
}
