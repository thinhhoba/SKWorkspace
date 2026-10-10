import type { WorkdeskTask, TaskPriority, TaskStatus } from "./types";

function nowIso(): string {
  return new Date().toISOString();
}
function genId(): string {
  return `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
}

const SEED_TASKS: WorkdeskTask[] = [
  { id: "task-001", title: "Soạn đơn SP-0841 theo FEFO (Heo xay cận date)", description: "Ưu tiên lô HSD 15/10", priority: "cao", status: "cho_xu_ly", assignee: "Thuy", dueDate: new Date(Date.now() + 86400000).toISOString(), createdAt: nowIso() },
  { id: "task-002", title: "Giao hàng tuyến Q7 — An Thinh Mart", description: "14h, xe Tan", priority: "cao", status: "dang_lam", assignee: "Tan", dueDate: nowIso(), createdAt: nowIso() },
  { id: "task-003", title: "Doi soat cong no An Thinh Mart 84.2tr", description: "Qua han 12 ngay", priority: "cao", status: "cho_xu_ly", assignee: "Nho", dueDate: new Date(Date.now() + 2 * 86400000).toISOString(), createdAt: nowIso() },
  { id: "task-004", title: "Duyet bao gia thang 10 — Minh Khang Food", description: "Chiet khau 5%", priority: "trung_binh", status: "cho_xu_ly", assignee: "Thinh", dueDate: new Date(Date.now() + 3 * 86400000).toISOString(), createdAt: nowIso() },
  { id: "task-005", title: "Kiem ke kho lanh Q12", description: "Doi chieu ton thuc te", priority: "thap", status: "hoan_thanh", assignee: "Thuy", dueDate: nowIso(), createdAt: nowIso() },
];

let tasks: WorkdeskTask[] = SEED_TASKS.map((t) => ({ ...t }));

async function tryPrisma<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  if (!process.env.DATABASE_URL) return fallback;
  try { return await fn(); } catch { return fallback; }
}

export function getTasks(filter?: { status?: string; assignee?: string }): WorkdeskTask[] {
  let list = [...tasks];
  if (filter?.status && filter.status !== "ALL") list = list.filter((t) => t.status === filter.status);
  if (filter?.assignee && filter.assignee.trim()) list = list.filter((t) => t.assignee?.toLowerCase() === filter.assignee!.toLowerCase());
  return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export function getTaskById(id: string): WorkdeskTask | undefined {
  return tasks.find((t) => t.id === id);
}

export function createTask(input: { title: string; priority?: TaskPriority; assignee?: string; description?: string; status?: TaskStatus }): WorkdeskTask {
  const title = input.title?.trim();
  if (!title) throw new Error("Tieu de task khong duoc de trong");
  const task: WorkdeskTask = {
    id: genId(),
    title,
    description: input.description?.trim() || undefined,
    priority: input.priority ?? "trung_binh",
    status: input.status ?? "cho_xu_ly",
    assignee: input.assignee?.trim() || undefined,
    createdAt: nowIso(),
  };
  tasks.unshift(task);
  return task;
}

export function toggleTaskStatus(id: string): WorkdeskTask | null {
  const t = tasks.find((x) => x.id === id);
  if (!t) return null;
  t.status = t.status === "hoan_thanh" ? "cho_xu_ly" : "hoan_thanh";
  return t;
}

export function updateTask(id: string, patch: Partial<Pick<WorkdeskTask, "title" | "description" | "priority" | "status" | "assignee" | "dueDate">>): WorkdeskTask | null {
  const t = tasks.find((x) => x.id === id);
  if (!t) return null;
  if (patch.title !== undefined) t.title = patch.title.trim() || t.title;
  if (patch.description !== undefined) t.description = patch.description?.trim() || undefined;
  if (patch.priority !== undefined) t.priority = patch.priority;
  if (patch.status !== undefined) t.status = patch.status;
  if (patch.assignee !== undefined) t.assignee = patch.assignee?.trim() || undefined;
  if (patch.dueDate !== undefined) t.dueDate = patch.dueDate;
  return t;
}

export function deleteTask(id: string): boolean {
  const idx = tasks.findIndex((t) => t.id === id);
  if (idx === -1) return false;
  tasks.splice(idx, 1);
  return true;
}

export function getTasksByAssignee(name: string): WorkdeskTask[] {
  return tasks.filter((t) => t.assignee?.toLowerCase() === name.toLowerCase());
}

// Async wrappers with Prisma fallback (future)
export async function getTasksAsync(filter?: { status?: string; assignee?: string }): Promise<WorkdeskTask[]> {
  return tryPrisma(async () => {
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient() as unknown as { workdeskTask: { findMany: (a: unknown) => Promise<never[]> } };
    const rows = await prisma.workdeskTask.findMany({ orderBy: { createdAt: "desc" } });
    return rows.map((r: Record<string, unknown>) => ({
      id: r.id as string,
      title: r.title as string,
      description: r.description as string | undefined,
      priority: r.priority as TaskPriority,
      status: r.status as TaskStatus,
      assignee: r.assignee as string | undefined,
      dueDate: (r.dueDate as Date | null)?.toISOString(),
      createdAt: (r.createdAt as Date).toISOString(),
    }));
  }, getTasks(filter));
}

export function __resetTasksStore(): void {
  tasks = SEED_TASKS.map((t) => ({ ...t }));
}
