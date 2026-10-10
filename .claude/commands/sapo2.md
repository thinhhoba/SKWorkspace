# LỆNH THỰC THI WORKER 2 — SAPO INVENTORY 2-WAY SYNC SQUAD

Đọc kỹ chỉ thị tại file: `.claude/inbox/sapo-worker-2.md` và thực hiện nghiêm ngặt các quy tắc sau:

1. **Ranh giới tập tin (STRICT FILE BOUNDARY):**
   - CHỈ ĐƯỢC PHÉP tạo và chỉnh sửa các file sau:
     - `packages/integrations/sapo/inventorySync.ts`
     - `app/api/sapo/inventory/route.ts`
     - `app/api/sapo/inventory/push/route.ts`
     - `app/api/sapo/inventory/reconcile/route.ts`
     - `.claude/reports/sapo-worker-2.md`
   - TUYỆT ĐỐI KHÔNG chạm vào bất kỳ file nào khác ngoài danh sách trên.

2. **Yêu cầu kỹ thuật:**
   - Xây dựng logic pull tồn Sapo từ `https://sonkhang.mysapo.net/admin/variants.json`.
   - Xây dựng bảng đối soát lệch tồn giữa Kho vật lý (Định Công / Yên Bình) và Sapo.
   - Hàm `pushStockToSapo` cập nhật tồn khả dụng lên Sapo an toàn.
   - Đảm bảo `npx tsc --noEmit` đạt 0 lỗi.

3. **Quy tắc an toàn Git:**
   - TUYỆT ĐỐI KHÔNG chạy lệnh `git commit` hay `git push`.
   - Báo cáo kết quả chi tiết vào `.claude/reports/sapo-worker-2.md`.
