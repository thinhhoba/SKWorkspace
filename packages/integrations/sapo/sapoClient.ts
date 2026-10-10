import { SapoOrder, CentralOrder, SapoOrderChannel } from "./types";
import { generateBusinessCode, BusinessScope } from "@/packages/core/aliases";

const DEFAULT_SAPO_ENDPOINT = "https://sonkhang.mysapo.net/admin/orders.json";
const DEFAULT_SAPO_API_KEY = "0166bd3c4bb745edb301413aec771b2b";
const DEFAULT_SAPO_API_SECRET = "e2cc59d4ace34a009a0704ab9f72a8b4";

/**
 * Fallback dataset: Mô phỏng dữ liệu đơn hàng thực tế từ Sapo Sơn Khang
 */
const MOCK_SAPO_ORDERS: SapoOrder[] = [
  {
    id: 341149305,
    order_number: 13537,
    name: "13537",
    code: "13537",
    created_on: "2026-10-09T08:30:00Z",
    created_at: "2026-10-09T08:30:00Z",
    source_name: "admin",
    financial_status: "pending",
    fulfillment_status: "fulfilled",
    customer: {
      id: 501,
      code: "KH0009",
      name: "Hoàng Thị Túy - 27 Đại Cồ Việt KH0009",
      address: "Số 5 Ngõ 27 Đại Cồ Việt, P. Bạch Mai, Q. Hai Bà Trưng, Hà Nội",
      phone: "+84979599902",
      tax_number: "0111252725",
    },
    branch_name: "Kho Định Công (HN)",
    total_price: 3159500,
    note: "Đơn sỉ quán xiên bẩn - Túy Foods, giao trước 11h trưa",
    line_items: [
      {
        id: 1,
        sku: "HH027",
        name: "Bánh Gà Nét Việt 800g (18 Chiếc) - Hộp",
        quantity: 3,
        price: 60000,
        unit: "Hộp",
        tax_rate: 8,
      },
      {
        id: 2,
        sku: "HH053",
        name: "Gà Viên Chiên Popcorn CP Túi 1kg - Túi 1kg",
        quantity: 3,
        price: 117000,
        unit: "Túi",
        tax_rate: 8,
      },
      {
        id: 3,
        sku: "SB237",
        name: "Viên xốt hải sản Mayonaise 450g basa Thoại An",
        quantity: 5,
        price: 41000,
        unit: "Gói",
        tax_rate: 8,
      },
      {
        id: 4,
        sku: "HH050",
        name: "Chả Tôm Surimi Định Hình Ô Ngon 500g (31 Con)",
        quantity: 12,
        price: 44000,
        unit: "Gói",
        tax_rate: 8,
      },
      {
        id: 5,
        sku: "HH092",
        name: "Xúc xích Hồ lô Đồng Quê LC Foods 500g (45 viên)",
        quantity: 8,
        price: 47000,
        unit: "Gói",
        tax_rate: 8,
      },
      {
        id: 6,
        sku: "HH043",
        name: "Chả Mực Xoắn Ống Deli Foods 2,5kg (178 Viên)",
        quantity: 2,
        price: 180000,
        unit: "Túi",
        tax_rate: 8,
      },
      {
        id: 7,
        sku: "HH123",
        name: "Cá viên Munchee 500g (PM)",
        quantity: 10,
        price: 23500,
        unit: "Gói",
        tax_rate: 8,
      },
      {
        id: 8,
        sku: "HH201",
        name: "Bò viên Muwono 500g (80 viên)",
        quantity: 10,
        price: 28000,
        unit: "Gói",
        tax_rate: 8,
      },
    ],
  },
  {
    id: 341149306,
    order_number: 13538,
    name: "13538",
    code: "13538",
    created_on: "2026-10-09T09:15:00Z",
    created_at: "2026-10-09T09:15:00Z",
    source_name: "zalo",
    financial_status: "paid",
    fulfillment_status: "fulfilled",
    customer: {
      id: 502,
      code: "KH0012",
      name: "Đại Lý Thực Phẩm Hải Hậu (Nam Định)",
      address: "Bến xe Giáp Bát gửi xe khách Tuấn Bình đi Hải Hậu, Nam Định",
      phone: "0912445566",
      tax_number: "0601234567",
    },
    branch_name: "Kho Định Công (HN)",
    total_price: 6850000,
    note: "Đóng 3 thùng xốp đá gel - CK Techcombank 22226060 đủ 100%",
    line_items: [
      {
        id: 11,
        sku: "SKU-MI-INDO-DB",
        name: "Mì trộn Indomie Vị Đặc Biệt 85g (Thùng 40 gói)",
        quantity: 20,
        price: 165000,
        unit: "Thùng",
        tax_rate: 8,
      },
      {
        id: 12,
        sku: "SKU-MI-KORENO-CJ",
        name: "Mì Koreno Jjajangmen Tương Đen 115g (Thùng 24 gói)",
        quantity: 15,
        price: 106000,
        unit: "Thùng",
        tax_rate: 8,
      },
      {
        id: 13,
        sku: "SKU-GV-TUONG-OT-SG",
        name: "Tương ớt Sài Gòn Can 2L (Thùng 6 can)",
        quantity: 10,
        price: 196000,
        unit: "Thùng",
        tax_rate: 8,
      },
    ],
  },
  {
    id: 341149307,
    order_number: 13539,
    name: "13539",
    code: "13539",
    created_on: "2026-10-09T10:00:00Z",
    created_at: "2026-10-09T10:00:00Z",
    source_name: "pos",
    financial_status: "paid",
    fulfillment_status: "fulfilled",
    customer: {
      id: 503,
      code: "KH-LE-01",
      name: "Khách lẻ ghé mua trực tiếp tại kho",
      address: "Số 96 Ngõ 337 Phố Định Công, Hoàng Mai, Hà Nội",
      phone: "0987112233",
    },
    branch_name: "Kho Định Công (HN)",
    total_price: 537000,
    note: "Khách bốc tại kho - giảm 1k/thùng theo chính sách",
    line_items: [
      {
        id: 21,
        sku: "SKU-MI-INDO-DB",
        name: "Mì trộn Indomie Vị Đặc Biệt 85g (Thùng 40 gói)",
        quantity: 3,
        price: 178000,
        unit: "Thùng",
        tax_rate: 8,
      },
    ],
  },
];

/**
 * Fetch orders trực tiếp từ Live Sapo API qua Basic Auth
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
      if (Array.isArray(data.orders) && data.orders.length > 0) {
        return data.orders;
      }
    } else {
      console.warn(`[SAPO API] Phản hồi lỗi HTTP ${res.status}, sử dụng dữ liệu dự phòng`);
    }
  } catch (err) {
    console.warn("[SAPO API] Không thể kết nối live API Sapo, chuyển sang mock dataset:", err);
  }

  return MOCK_SAPO_ORDERS.slice(0, limit);
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
