# Báo cáo nghiệm thu — Worker 3: HR & RBAC (Human Resources)

**Ngày:** 2026-10-10
**Worker:** Worker 3 — HR Squad
**Phạm vi cho phép:** `packages/modules/hr/**`, `app/(shell)/hr/**`, `app/api/hr/**`
**Nhiệm vụ:** Phân hệ Quản lý Nhân sự, Chấm công & Phân quyền (/hr)

## 1. Hoàn thành

### `packages/modules/hr/types.ts`
- `HrRole`: `admin | ketoan | thukho | taixe` + `HR_ROLE_LABEL`, `HR_TITLE_LABEL`, `HR_ROLE_COLOR`, `HR_ROLE_APPS` (RBAC mapping).
- `HrStatus`, `WorkShift` (`sang/chieu/ca_ngay`), `AttendanceStatus` (`present/late/leave/absent`).
- `SHIFT_DEFS`: ca sáng 08:00–12:00, ca chiều 13:30–17:30, cả ngày 8h — T2–T7, Chủ nhật nghỉ.
- Interfaces: `HrEmployee`, `AttendanceRecord`, `HrSummary`.

### `packages/modules/hr/mockData.ts`
- `MOCK_EMPLOYEES` — 4 nhân sự chính thức:
  1. Hồ Bá Thịnh (NV001, admin) — Giám đốc điều hành & Đại diện pháp luật, toàn quyền 13 apps.
  2. Hoàng Thị Nho (NV002, ketoan) — Kế toán trưởng, SĐT 0942 22 60 60.
  3. Trần Thị Ngọc Thúy (NV003, thukho) — Thủ kho trung tâm, Kho lạnh Định Công & Yên Bình.
  4. Ngô Văn Tân (NV004, taixe) — Tài xế giao nhận, nội thành HN + chành xe 4 bến + Thu hộ VietQR.
- `MOCK_ATTENDANCE` — 8 dòng chấm công hôm nay (mỗi NV 2 ca sáng/chiều, có 1 ca late kẹt xe Giáp Bát).

### `packages/modules/hr/hrService.ts`
- `getEmployees()`, `getAttendance(date?)`, `getHrSummary()` (total/presentToday/operations/rbacReady/attendanceRate), `getEmployeeById()`.

### `app/api/hr/route.ts`
- `GET /api/hr` — trả `summary + employees + attendance`.

### `app/(shell)/hr/page.tsx`
- 4 thẻ Clay-KPI: Tổng nhân sự (4) / Đang làm việc hôm nay (presentToday/total + attendanceRate) / Vận hành kho & xe (thukho+taixe) / Phân quyền RBAC (Full RBAC).
- Bảng nhân sự: Avatar initials, họ tên, chức danh, SĐT, badge vai trò (Admin/Kế toán/Thủ kho/Tài xế), ứng dụng được truy cập (chips), trạng thái, nút Chi tiết.
- Thẻ Chấm Công Hàng Ngày: header ca làm + ngày, bảng 8 dòng (nhân sự × ca sáng/chiều, trạng thái present/late, checkIn/Out, ghi chú), grid mini summary per-employee.
- Modal chi tiết hồ sơ & cấp quyền: avatar, mã NV, SĐT/email, ca làm, ngày vào, kho/khu vực (nếu có), danh sách apps (chips), ghi chú RBAC.

## 2. Kiểm tra

- `npx tsc --noEmit` — **0 lỗi** (EXIT 0).
- Không chạy `git commit` / `git push` (tuân thủ song song).

## 3. Tuân thủ chỉ thị

- Chỉ sửa trong phạm vi `hr/**`, không chạm thư mục worker khác.
- Dữ liệu 4 nhân sự khớp chỉ thị, ca làm 08:00–12:00 & 13:30–17:30, RBAC theo role.
