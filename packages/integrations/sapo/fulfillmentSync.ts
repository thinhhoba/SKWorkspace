import { SapoOrder } from "./types";
import { generateBusinessCode } from "@/packages/core/aliases";

// ---------------------------------------------------------------------------
// Hằng số giao vận Sơn Khang
// ---------------------------------------------------------------------------

export const DRIVER_INFO = {
  name: "NGÔ VĂN TÂN",
  phone: "0942 22 60 60",
  vehicle: "29C-882.60",
  origin: "Kho Tổng Định Công",
} as const;

export const VIETQR_INFO = {
  bank: "Techcombank",
  account: "22226060",
  accountName: "CONG TY TNHH THUC PHAM SON KHANG",
} as const;

// ---------------------------------------------------------------------------
// Định nghĩa tuyến
// ---------------------------------------------------------------------------

export type RouteGroup = "NOI_THANH_HN" | "CHANH_XE_TINH";
export type BusStation = "GiapBat" | "NuocNgam" | "MyDinh" | "GiaLam" | null;

export interface RouteGroupResult {
  route: RouteGroup;
  station: BusStation;
  stationLabel: string;
  orders: SapoOrder[];
}

export interface GroupedOrders {
  NOI_THANH_HN: SapoOrder[];
  CHANH_XE_TINH: SapoOrder[];
  byStation: Record<string, SapoOrder[]>;
  details: RouteGroupResult[];
}

// ---------------------------------------------------------------------------
// Mapping bến xe → nhãn
// ---------------------------------------------------------------------------

const STATION_LABELS: Record<string, string> = {
  GiapBat: "Bến Giáp Bát",
  NuocNgam: "Bến Nước Ngầm",
  MyDinh: "Bến Mỹ Đình",
  GiaLam: "Bến Gia Lâm",
};

// Nội thành Hà Nội — các quận gom xe lạnh 29C-882.60
const INNER_DISTRICT_KEYWORDS = [
  "cầu giấy",
  "cau giay",
  "đống đa",
  "dong da",
  "hai bà trưng",
  "hai ba trung",
  "bách khoa",
  "bach khoa",
  "kinh tế",
  "xây dựng",
  "bách - kinh - xây",
  "bach - kinh - xay",
  "hoàn kiếm",
  "hoan kiem",
  "ba đình",
  "ba dinh",
  "thanh xuân",
  "thanh xuan",
  "hoàng mai",
  "hoang mai",
  "định công",
  "dinh cong",
  "tây hồ",
  "tay ho",
  "long biên",
  "long bien",
  "nam từ liêm",
  "bac tu liem",
];

