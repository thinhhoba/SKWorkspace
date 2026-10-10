---
description: [WORKER 4 - DOCS SQUAD] Thực thi chỉ thị Văn thư, Hồ sơ pháp lý & Hợp đồng B2B (/docs)
---

Đọc file `.claude/inbox/worker-4.md` trong workspace hiện tại.
Đó là bản chỉ thị nhiệm vụ độc lập dành riêng cho Worker 4 do Commander ban hành.
1. Đọc kỹ toàn bộ yêu cầu, 5 tệp PDF pháp lý trong `docs/legal/` và biểu mẫu trong `.claude/inbox/worker-4.md`.
2. CHỈ ĐƯỢC PHÉP tạo và sửa file trong phạm vi: `packages/modules/docs/**`, `app/(shell)/docs/**`, `app/api/docs/**`. TUYỆT ĐỐI KHÔNG sửa các file thuộc thư mục khác.
3. TUYỆT ĐỐI KHÔNG chạy lệnh `git commit` hay `git push` để tránh xung đột với các worker khác đang chạy song song.
4. Chạy kiểm tra `npx tsc --noEmit` để đảm bảo không có lỗi type.
5. Sau khi hoàn thành, BẮT BUỘC ghi tóm tắt báo cáo nghiệm thu vào `.claude/reports/worker-4-docs.md`.
