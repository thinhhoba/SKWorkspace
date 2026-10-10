# LỆNH THỰC THI WORKER 1 — SAPO WEBHOOK & REALTIME ENGINE

Đọc kỹ chỉ thị tại file: `.claude/inbox/sapo-worker-1.md` và thực hiện nghiêm ngặt các quy tắc sau:

1. **Ranh giới tập tin (STRICT FILE BOUNDARY):**
   - CHỈ ĐƯỢC PHÉP tạo và chỉnh sửa các file sau:
     - `packages/integrations/sapo/webhookService.ts`
     - `packages/integrations/sapo/types.ts`
     - `app/api/sapo/webhooks/route.ts`
     - `app/api/sapo/webhooks/orders/create/route.ts`
     - `app/api/sapo/webhooks/orders/update/route.ts`
     - `.claude/reports/sapo-worker-1.md`
   - TUYỆT ĐỐI KHÔNG chạm vào bất kỳ file nào khác ngoài danh sách trên.

2. **Yêu cầu kỹ thuật:**
   - Sử dụng Node native `crypto` cho thuật toán HMAC-SHA256 với secret `e2cc59d4ace34a009a0704ab9f72a8b4`.
   - Chuẩn hóa payload đơn webhook thành `CentralOrder` tương thích `sapoClient.ts`.
   - Đảm bảo `npx tsc --noEmit` đạt 0 lỗi.

3. **Quy tắc an toàn Git:**
   - TUYỆT ĐỐI KHÔNG chạy lệnh `git commit` hay `git push`.
   - Báo cáo kết quả chi tiết vào `.claude/reports/sapo-worker-1.md`.
