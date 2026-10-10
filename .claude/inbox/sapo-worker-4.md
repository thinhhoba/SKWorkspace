# CHỈ THỊ LỆNH PHÂN CÔNG — WORKER 4 (SAPO FULFILLMENT & DISPATCH SQUAD)
# DỰ ÁN: SK WORKSPACE 2 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# NHIỆM VỤ: GOM ĐƠN SAPO THEO TUYẾN, ĐIỀU XE CHÀNH XE & ĐỒNG BỘ FULFILLMENT

---

### PHẠM VI DANH MỤC FILE CHO PHÉP (STRICT BOUNDARY):
> ⚠️ **NGUYÊN TẮC AN TOÀN:** Worker 4 CHỈ ĐƯỢC PHÉP tạo và sửa trong các file sau. TUYỆT ĐỐI KHÔNG chạm vào thư mục của các worker khác.
- `packages/integrations/sapo/fulfillmentSync.ts` (Tạo mới)
- `app/api/sapo/fulfillment/route.ts` (Tạo mới — Lấy danh sách fulfillment & gom chuyến)
- `app/api/sapo/fulfillment/dispatch/route.ts` (Tạo mới — Tự động tạo chuyến xe từ đơn Sapo)
- `app/api/sapo/fulfillment/update/route.ts` (Tạo mới — Cập nhật đã giao lên Sapo)
- Báo cáo kết quả vào: `.claude/reports/sapo-worker-4.md`

---

### DỮ LIỆU ĐỊNH DANH GIAO VẬN SƠN KHANG:
- **Tài xế chuyên trách:** NGÔ VĂN TÂN (`0942 22 60 60`).
- **Biển số xe tải lạnh:** `29C-882.60` (Xuất phát từ Kho Tổng Định Công).
- **Phân tuyến thực tế:**
  - Tuyến nội thành: Cầu Giấy, Đống Đa, Hai Bà Trưng, Bách - Kinh - Xây.
  - Tuyến chành xe 4 bến lớn: Bến Giáp Bát, Nước Ngầm, Mỹ Đình, Gia Lâm đi các tỉnh phía Bắc.
- **Tài khoản thu hộ COD VietQR:** Techcombank `22226060` (CONG TY TNHH THUC PHAM SON KHANG).

---

### CHI TIẾT CÁC HẠNG MỤC CẦN LÀM:
1. **Module Gom Đơn & Điều Xe (`packages/integrations/sapo/fulfillmentSync.ts`):**
   - Hàm `groupOrdersByRoute(sapoOrders: SapoOrder[])`:
     - Tự động phân tích địa chỉ giao hàng và ghi chú của đơn Sapo.
     - Gom đơn vào 2 nhóm tuyến: `NOI_THANH_HN` và `CHANH_XE_TINH` (gắn mã bến xe cụ thể: Giáp Bát / Nước Ngầm / Mỹ Đình / Gia Lâm).
   - Hàm `generateChanhXePackingSlip(order: SapoOrder)`:
     - Tạo mẫu phiếu gửi chành xe dán thùng xốp: Tên nhà xe, biển số xe gửi, người nhận tỉnh, SĐT, số kiện hàng, mã đơn Sapo, mã QR Techcombank 22226060.
   - Hàm `markSapoOrderFulfilled(sapoOrderId: number, trackingNumber: string)`:
     - Gửi yêu cầu cập nhật trạng thái đơn hàng trên Sapo thành `fulfilled` (kèm thông tin tài xế Ngô Văn Tân).
2. **API Endpoints:**
   - `GET /api/sapo/fulfillment`: Lấy danh sách đơn Sapo đang chờ giao, phân nhóm theo tuyến.
   - `POST /api/sapo/fulfillment/dispatch`: Gom các đơn Sapo đã chọn thành chuyến giao nhận `SK-DO-...` cho Tài xế Ngô Văn Tân.
   - `POST /api/sapo/fulfillment/update`: Cập nhật trạng thái `fulfilled` ngược lại Sapo khi tài xế giao thành công trên PWA.

---

### YÊU CẦU NGHIỆM THU:
1. `npx tsc --noEmit` đạt 0 lỗi.
2. TUYỆT ĐỐI KHÔNG chạy `git commit` hay `git push`.
3. Ghi báo cáo vào `.claude/reports/sapo-worker-4.md`.