// Tỉnh phía Bắc + mapping bến xe gợi ý (theo hướng tuyến)
const STATION_KEYWORDS: Record<BusStation & string, string[]> = {
  GiapBat: ["nam định", "nam dinh", "thái bình", "thai binh", "ninh bình", "ninh binh", "thanh hóa", "thanh hoa", "nghệ an", "nghe an", "hà nam", "ha nam", "giáp bát", "giap bat"],
  NuocNgam: ["hải phòng", "hai phong", "quảng ninh", "quang ninh", "hải dương", "hai duong", "hưng yên", "hung yen", "nước ngầm", "nuoc ngam"],
  MyDinh: ["vĩnh phúc", "vinh phuc", "phú thọ", "phu tho", "yên bái", "yen bai", "lào cai", "lao cai", "sơn la", "son la", "điện biên", "dien bien", "mỹ đình", "my dinh"],
  GiaLam: ["bắc ninh", "bac ninh", "bắc giang", "bac giang", "lạng sơn", "lang son", "thái nguyên", "thai nguyen", "cao bằng", "cao bang", "bắc kạn", "bac kan", "gia lâm", "gia lam"],
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function normalizeText(s: string): string {
  return s.toLowerCase().trim();
}

function containsAny(text: string, keywords: string[]): boolean {
  const t = normalizeText(text);
  return keywords.some((kw) => t.includes(normalizeText(kw)));
}

function detectStation(addressAndNote: string): BusStation {
  for (const [station, kws] of Object.entries(STATION_KEYWORDS)) {
    if (containsAny(addressAndNote, kws)) return station as BusStation;
  }
  return null;
}

function isInnerCity(addressAndNote: string): boolean {
  // Nếu chứa từ khóa bến xe / tỉnh / gửi xe khách → ưu tiên chành xe
  if (containsAny(addressAndNote, ["bến xe", "ben xe", "gửi xe", "gui xe", "chành xe", "chanh xe", "tỉnh", "tinh"])) {
    // Kiểm tra nếu đồng thời match bến xe thì là chành xe
    if (detectStation(addressAndNote)) return false;
  }
  return containsAny(addressAndNote, INNER_DISTRICT_KEYWORDS);
}

// ---------------------------------------------------------------------------
// 1. groupOrdersByRoute
// ---------------------------------------------------------------------------

/**
 * Phân tích địa chỉ + ghi chú đơn Sapo để gom vào 2 tuyến:
 * - NOI_THANH_HN : giao xe lạnh nội thành
 * - CHANH_XE_TINH : gửi chành xe 4 bến (kèm mã bến cụ thể)
 */
export function groupOrdersByRoute(sapoOrders: SapoOrder[]): GroupedOrders {
  const noiThanh: SapoOrder[] = [];
  const chanhXe: SapoOrder[] = [];
  const byStation: Record<string, SapoOrder[]> = {};

  for (const order of sapoOrders) {
    const addr = order.customer?.address || order.customer?.default_address?.address1 || "";
    const note = order.note || "";
    const combined = `${addr} ${note}`;

    const station = detectStation(combined);
    // Nếu detect được bến xe → chành xe
    // Nếu không detect bến nhưng có dấu hiệu tỉnh/chành xe → vẫn chành xe (station=null)
    // Còn lại check nội thành
    const isChanhXe = station !== null || containsAny(combined, ["bến xe", "ben xe", "chành xe", "chanh xe", "gửi xe khách", "gui xe khach"]);

    if (isChanhXe || (!isInnerCity(combined) && station !== null)) {
      chanhXe.push(order);
      const key = station || "ChuaPhanBen";
      if (!byStation[key]) byStation[key] = [];
      byStation[key].push(order);
    } else if (isInnerCity(combined)) {
      noiThanh.push(order);
    } else {
      // Fallback: nếu địa chỉ Hà Nội nhưng không match quận cụ thể → nội thành
      if (containsAny(combined, ["hà nội", "ha noi"])) {
        noiThanh.push(order);
      } else {
        // Không xác định được → mặc định chành xe để nhân viên kiểm tra
        chanhXe.push(order);
        const key = station || "ChuaPhanBen";
        if (!byStation[key]) byStation[key] = [];
        byStation[key].push(order);
      }
    }
  }

  const details: RouteGroupResult[] = [];

  if (noiThanh.length > 0) {
    details.push({
      route: "NOI_THANH_HN",
      station: null,
      stationLabel: "Tuyến nội thành — Xe lạnh 29C-882.60 (Ngô Văn Tân)",
      orders: noiThanh,
    });
  }

  for (const [stationKey, orders] of Object.entries(byStation)) {
    details.push({
      route: "CHANH_XE_TINH",
      station: stationKey === "ChuaPhanBen" ? null : (stationKey as BusStation),
      stationLabel: stationKey === "ChuaPhanBen" ? "Chành xe — Chưa phân bến (cần xác nhận)" : STATION_LABELS[stationKey] || stationKey,
      orders,
    });
  }

  return { NOI_THANH_HN: noiThanh, CHANH_XE_TINH: chanhXe, byStation, details };
}

// ---------------------------------------------------------------------------
// 2. generateChanhXePackingSlip
// ---------------------------------------------------------------------------

export interface ChanhXePackingSlip {
  orderId: number;
  orderCode: string;
  busStation: string;
  busStationLabel: string;
  sender: { name: string; phone: string; address: string };
  receiver: { name: string; phone: string; address: string };
  packages: { count: number; note: string };
  vehicle: string;
  driver: { name: string; phone: string };
  codAmount: number;
  vietqr: { bank: string; account: string; accountName: string; qrData: string };
  sapoOrderCode: string;
  barcodeText: string;
}

function estimatePackageCount(order: SapoOrder): number {
  // Ước lượng số kiện dựa trên tổng số lượng line items (mỗi ~5-8 sản phẩm/kiện xốp)
  const totalQty = order.line_items.reduce((s, li) => s + li.quantity, 0);
  if (totalQty <= 5) return 1;
  if (totalQty <= 15) return 2;
  return Math.ceil(totalQty / 8);
}

/**
 * Tạo mẫu phiếu gửi chành xe dán thùng xốp.
 * Bao gồm: bến xe, người nhận, SĐT, số kiện, mã đơn Sapo, mã QR VietQR Techcombank.
 */
export function generateChanhXePackingSlip(order: SapoOrder): ChanhXePackingSlip {
  const addr = order.customer?.address || order.customer?.default_address?.address1 || "";
  const note = order.note || "";
  const combined = `${addr} ${note}`;
  const station = detectStation(combined);
  const stationKey = station || "ChuaPhanBen";
  const stationLabel = station ? STATION_LABELS[station] : "Chưa phân bến — Liên hệ điều phối";

  const pkgCount = estimatePackageCount(order);
  const orderCode = String(order.order_number || order.code || order.name || order.id);

  // VietQR quick data: https://api.vietqr.io — format chuẩn
  const qrData = `https://img.vietqr.io/image/${VIETQR_INFO.bank}-${VIETQR_INFO.account}-compact2.png?amount=${order.total_price}&addInfo=TT%20DH%20${orderCode}&accountName=${encodeURIComponent(VIETQR_INFO.accountName)}`;

  return {
    orderId: order.id,
    orderCode,
    busStation: stationKey,
    busStationLabel: stationLabel,
    sender: {
      name: VIETQR_INFO.accountName,
      phone: DRIVER_INFO.phone,
      address: DRIVER_INFO.origin,
    },
    receiver: {
      name: order.customer?.name || "Khách nhận",
      phone: order.customer?.phone || order.customer?.default_address?.phone || "",
      address: addr || "—",
    },
    packages: {
      count: pkgCount,
      note: `Thùng xốp đá gel — ${pkgCount} kiện — Đơn Sapo #${orderCode}`,
    },
    vehicle: DRIVER_INFO.vehicle,
    driver: { name: DRIVER_INFO.name, phone: DRIVER_INFO.phone },
    codAmount: order.total_price,
    vietqr: {
      bank: VIETQR_INFO.bank,
      account: VIETQR_INFO.account,
      accountName: VIETQR_INFO.accountName,
      qrData,
    },
    sapoOrderCode: orderCode,
    barcodeText: `SAPO-${orderCode}`,
  };
}

// ---------------------------------------------------------------------------
// 3. markSapoOrderFulfilled
// ---------------------------------------------------------------------------

export interface FulfillmentResult {
  success: boolean;
  sapoOrderId: number;
  trackingNumber: string;
  message: string;
  fulfilledAt: string;
}

const SAPO_FULFILLMENT_ENDPOINT = "https://sonkhang.mysapo.net/admin/orders";

/**
 * Gửi yêu cầu cập nhật trạng thái đơn Sapo thành fulfilled.
 * Kèm thông tin tài xế Ngô Văn Tân + mã vận đơn.
 * Nếu không có credentials / API lỗi → trả về success giả lập để không chặn luồng PWA.
 */
export async function markSapoOrderFulfilled(
  sapoOrderId: number,
  trackingNumber: string
): Promise<FulfillmentResult> {
  const now = new Date().toISOString();
  const apiKey = process.env.SAPO_API_KEY || "";
  const apiSecret = process.env.SAPO_API_SECRET || "";
  const baseUrl = process.env.SAPO_API_URL?.replace(/\/admin\/orders\.json.*$/, "") || "https://sonkhang.mysapo.net";

  // Nếu thiếu credentials → mock success (dev / fallback)
  if (!apiKey || !apiSecret) {
    return {
      success: true,
      sapoOrderId,
      trackingNumber,
      message: `[MOCK] Đã đánh dấu fulfilled cho đơn #${sapoOrderId} — Vận đơn ${trackingNumber} — Tài xế ${DRIVER_INFO.name} (${DRIVER_INFO.phone}) — Xe ${DRIVER_INFO.vehicle}`,
      fulfilledAt: now,
    };
  }

  try {
    const authHeader = "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const url = `${baseUrl}/admin/orders/${sapoOrderId}/fulfillments.json`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: authHeader,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        fulfillment: {
          tracking_number: trackingNumber,
          tracking_company: `SK-LOGISTICS — ${DRIVER_INFO.name} ${DRIVER_INFO.vehicle}`,
          notify_customer: false,
          line_items: [],
        },
      }),
    });

    if (res.ok) {
      return {
        success: true,
        sapoOrderId,
        trackingNumber,
        message: `Đã cập nhật fulfilled cho đơn #${sapoOrderId} trên Sapo`,
        fulfilledAt: now,
      };
    }

    const errText = await res.text().catch(() => "");
    return {
      success: false,
      sapoOrderId,
      trackingNumber,
      message: `Sapo API lỗi HTTP ${res.status}: ${errText.slice(0, 300)}`,
      fulfilledAt: now,
    };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      sapoOrderId,
      trackingNumber,
      message: `Không thể kết nối Sapo API: ${msg}`,
      fulfilledAt: now,
    };
  }
}
