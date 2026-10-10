import { SapoCustomer } from "./types";

// ---------------------------------------------------------------------------
// Types — B2B enrichment
// ---------------------------------------------------------------------------

export type B2BGroup = "QUAN_AN" | "CHANH_XE" | "CAN_TIN" | "BAN_LE";

export type DebtAgingBucket = "1-15" | "16-30" | ">30" | "NO_DEBT";

export interface EnrichedCustomer {
  sapo_id: number;
  code: string;
  name: string;
  phone: string;
  address: string;
  tax_number: string | null;
  b2b_group: B2BGroup;
  total_spent: number;
  orders_count: number;
  debt_amount: number;
  debt_aging: DebtAgingBucket;
  debt_aging_days: number;
  last_order_at: string | null;
}

export interface SapoCustomerRaw extends SapoCustomer {
  total_spent?: number;
  orders_count?: number;
  note?: string;
  created_at?: string;
  updated_at?: string;
  last_order_at?: string;
  tags?: string;
}

// ---------------------------------------------------------------------------
// Mock dataset — khách hàng B2B tiêu biểu Sơn Khang
// ---------------------------------------------------------------------------

const MOCK_SAPO_CUSTOMERS: SapoCustomerRaw[] = [
  {
    id: 501,
    code: "KH0009",
    name: "Hoang Thi Tuy - Tuy Foods",
    phone: "0979599902",
    address: "So 5 Ngo 27 Dai Co Viet, P. Bach Mai, Q. Hai Ba Trung, Ha Noi",
    tax_number: "0111252725",
    total_spent: 125_800_000,
    orders_count: 42,
    note: "MST 0111252725 - Quan xien ban, giao truoc 11h trua",
    last_order_at: "2026-10-08T11:00:00Z",
  },
  {
    id: 502,
    code: "KH0012",
    name: "Dai Ly Thuc Pham Hai Hau (Nam Dinh)",
    phone: "0912445566",
    address: "Ben xe Giap Bat gui xe khach Tuan Binh di Hai Hau, Nam Dinh",
    tax_number: "0601234567",
    total_spent: 89_500_000,
    orders_count: 18,
    note: "Chanh xe Giap Bat - dong 3 thung xop da gel",
    last_order_at: "2026-09-20T08:00:00Z",
  },
  {
    id: 503,
    code: "KH0015",
    name: "Can tin DH Bach Khoa Ha Noi",
    phone: "0988123456",
    address: "Can tin KTX B8, DH Bach Khoa, Hai Ba Trung, Ha Noi",
    tax_number: "0100101509",
    total_spent: 210_000_000,
    orders_count: 65,
    note: "Bep an / Can tin truong hoc - hop dong thang",
    last_order_at: "2026-10-09T06:30:00Z",
  },
  {
    id: 504,
    code: "KH-LE-01",
    name: "Khach le ghe mua truc tiep tai kho",
    phone: "0987112233",
    address: "So 96 Ngo 337 Pho Dinh Cong, Hoang Mai, Ha Noi",
    total_spent: 3_200_000,
    orders_count: 2,
    note: "Khach boc tai kho - giam 1k/thung",
    last_order_at: "2026-10-05T09:00:00Z",
  },
  {
    id: 505,
    code: "KH0020",
    name: "Quan Mi Tron Ngon 138 Thai Ha",
    phone: "0904123456",
    address: "138 Thai Ha, Dong Da, Ha Noi",
    total_spent: 18_600_000,
    orders_count: 12,
    note: "Quan an vat - mi tron noi thanh, don toi thieu 500k",
    last_order_at: "2026-09-15T10:00:00Z",
  },
  {
    id: 506,
    code: "KH0021",
    name: "Dai Ly Nuoc Ngam - Thai Binh",
    phone: "0918765432",
    address: "Ben xe Nuoc Ngam gui xe Hai Au di Thai Binh",
    tax_number: "1000897654",
    total_spent: 67_300_000,
    orders_count: 22,
    note: "Chanh xe Nuoc Ngam - tuyen Thai Binh, Thanh Hoa",
    last_order_at: "2026-08-10T07:00:00Z",
  },
  {
    id: 507,
    code: "KH0025",
    name: "KCN Thang Long - Bep An Cong Nghiep",
    phone: "0977001122",
    address: "Lo CN4, KCN Thang Long, Dong Anh, Ha Noi",
    tax_number: "0102345678",
    total_spent: 340_000_000,
    orders_count: 88,
    note: "Bep an KCN Thang Long - can tin cong nhan",
    last_order_at: "2026-10-09T05:00:00Z",
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SAPO_CUSTOMER_ENDPOINT = "https://sonkhang.mysapo.net/admin/customers.json";
const DEFAULT_API_KEY = "0166bd3c4bb745edb301413aec771b2b";
const DEFAULT_API_SECRET = "e2cc59d4ace34a009a0704ab9f72a8b4";

/** Boc tach MST (10-13 so) tu note / address */
export function extractTaxNumber(source: string): string | null {
  const m = source.match(/\b(\d{10,13})\b/);
  return m ? m[1] : null;
}

/** Phan nhom B2B dua tren dia chi / ghi chu / ten */
export function classifyB2BGroup(c: SapoCustomerRaw): B2BGroup {
  const hay = `${c.name} ${c.address} ${c.note} ${c.tags ?? ""}`.toLowerCase();
  if (
    hay.includes("chanh xe") ||
    hay.includes("ben xe") ||
    hay.includes("gui xe") ||
    hay.includes("chành xe") ||
    hay.includes("bến xe")
  )
    return "CHANH_XE";
  if (
    hay.includes("can tin") ||
    hay.includes("căn tin") ||
    hay.includes("bep an") ||
    hay.includes("bếp ăn") ||
    hay.includes("kcn") ||
    hay.includes("truong hoc") ||
    hay.includes("dai hoc") ||
    hay.includes("đại học")
  )
    return "CAN_TIN";
  if (
    hay.includes("quan") ||
    hay.includes("quán") ||
    hay.includes("xien") ||
    hay.includes("xiên") ||
    hay.includes("mi tron") ||
    hay.includes("mì trộn")
  )
    return "QUAN_AN";
  return "BAN_LE";
}

/** Tinh tuoi no dua tren last_order_at */
export function calcDebtAging(lastOrderAt: string | null): { bucket: DebtAgingBucket; days: number } {
  if (!lastOrderAt) return { bucket: "NO_DEBT", days: 0 };
  const diffMs = Date.now() - new Date(lastOrderAt).getTime();
  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  if (days <= 15) return { bucket: "1-15", days };
  if (days <= 30) return { bucket: "16-30", days };
  return { bucket: ">30", days };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Goi Sapo API GET /admin/customers.json
 * Fallback ve mock dataset neu live API khong kha dung
 */
export async function fetchSapoCustomers(limit = 50): Promise<SapoCustomerRaw[]> {
  const apiKey = process.env.SAPO_API_KEY || DEFAULT_API_KEY;
  const apiSecret = process.env.SAPO_API_SECRET || DEFAULT_API_SECRET;
  const baseUrl = process.env.SAPO_API_URL || SAPO_CUSTOMER_ENDPOINT;
  const url = `${baseUrl.replace(/\/admin\/.*$/, "")}/admin/customers.json?limit=${limit}`;

  try {
    const auth = "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const res = await fetch(url, {
      headers: { Authorization: auth, "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.customers) && data.customers.length > 0) {
        return data.customers.slice(0, limit) as SapoCustomerRaw[];
      }
      if (Array.isArray(data) && data.length > 0) {
        return (data as SapoCustomerRaw[]).slice(0, limit);
      }
    } else {
      console.warn(`[SAPO customers] HTTP ${res.status}, dung mock`);
    }
  } catch (err) {
    console.warn("[SAPO customers] Khong ket noi live API, dung mock:", err);
  }
  return MOCK_SAPO_CUSTOMERS.slice(0, limit);
}

/**
 * Lam giau 1 khach Sapo thanh ho so B2B day du:
 * - boc MST, phan nhom, tinh cong no & tuoi no
 */
export function enrichCustomerB2B(sapoCustomer: SapoCustomerRaw): EnrichedCustomer {
  const hay = `${sapoCustomer.note ?? ""} ${sapoCustomer.address ?? ""}`;
  const tax = sapoCustomer.tax_number || extractTaxNumber(hay) || null;
  const group = classifyB2BGroup(sapoCustomer);
  const lastOrderAt = sapoCustomer.last_order_at || sapoCustomer.updated_at || sapoCustomer.created_at || null;
  const aging = calcDebtAging(lastOrderAt);

  // Cong no mo phong: % total_spent chua thanh toan ti le theo tuoi no
  const debtRatio = aging.bucket === ">30" ? 0.35 : aging.bucket === "16-30" ? 0.2 : aging.bucket === "1-15" ? 0.08 : 0;
  const debt = Math.round((sapoCustomer.total_spent ?? 0) * debtRatio);

  return {
    sapo_id: sapoCustomer.id,
    code: sapoCustomer.code || `KH-${sapoCustomer.id}`,
    name: sapoCustomer.name,
    phone: sapoCustomer.phone || sapoCustomer.default_address?.phone || "",
    address: sapoCustomer.address || sapoCustomer.default_address?.address1 || "",
    tax_number: tax,
    b2b_group: group,
    total_spent: sapoCustomer.total_spent ?? 0,
    orders_count: sapoCustomer.orders_count ?? 0,
    debt_amount: debt,
    debt_aging: aging.bucket,
    debt_aging_days: aging.days,
    last_order_at: lastOrderAt,
  };
}

/** Lay toan bo KH da enrich (dung cho API route) */
export async function fetchEnrichedCustomers(limit = 50): Promise<EnrichedCustomer[]> {
  const raws = await fetchSapoCustomers(limit);
  return raws.map(enrichCustomerB2B);
}
