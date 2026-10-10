export type ProductCategory = "MI_KHO" | "GA_POPCORN" | "VIEN_THA_LAU" | "TUONG_OT_XOT" | "KHAC";

export interface SapoProductRaw {
  id: number;
  name: string;
  sku?: string;
  product_type?: string;
  vendor?: string;
  tags?: string;
  price?: number;
  variants?: { id: number; sku: string; price: number; name?: string }[];
  created_at?: string;
}

export interface B2BPriceMatrix {
  cap1_chanh_xe: number;
  cap2_can_tin: number;
  cap3_quan_an: number;
  cap4_ban_le: number;
  note: string;
}

export interface EnrichedProduct {
  sapo_id: number;
  sku: string;
  name: string;
  category: ProductCategory;
  base_price: number;
  b2b_matrix: B2BPriceMatrix;
}

// ---------------------------------------------------------------------------
// Mock products — danh muc tieu bieu Son Khang
// ---------------------------------------------------------------------------

const MOCK_SAPO_PRODUCTS: SapoProductRaw[] = [
  { id: 101, name: "Mi tron Indomie Vi Dac Biet 85g (Thung 40 goi)", sku: "SKU-MI-INDO-DB", product_type: "Mì khô", price: 178000 },
  { id: 102, name: "Mi Koreno Jjajangmen Tuong Den 115g (Thung 24 goi)", sku: "SKU-MI-KORENO-CJ", product_type: "Mì khô", price: 115000 },
  { id: 103, name: "Ga Vien Chien Popcorn CP Tui 1kg", sku: "HH053", product_type: "Gà chiên Popcorn CP", price: 117000 },
  { id: 104, name: "Banh Ga Net Viet 800g (18 Chiec) - Hop", sku: "HH027", product_type: "Gà chiên Popcorn CP", price: 60000 },
  { id: 105, name: "Vien xot hai san Mayonaise 450g basa Thoai An", sku: "SB237", product_type: "Viên thả lẩu", price: 41000 },
  { id: 106, name: "Cha Tom Surimi Dinh Hinh O Ngon 500g (31 Con)", sku: "HH050", product_type: "Viên thả lẩu", price: 44000 },
  { id: 107, name: "Xuc xich Ho lo Dong Que LC Foods 500g (45 vien)", sku: "HH092", product_type: "Viên thả lẩu", price: 47000 },
  { id: 108, name: "Tuong ot Sai Gon Can 2L (Thung 6 can)", sku: "SKU-GV-TUONG-OT-SG", product_type: "Tương ớt xốt", price: 196000 },
  { id: 109, name: "Ca vien Munchee 500g (PM)", sku: "HH123", product_type: "Viên thả lẩu", price: 23500 },
  { id: 110, name: "Bo vien Muwono 500g (80 vien)", sku: "HH201", product_type: "Viên thả lẩu", price: 28000 },
];

const SAPO_PRODUCT_ENDPOINT = "https://sonkhang.mysapo.net/admin/products.json";
const DEFAULT_API_KEY = "0166bd3c4bb745edb301413aec771b2b";
const DEFAULT_API_SECRET = "e2cc59d4ace34a009a0704ab9f72a8b4";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function classifyProductCategory(p: SapoProductRaw): ProductCategory {
  const hay = `${p.name} ${p.product_type ?? ""} ${p.tags ?? ""}`.toLowerCase();
  if (hay.includes("mì") || hay.includes("mi ") || hay.includes("indomie") || hay.includes("koreno")) return "MI_KHO";
  if (hay.includes("popcorn") || hay.includes("gà chiên") || hay.includes("ga chien") || hay.includes("bánh gà") || hay.includes("banh ga")) return "GA_POPCORN";
  if (hay.includes("viên") || hay.includes("vien") || hay.includes("chả") || hay.includes("cha ") || hay.includes("xúc xích") || hay.includes("xuc xich") || hay.includes("cá viên") || hay.includes("bò viên")) return "VIEN_THA_LAU";
  if (hay.includes("tương ớt") || hay.includes("tuong ot") || hay.includes("xốt") || hay.includes("xot") || hay.includes("tương")) return "TUONG_OT_XOT";
  return "KHAC";
}

/**
 * Tinh 4 muc gia B2B theo chinh sach Son Khang:
 * - Cap 1 (chanh xe thung lon): chiet khau sau nhat ~ -12%
 * - Cap 2 (bep an / can tin): on dinh hop dong ~ -7%
 * - Cap 3 (quan an vat, don >=500k): ~ -4%
 * - Cap 4 (ban le tai kho): giam 1.000d/thung so voi gia niem yet
 */
export function mapB2BPriceMatrix(_productId: number, basePrice: number): B2BPriceMatrix {
  const cap1 = Math.round(basePrice * 0.88);
  const cap2 = Math.round(basePrice * 0.93);
  const cap3 = Math.round(basePrice * 0.96);
  const cap4 = Math.max(0, basePrice - 1000);
  return {
    cap1_chanh_xe: cap1,
    cap2_can_tin: cap2,
    cap3_quan_an: cap3,
    cap4_ban_le: cap4,
    note: "Cap 1: CK sau nhat (chanh xe) | Cap 2: hop dong can tin | Cap 3: quan an >=500k | Cap 4: boc kho -1k/thung",
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export async function fetchSapoProducts(limit = 50): Promise<SapoProductRaw[]> {
  const apiKey = process.env.SAPO_API_KEY || DEFAULT_API_KEY;
  const apiSecret = process.env.SAPO_API_SECRET || DEFAULT_API_SECRET;
  const baseUrl = process.env.SAPO_API_URL || SAPO_PRODUCT_ENDPOINT;
  const url = `${baseUrl.replace(/\/admin\/.*$/, "")}/admin/products.json?limit=${limit}`;

  try {
    const auth = "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
    const res = await fetch(url, {
      headers: { Authorization: auth, "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data.products) && data.products.length > 0) {
        return (data.products as SapoProductRaw[]).slice(0, limit);
      }
      if (Array.isArray(data) && data.length > 0) return (data as SapoProductRaw[]).slice(0, limit);
    } else {
      console.warn(`[SAPO products] HTTP ${res.status}, dung mock`);
    }
  } catch (err) {
    console.warn("[SAPO products] Khong ket noi live API, dung mock:", err);
  }
  return MOCK_SAPO_PRODUCTS.slice(0, limit);
}

export async function fetchEnrichedProducts(limit = 50): Promise<EnrichedProduct[]> {
  const raws = await fetchSapoProducts(limit);
  return raws.map((p) => {
    const base = p.price ?? p.variants?.[0]?.price ?? 0;
    return {
      sapo_id: p.id,
      sku: p.sku || p.variants?.[0]?.sku || `SKU-${p.id}`,
      name: p.name,
      category: classifyProductCategory(p),
      base_price: base,
      b2b_matrix: mapB2BPriceMatrix(p.id, base),
    };
  });
}
