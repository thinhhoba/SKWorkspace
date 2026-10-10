---
description: [WORKER 1 - PRICING SQUAD] Thực thi chỉ thị chuyên trách phân hệ Bảng Giá /pricing
---

Đọc file `.claude/inbox/worker-1.md` trong workspace hiện tại.
Đó là bản chỉ thị nhiệm vụ độc lập dành riêng cho Worker 1 do Commander ban hành.
1. Đọc kỹ toàn bộ yêu cầu, dữ liệu mockData và phạm vi file cho phép trong `.claude/inbox/worker-1.md`.
2. CHỈ ĐƯỢC PHÉP tạo và sửa file trong phạm vi: `packages/modules/pricing/**` và `app/(shell)/pricing/**`, `app/api/pricing/**`. TUYỆT ĐỐI KHÔNG sửa các file thuộc thư mục khác.
3. TUYỆT ĐỐI KHÔNG chạy lệnh `git commit` hay `git push` để tránh xung đột với các worker khác đang chạy song song.
4. Chạy kiểm tra `npx tsc --noEmit` để đảm bảo không có lỗi type.
5. Sau khi hoàn thành, BẮT BUỘC ghi tóm tắt báo cáo nghiệm thu vào `.claude/reports/worker-1-pricing.md`.
