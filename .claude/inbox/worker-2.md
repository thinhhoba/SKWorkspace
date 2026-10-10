# CHỈ THỊ LỆNH PHÂN CÔNG — WORKER 2 (WAREHOUSE & COLD CHAIN SQUAD)
# DỰ ÁN: SK WORKSPACE 2 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# NHIỆM VỤ: PHÂN HỆ QUẢN LÝ KHO LẠNH & HẠN SỬ DỤNG FEFO (/inventory & PWA Kho)

---

### PHẠM VI DANH MỤC FILE CHO PHÉP (STRICT BOUNDARY):
> ⚠️ **NGUYÊN TẮC AN TOÀN:** Worker 2 CHỈ ĐƯỢC PHÉP tạo và sửa trong các file sau. TUYỆT ĐỐI KHÔNG chạm vào `delivery`, `customers`, hay `pricing` để tránh xung đột với Worker 1 và Worker 3.
- `packages/modules/inventory/**` (`types.ts`, `mockData.ts`, `inventoryService.ts`)
- `app/api/inventory/**` (`route.ts`, `transfer/route.ts`)
- `app/(shell)/inventory/page.tsx` (Cập nhật giao diện kho lạnh)
- `app/pwa/kho/page.tsx` (Cập nhật PWA thủ kho)
- Báo cáo kết quả vào: `.claude/reports/worker-2-inventory.md`

---

### DỮ LIỆU ĐỊNH DANH VẬN HÀNH:
- **Thủ kho trung tâm:** TRẦN THỊ NGỌC THÚY (SĐT: `0942 22 60 60`)
- **Hai kho hoạt động chính thức:**
  1. `KHO_DINH_CONG`: Kho Tổng Định Công (Số 96 Ngõ 337 Phố Định Công, Hoàng Mai, Hà Nội) — Kho trung tâm phân phối chính.
  2. `KHO_YEN_BINH`: Kho Vệ Tinh Yên Bình (Thôn 6 Yên Bình / Yên Xuân, Hà Nội) — Kho đệm nguyên liệu & lưu trữ.
- **Phân loại nhiệt độ chuẩn:**
  - *Kho Đông Lạnh (-18°C):* Viên chiên LC Foods, Gà chiên CP, Nem chua rán Đức Minh, Dồi sụn, Khoai tây chiên...
  - *Kho Mát (0°C ~ 4°C):* Tokbokki bánh gạo, Xúc xích, Kim chi, Sốt mì trộn...
  - *Kho Khô Thường:* Mì trộn Indomie, Mì Koreno, Mì Nissin, Tương ớt/cà Sài Gòn, Mayonnaise, Dầu ăn...

---

### CHI TIẾT CÁC HẠNG MỤC CẦN LÀM:

#### 1. CHUẨN HÓA DỮ LIỆU KHO THỰC TẾ (`packages/modules/inventory/`):
- `types.ts`:
  - `WarehouseCode`: `"KHO_DINH_CONG" | "KHO_YEN_BINH"`.
  - `StorageTempZone`: `"dong_lanh" | "kho_mat" | "kho_kho"`.
  - Cột quản lý FEFO: `lot_number`, `expiry_date`, `days_until_expiry`, `is_near_expiry` (cảnh báo nếu < 30 ngày).
- `mockData.ts`: Thay thế 100% dữ liệu cũ (Q7/Q12, thịt heo xay) bằng 20+ mặt hàng thực tế của Sơn Khang theo 2 kho Định Công & Yên Bình.
- `inventoryService.ts`:
  - Lọc theo kho và theo phân vùng nhiệt độ.
  - Hàm cảnh báo cận hạn sử dụng FEFO.
  - Tạo phiếu luân chuyển nội bộ (`SK-DC-...`) giữa Kho Định Công và Kho Yên Bình.

#### 2. GIAO DIỆN SHELL & PWA:
- **Giao diện Web (`app/(shell)/inventory/page.tsx`):**
  - 4 Thẻ Clay-KPI: Tổng tồn trị giá (VNĐ), Cảnh báo sắp hết hàng, Cảnh báo cận hạn FEFO (<30 ngày - Rose tone), Tồn kho đông & mát.
  - Tabs phân loại: Tất cả kho | Kho Tổng Định Công (HN) | Kho Yên Bình (Thạch Thất).
  - Badge nhiệt độ bảo quản trực quan (-18°C, 0–4°C, Thường).
  - Cột hạn sử dụng & số ngày còn lại (đỏ nếu <30 ngày, vàng nếu <60 ngày, xanh nếu >60 ngày).
  - Modal tạo phiếu luân chuyển kho & Phiếu kiểm kê kho lạnh (`SK-KK-`).
- **Cập nhật PWA Thủ kho (`app/pwa/kho/page.tsx`):**
  - Màn hình quét mã / kiểm đếm nhanh cho Thủ kho Trần Thị Ngọc Thúy.

---

### YÊU CẦU NGHIỆM THU:
1. Chạy `npx tsc --noEmit` đạt 0 lỗi.
2. TUYỆT ĐỐI KHÔNG chạy `git commit` hay `git push`.
3. Ghi báo cáo nghiệm thu vào `.claude/reports/worker-2-inventory.md`.
