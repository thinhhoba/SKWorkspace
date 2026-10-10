# LỆNH THỰC THI WORKER 3 — SAPO CUSTOMER B2B & PRICING SYNC SQUAD

Đọc kỹ chỉ thị tại file: `.claude/inbox/sapo-worker-3.md` và thực hiện nghiêm ngặt các quy tắc sau:

1. **Ranh giới tập tin (STRICT FILE BOUNDARY):**
   - CHỈ ĐƯỢC PHÉP tạo và chỉnh sửa các file sau:
     - `packages/integrations/sapo/customerSync.ts`
     - `packages/integrations/sapo/productSync.ts`
     - `app/api/sapo/customers/route.ts`
     - `app/api/sapo/customers/sync/route.ts`
     - `app/api/sapo/products/route.ts`
     - `.claude/reports/sapo-worker-3.md`
   - TUYỆT ĐỐI KHÔNG chạm vào bất kỳ file nào khác ngoài danh sách trên.

2. **Yêu cầu kỹ thuật:**
   - Kéo danh sách khách hàng từ Sapo API và phân loại nhóm B2B (Quán ăn, Chành xe, Căn tin, Bán lẻ).
   - Tích lũy công nợ và cập nhật tuổi nợ.
   - Bảng giá B2B 4 cấp theo chính sách Sơn Khang.
   - Đảm bảo `npx tsc --noEmit` đạt 0 lỗi.

3. **Quy tắc an toàn Git:**
   - TUYỆT ĐỐI KHÔNG chạy lệnh `git commit` hay `git push`.
   - Báo cáo kết quả chi tiết vào `.claude/reports/sapo-worker-3.md`.
