# BÁO CÁO WORKER 3 — SAPO CUSTOMER B2B & PRICING SYNC

**Ngày:** 2026-10-10 | **Worker:** 3 (Customer B2B & Pricing Sync Squad)

## 1. File đã tạo/sửa

| File | Mô tả |
|------|-------|
| `packages/integrations/sapo/customerSync.ts` | fetchSapoCustomers, enrichCustomerB2B, classifyB2BGroup, extractTaxNumber, calcDebtAging + mock 7 KH tiêu biểu |
| `packages/integrations/sapo/productSync.ts` | fetchSapoProducts, classifyProductCategory, mapB2BPriceMatrix, fetchEnrichedProducts + mock 10 SP |
| `app/api/sapo/customers/route.ts` | GET /api/sapo/customers — filter group/search, trả total_debt |
| `app/api/sapo/customers/sync/route.ts` | POST /api/sapo/customers/sync — sync + thống kê by_group |
| `app/api/sapo/products/route.ts` | GET /api/sapo/products — filter category/search + ma trận B2B 4 cấp |

## 2. Logic chính

- **B2B grouping:** QUAN_AN / CHANH_XE / CAN_TIN / BAN_LE dựa trên name+address+note (chành xe/bến xe/gửi xe, căn tin/bếp ăn/KCN, quán/xiên/mì trộn).
- **MST:** bóc từ note/address (regex 10-13 số), fallback tax_number.
- **Tuổi nợ:** 1-15 / 16-30 / >30 ngày từ last_order_at; debt_amount = total_spent * ratio (8%/20%/35%).
- **Bảng giá 4 cấp:** Cap1 -12% (chành xe), Cap2 -7% (căn tin), Cap3 -4% (quán ăn), Cap4 -1.000đ/thùng (bán lẻ kho).
- **Phân loại SP:** MI_KHO / GA_POPCORN / VIEN_THA_LAU / TUONG_OT_XOT / KHAC.

## 3. Nghiệm thu

- `npx tsc --noEmit`: **0 lỗi trong 5 file của Worker 3** (grep rỗng). 1 lỗi pre-existing ngoài phạm vi tại `app/api/sapo/cron/eod-accounting/route.ts:24` (duplicate `success`).
- Không chạy git commit/push.
- Live Sapo API: Basic Auth qua SAPO_API_KEY/SECRET/URL env, fallback mock khi lỗi.

## 4. Lưu ý

- Lỗi TS2783 tại eod-accounting không thuộc phạm vi Worker 3, không sửa để giữ ranh giới file.
