# LỆNH THỰC THI WORKER 5 — SAPO HUB & MISA AUTO-ACCOUNTING SQUAD

Đọc kỹ chỉ thị tại file: `.claude/inbox/sapo-worker-5.md` và thực hiện nghiêm ngặt các quy tắc sau:

1. **Ranh giới tập tin (STRICT FILE BOUNDARY):**
   - CHỈ ĐƯỢC PHÉP tạo và chỉnh sửa các file sau:
     - `app/(shell)/sales/sapo/page.tsx`
     - `packages/integrations/sapo/sapoHubService.ts`
     - `app/api/sapo/hub/route.ts`
     - `app/api/sapo/cron/eod-accounting/route.ts`
     - `.claude/reports/sapo-worker-5.md`
   - TUYỆT ĐỐI KHÔNG chạm vào bất kỳ file nào khác ngoài danh sách trên.

2. **Yêu cầu kỹ thuật:**
   - Xây dựng Dashboard Sapo Live Hub (`/sales/sapo`) với phong cách 3D Claymorphism, hiển thị đơn live hôm nay.
   - Thẻ hiển thị trạng thái kết nối Cloudflare 1/40 calls/s, nút kéo đơn và nút đối soát MISA.
   - Endpoint hạch toán tự động cuối ngày gom đơn sang 63 cột MISA AMIS.
   - Đảm bảo `npx tsc --noEmit` đạt 0 lỗi.

3. **Quy tắc an toàn Git:**
   - TUYỆT ĐỐI KHÔNG chạy lệnh `git commit` hay `git push`.
   - Báo cáo kết quả chi tiết vào `.claude/reports/sapo-worker-5.md`.
