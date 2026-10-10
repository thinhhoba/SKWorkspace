import { NextRequest, NextResponse } from "next/server";
import { getEmployeeById, updateEmployee, deleteEmployee } from "@/packages/modules/hr/hrService";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const emp = getEmployeeById(id);
    if (!emp) {
      return NextResponse.json({ success: false, error: "Không tìm thấy nhân viên" }, { status: 404 });
    }
    return NextResponse.json({ success: true, employee: emp });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi lấy thông tin nhân sự";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const updated = updateEmployee(id, body);
    if (!updated) {
      return NextResponse.json({ success: false, error: "Không tìm thấy nhân sự để cập nhật" }, { status: 404 });
    }
    return NextResponse.json({ success: true, employee: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi cập nhật hồ sơ nhân sự";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const ok = deleteEmployee(id);
    if (!ok) {
      return NextResponse.json({ success: false, error: "Không tìm thấy nhân sự để xóa" }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: "Đã xóa nhân sự thành công" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi xóa hồ sơ nhân sự";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
