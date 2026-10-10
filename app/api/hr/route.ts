import { NextRequest, NextResponse } from "next/server";
import { getEmployees, getAttendance, getHrSummary, createEmployee } from "@/packages/modules/hr/hrService";

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.name) {
      return NextResponse.json({ success: false, error: "Tên nhân viên là bắt buộc" }, { status: 400 });
    }
    const emp = createEmployee(body);
    return NextResponse.json({ success: true, employee: emp }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi tạo hồ sơ nhân sự";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
