---
description: [WORKER 5 - AUDIT SQUAD] Thực thi chỉ thị Nhật ký kiểm toán & Logs tích hợp (/audit)
---

Đọc file `.claude/inbox/worker-5.md` trong workspace hiện tại.
Đó là bản chỉ thị nhiệm vụ độc lập dành riêng cho Worker 5 do Commander ban hành.
1. Đọc kỹ toàn bộ yêu cầu, cấu trúc log sự kiện Sapo/MISA/hệ thống trong `.claude/inbox/worker-5.md`.
2. CHỈ ĐƯỢC PHÉP tạo và sửa file trong phạm vi: `packages/modules/audit/**`, `app/(shell)/audit/**`, `app/api/audit/**`. TUYỆT ĐỐI KHÔNG sửa các file thuộc thư mục khác.
3. TUYỆT ĐỐI KHÔNG chạy lệnh `git commit` hay `git push` để tránh xung đột với các worker khác đang chạy song song.
4. Chạy kiểm tra `npx tsc --noEmit` để đảm bảo không có lỗi type.
5. Sau khi hoàn thành, BẮT BUỘC ghi tóm tắt báo cáo nghiệm thu vào `.claude/reports/worker-5-audit.md`.
