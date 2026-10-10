---
description: [WORKER 3 - HR SQUAD] Thực thi chỉ thị Quản lý Nhân sự, Chấm công & Phân quyền (/hr)
---

Đọc file `.claude/inbox/worker-3.md` trong workspace hiện tại.
Đó là bản chỉ thị nhiệm vụ độc lập dành riêng cho Worker 3 do Commander ban hành.
1. Đọc kỹ toàn bộ yêu cầu, dữ liệu 4 nhân sự chính và ca làm việc trong `.claude/inbox/worker-3.md`.
2. CHỈ ĐƯỢC PHÉP tạo và sửa file trong phạm vi: `packages/modules/hr/**`, `app/(shell)/hr/**`, `app/api/hr/**`. TUYỆT ĐỐI KHÔNG sửa các file thuộc thư mục khác.
3. TUYỆT ĐỐI KHÔNG chạy lệnh `git commit` hay `git push` để tránh xung đột với các worker khác đang chạy song song.
4. Chạy kiểm tra `npx tsc --noEmit` để đảm bảo không có lỗi type.
5. Sau khi hoàn thành, BẮT BUỘC ghi tóm tắt báo cáo nghiệm thu vào `.claude/reports/worker-3-hr.md`.
