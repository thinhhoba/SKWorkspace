import { NextRequest, NextResponse } from "next/server";
import { getTaskById, toggleTaskStatus, updateTask, deleteTask } from "@/packages/modules/tasks/tasksService";
import type { TaskStatus } from "@/packages/modules/tasks/types";

export const dynamic = "force-dynamic";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const existing = getTaskById(id);
    if (!existing) return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
    const body = await req.json().catch(() => ({}));
    // If explicit status provided, use updateTask; otherwise toggle
    if (body.status && ["cho_xu_ly", "dang_lam", "hoan_thanh"].includes(body.status)) {
      const updated = updateTask(id, { status: body.status as TaskStatus });
      return NextResponse.json({ success: true, task: updated });
    }
    const toggled = toggleTaskStatus(id);
    return NextResponse.json({ success: true, task: toggled });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Loi cap nhat task";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const existing = getTaskById(id);
  if (!existing) return NextResponse.json({ success: false, error: "Task not found" }, { status: 404 });
  deleteTask(id);
  return NextResponse.json({ success: true, deleted: true });
}
