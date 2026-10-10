# CHỈ THỊ LỆNH PHÂN CÔNG — WORKER 3 (HUMAN RESOURCES & RBAC SQUAD)
# DỰ ÁN: SK WORKSPACE 2 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# NHIỆM VỤ: PHÂN HỆ QUẢN LÝ NHÂN SỰ, CHẤM CÔNG & PHÂN QUYỀN (/hr)

---

### PHẠM VI DANH MỤC FILE CHO PHÉP (STRICT BOUNDARY):
> ⚠️ **NGUYÊN TẮC AN TOÀN:** Worker 3 CHỈ ĐƯỢC PHÉP tạo và sửa trong các file sau. TUYỆT ĐỐI KHÔNG chạm vào thư mục của các worker khác.
- `packages/modules/hr/**` (`types.ts`, `mockData.ts`, `hrService.ts`)
- `app/api/hr/**` (`route.ts`)
- `app/(shell)/hr/page.tsx` (Tạo mới giao diện nhân sự)
- Báo cáo kết quả vào: `.claude/reports/worker-3-hr.md`

---

### DỮ LIỆU ĐỊNH DANH 4 NHÂN SỰ CHÍNH THỨC:
1. **HỒ BÁ THỊNH** (`admin`): Giám đốc điều hành & Đại diện pháp luật (Toàn quyền hệ thống)
2. **HOÀNG THỊ NHO** (`ketoan`): Kế toán trưởng (Quản lý Tài chính, Công nợ, MISA, Sapo2Misa, Báo giá)
3. **TRẦN THỊ NGỌC THÚY** (`thukho`): Thủ kho trung tâm (Quản lý Kho lạnh Định Công & Yên Bình, Nhập xuất, FEFO)
4. **NGÔ VĂN TÂN** (`taixe`): Tài xế giao nhận (Giao hàng nội thành HN, chành xe 4 bến bãi, thu hộ VietQR)

---

### CHI TIẾT CÁC HẠNG MỤC CẦN LÀM:
1. **Module Nghiệp Vụ (`packages/modules/hr/`):**
   - Danh sách hồ sơ nhân sự (Họ tên, Chức vụ, SĐT, Email, Phân quyền Role, Trạng thái hoạt động).
   - Ca làm việc tiêu chuẩn Sơn Khang: 08:00–12:00 & 13:30–17:30 (Thứ 2 đến Thứ 7, Chủ nhật nghỉ).
   - Nhật ký chấm công (Điểm danh hôm nay, ca làm, trạng thái đi làm/nghỉ phép).
2. **API Endpoints:**
   - `GET /api/hr`: Lấy danh sách nhân sự, thống kê điểm danh và phân quyền ứng dụng.
3. **Giao Diện Nhân Sự (`app/(shell)/hr/page.tsx`):**
   - 4 Thẻ Clay-KPI: Tổng nhân sự (4), Đang làm việc hôm nay, Nhân sự vận hành kho & xe, Trạng thái phân quyền (Full RBAC).
   - Bảng nhân sự: Avatar, Họ tên, Chức danh, Số điện thoại, Vai trò (Admin, Kế toán, Thủ kho, Tài xế), Ứng dụng được truy cập, Trạng thái.
   - Thẻ Chấm Công Hàng Ngày: Hiển thị bảng điểm danh theo ca làm việc.
   - Modal xem chi tiết hồ sơ & cấp quyền ứng dụng cho từng nhân sự.

---

### YÊU CẦU NGHIỆM THU:
1. `npx tsc --noEmit` đạt 0 lỗi.
2. TUYỆT ĐỐI KHÔNG chạy `git commit` hay `git push`.
3. Ghi báo cáo vào `.claude/reports/worker-3-hr.md`.
