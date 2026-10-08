# CHỈ THỊ LỆNH TỪ COMMANDER & CHỦ TỊCH: NÂNG CẤP THẨM MỸ 3D CLAYMORPHISM & GLOSSY SOFT TECH UI
# DỰ ÁN: SK WORKSPACE — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# CĂN CỨ PHÊ DUYỆT: Quyết định Chủ tịch ngày 08/10/2026 — Định hướng Visual Soft Tech / Neo-Claymorphism

Chủ tịch và Commander đã **CHÍNH THỨC PHÊ DUYỆT ĐỊNH HƯỚNG THẨM MỸ MỚI**:
Toàn bộ hệ thống giao diện Next.js 15 (cả Web App Shell và Mobile PWA) chuyển đổi từ giao diện phẳng tiêu chuẩn sang phong cách **3D Claymorphism kết hợp Glossy Soft Tech UI** (phong cách xúc giác phồng mềm mại, hiệu ứng kính bóng mờ ngọc trai, nút bấm viên thuốc đổ bóng màu, giống ngôn ngữ thiết kế của Apple Widgets / Zalo Cloud / Linear).

Kích hoạt **Agent Code (Model: Claude Sonnet 5.5)** triển khai nâng cấp theo các hạng mục cụ thể sau:

---

### 1. BỔ SUNG DESIGN TOKENS & UTILITY CLASSES TRONG `app/globals.css`:
Thêm bộ utility class chuyên biệt cho phong cách 3D Claymorphism & Glossy:
- **`.clay-card`**: Khối thẻ 3D đất sét/ceramic mềm mại:
  - Nền gradient sứ ngọc trai: `linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(240, 246, 255, 0.85) 100%)` (Dark mode: `linear-gradient(135deg, rgba(17, 30, 58, 0.95) 0%, rgba(11, 19, 41, 0.85) 100%)`).
  - Bo góc mềm: `rounded-2xl` đến `rounded-3xl` (`1.25rem` - `1.5rem`).
  - Viền phản chiếu ánh sáng kính: `border: 1px solid rgba(255, 255, 255, 0.85)` (Dark mode: `border: 1px solid rgba(255, 255, 255, 0.12)`).
  - Đổ bóng khối kép (*Dual-Shadow*):
    `box-shadow: 0 16px 32px -8px rgba(14, 165, 233, 0.12), 0 4px 12px -2px rgba(15, 23, 42, 0.04), inset 0 2px 4px 0 rgba(255, 255, 255, 0.9), inset 0 -2px 4px 0 rgba(14, 165, 233, 0.06);`
- **`.clay-kpi`**: Thẻ KPI phồng 3D xúc giác, có bóng đổ phát quang tương ứng 4 sắc độ:
  - Tone Sky (Doanh thu): `box-shadow: 0 14px 28px -6px rgba(14, 165, 233, 0.22), inset 0 2px 3px rgba(255,255,255,0.95);`
  - Tone Warning (Đơn cần soạn): `box-shadow: 0 14px 28px -6px rgba(217, 119, 6, 0.22), inset 0 2px 3px rgba(255,255,255,0.95);`
  - Tone Danger (Cảnh báo tồn / Nợ): `box-shadow: 0 14px 28px -6px rgba(225, 29, 72, 0.22), inset 0 2px 3px rgba(255,255,255,0.95);`
- **`.clay-tile`**: 14 Ô Mini-App Launcher dạng gạch xúc giác (Tactile Tiles):
  - Bo góc `rounded-2xl`, hiệu ứng phồng nhẹ, bóng đổ tinh tế.
  - Micro-interaction: Khi hover thì nảy nhẹ lên (`transform: translateY(-3px) scale(1.01)`), tăng bóng đổ màu, chuyển động mượt `transition: all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)`.
- **`.glossy-pill` & `.glossy-btn`**: Nút bấm / Badge dạng viên thuốc bo tròn trịa (`rounded-full`):
  - Vạch phản quang specular ở mép trên, đổ bóng màu phát sáng (`colored glow shadow`).
- **`.glossy-glass`**: Thanh kính mờ `backdrop-blur-md bg-white/75 border border-white/80 shadow-sm`.

---

### 2. NÂNG CẤP GIAO DIỆN `app/(shell)/page.tsx` (BENTO DASHBOARD & 14 MINI-APPS):
1. **4 Thẻ KPI**:
   - Áp dụng `.clay-kpi` với hiệu ứng nổi 3D, số tiền đậm nét nổi bật.
   - Icon nằm trong khung bo tròn phồng nhẹ với viền sáng phản quang.
2. **3 Khối Bento (Đơn sáng nay, Tồn kho lạnh, Công nợ)**:
   - Sử dụng thẻ `.clay-card` kết hợp viền kính sáng.
   - Thanh tiến trình kho lạnh Q7/Q12 nâng cấp thành thanh gradient viên thuốc bóng mượt (`linear-gradient(90deg, #0284C7, #38BDF8)`).
   - Danh sách đơn hàng dạng các pill nổi nhẹ nhàng.
3. **Lưới 14 Mini-App Launcher**:
   - Đưa vào toàn bộ 14 ô app dạng `.clay-tile` 3D xúc giác.
   - Mỗi phân hệ (Bán hàng, Vận hành, Tài chính, Hệ thống) có biểu tượng gradient phồng màu riêng biệt, bấm rất sướng tay.

---

### 3. NÂNG CẤP `app/(shell)/layout.tsx` (FULL-VIEWPORT SHELL):
- Topbar 56px và Sidebar 240px: Phủ lớp `.glossy-glass` trong mờ, hòa quyện với nền nhẹ ngọc trai `#F8FAFC`.
- Thanh tìm kiếm Command Palette (Cmd+K) nâng cấp thành dạng viên thuốc bóng mờ.

---

### 4. NÂNG CẤP PWA MOBILE (`app/pwa/`):
- **`BottomNav.tsx`**: Thiết kế dạng thanh điều hướng nổi lơ lửng bóng mờ (`floating glossy pill nav bar`) bo tròn 9999px hoặc `rounded-2xl`, nút active có ánh sáng màu ngọc.
- **`QrViewport.tsx`**: Khung quét Camera VietQR dạng viền 3D Clay bo góc mềm mại.
- **`app/pwa/page.tsx`**: Các thẻ chức năng thao tác nhanh trên mobile áp dụng `.clay-card`.

---

### 5. GIỮ VỮNG NGUYÊN TẮC HIỆU NĂNG MISA GRID 63 CỘT:
- Phân hệ Sapo2Misa (`app/(shell)/finance/sapo2misa/`):
  - Stepper 4 bước: Dùng các viên thuốc bóng mờ `.glossy-pill` với tiến trình gradient.
  - Vỏ ngoài bao quanh bảng: Dùng khung `.clay-card` cao cấp.
  - **LƯU Ý QUAN TRỌNG:** Bên trong lưới dữ liệu 63 cột (`MisaGrid.tsx`) giữ nguyên độ sắc nét phẳng của bảng kế toán, font Mono rõ ràng, cuộn mượt 60fps `@tanstack/react-virtual` để tránh làm rối mắt khi đối soát số liệu.

---

### 6. QUY TẮC KIỂM THỬ & BÀN GIAO:
- Chạy `npx tsc --noEmit` và `npm run build` phải đạt **0 lỗi**.
- Cập nhật báo cáo tóm tắt vào `.claude/reports/latest.md`.
