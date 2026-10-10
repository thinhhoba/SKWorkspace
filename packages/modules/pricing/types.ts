export type PriceChannel = "quan_an" | "dai_ly" | "bep_an" | "ban_le" | "web_order" | "pos";

export const PRICE_CHANNEL_LABEL: Record<PriceChannel, string> = {
  quan_an: "Quán ăn HN",
  dai_ly: "Đại lý chành xe",
  bep_an: "Bếp ăn căn tin",
  ban_le: "Bán lẻ",
  web_order: "Web Order",
  pos: "POS Quầy",
};

export const PRICE_CHANNEL_COLOR: Record<PriceChannel, string> = {
  quan_an: "bg-sky-100 text-sky-700 border-sky-200",
  dai_ly: "bg-amber-100 text-amber-700 border-amber-200",
  bep_an: "bg-violet-100 text-violet-700 border-violet-200",
  ban_le: "bg-emerald-100 text-emerald-700 border-emerald-200",
  web_order: "bg-cyan-100 text-cyan-700 border-cyan-200",
  pos: "bg-slate-100 text-slate-700 border-slate-200",
};

export const CHANNEL_ORDER: PriceChannel[] = ["quan_an", "dai_ly", "bep_an", "ban_le", "web_order", "pos"];

export type PricingCategory = "hang_kho" | "gia_vi" | "hang_mat" | "hang_dong";

export const PRICING_CATEGORY_LABEL: Record<PricingCategory, string> = {
  hang_kho: "Hàng khô",
  gia_vi: "Gia vị & Xốt",
  hang_mat: "Hàng mát",
  hang_dong: "Hàng đông",
};

export const STORAGE_TEMP_LABEL: Record<PricingCategory, string> = {
  hang_kho: "Thường",
  gia_vi: "Thường",
  hang_mat: "0–4°C",
  hang_dong: "-18°C",
};

export interface PricingItem {
  id: string;
  sku: string;
  name: string;
  category: PricingCategory;
  dvt: string;
  cost_price: number;
  prices: Record<PriceChannel, number>;
  updated_at: string;
  min_margin_pct?: number;
  note?: string;
}

export interface PricingStats {
  total_skus: number;
  avg_margin_pct: number;
  fresh_meat_count: number;
  frozen_meat_count: number;
  last_updated: string;
}

export function getMarginPct(cost: number, price: number): number {
  if (price <= 0) return 0;
  return ((price - cost) / price) * 100;
}
