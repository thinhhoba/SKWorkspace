# CHỈ THỊ LỆNH TỪ COMMANDER & CHỦ TỊCH: XÂY DỰNG PHÂN HỆ MOBILE PWA ĐA VAI TRÒ (4 ROLE PERSONAS)
# DỰ ÁN: SK WORKSPACE — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# CĂN CỨ PHÊ DUYỆT: Quyết định Chủ tịch ngày 08/10/2026 — Thiết kế PWA chuyên biệt theo 4 đối tượng người dùng

Chủ tịch và Commander đã **CHÍNH THỨC PHÊ DUYỆT ĐỀ ÁN PWA ĐA VAI TRÒ**:
Nâng cấp toàn bộ phân hệ PWA tại `app/pwa/` từ giao diện chung sang **4 không gian trải nghiệm chuyên biệt cho 4 nhóm nhân sự**, tích hợp sẵn công cụ **Role Switcher** để chuyển đổi vai trò tức thì, toàn bộ áp dụng chuẩn thẩm mỹ **3D Claymorphism & Glossy Soft Tech**.

Kích hoạt **Agent Code (Model: Claude Sonnet 5.5)** triển khai theo các hạng mục cụ thể sau:

---

### 1. NỀN TẢNG KIẾN TRÚC & ROLE SWITCHER:
1. **Cập nhật `packages/core/rbac.ts`**:
   - Định nghĩa 4 roles chuẩn: `admin` (Giám đốc), `accountant` (Kế toán), `warehouse` (Kho lạnh), `delivery` (Giao hàng/Shipper).
   - Quản lý role hiện tại thông qua React Context hoặc Client State để các component PWA tự động phản hồi.
2. **Component `RoleSwitcher.tsx` ([app/pwa/_components/RoleSwitcher.tsx](file:///z:/SK%20Workspace%202/app/pwa/_components/RoleSwitcher.tsx))**:
   - Nút bấm dạng viên thuốc kính mờ `.glossy-pill` tích hợp ngay trên Topbar của PWA.
   - Bấm vào mở popup/drawer cho phép chọn 1 trong 4 vai trò kèm huy hiệu màu nhận diện riêng.
   - Khi đổi vai trò: Toàn bộ giao diện trang chủ PWA và thanh điều hướng BottomNav lập tức thích ứng theo vai trò đó.
3. **Thanh điều hướng linh hoạt `BottomNav.tsx` ([app/pwa/_components/BottomNav.tsx](file:///z:/SK%20Workspace%202/app/pwa/_components/BottomNav.tsx))**:
   - Giữ nguyên thiết kế **viên thuốc kính nổi lơ lửng** (`floating pill bar` 56px, bo tròn 9999px, safe-area).
   - Tự động đổi 4 tab tương ứng với từng vai trò:
     - **Admin:** `Tổng quan` · `Duyệt lệnh` · `Dòng tiền` · `Cài đặt`
     - **Kế toán:** `Công nợ B2B` · `Thu / Chi` · `Sapo ↔ MISA` · `Đối soát`
     - **Kho:** `Soạn đơn` · `Nhập hàng` · `Kho lạnh` · `Quét mã`
     - **Giao hàng:** `Chuyến giao` · `Thu COD` · `Quét QR` · `Lịch sử`

---

### 2. GIAO DIỆN CHI TIẾT CHO 4 VAI TRÒ (3D CLAYMORPHISM & GLOSSY SOFT TECH):

#### A. GIÁM ĐỐC / ADMIN (`admin`):
- **4 Thẻ Clay KPI nổi:** Doanh thu thực thu hôm nay (`128.400.000 ₫`), Số dư quỹ tiền mặt/ngân hàng (`540.200.000 ₫`), Công nợ quá hạn (`84.200.000 ₫`), Tồn kho cảnh báo (`5 SKU`).
- **Trung tâm Phê duyệt 1 chạm (Quick Approvals):** Thẻ `.clay-card` hiển thị 2 phiếu chờ duyệt (Phiếu chi khẩn cấp 15.000.000 ₫ của kho Q7; Đơn hàng SP-0842 xuất vượt hạn mức nợ). Có nút Duyệt (xanh ngọc) và Từ chối (đỏ).
- **Cảnh báo điều hành:** Radar giám sát nhiệt độ 2 kho Q7 (-18.2°C) và Q12 (-17.9°C).

#### B. KẾ TOÁN (`accountant`):
- **Theo dõi công nợ B2B:** Danh sách đại lý quá hạn (An Thịnh Mart 84.2tr - quá 12 ngày; Minh Khang Food 42.1tr - quá 5 ngày). Nút viên thuốc bóng `.glossy-pill` bấm 1 chạm gửi Zalo nhắc nợ.
- **Trạng thái đồng bộ Sapo ↔ MISA:** Thẻ hiển thị 48 đơn đã sync, 3 đơn chờ duyệt, 1 đơn lỗi MST kèm nút đẩy sync lại.
- **Đối soát dòng tiền VietQR:** Danh sách các món tiền khách vừa chuyển khoản theo đơn hàng để kế toán xác nhận nhanh.

#### C. NHÂN VIÊN KHO LẠNH Q7 / Q12 (`warehouse`):
- **Công thái học kho đông (-18°C):** Nút bấm to bản (`min-h-[52px]`), chữ số đậm nét, dễ bấm khi đeo găng tay.
- **Danh sách đơn cần soạn sáng nay:** Thẻ đơn hàng to dạng `.clay-card`. Bấm vào hiển thị checklist từng món (Heo xay 500g: 40 gói; Bò viên 1kg: 20 gói; Chả lụa 500g: 50 đòn). Khi nhân viên chạm tick từng món, ô chuyển sang xanh ngọc kèm rung haptic.
- **Giám sát kho đông:** Widget hiển thị nhiệt độ kho Q7 và Q12 chuẩn -18°C.
- **Khung quét Barcode / Pallet QR:** Camera viewfinder quét mã lô hạn sử dụng.

#### D. NHÂN VIÊN GIAO HÀNG / SHIPPER (`delivery`):
- **Lộ trình chuyến giao:** Danh sách các điểm giao sắp xếp tối ưu sáng nay (Điểm 1: An Thịnh Mart Q7; Điểm 2: Minh Khang Food Q1; Điểm 3: Hòa Bình Market Q4).
- **Nút tương tác 1 chạm:** Mỗi điểm giao có nút Gọi điện (`tel:`) và Mở bản đồ (`Google Maps`).
- **MÁY TẠO VIETQR ĐỘNG THU TIỀN:** Bấm nút "Thu tiền COD" trên thẻ đơn hàng sẽ mở modal hiển thị mã **VietQR Napas chuẩn** kèm đúng số tiền của đơn hàng (VD: `42.800.000 ₫`) và nội dung chuyển khoản để khách quét chuyển tiền ngay.
- **Xác nhận giao hàng:** Nút chụp ảnh hóa đơn đã ký hoặc hàng đã giao (PoD).

---

### 3. QUY TẮC KIỂM THỬ & BÀN GIAO:
- Kiểm tra tính tương thích TypeScript: `npx tsc --noEmit` đạt 0 lỗi.
- Kiểm tra build tĩnh: `npm run build` phải PASS 100%.
- Cập nhật bản tóm tắt nghiệm thu vào `.claude/reports/latest.md`.
