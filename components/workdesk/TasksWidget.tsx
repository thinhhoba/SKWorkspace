"use client";
import * as React from "react";
import type { WorkdeskTask, TaskPriority } from "@/packages/modules/tasks/types";

const PRIORITY_STYLE: Record<TaskPriority, string> = {
  cao: "bg-rose-100 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400",
  trung_binh: "bg-amber-100 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400",
  thap: "bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400",
};
const PRIORITY_LABEL: Record<TaskPriority, string> = { cao: "Cao", trung_binh: "TB", thap: "Thấp" };

interface TasksWidgetProps {
  tasks?: WorkdeskTask[];
}

export default function TasksWidget({ tasks: propTasks }: TasksWidgetProps) {
  const [tasks, setTasks] = React.useState<WorkdeskTask[]>(propTasks ?? []);
  const [newTitle, setNewTitle] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const fetchTasks = React.useCallback(async () => {
    try {
      const res = await fetch("/api/tasks");
      const d = await res.json();
      if (d.success) setTasks(d.tasks);
    } catch {}
  }, []);

  React.useEffect(() => {
    if (propTasks !== undefined) { setTasks(propTasks); return; }
    fetchTasks();
  }, [propTasks, fetchTasks]);

  async function toggle(id: string) {
    const prev = tasks;
    setTasks((p) => p.map((t) => t.id === id ? { ...t, status: t.status === "hoan_thanh" ? "cho_xu_ly" : "hoan_thanh" } : t));
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
      const d = await res.json();
      if (d.success && d.task) setTasks((p) => p.map((t) => t.id === id ? d.task : t));
      else setTasks(prev);
    } catch { setTasks(prev); }
  }

  async function addTask() {
    const title = newTitle.trim();
    if (!title) return;
    setLoading(true);
    try {
      const res = await fetch("/api/tasks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ title }) });
      const d = await res.json();
      if (d.success && d.task) { setTasks((p) => [d.task, ...p]); setNewTitle(""); }
    } catch {}
    setLoading(false);
  }

  return (
    <div className="clay-card overflow-hidden">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="font-semibold text-sm">Việc của tôi</h3>
        <span className="text-xs text-muted-foreground">{tasks.filter((t) => t.status !== "hoan_thanh").length} việc</span>
      </div>
      <div className="px-5 pb-3 space-y-2 max-h-[320px] overflow-auto">
        {tasks.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">Chưa có việc nào</p>}
        {tasks.map((t) => (
          <label key={t.id} className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 cursor-pointer transition-colors ${t.status === "hoan_thanh" ? "bg-muted/40 opacity-60" : "bg-white/80 hover:bg-white dark:bg-white/[0.04]"}`}>
            <input type="checkbox" checked={t.status === "hoan_thanh"} onChange={() => toggle(t.id)} className="h-4 w-4 rounded accent-primary shrink-0" />
            <span className={`flex-1 text-sm leading-tight min-w-0 ${t.status === "hoan_thanh" ? "line-through text-muted-foreground" : ""}`}>{t.title}</span>
            <span className={`shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-full border ${PRIORITY_STYLE[t.priority]}`}>{PRIORITY_LABEL[t.priority]}</span>
          </label>
        ))}
      </div>
      <div className="px-5 pb-5 flex gap-2">
        <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} onKeyDown={(e) => e.key === "Enter" && addTask()} placeholder="Thêm việc nhanh..." className="flex-1 h-9 rounded-full border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring" />
        <button onClick={addTask} disabled={loading || !newTitle.trim()} className="h-9 px-4 rounded-full bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-50 shrink-0">Thêm</button>
      </div>
    </div>
  );
}
