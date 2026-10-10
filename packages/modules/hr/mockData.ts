import type { HrEmployee, AttendanceRecord } from "./types";

// ---------------------------------------------------------------------------
// 4 nhân sự chính thức Sơn Khang
// ---------------------------------------------------------------------------

export const MOCK_EMPLOYEES: HrEmployee[] = [
  {
    id: "NV001",
    code: "NV001",
    name: "Hồ Bá Thịnh",
    title: "Giám đốc điều hành & Đại diện pháp luật",
    role: "admin",
    phone: "0901 000 001",
    email: "thinh.ho@sonkhang.vn",
    avatar: "HT",
    status: "active",
    shift: "ca_ngay",
    joinedAt: "2020-01-15",
    apps: ["dashboard", "finance", "pricing", "inventory", "purchase", "sales", "delivery", "customers", "hr", "reports", "settings", "audit", "docs"],
  },
  {
    id: "NV002",
    code: "NV002",
    name: "Hoàng Thị Nho",
    title: "Kế toán trưởng",
    role: "ketoan",
    phone: "0942 22 60 60",
    email: "nho.hoang@sonkhang.vn",
    avatar: "HN",
    status: "active",
    shift: "ca_ngay",
    joinedAt: "2020-03-01",
    apps: ["dashboard", "finance", "customers", "pricing", "reports", "purchase", "sales"],
  },
  {
    id: "NV003",
    code: "NV003",
    name: "Trần Thị Ngọc Thúy",
    title: "Thủ kho trung tâm",
    role: "thukho",
    phone: "0901 000 003",
    email: "thuy.tran@sonkhang.vn",
    avatar: "TT",
    status: "active",
    shift: "ca_ngay",
    joinedAt: "2021-06-10",
    apps: ["dashboard", "inventory", "purchase", "delivery"],
    warehouse: "Kho lạnh Định Công & Yên Bình",
  },
  {
    id: "NV004",
    code: "NV004",
    name: "Ngô Văn Tân",
    title: "Tài xế giao nhận",
    role: "taixe",
    phone: "0901 000 004",
    email: "tan.ngo@sonkhang.vn",
    avatar: "NT",
    status: "active",
    shift: "ca_ngay",
    joinedAt: "2022-02-20",
    apps: ["dashboard", "delivery", "customers"],
    deliveryZones: ["Nội thành Hà Nội", "Chành xe 4 bến bãi", "Thu hộ VietQR"],
  },
];

// Chấm công hôm nay (mock — theo ca Sơn Khang 08:00-12:00 & 13:30-17:30)
const TODAY = new Date().toISOString().slice(0, 10);

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { employeeId: "NV001", date: TODAY, shift: "sang", status: "present", checkIn: "07:55", checkOut: "12:05", note: "Họp điều hành" },
  { employeeId: "NV001", date: TODAY, shift: "chieu", status: "present", checkIn: "13:28", checkOut: "17:35" },
  { employeeId: "NV002", date: TODAY, shift: "sang", status: "present", checkIn: "08:02", checkOut: "12:00" },
  { employeeId: "NV002", date: TODAY, shift: "chieu", status: "present", checkIn: "13:30", checkOut: "17:30" },
  { employeeId: "NV003", date: TODAY, shift: "sang", status: "present", checkIn: "07:45", checkOut: "12:10", note: "Kiểm kho lạnh Định Công" },
  { employeeId: "NV003", date: TODAY, shift: "chieu", status: "present", checkIn: "13:30", checkOut: "17:30" },
  { employeeId: "NV004", date: TODAY, shift: "sang", status: "late", checkIn: "08:15", checkOut: "12:00", note: "Kẹt xe bến Giáp Bát" },
  { employeeId: "NV004", date: TODAY, shift: "chieu", status: "present", checkIn: "13:35", checkOut: "17:30", note: "Giao chành xe Nước Ngầm" },
];
