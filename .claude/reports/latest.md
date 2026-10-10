# Báo cáo Bảng giá 4 Kênh & Báo giá Zalo — 10/10/2026

## Triển khai
- `packages/modules/pricing/types.ts` — `PriceChannel` 6 kênh (quan_an/dai_ly/bep_an/ban_le/web_order/pos) + `PRICE_CHANNEL_LABEL/COLOR`, `CHANNEL_ORDER`, `PricingCategory` (hang_kho/gia_vi/hang_mat/hang_dong) + `PRICING_CATEGORY_LABEL/STORAGE_TEMP_LABEL`, `PricingItem` (sku/name/category/dvt/cost_price/prices:Record<PriceChannel,number>/updated_at/min_margin_pct/note), `PricingStats` (total_skus/avg_margin_pct/fresh_meat_count/frozen_meat_count/last_updated), `getMarginPct(cost,price)`.
- `packages/modules/pricing/mockData.ts` — 24 SKU thực tế catalogue Sơn Khang (6 hàng khô GAO/MGO/MTR/BUN/NAM/MOC, 6 gia vị NM/TTU/DTU/HAT/TIE/SOT, 6 hàng mát THX/BMB/CTH/CLB/BVG/DHA, 6 hàng đông BRS/SNN/DCG/CAH/TOM/MUC) — mỗi SKU có cost_price và giá 6 kênh phân tầng, min_margin_pct 10%.
- `packages/modules/pricing/pricingService.ts` — `getPricingItems({category,search})`, `getPricingStats()` (TB theo ban_le, đếm hang_mat/hang_dong), `getPricingItemBySku`, `updateItemPrice(sku,channel,price)` kiểm tra biên + cảnh báo "Giá bán thấp hơn giá vốn!" / "Biên mỏng <10%", `generateZaloQuote(channel)` sinh văn bản báo giá gồm header CTY + hotline 0942 22 60 60 + STK + kho Định Công + danh mục format VNĐ + chính sách chung + hạn 7 ngày, `__resetPricingStore`.
- `app/api/pricing/route.ts` — `GET /api/pricing?category&search` → {success, stats, count, items}.
- `app/api/pricing/[sku]/route.ts` — `GET /api/pricing/[sku]` + `PATCH /api/pricing/[sku]` {channel, price} → {success, item, warning?}.
- `app/api/pricing/quote/route.ts` — `POST /api/pricing/quote` {channel} → {success, channel, text} báo giá Zalo.
- `app/(shell)/pricing/page.tsx` — "use client" Claymorphism:
  - 4 Clay-KPI: Tổng SKU (sky), Biên lợi nhuận TB % emerald, Giá Heo Xay bán sỉ amber, Kênh chủ lực Bếp Ăn KCN violet.
  - Tabs kênh (Tất cả/Quán ăn/Đại lý/Bếp ăn/Web Order/POS) + tabs nhóm hàng (Hàng khô/Gia vị/Hàng mát/Hàng đông) + search debounce 300ms.
  - Bảng giá: SKU mono, tên, ĐVT, giá vốn, cột giá theo kênh (nhấn để sửa), huy hiệu BL% emerald/rose (<10%), nút bút sửa.
  - Modal Cập nhật Giá Nhanh: chọn kênh + nhập giá + cảnh báo đỏ "thấp hơn giá vốn" / vàng "biên mỏng <10%" + PATCH.
  - Modal Xuất Báo Giá Zalo 1-chạm: chọn kênh → POST /api/pricing/quote → textarea preview + Copy mẫu báo giá (clipboard + toast) + Mở Zalo.
- `packages/core/appRegistry.ts` — entry pricing `{id:"pricing", label:"Bảng giá", group:"ban-hang", icon:Tag, href:"/pricing"}`.

## Verify 10/10/2026
- `npx tsc --noEmit` — PASS (0 lỗi).
- `npm run build` — PASS — 34 routes, `○ /pricing` 6.97 kB / First Load 132 kB, `ƒ /api/pricing`, `ƒ /api/pricing/[sku]`, `ƒ /api/pricing/quote`, Middleware 34 kB.
- Commit `feat(pricing): bang gia ban phan tang 4 kenh, canh bao loi gia von va bao gia Zalo 1-cham`.

## Thử
Mở `/pricing` → 4 KPI (24 SKU, BL% TB). Tabs Tất cả → bảng đa kênh + BL% badge. Bấm giá → Modal cập nhật → nhập giá < cost_price → cảnh báo đỏ "Giá bán thấp hơn giá vốn!". Lưu → PATCH → toast. Bấm Xuất báo giá Zalo → chọn Quán ăn HN → xem preview đầy đủ hotline/STK/địa chỉ kho → Copy → dán Zalo gửi khách.
