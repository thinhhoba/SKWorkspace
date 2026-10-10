# LỆNH THỰC THI WORKER 4 — SAPO FULFILLMENT & DISPATCH SQUAD

Đọc kỹ chỉ thị tại file: `.claude/inbox/sapo-worker-4.md` và thực hiện nghiêm ngặt các quy tắc sau:

1. **Ranh giới tập tin (STRICT FILE BOUNDARY):**
   - CHỈ ĐƯỢC PHÉP tạo và chỉnh sửa các file sau:
     - `packages/integrations/sapo/fulfillmentSync.ts`
     - `app/api/sapo/fulfillment/route.ts`
     - `app/api/sapo/fulfillment/dispatch/route.ts`
     - `app/api/sapo/fulfillment/update/route.ts`
     - `.claude/reports/sapo-worker-4.md`
   - TUYỆT ĐỐI KHÔNG chạm vào bất kỳ file nào khác ngoài danh sách trên.

2. **Yêu cầu kỹ thuật:**
   - Phân tích địa chỉ/ghi chú đơn Sapo để gom chuyến: Tuyến nội thành vs Tuyến chành xe 4 bến.
   - Tạo mẫu phiếu gửi chành xe dán thùng xốp kèm mã QR Techcombank 22226060.
   - Cập nhật trạng thái `fulfilled` ngược lại Sapo API khi giao thành công.
   - Đảm bảo `npx tsc --noEmit` đạt 0 lỗi.

3. **Quy tắc an toàn Git:**
   - TUYỆT ĐỐI KHÔNG chạy lệnh `git commit` hay `git push`.
   - Báo cáo kết quả chi tiết vào `.claude/reports/sapo-worker-4.md`.
