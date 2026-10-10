# CHỈ THỊ LỆNH PHÂN CÔNG — WORKER 4 (LEGAL & DOCUMENT ARCHIVE SQUAD)
# DỰ ÁN: SK WORKSPACE 2 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# NHIỆM VỤ: PHÂN HỆ VĂN THƯ, HỒ SƠ PHÁP LÝ & HỢP ĐỒNG B2B (/docs)

---

### PHẠM VI DANH MỤC FILE CHO PHÉP (STRICT BOUNDARY):
> ⚠️ **NGUYÊN TẮC AN TOÀN:** Worker 4 CHỈ ĐƯỢC PHÉP tạo và sửa trong các file sau. TUYỆT ĐỐI KHÔNG chạm vào thư mục của các worker khác.
- `packages/modules/docs/**` (`types.ts`, `mockData.ts`, `docService.ts`)
- `app/api/docs/**` (`route.ts`)
- `app/(shell)/docs/page.tsx` (Tạo mới giao diện văn thư)
- Báo cáo kết quả vào: `.claude/reports/worker-4-docs.md`

---

### DỮ LIỆU ĐỊNH DANH HỒ SƠ PHÁP LÝ CÔNG TY:
- **Tên doanh nghiệp:** CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: `0111252725`)
- **Kho tệp số hóa tại `docs/legal/`:**
  1. `01_GCN_DKKD_SON_KHANG.pdf`: Giấy chứng nhận ĐKKD công ty TNHH MTV (16/10/2025)
  2. `02_GCN_DKD_00001.pdf`: Giấy chứng nhận đăng ký địa điểm kinh doanh số 00001 (24/10/2025)
  3. `03_GIAY_XAC_NHAN_DDKD.pdf`: Giấy xác nhận thay đổi nội dung ĐĐKD & đăng ký thuế (02/10/2026)
  4. `04_THONG_BAO_THUE.pdf`: Thông báo cơ quan thuế quản lý trực tiếp (Thuế cơ sở 22 Hà Nội)
  5. `05_DKKD_DIA_DIEM_KINH_DOANH.pdf`: Giấy chứng nhận ĐKKD địa điểm thay đổi lần 1 (02/10/2026 - Ngõ 337 Định Công)
  6. `HO_SO_PHAP_LY_SON_KHANG.md`: Hồ sơ pháp lý tổng hợp

---

### CHI TIẾT CÁC HẠNG MỤC CẦN LÀM:
1. **Module Nghiệp Vụ (`packages/modules/docs/`):**
   - Danh mục hồ sơ pháp trị (ĐKKD, Thông báo thuế, Giấy xác nhận địa điểm kinh doanh).
   - Danh mục chứng chỉ chất lượng: Giấy phép Vệ sinh An toàn Thực phẩm (VSATTP), Chứng nhận kiểm dịch thú y lô hàng CP/Thoại An.
   - Danh mục biểu mẫu & hợp đồng mẫu: Hợp đồng nguyên tắc bán lẻ/bán buôn thực phẩm B2B, Biên bản giao nhận hàng hóa chành xe, Mẫu ủy quyền giao dịch.
2. **API Endpoints:**
   - `GET /api/docs`: Lấy danh mục văn bản, phân loại thư mục và đếm tài liệu.
3. **Giao Diện Văn Thư Lưu Trữ (`app/(shell)/docs/page.tsx`):**
   - 4 Thẻ Clay-KPI: Hồ sơ pháp lý doanh nghiệp (5 tài liệu), Chứng nhận VSATTP & Kiểm dịch, Hợp đồng B2B lưu trữ, Tổng dung lượng lưu trữ.
   - Tabs phân loại: Tất cả | Pháp lý doanh nghiệp | Chứng nhận ATTP & Kiểm dịch | Hợp đồng B2B & Biểu mẫu.
   - Lưới danh thiếp tài liệu: Icon PDF/Docx, Tên tài liệu, Cơ quan ban hành (Sở Tài chính Hà Nội, Cục ATTP), Ngày ban hành, Nút Xem chi tiết / Tải về.
   - Drawer xem nhanh thông tin tóm tắt hồ sơ pháp lý công ty Sơn Khang.

---

### YÊU CẦU NGHIỆM THU:
1. `npx tsc --noEmit` đạt 0 lỗi.
2. TUYỆT ĐỐI KHÔNG chạy `git commit` hay `git push`.
3. Ghi báo cáo vào `.claude/reports/worker-4-docs.md`.
