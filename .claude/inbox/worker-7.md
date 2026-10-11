# PHÂN CÔNG THỰC THI — WORKER 7 (SYSTEM CORE & ADMINISTRATION SQUAD)
# DỰ ÁN: SƠN KHANG WORKSPACE 2.0 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: 0111252725)
# PHÂN HỆ: 7. QUẢN TRỊ HỆ THỐNG (SYSTEM CORE & ADMINISTRATION)
# CĂN CỨ: CHỈ THỊ SỐ 19 TỪ COMMANDER

---

### PHẠM VI DANH MỤC TỆP CHO PHÉP (STRICT BOUNDARY):
- `packages/core/**`
- `app/(shell)/settings/**`
- `app/(shell)/audit/**`
- `app/(shell)/profile/**`
- `app/(shell)/docs/**`
- `app/(shell)/notes/**`
- `app/(shell)/mail/**`
- `app/api/settings/**`
- `app/api/audit/**`
- Báo cáo kết quả: `.claude/reports/worker-7-system.md`

---

### NHIỆM VỤ CHI TIẾT:
1. **Trang cá nhân (User Workspace):** Đổi mật khẩu, chữ ký số, To-do list, lịch sử chấm công & payslip.
2. **Phân quyền RBAC:** Phân quyền theo vai trò (Admin, Trưởng Thu mua, Thủ kho, Kế toán, Sales Admin, Shipper/Tài xế); kiểm soát quyền hành động và chi nhánh/kho.
3. **Master Settings:** Thuế suất mặc định (8%, 10%), mẫu hóa đơn C26TSK, quy tắc làm tròn, tỷ lệ quy đổi UoM Thùng $\leftrightarrow$ Gói/Can.
4. **Integration Gateway:** Quản lý Webhook Sapo, OAuth 2.0 MISA Open API, cổng VietQR Techcombank, 3PL và ZNS.
5. **Notification Center:** Cảnh báo đơn hàng, nợ quá hạn, cận date, duyệt chứng từ (Web, Mobile, Telegram Bot, Zalo ZNS).
6. **Audit Trail & Logs:** Ghi vết lịch sử thao tác & toàn bộ Request/Response API MISA.

---

### YÊU CẦU NGHIỆM THU:
- `npx tsc --noEmit` đạt 0 lỗi.
- Báo cáo kết quả vào `.claude/reports/worker-7-system.md`.
