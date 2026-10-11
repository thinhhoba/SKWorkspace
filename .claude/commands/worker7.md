---
description: [WORKER 7 - SYSTEM CORE] Thực thi chỉ thị Quản trị Hệ thống, RBAC & Integration Gateway
---

Đọc file `.claude/inbox/worker-7.md` trong workspace hiện tại.
Đó là bản chỉ thị nhiệm vụ độc lập dành riêng cho Worker 7 do Commander ban hành.
1. Đọc kỹ toàn bộ yêu cầu, phân quyền RBAC & Gateway trong `.claude/inbox/worker-7.md`.
2. CHỈ ĐƯỢC PHÉP tạo và sửa file trong phạm vi: `packages/core/**`, `app/(shell)/settings/**`, `app/(shell)/audit/**`, `app/(shell)/profile/**`, `app/api/settings/**`, `app/api/audit/**`.
3. TUYỆT ĐỐI KHÔNG chạy lệnh `git commit` hay `git push` để tránh xung đột với các worker khác đang chạy song song.
4. Chạy kiểm tra `npx tsc --noEmit` để đảm bảo không có lỗi type.
5. Sau khi hoàn thành, BẮT BUỘC ghi tóm tắt báo cáo nghiệm thu vào `.claude/reports/worker-7-system.md`.
