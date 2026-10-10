---
description: [WORKER 6 - SETTINGS SQUAD] Thực thi chỉ thị Cấu hình hệ thống, Tích hợp & Doanh nghiệp (/settings)
---

Đọc file `.claude/inbox/worker-6.md` trong workspace hiện tại.
Đó là bản chỉ thị nhiệm vụ độc lập dành riêng cho Worker 6 do Commander ban hành.
1. Đọc kỹ toàn bộ yêu cầu, 5 nhóm cấu hình (doanh nghiệp, VietQR, Sapo, MISA, chính sách) trong `.claude/inbox/worker-6.md`.
2. CHỈ ĐƯỢC PHÉP tạo và sửa file trong phạm vi: `packages/modules/settings/**`, `app/(shell)/settings/**`, `app/api/settings/**`. TUYỆT ĐỐI KHÔNG sửa các file thuộc thư mục khác.
3. TUYỆT ĐỐI KHÔNG chạy lệnh `git commit` hay `git push` để tránh xung đột với các worker khác đang chạy song song.
4. Chạy kiểm tra `npx tsc --noEmit` để đảm bảo không có lỗi type.
5. Sau khi hoàn thành, BẮT BUỘC ghi tóm tắt báo cáo nghiệm thu vào `.claude/reports/worker-6-settings.md`.
