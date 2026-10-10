# CHỈ THỊ LỆNH PHÂN CÔNG — WORKER 1 (SAPO WEBHOOK & REALTIME ENGINE)
# DỰ ÁN: SK WORKSPACE 2 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# NHIỆM VỤ: HỆ THỐNG WEBHOOK NHẬN ĐƠN HÀNG REALTIME TỪ SAPO OPEN API

---

### PHẠM VI DANH MỤC FILE CHO PHÉP (STRICT BOUNDARY):
> ⚠️ **NGUYÊN TẮC AN TOÀN:** Worker 1 CHỈ ĐƯỢC PHÉP tạo và sửa trong các file sau. TUYỆT ĐỐI KHÔNG chạm vào thư mục của các worker khác.
- `packages/integrations/sapo/webhookService.ts` (Tạo mới)
- `packages/integrations/sapo/types.ts` (Mở rộng thêm webhook types)
- `app/api/sapo/webhooks/route.ts` (Endpoint nhận tổng hợp hoặc đăng ký webhook)
- `app/api/sapo/webhooks/orders/create/route.ts` (Webhook khi có đơn hàng mới)
- `app/api/sapo/webhooks/orders/update/route.ts` (Webhook khi đơn đổi trạng thái)
- Báo cáo kết quả vào: `.claude/reports/sapo-worker-1.md`

---

### DỮ LIỆU ĐỊNH DANH HỆ THỐNG SAPO SƠN KHANG:
- **Cửa hàng:** `https://sonkhang.mysapo.net`
- **API Key:** `0166bd3c4bb745edb301413aec771b2b`
- **API Secret / Webhook Secret:** `e2cc59d4ace34a009a0704ab9f72a8b4`
- **Header xác thực Webhook:** `X-Sapo-Hmac-Sha256`, `X-Sapo-Topic`, `X-Sapo-Shop-Domain`

---

### CHI TIẾT CÁC HẠNG MỤC CẦN LÀM:
1. **Module Webhook Service (`packages/integrations/sapo/webhookService.ts`):**
   - Hàm `verifySapoWebhook(rawBody: string, hmacHeader: string): boolean`: Xác thực chữ ký HMAC-SHA256 chuẩn Sapo.
   - Hàm `processOrderWebhook(topic: string, orderData: SapoOrder)`:
     - Tự động chuẩn hóa đơn Sapo thành `CentralOrder` (gán mã `SK-SO-`, phân loại kênh bán hàng, chi tiết hàng, thuế 8%).
     - Lưu sự kiện vào hàng đợi/bộ nhớ đệm webhook logs để giám sát.
   - Hàm `getWebhookLogs(limit?: number)`: Lấy danh sách sự kiện webhook gần nhất.
2. **API Endpoints:**
   - `POST /api/sapo/webhooks/orders/create`: Nhận payload đơn mới từ Sapo, xác thực HMAC, chuyển đổi thành CentralOrder, trả HTTP 200 tức thì cho Sapo.
   - `POST /api/sapo/webhooks/orders/update`: Nhận cập nhật trạng thái đơn (chờ duyệt, đã thanh toán, đã hủy).
   - `GET /api/sapo/webhooks`: Lấy trạng thái hoạt động và danh sách các sự kiện webhook đã nhận.
3. **Chế Độ Kiểm Thử Mô Phỏng (Self-Test Simulation):**
   - Hỗ trợ endpoint test ping gửi payload giả lập để kiểm tra HMAC mà không cần gọi ra ngoài.

---

### YÊU CẦU NGHIỆM THU:
1. `npx tsc --noEmit` đạt 0 lỗi.
2. TUYỆT ĐỐI KHÔNG chạy `git commit` hay `git push`.
3. Ghi báo cáo vào `.claude/reports/sapo-worker-1.md`.
