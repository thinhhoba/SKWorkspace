import type { PricingItem, PricingStats, PriceChannel } from "./types";
import { MOCK_PRICING_ITEMS } from "./mockData";
import { CHANNEL_ORDER, PRICE_CHANNEL_LABEL, getMarginPct } from "./types";

let pricingStore: PricingItem[] = MOCK_PRICING_ITEMS.map((o) => ({ ...o, prices: { ...o.prices } }));

export function getPricingItems(filters?: { category?: string; search?: string }): PricingItem[] {
  let list = [...pricingStore];
  if (filters?.category && filters.category !== "ALL") {
    list = list.filter((i) => i.category === filters.category);
  }
  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter((i) => i.sku.toLowerCase().includes(q) || i.name.toLowerCase().includes(q));
  }
  return list;
}

export function getPricingStats(): PricingStats {
  const total_skus = pricingStore.length;
  let sum = 0;
  for (const it of pricingStore) {
    sum += getMarginPct(it.cost_price, it.prices.ban_le);
  }
  const avg_margin_pct = total_skus ? Math.round((sum / total_skus) * 10) / 10 : 0;
  const fresh_meat_count = pricingStore.filter((i) => i.category === "hang_mat").length;
  const frozen_meat_count = pricingStore.filter((i) => i.category === "hang_dong").length;
  const last_updated = pricingStore.reduce((max, i) => (i.updated_at > max ? i.updated_at : max), "");
  return { total_skus, avg_margin_pct, fresh_meat_count, frozen_meat_count, last_updated };
}

export function getPricingItemBySku(sku: string): PricingItem | undefined {
  return pricingStore.find((i) => i.sku === sku);
}

export function updateItemPrice(sku: string, channel: PriceChannel, newPrice: number): { item: PricingItem; warning?: string } {
  const item = pricingStore.find((i) => i.sku === sku);
  if (!item) throw new Error(`Không tìm thấy SKU ${sku}`);
  if (!CHANNEL_ORDER.includes(channel as PriceChannel)) throw new Error(`Kênh không hợp lệ: ${channel}`);
  if (!Number.isFinite(newPrice) || newPrice <= 0) throw new Error("Giá bán phải > 0");
  item.prices[channel] = newPrice;
  item.updated_at = new Date().toLocaleDateString("vi-VN");
  let warning: string | undefined;
  if (newPrice < item.cost_price) warning = "Giá bán thấp hơn giá vốn nhập kho!";
  else if (getMarginPct(item.cost_price, newPrice) < (item.min_margin_pct ?? 10)) warning = "Biên lợi nhuận mỏng < " + (item.min_margin_pct ?? 10) + "%";
  return { item: { ...item, prices: { ...item.prices } }, warning };
}

export function generateZaloQuote(channel: PriceChannel, _options?: { note?: string }): string {
  const label = PRICE_CHANNEL_LABEL[channel] ?? channel;
  const today = new Date().toLocaleDateString("vi-VN");
  const items = [...pricingStore].sort((a, b) => a.sku.localeCompare(b.sku));
  const lines: string[] = [];
  lines.push(`CÔNG TY TNHH THỰC PHẨM SƠN KHANG (sonkhang.vn)`);
  lines.push(`Hotline: 0942 22 60 60 | Cố định: (024) 22 60 60 60`);
  lines.push(`STK: Techcombank 22226060 - CONG TY TNHH THUC PHAM SON KHANG`);
  lines.push(`Kho tổng: Số 96 Ngõ 337 Phố Định Công, P. Định Công, TP. Hà Nội`);
  lines.push(`────────────────────────────────`);
  lines.push(`BÁO GIÁ ${label.toUpperCase()} — ${today}`);
  lines.push(`────────────────────────────────`);
  for (const it of items) {
    const price = it.prices[channel] ?? it.prices.ban_le;
    const vnd = price.toLocaleString("vi-VN") + " ₫";
    lines.push(`${it.sku} | ${it.name} | ${it.dvt} | ${vnd}`);
  }
  lines.push(`────────────────────────────────`);
  lines.push(`Chính sách chung:`);
  lines.push(`• Đơn tối thiểu 500.000₫`);
  lines.push(`• Freeship đơn từ 1.000.000₫ (<8km nội thành HN)`);
  lines.push(`• Gửi chành xe bến Giáp Bát / Nước Ngầm đi các tỉnh phía Bắc`);
  lines.push(`• Giá áp dụng đến 7 ngày kể từ ${today}`);
  lines.push(`• Liên hệ báo giá: 0942 22 60 60 (Zalo) — sonkhang.vn`);
  return lines.join("\n");
}

export function __resetPricingStore(): void {
  pricingStore = MOCK_PRICING_ITEMS.map((o) => ({ ...o, prices: { ...o.prices } }));
}
