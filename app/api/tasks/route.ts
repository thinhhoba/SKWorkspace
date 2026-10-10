import { NextRequest, NextResponse } from "next/server";
import { getTasks, createTask } from "@/packages/modules/tasks/tasksService";
import type { TaskPriority } from "@/packages/modules/tasks/types";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || undefined;
    const assignee = searchParams.get("assignee") || undefined;
    const tasks = getTasks({ status, assignee });
    return NextResponse.json({ success: true, tasks, count: tasks.length });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Loi lay danh sach tasks";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const title = typeof body.title === "string" ? body.title.trim() : "";
    if (!title) return NextResponse.json({ success: false, error: "title is required" }, { status: 400 });
    const priority = (body.priority as TaskPriority) ?? "trung_binh";
    const task = createTask({ title, priority, assignee: body.assignee, description: body.description });
    return NextResponse.json({ success: true, task }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Loi tao task";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
