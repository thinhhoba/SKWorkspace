import type { HrEmployee, HrSummary, AttendanceRecord, HrRole } from "./types";
import { MOCK_EMPLOYEES, MOCK_ATTENDANCE } from "./mockData";

let employeesStore: HrEmployee[] = [...MOCK_EMPLOYEES];
let attendanceStore: AttendanceRecord[] = [...MOCK_ATTENDANCE];

export function getEmployees(): HrEmployee[] {
  return [...employeesStore];
}

export function getAttendance(date?: string): AttendanceRecord[] {
  if (!date) return [...attendanceStore];
  return attendanceStore.filter((r) => r.date === date);
}

export function getHrSummary(): HrSummary {
  const total = employeesStore.length;
  const presentToday = new Set(
    attendanceStore.filter((r) => r.status === "present" || r.status === "late").map((r) => r.employeeId)
  ).size;
  const operations = employeesStore.filter((e) => e.role === "thukho" || e.role === "taixe").length;
  const rbacReady = employeesStore.every((e) => e.apps.length > 0);
  const attendanceRate = total === 0 ? 0 : Math.round((presentToday / total) * 100);
  return { total, presentToday, operations, rbacReady, attendanceRate };
}

export function getEmployeeById(id: string): HrEmployee | undefined {
  return employeesStore.find((e) => e.id === id);
}

export function createEmployee(data: Partial<HrEmployee>): HrEmployee {
  const id = data.id || `NV-${Date.now().toString().slice(-4)}`;
  const avatar = data.avatar || data.name?.slice(0, 2).toUpperCase() || "NV";
  const newEmp: HrEmployee = {
    id,
    name: data.name || "Nhân viên mới",
    title: data.title || "Nhân viên vận hành",
    email: data.email || `${id.toLowerCase()}@sonkhang.vn`,
    phone: data.phone || "0942 22 60 60",
    role: data.role || "thukho",
    apps: data.apps || ["dashboard", "sales", "inventory"],
    status: data.status || "active",
    avatar,
    hourlyRate: data.hourlyRate || 35000,
    contractType: data.contractType || "chinh_thuc",
  };
  employeesStore.unshift(newEmp);
  return newEmp;
}

export function updateEmployee(id: string, updates: Partial<HrEmployee>): HrEmployee | undefined {
  const idx = employeesStore.findIndex((e) => e.id === id);
  if (idx < 0) return undefined;
  employeesStore[idx] = {
    ...employeesStore[idx],
    ...updates,
    id: employeesStore[idx].id, // preserve ID
  };
  return employeesStore[idx];
}

export function deleteEmployee(id: string): boolean {
  const beforeLen = employeesStore.length;
  employeesStore = employeesStore.filter((e) => e.id !== id);
  return employeesStore.length < beforeLen;
}
