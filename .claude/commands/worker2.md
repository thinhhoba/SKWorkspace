---
description: [WORKER 2 - REPORTS SQUAD] Thực thi chỉ thị Báo cáo Quản trị BI (/reports)
---

Đọc file `.claude/inbox/worker-2.md` trong workspace hiện tại.
Đó là bản chỉ thị nhiệm vụ độc lập dành riêng cho Worker 2 do Commander ban hành.
1. Đọc kỹ toàn bộ yêu cầu, phân tích doanh thu 6 kênh và lãi gộp trong `.claude/inbox/worker-2.md`.
2. CHỈ ĐƯỢC PHÉP tạo và sửa file trong phạm vi: `packages/modules/reports/**`, `app/(shell)/reports/**`, `app/api/reports/**`. TUYỆT ĐỐI KHÔNG sửa các file thuộc thư mục khác.
3. TUYỆT ĐỐI KHÔNG chạy lệnh `git commit` hay `git push` để tránh xung đột với các worker khác đang chạy song song.
4. Chạy kiểm tra `npx tsc --noEmit` để đảm bảo không có lỗi type.
5. Sau khi hoàn thành, BẮT BUỘC ghi tóm tắt báo cáo nghiệm thu vào `.claude/reports/worker-2-reports.md`.
