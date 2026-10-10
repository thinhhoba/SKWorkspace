# Báo cáo nghiệm thu — Worker 1: Phân hệ Bảng giá đa kênh & Báo giá Zalo

**Ngày:** 10/10/2026 | **Worker:** Worker 1 — Pricing Squad | **Route:** `/pricing` | **APIs:** `/api/pricing`

## 1. Phạm vi thực hiện (STRICT BOUNDARY tuân thủ)
Chỉ can thiệp các file được phép: `packages/modules/pricing/**`, `app/(shell)/pricing/**`, `app/api/pricing/**`. Không chạm `packages/integrations` hay `finance`.

## 2. File đã tạo/cập nhật
| File | Trạng thái |
|------|-----------|
| `packages/modules/pricing/types.ts` | Cập nhật: 6 kênh (`quan_an`, `dai_ly`, `bep_an`, `ban_le`, `web_order`, `pos`) + 4 nhóm hàng (`hang_kho`, `gia_vi`, `hang_mat`, `hang_dong`) + `STORAGE_TEMP_LABEL` + `PricingStats` |
| `packages/modules/pricing/mockData.ts` | Cập nhật: 24 SKUs đầy đủ (6 hang_kho + 6 gia_vi + 6 hang_mat + 6 hang_dong), mỗi SKU có đủ 6 giá kênh |
| `packages/modules/pricing/pricingService.ts` | Cập nhật: `getPricingItems`, `getPricingStats`, `updateItemPrice` (cảnh báo `newPrice < cost_price` + margin mỏng), `generateZaloQuote(channel)` format chuẩn Sơn Khang |
| `app/api/pricing/route.ts` | Sẵn có: `GET /api/pricing` (filter category/search + stats) |
| `app/api/pricing/[sku]/route.ts` | Sẵn có: `GET` + `PATCH /api/pricing/[sku]` |
| `app/api/pricing/quote/route.ts` | Sẵn có: `POST /api/pricing/quote` |
| `app/(shell)/pricing/page.tsx` | Cập nhật toàn diện theo spec |

## 3. Service `pricingService.ts`
- Đọc 24 SKUs từ `mockData.ts`, store in-memory kèm `__resetPricingStore()` cho test.
- Lọc theo 4 nhóm hàng + search SKU/tên (case-insensitive).
- 6 kênh: `CHANNEL_ORDER` cố định, `PRICE_CHANNEL_LABEL`/`COLOR`.
- `updateItemPrice`: validate kênh+giá, tự tính `% margin = (price-cost)/price*100`, cảnh báo nếu `newPrice < cost_price` hoặc `margin < min_margin_pct (10%)`.
- `generateZaloQuote(channel, options)`: header `CÔNG TY TNHH THỰC PHẨM SƠN KHANG (sonkhang.vn) - Hotline 0942 22 60 60`, STK `Techcombank 22226060`, kho tổng `96 Ngõ 337 Định Công`, chính sách `tối thiểu 500k / freeship 1tr <8km HN / chành xe Giáp Bát-Nước Ngầm`, danh sách giá theo kênh.

## 4. API Endpoints
- `GET /api/pricing?category=&search=` → `{ success, stats, count, items }`
- `GET /api/pricing/[sku]` → `{ success, item }`
- `PATCH /api/pricing/[sku]` body `{ channel, price }` → `{ success, item, warning }`
- `POST /api/pricing/quote` body `{ channel }` → `{ success, channel, text }`

## 5. Giao diện `app/(shell)/pricing/page.tsx`
- **4 Clay-KPI:** Tổng SKU (Sky) | Biên LN gộp TB ~21.4% (Emerald) | Bảo quản đông & mát count (Cyan) | Kênh sỉ chủ lực Quán ăn & Chành xe tỉnh (Amber).
- **Tabs 6 kênh:** Tất cả kênh | Quán ăn HN | Đại lý chành xe | Bếp ăn căn tin | Web Order | POS Quầy.
- **Tabs 4 nhóm hàng:** Tất cả | Hàng khô | Gia vị & Xốt | Hàng mát | Hàng đông.
- **Search tức thì** (debounce 300ms) theo SKU/tên.
- **Bảng giá:** Mã SKU | Tên + nhóm | ĐVT | Nhiệt độ bảo quản (badge Thường/0–4°C/-18°C) | Giá vốn | Giá Quán ăn/Chành xe/Căn tin/Web Order/POS | % Margin (badge màu) | Thao tác (Pencil).
- **Modal Cập nhật Giá Nhanh:** chọn kênh, nhập giá, cảnh báo đỏ nếu dưới vốn, vàng nếu margin mỏng, nút Lưu.
- **Modal Xuất Báo Giá Zalo 1-Chạm:** chọn kênh, textarea text báo giá, nút Copy + Mở Zalo.

## 6. Nghiệm thu
- `npx tsc --noEmit`: **0 lỗi**.
- Không chạy `git commit` / `git push`.
- Tuân thủ phạm vi file cho phép.
