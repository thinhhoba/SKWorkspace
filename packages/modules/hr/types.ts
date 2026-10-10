// Module nhân sự Sơn Khang — types
// 4 nhân sự chính thức + ca làm & chấm công

/** Role hệ thống (RBAC) */
export type HrRole = "admin" | "ketoan" | "thukho" | "taixe";

/** Trạng thái nhân sự */
export type HrStatus = "active" | "inactive" | "on_leave";

/** Ca làm việc Sơn Khang */
export type WorkShift = "sang" | "chieu" | "ca_ngay";

/** Trạng thái chấm công trong ngày */
export type AttendanceStatus = "present" | "late" | "leave" | "absent";

/** Nhãn role */
export const HR_ROLE_LABEL: Record<HrRole, string> = {
  admin: "Admin",
  ketoan: "Kế toán",
  thukho: "Thủ kho",
  taixe: "Tài xế",
};

/** Tên chức danh đầy đủ */
export const HR_TITLE_LABEL: Record<HrRole, string> = {
  admin: "Giám đốc điều hành & Đại diện pháp luật",
  ketoan: "Kế toán trưởng",
  thukho: "Thủ kho trung tâm",
  taixe: "Tài xế giao nhận",
};

/** Ứng dụng mà mỗi role được truy cập (RBAC) */
export const HR_ROLE_APPS: Record<HrRole, string[]> = {
  admin: ["dashboard", "finance", "pricing", "inventory", "purchase", "sales", "delivery", "customers", "hr", "reports", "settings", "audit", "docs"],
  ketoan: ["dashboard", "finance", "customers", "pricing", "reports", "purchase", "sales"],
  thukho: ["dashboard", "inventory", "purchase", "delivery"],
  taixe: ["dashboard", "delivery", "customers"],
};

/** Màu badge role */
export const HR_ROLE_COLOR: Record<HrRole, string> = {
  admin: "bg-slate-900 text-white border-slate-900",
  ketoan: "bg-sky-100 text-sky-700 border-sky-200",
  thukho: "bg-amber-100 text-amber-700 border-amber-200",
  taixe: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

/** Ca làm tiêu chuẩn Sơn Khang */
export interface ShiftDefinition {
  key: WorkShift;
  label: string;
  time: string;
  hours: number;
}

export const SHIFT_DEFS: ShiftDefinition[] = [
  { key: "sang", label: "Ca sáng", time: "08:00 – 12:00", hours: 4 },
  { key: "chieu", label: "Ca chiều", time: "13:30 – 17:30", hours: 4 },
  { key: "ca_ngay", label: "Cả ngày", time: "08:00 – 12:00 & 13:30 – 17:30", hours: 8 },
];

/** Hồ sơ nhân sự */
export interface HrEmployee {
  id: string;
  code?: string; // VD NV001
  name: string;
  title: string; // chức danh
  role: HrRole;
  phone: string;
  email: string;
  avatar: string; // initials
  status: HrStatus;
  shift?: WorkShift;
  joinedAt?: string; // ISO date
  apps: string[]; // cached from HR_ROLE_APPS[role]
  warehouse?: string; // cho thủ kho
  deliveryZones?: string[]; // cho tài xế
  hourlyRate?: number;
  contractType?: string;
}

/** Một dòng chấm công trong ngày */
export interface AttendanceRecord {
  employeeId: string;
  date: string; // YYYY-MM-DD
  shift: WorkShift;
  status: AttendanceStatus;
  checkIn?: string; // HH:mm
  checkOut?: string; // HH:mm
  note?: string;
}

/** Thống kê HR cho API/KPI */
export interface HrSummary {
  total: number;
  presentToday: number;
  operations: number; // thukho + taixe
  rbacReady: boolean;
  attendanceRate: number; // %
}
