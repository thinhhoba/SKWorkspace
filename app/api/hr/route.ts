import { NextResponse } from "next/server";
import { getEmployees, getAttendance, getHrSummary } from "@/packages/modules/hr/hrService";

export async function GET() {
  try {
    const employees = getEmployees();
    const attendance = getAttendance();
    const summary = getHrSummary();
    return NextResponse.json({ success: true, summary, employees, attendance });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi lấy danh sách nhân sự";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
