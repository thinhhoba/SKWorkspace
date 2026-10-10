export type TaskPriority = "cao" | "trung_binh" | "thap";
export type TaskStatus = "cho_xu_ly" | "dang_lam" | "hoan_thanh";

export interface WorkdeskTask {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  status: TaskStatus;
  assignee?: string;
  dueDate?: string;
  createdAt: string;
}
