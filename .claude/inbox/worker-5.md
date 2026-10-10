# CHỈ THỊ LỆNH PHÂN CÔNG — WORKER 5 (SYSTEM AUDIT & LOGS SQUAD)
# DỰ ÁN: SK WORKSPACE 2 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# NHIỆM VỤ: PHÂN HỆ NHẬT KÝ HỆ THỐNG, VẾT KIỂM TOÁN & LOGS TÍCH HỢP (/audit)

---

### PHẠM VI DANH MỤC FILE CHO PHÉP (STRICT BOUNDARY):
> ⚠️ **NGUYÊN TẮC AN TOÀN:** Worker 5 CHỈ ĐƯỢC PHÉP tạo và sửa trong các file sau. TUYỆT ĐỐI KHÔNG chạm vào thư mục của các worker khác.
- `packages/modules/audit/**` (`types.ts`, `mockData.ts`, `auditService.ts`)
- `app/api/audit/**` (`route.ts`)
- `app/(shell)/audit/page.tsx` (Tạo mới giao diện nhật ký)
- Báo cáo kết quả vào: `.claude/reports/worker-5-audit.md`

---

### DỮ LIỆU ĐỊNH DANH HỆ THỐNG TÍCH HỢP:
- **Tích hợp ngoài:** Sapo API (`sonkhang.mysapo.net`), MISA AMIS Kế toán OpenAPI, MISA meInvoice Bot, VietQR Techcombank.
- **Nghiệp vụ ghi vết:** Đăng nhập hệ thống, Đồng bộ đơn Sapo, Hạch toán MISA, Phát hành HĐĐT, Đổi giá bán, Xuất/Nhập kho lạnh.

---

### CHI TIẾT CÁC HẠNG MỤC CẦN LÀM:
1. **Module Nghiệp Vụ (`packages/modules/audit/`):**
   - Cấu trúc `AuditLog`: ID, Thời gian (ISO), Nhân sự thao tác (`admin`, `ketoan`, `thukho`, `taixe`, `SYSTEM`), Module tác động (`PRICING`, `SALES`, `INVENTORY`, `DELIVERY`, `FINANCE_MISA`), Hành động (`SYNC_SAPO`, `POST_AMIS`, `PUBLISH_INVOICE`, `UPDATE_PRICE`, `DISPATCH_TRIP`, `LOGIN`), Mức độ (`INFO`, `SUCCESS`, `WARNING`, `ERROR`), Chi tiết payload.
   - Thống kê: Tổng số logs hôm nay, Số lượt đồng bộ API thành công, Số cảnh báo/lỗi hệ thống.
2. **API Endpoints:**
   - `GET /api/audit`: Lấy danh sách nhật ký, bộ lọc theo module, nhân sự, mức độ và tìm kiếm.
3. **Giao Diện Nhật Ký Kiểm Toán (`app/(shell)/audit/page.tsx`):**
   - 4 Thẻ Clay-KPI: Tổng lượt ghi nhận (Logs), Đồng bộ Sapo & MISA thành công (Emerald), Cảnh báo kiểm toán (Amber), Lỗi kết nối API (Rose).
   - Bộ lọc thanh công cụ: Lọc theo Module | Lọc theo Nhân sự | Lọc theo Mức độ (INFO/SUCCESS/WARN/ERR) | Ô tìm kiếm tức thì.
   - Bảng nhật ký trực quan: Timestamp, Badge mức độ, Nhân sự, Module, Mô tả sự kiện, Địa chỉ IP / Client, Nút xem chi tiết payload JSON.
   - Modal xem chi tiết Payload Request/Response của sự kiện kiểm toán.

---

### YÊU CẦU NGHIỆM THU:
1. `npx tsc --noEmit` đạt 0 lỗi.
2. TUYỆT ĐỐI KHÔNG chạy `git commit` hay `git push`.
3. Ghi báo cáo vào `.claude/reports/worker-5-audit.md`.
