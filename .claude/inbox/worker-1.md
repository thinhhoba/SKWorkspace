# CHỈ THỊ LỆNH PHÂN CÔNG — WORKER 1 (LOGISTICS & FLEET SQUAD)
# DỰ ÁN: SK WORKSPACE 2 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# NHIỆM VỤ: PHÂN HỆ GIAO VẬN & ĐIỀU PHỐI CHÀNH XE MIỀN BẮC (/delivery & PWA Giao Vận)

---

### PHẠM VI DANH MỤC FILE CHO PHÉP (STRICT BOUNDARY):
> ⚠️ **NGUYÊN TẮC AN TOÀN:** Worker 1 CHỈ ĐƯỢC PHÉP tạo và sửa trong các file sau. TUYỆT ĐỐI KHÔNG chạm vào `inventory`, `customers`, hay `finance` để tránh xung đột với Worker 2 và Worker 3.
- `packages/modules/delivery/**` (Tạo mới `types.ts`, `mockData.ts`, `deliveryService.ts`)
- `app/api/delivery/**` (Tạo mới `route.ts`, `[id]/route.ts`)
- `app/(shell)/delivery/page.tsx` (Tạo mới giao diện)
- `app/pwa/giaovan/page.tsx` (Cập nhật PWA tài xế)
- Báo cáo kết quả vào: `.claude/reports/worker-1-delivery.md`

---

### DỮ LIỆU ĐỊNH DANH VẬN HÀNH:
- **Tài xế chính:** NGÔ VĂN TÂN (SĐT: `0942 22 60 60`)
- **Kho xuất phát:** Kho Tổng Định Công (Số 96 Ngõ 337 Phố Định Công, P. Định Công, Hoàng Mai, Hà Nội)
- **Tài khoản thu hộ (COD/VietQR):** Techcombank `22226060` (CONG TY TNHH THUC PHAM SON KHANG)
- **Quy tắc giao hàng Sơn Khang:**
  - *Nội thành HN:* Freeship đơn từ 1tr (<8km) và đơn từ 3tr (<12km). Đơn dưới 500k phụ thu +10%.
  - *Chành xe tỉnh:* Đóng thùng xốp, gửi bến Giáp Bát, Nước Ngầm, Mỹ Đình, Gia Lâm. Khách CK 100% trước khi xuất kho (Không COD qua xe khách).

---

### CHI TIẾT CÁC HẠNG MỤC CẦN LÀM:

#### 1. MODULE DỮ LIỆU & SERVICE (`packages/modules/delivery/`):
- `types.ts`:
  - `DeliveryTrip`: Mã chuyến `SK-DO-...`, tài xế `Ngô Văn Tân`, biển số xe (vd: `29C-882.60`), loại tuyến (`noi_thanh_hn` | `chanh_xe_tinh`), trạng thái (`cho_xep_xe`, `dang_giao`, `da_giao`, `hoan_tat`).
  - `DeliveryStop`: Điểm dừng, khách hàng, địa chỉ (Quán ăn nội thành hoặc Bến xe Giáp Bát/Nước Ngầm/Mỹ Đình đi Nam Định, Hải Phòng, Quảng Ninh), số thùng xốp, số tiền thu hộ VietQR, trạng thái.
- `mockData.ts`: 8–10 vận đơn thực tế của Sơn Khang theo các bến xe và cụm quán ăn Hà Nội.
- `deliveryService.ts`: Tạo chuyến xe, cập nhật trạng thái trạm dừng, tạo phiếu gửi chành xe.

#### 2. API ENDPOINTS:
- `GET /api/delivery`: Danh sách chuyến xe & thống kê (đang giao, hoàn tất, tiền thu hộ).
- `POST /api/delivery`: Tạo chuyến giao hàng mới.
- `PATCH /api/delivery/[id]`: Cập nhật trạng thái chuyến / trạm dừng.

#### 3. GIAO DIỆN SHELL & PWA:
- **Giao diện Web (`app/(shell)/delivery/page.tsx`):**
  - 4 Thẻ Clay-KPI: Chuyến đang lăn bánh, Đơn giao nội thành HN, Kiện gửi chành xe tỉnh, Tổng tiền đối soát.
  - Tabs lọc tuyến: Tất cả | Tuyến Nội Thành HN | Tuyến Chành Xe Bến Bãi.
  - Bảng chuyến xe: Mã chuyến (`SK-DO-`), Tài xế, Biển số xe, Lộ trình, Số điểm giao, Trạng thái.
  - Modal xem chi tiết chuyến & nút **In Phiếu Gửi Chành Xe** (dán lên thùng xốp kèm thông tin nhà xe, người nhận tỉnh, mã QR Techcombank 22226060).
- **Cập nhật PWA Tài xế (`app/pwa/giaovan/page.tsx`):**
  - Tích hợp danh sách điểm dừng thực tế của tài xế Ngô Văn Tân với nút "Đã Giao" và "Quét VietQR 22226060".

---

### YÊU CẦU NGHIỆM THU:
1. Chạy `npx tsc --noEmit` đạt 0 lỗi.
2. TUYỆT ĐỐI KHÔNG chạy `git commit` hay `git push`.
3. Ghi báo cáo nghiệm thu vào `.claude/reports/worker-1-delivery.md`.
