# Báo cáo Worker 2 — SAPO & MISA Integration (sapo2misa)

**Ngày:** 10/10/2026 | **MST:** 0111252725 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
**Phạm vi:** `app/api/sapo2misa/amis`, `app/api/sapo2misa/meinvoice`, `app/(shell)/finance/sapo2misa/page.tsx`, `packages/integrations/misa/*`, `app/api/sapo2misa/sync` (bổ sung centralOrders)

## 1. API Endpoints MISA OpenAPI

| Endpoint | File | Mô tả |
|----------|------|-------|
| `POST /api/sapo2misa/amis` | `app/api/sapo2misa/amis/route.ts` | Nhận `CentralOrder[]` (qua `orders` hoặc body mảng), gọi `syncOrderToAmis(order)` cho từng đơn, trả `{ success, count, total, vouchers: [{orderId, aliasCode, refNo, success, voucherId}] }` |
| `POST /api/sapo2misa/meinvoice` | `app/api/sapo2misa/meinvoice/route.ts` | Nhận `CentralOrder[]`, gọi `publishInvoiceFromOrder(order)`, trả `{ success, count, total, invoices: [{orderId, aliasCode, invoiceNo, taxAuthorityCode, viewUrl}] }` kèm link tra cứu `meinvoice.vn/tra-cuu?taxCode=0111252725` |

- Nếu FE không gửi `orders`, tự fallback kéo `fetchSapoOrders()` → `normalizeToCentralOrders()`.
- `app/api/sapo2misa/sync` đã được cập nhật trả thêm `centralOrders` để FE dùng cho 2 nút MISA.

## 2. Nâng cấp giao diện `app/(shell)/finance/sapo2misa/page.tsx`

- **Action Bar:** Giữ nguyên "Đồng bộ Sapo" + "Xuất Excel 63 cột" + "Mapping" + "Lịch sử Ledger". Bổ sung:
  - **"Đẩy AMIS Kế Toán"** (`Send` icon, border sky) — gọi `POST /api/sapo2misa/amis`, spinner `Loader2`, log `RUN→OK` realtime vào terminal, cập nhật Stepper bước 4 → "Đã hạch toán vào AMIS", mở Dialog kết quả với bảng `Alias | Số CT (SK-CTGS-...) | Trạng thái`.
  - **"Phát Hành meInvoice Bot"** (`FilePlus2` icon, border emerald) — gọi `POST /api/sapo2misa/meinvoice`, log realtime, mở Dialog kèm `Số HĐ (HD-xxxx)`, `Mã CQT (001-26-SK-...)`, link `Tra cứu HĐĐT tại meInvoice.vn` (C26TSK).
- **Terminal Logs:** Ghi chi tiết từng lượt gọi Sapo/AMIS/meInvoice theo thời gian thực, filter ALL/INFO/OK/WARN/RUN/ERR, auto-scroll.
- **Alias & Channel:** `centralOrders` chứa `alias_code` (SK-SO/SK-WEB/SK-POS/SK-QA/SK-DL/SK-BA) và `channel` (`web_order|pos|quan_an|dai_ly|bep_an`) từ `sapoClient.normalizeToCentralOrders` + `generateBusinessCode`; hiển thị trong Dialog kết quả AMIS/meInvoice và sẵn sàng mở rộng badge trong MisaGrid.

## 3. Nghiệm thu

- `npx tsc --noEmit` — **0 lỗi**.
- Không chạy `git commit`/`git push` (tuân thủ worker song song).
- Không chạm `packages/modules/pricing` hay `app/(shell)/pricing`.

## 4. Hạn chế & tiếp theo

- Chế độ dev/staging giả lập thành công (random voucher/invoice). Khi `MISA_AMIS_LIVE=true` / `MEINVOICE_LIVE=true` sẽ gọi live endpoint `api.amis.misa.vn` / `api.meinvoice.vn`.
- Có thể bổ sung cột badge Alias/Channel trực tiếp trong `MisaGrid.tsx` nếu cần hiển thị tabular thay vì chỉ trong Dialog.
