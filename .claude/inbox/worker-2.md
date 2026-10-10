# CHỈ THỊ LỆNH PHÂN CÔNG — WORKER 2 (BUSINESS INTELLIGENCE & REPORTS SQUAD)
# DỰ ÁN: SK WORKSPACE 2 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# NHIỆM VỤ: PHÂN HỆ BÁO CÁO DOANH THU, LÃI GỘP & VẬN HÀNH (/reports)

---

### PHẠM VI DANH MỤC FILE CHO PHÉP (STRICT BOUNDARY):
> ⚠️ **NGUYÊN TẮC AN TOÀN:** Worker 2 CHỈ ĐƯỢC PHÉP tạo và sửa trong các file sau. TUYỆT ĐỐI KHÔNG chạm vào thư mục của các worker khác.
- `packages/modules/reports/**` (`types.ts`, `mockData.ts`, `reportService.ts`)
- `app/api/reports/**` (`route.ts`)
- `app/(shell)/reports/page.tsx` (Tạo mới giao diện báo cáo)
- Báo cáo kết quả vào: `.claude/reports/worker-2-reports.md`

---

### DỮ LIỆU ĐỊNH DANH VẬN HÀNH:
- **Giám đốc điều hành:** HỒ BÁ THỊNH
- **Kế toán trưởng:** HOÀNG THỊ NHO
- **Kênh phân phối:** 6 kênh (Quán ăn vặt/mì trộn HN, Đại lý chành xe tỉnh, Căn tin, Web Order, POS, Bán lẻ)
- **Nhóm sản phẩm:** Hàng khô (Indomie/Koreno), Gia vị & Xốt, Hàng mát, Hàng đông lạnh.

---

### CHI TIẾT CÁC HẠNG MỤC CẦN LÀM:
1. **Module Nghiệp Vụ (`packages/modules/reports/`):**
   - Báo cáo Doanh thu theo 6 kênh bán hàng.
   - Báo cáo Cơ cấu Doanh thu & Lợi nhuận gộp theo 4 nhóm hàng (ước tính biên lãi ~21.4%).
   - Báo cáo Tỷ trọng xuất kho: Kho Định Công vs Kho Yên Bình.
   - Báo cáo Hiệu suất giao vận của Tài xế Ngô Văn Tân (tỷ lệ giao thành công, số kiện gửi chành xe).
2. **API Endpoints:**
   - `GET /api/reports`: Trả về dữ liệu tổng hợp theo chu kỳ (ngày, tuần, tháng, quý).
3. **Giao Diện Báo Cáo BI (`app/(shell)/reports/page.tsx`):**
   - 4 Thẻ Clay-KPI: Doanh thu tháng (Sky), Lãi gộp ước tính (Emerald), Sản lượng thùng mì xuất kho (Cyan), Tỷ lệ thu hồi công nợ B2B (Amber).
   - Biểu đồ phân bổ tỷ trọng doanh thu theo kênh (CSS Bars / SVG progress cards).
   - Bảng xếp hạng Top 5 Sản Phẩm Bán Chạy Nhất (Indomie Đặc Biệt, Popcorn CP, Nem chua rán Đức Minh, Tokbokki, Mayonnaise Kewpie).
   - Bộ lọc thời gian: Hôm nay | 7 ngày qua | Tháng này | Quý này.
   - Nút **Xuất Báo Cáo Excel / PDF** tóm tắt.

---

### YÊU CẦU NGHIỆM THU:
1. `npx tsc --noEmit` đạt 0 lỗi.
2. TUYỆT ĐỐI KHÔNG chạy `git commit` hay `git push`.
3. Ghi báo cáo vào `.claude/reports/worker-2-reports.md`.
