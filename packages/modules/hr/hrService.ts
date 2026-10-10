import type { HrEmployee, HrSummary, AttendanceRecord } from "./types";
import { MOCK_EMPLOYEES, MOCK_ATTENDANCE } from "./mockData";

export function getEmployees(): HrEmployee[] {
  return [...MOCK_EMPLOYEES];
}

export function getAttendance(date?: string): AttendanceRecord[] {
  if (!date) return [...MOCK_ATTENDANCE];
  return MOCK_ATTENDANCE.filter((r) => r.date === date);
}

export function getHrSummary(): HrSummary {
  const total = MOCK_EMPLOYEES.length;
  const presentToday = new Set(
    MOCK_ATTENDANCE.filter((r) => r.status === "present" || r.status === "late").map((r) => r.employeeId)
  ).size;
  const operations = MOCK_EMPLOYEES.filter((e) => e.role === "thukho" || e.role === "taixe").length;
  const rbacReady = MOCK_EMPLOYEES.every((e) => e.apps.length > 0);
  const attendanceRate = total === 0 ? 0 : Math.round((presentToday / total) * 100);
  return { total, presentToday, operations, rbacReady, attendanceRate };
}

export function getEmployeeById(id: string): HrEmployee | undefined {
  return MOCK_EMPLOYEES.find((e) => e.id === id);
}
