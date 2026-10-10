# CHỈ THỊ LỆNH PHÂN CÔNG — WORKER 2 (SAPO & MISA INTEGRATION SQUAD)
# DỰ ÁN: SK WORKSPACE 2 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# NHIỆM VỤ: ĐỒNG BỘ ĐƠN HÀNG SAPO LIVE & TÍCH HỢP MISA OPEN API (/finance/sapo2misa)

---

### PHẠM VI DANH MỤC FILE CHO PHÉP (STRICT BOUNDARY):
> ⚠️ **NGUYÊN TẮC AN TOÀN:** Worker 2 CHỈ ĐƯỢC PHÉP đọc và ghi trong các file sau. TUYỆT ĐỐI KHÔNG chạm vào thư mục `packages/modules/pricing` hay `app/(shell)/pricing` để tránh xung đột với Worker 1.
- `app/api/sapo2misa/amis/route.ts` (Tạo mới)
- `app/api/sapo2misa/meinvoice/route.ts` (Tạo mới)
- `app/(shell)/finance/sapo2misa/page.tsx` (Cập nhật)
- `packages/integrations/misa/misaTransformer.ts` (Đã có, mở rộng nếu cần)
- Báo cáo kết quả vào: `.claude/reports/worker-2-misa.md`

---

### DỮ LIỆU ĐỊNH DANH & KẾT NỐI:
- **MST Công ty:** `0111252725` (CÔNG TY TNHH THỰC PHẨM SƠN KHANG)
- **Sapo Live Client:** Đã cấu hình tại `packages/integrations/sapo/sapoClient.ts` (kết nối endpoint `sonkhang.mysapo.net` với Basic Auth).
- **MISA AMIS OpenAPI Client:** Đã tạo tại `packages/integrations/misa/amisOpenApiClient.ts` (hàm `syncOrderToAmis`).
- **MISA meInvoice Bot Client:** Đã tạo tại `packages/integrations/misa/meInvoiceBotClient.ts` (hàm `publishInvoiceFromOrder`).
- **Chuẩn Alias Code:** `packages/core/aliases.ts` (`SK-SO-...`, `SK-WEB-...`, `SK-POS-...`, `SK-QA-...`, `SK-DL-...`).

---

### CHI TIẾT CÁC HẠNG MỤC CẦN LÀM:

#### 1. TẠO API ENDPOINTS CHO MISA OPEN API:
- `POST /api/sapo2misa/amis`:
  - Nhận danh sách đơn hàng `CentralOrder[]` hoặc đơn hàng được chọn.
  - Gọi hàm `syncOrderToAmis(order)` từ `amisOpenApiClient.ts`.
  - Trả về kết quả: `{ success: true, count: N, vouchers: [...] }`.
- `POST /api/sapo2misa/meinvoice`:
  - Nhận danh sách đơn hàng `CentralOrder[]`.
  - Gọi hàm `publishInvoiceFromOrder(order)` từ `meInvoiceBotClient.ts`.
  - Trả về kết quả: `{ success: true, count: N, invoices: [...] }` kèm mã Cơ quan thuế và link tra cứu hóa đơn.

#### 2. NÂNG CẤP GIAO DIỆN BẢNG ĐIỀU KHIỂN SAPO2MISA (`app/(shell)/finance/sapo2misa/page.tsx`):
- **Cột Bảng Dữ Liệu:**
  - Hiển thị thêm cột **Mã Định Danh (Alias Code)** (hiển thị badge chuẩn `SK-SO-...`, `SK-WEB-...`, `SK-POS-...`).
  - Hiển thị cột **Kênh Bán (Channel)**: Badge màu phân biệt (Web Order, POS, Quán Ăn HN, Đại Lý Tỉnh).
- **Thanh Công Cụ Hành Động Trực Tiếp (Action Bar):**
  - Giữ nguyên nút: **"Đồng bộ Sapo"** (kéo đơn live) và **"Xuất Excel 63 cột"**.
  - Bổ sung 2 nút hành động MISA OpenAPI:
    - **Nút "Đẩy AMIS Kế Toán"**: Khi bấm sẽ gọi `POST /api/sapo2misa/amis`, hiển thị spinner loading, ghi log trực tiếp vào màn hình terminal và cập nhật trạng thái bước 4 trên Stepper thành "Đã hạch toán vào AMIS".
    - **Nút "Phát Hành meInvoice Bot"**: Khi bấm sẽ gọi `POST /api/sapo2misa/meinvoice`, phát hành HĐĐT tự động, mở Dialog thông báo kèm Mã số HĐĐT và mã cấp của Cơ quan thuế.
- **Terminal Logs:**
  - Ghi lại chi tiết từng lượt gọi API Sapo, AMIS Kế toán và meInvoice Bot theo thời gian thực.

---

### YÊU CẦU NGHIỆM THU:
1. Chạy `npx tsc --noEmit` đạt 0 lỗi.
2. TUYỆT ĐỐI KHÔNG chạy lệnh `git commit` hay `git push` (Commander sẽ thực hiện).
3. Ghi báo cáo hoàn thành vào `.claude/reports/worker-2-misa.md`.
