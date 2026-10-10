"use client";
import * as React from "react";
import {
  CheckSquare,
  Plus,
  Clock,
  User,
  AlertCircle,
  CheckCircle2,
  ListTodo,
  Kanban,
  Calendar,
  Filter,
  Trash2,
  ChevronRight,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type TaskStatus = "todo" | "in_progress" | "done";
type TaskPriority = "low" | "medium" | "high" | "urgent";

interface Task {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  assignee: string;
  assigneeRole: string;
  dueDate: string;
  progress: number;
}

const INITIAL_TASKS: Task[] = [
  {
    id: "TASK-101",
    title: "Kiểm đếm định kỳ tồn kho đông lạnh Q7 - Lô Gà Popcorn CP",
    description: "Quét lại toàn bộ mã SKU HH053 và đối chiếu với số liệu Sapo. Đảm bảo tem phụ không bị mờ do bám tuyết.",
    status: "in_progress",
    priority: "high",
    assignee: "Trần Quốc Toản",
    assigneeRole: "Thủ kho Q7",
    dueDate: "Hôm nay 17:00",
    progress: 60,
  },
  {
    id: "TASK-102",
    title: "Bảo dưỡng định kỳ dàn lạnh thùng xe tải 29C-882.60",
    description: "Kiểm tra ga lạnh R404A, vệ sinh quạt dàn ngưng, thay lọc dầu máy lạnh bảo đảm giữ -20 độ C.",
    status: "todo",
    priority: "urgent",
    assignee: "Ngô Văn Tân",
    assigneeRole: "Tài xế chuyên dụng",
    dueDate: "Ngày mai 09:00",
    progress: 0,
  },
  {
    id: "TASK-103",
    title: "Đối soát công nợ tuần chành xe miền Tây & Bến xe Giáp Bát",
    description: "Xuất file MISA 63 cột đối chiếu doanh thu COD VietQR Techcombank 22226060 với hệ thống Sapo.",
    status: "done",
    priority: "medium",
    assignee: "Nguyễn Thị Mai",
    assigneeRole: "Kế toán bán hàng",
    dueDate: "Hôm qua",
    progress: 100,
  },
  {
    id: "TASK-104",
    title: "Thiết lập chương trình khuyến mãi tương ớt Sài Gòn Can 2L",
    description: "Áp dụng giá cấp 3 (196.000đ/thùng) cho các quán trà sữa & ăn vặt đặt từ 3 thùng.",
    status: "in_progress",
    priority: "medium",
    assignee: "Lê Hoàng Phúc",
    assigneeRole: "Kinh doanh B2B",
    dueDate: "12/10/2026",
    progress: 40,
  },
  {
    id: "TASK-105",
    title: "Kiểm tra hạn sử dụng chả cá sợi Ô Ngon và thịt bò viên",
    description: "Thực hiện dán nhãn ưu tiên xuất trước (FEFO) các thùng có hạn sử dụng dưới 45 ngày.",
    status: "todo",
    priority: "high",
    assignee: "Phạm Văn Long",
    assigneeRole: "Thủ kho Q12",
    dueDate: "13/10/2026",
    progress: 10,
  },
];

const PRIORITY_BADGES: Record<TaskPriority, { label: string; color: string }> = {
  urgent: { label: "Khẩn cấp", color: "bg-rose-50 text-rose-700 border-rose-300" },
  high: { label: "Ưu tiên cao", color: "bg-amber-50 text-amber-700 border-amber-300" },
  medium: { label: "Bình thường", color: "bg-sky-50 text-sky-700 border-sky-300" },
  low: { label: "Thấp", color: "bg-slate-50 text-slate-700 border-slate-300" },
};

const STATUS_COLUMNS: { id: TaskStatus; label: string; border: string }[] = [
  { id: "todo", label: "Cần thực hiện", border: "border-slate-300" },
  { id: "in_progress", label: "Đang tiến hành", border: "border-sky-400" },
  { id: "done", label: "Đã hoàn thành", border: "border-emerald-400" },
];

export default function TasksPage() {
  const [tasks, setTasks] = React.useState<Task[]>(INITIAL_TASKS);
  const [viewMode, setViewMode] = React.useState<"kanban" | "list">("kanban");
  const [showAdd, setShowAdd] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newDesc, setNewDesc] = React.useState("");
  const [newAssignee, setNewAssignee] = React.useState("Trần Quốc Toản");
  const [newPriority, setNewPriority] = React.useState<TaskPriority>("medium");
  const [newDueDate, setNewDueDate] = React.useState("Hôm nay");

  const moveStatus = (taskId: string, nextStatus: TaskStatus) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          status: nextStatus,
          progress: nextStatus === "done" ? 100 : nextStatus === "todo" ? 0 : 50,
        };
      })
    );
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask: Task = {
      id: `TASK-${Date.now().toString().slice(-3)}`,
      title: newTitle.trim(),
      description: newDesc.trim() || "Chưa có mô tả chi tiết",
      status: "todo",
      priority: newPriority,
      assignee: newAssignee,
      assigneeRole:
        newAssignee.includes("Tân") ? "Tài xế chuyên dụng" : newAssignee.includes("Mai") ? "Kế toán" : "Thủ kho",
      dueDate: newDueDate,
      progress: 0,
    };

    setTasks([newTask, ...tasks]);
    setNewTitle("");
    setNewDesc("");
    setShowAdd(false);
  };

  const deleteTask = (taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-sky-500" /> Quản Lý Tác Vụ & Công Việc
          </h1>
          <p className="text-xs text-muted-foreground">
            Phân công công việc kho lạnh, bảo dưỡng xe tải lạnh, đối soát kế toán & bán hàng
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setViewMode("kanban")}
              className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                viewMode === "kanban" ? "bg-white dark:bg-slate-900 shadow-sm text-sky-600" : "text-muted-foreground"
              }`}
            >
              <Kanban className="w-3.5 h-3.5" /> Kanban
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`flex items-center gap-1 px-3 py-1 text-xs rounded-full font-medium transition-colors ${
                viewMode === "list" ? "bg-white dark:bg-slate-900 shadow-sm text-sky-600" : "text-muted-foreground"
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" /> Danh sách
            </button>
          </div>

          <Button
            onClick={() => setShowAdd(!showAdd)}
            size="sm"
            className="rounded-full bg-sky-600 hover:bg-sky-700 text-white font-semibold"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Thêm việc mới
          </Button>
        </div>
      </div>

      {/* Add Task Form Modal/Card */}
      {showAdd && (
        <form onSubmit={handleAddTask} className="rounded-3xl border border-sky-200 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Giao tác vụ công việc mới</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Tên công việc (VD: Kiểm tra nhiệt độ kho Q12)..."
              required
              className="text-sm font-semibold"
            />
            <div className="flex gap-2">
              <select
                value={newAssignee}
                onChange={(e) => setNewAssignee(e.target.value)}
                className="h-10 rounded-md border bg-white dark:bg-slate-950 px-3 text-xs flex-1"
              >
                <option value="Trần Quốc Toản">Trần Quốc Toản (Thủ kho Q7)</option>
                <option value="Ngô Văn Tân">Ngô Văn Tân (Tài xế 29C-882.60)</option>
                <option value="Nguyễn Thị Mai">Nguyễn Thị Mai (Kế toán)</option>
                <option value="Phạm Văn Long">Phạm Văn Long (Thủ kho Q12)</option>
              </select>
              <select
                value={newPriority}
                onChange={(e) => setNewPriority(e.target.value as TaskPriority)}
                className="h-10 rounded-md border bg-white dark:bg-slate-950 px-3 text-xs w-36"
              >
                <option value="urgent">Khẩn cấp</option>
                <option value="high">Ưu tiên cao</option>
                <option value="medium">Bình thường</option>
                <option value="low">Thấp</option>
              </select>
            </div>
          </div>
          <Input
            value={newDesc}
            onChange={(e) => setNewDesc(e.target.value)}
            placeholder="Mô tả chi tiết và yêu cầu bàn giao..."
            className="text-xs"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Thời hạn:</span>
              <Input
                value={newDueDate}
                onChange={(e) => setNewDueDate(e.target.value)}
                className="h-8 w-40 text-xs"
              />
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Hủy</Button>
              <Button type="submit" size="sm" className="bg-sky-600 text-white rounded-full">Lưu công việc</Button>
            </div>
          </div>
        </form>
      )}

      {/* Main View */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {STATUS_COLUMNS.map((col) => {
            const colTasks = tasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                className="rounded-3xl border border-slate-200 bg-slate-50/60 dark:bg-slate-900/40 p-4 space-y-3"
              >
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {col.label}
                  </span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {colTasks.length}
                  </Badge>
                </div>

                <div className="space-y-3">
                  {colTasks.map((task) => (
                    <div
                      key={task.id}
                      className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-2.5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <Badge variant="outline" className={`text-[10px] ${PRIORITY_BADGES[task.priority].color}`}>
                          {PRIORITY_BADGES[task.priority].label}
                        </Badge>
                        <span className="font-mono text-[10px] text-muted-foreground">{task.id}</span>
                      </div>

                      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug">
                        {task.title}
                      </h2>
                      <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-semibold text-muted-foreground">
                          <span>Tiến độ</span>
                          <span className="font-mono">{task.progress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-sky-500 rounded-full"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Assignee & Due Date */}
                      <div className="flex items-center justify-between text-[11px] text-muted-foreground border-t border-slate-100 dark:border-slate-800 pt-2">
                        <div className="flex items-center gap-1 font-medium text-slate-700 dark:text-slate-300">
                          <User className="w-3 h-3 text-sky-500" /> {task.assignee}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {task.dueDate}
                        </div>
                      </div>

                      {/* Status switcher buttons */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex gap-1">
                          {task.status !== "todo" && (
                            <button
                              onClick={() => moveStatus(task.id, "todo")}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded border border-slate-200 hover:bg-slate-100"
                            >
                              ← Chờ
                            </button>
                          )}
                          {task.status !== "in_progress" && (
                            <button
                              onClick={() => moveStatus(task.id, "in_progress")}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded border border-sky-200 text-sky-600 hover:bg-sky-50"
                            >
                              Làm
                            </button>
                          )}
                          {task.status !== "done" && (
                            <button
                              onClick={() => moveStatus(task.id, "done")}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded border border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                            >
                              Xong ✓
                            </button>
                          )}
                        </div>
                        <button
                          onClick={() => deleteTask(task.id)}
                          className="text-slate-400 hover:text-rose-500 p-1"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 shadow-sm divide-y">
          {tasks.map((task) => (
            <div key={task.id} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-[10px] ${PRIORITY_BADGES[task.priority].color}`}>
                    {PRIORITY_BADGES[task.priority].label}
                  </Badge>
                  <span className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                    {task.title}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <span>Phụ trách: <strong>{task.assignee}</strong></span>
                  <span>Hạn: <strong>{task.dueDate}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <select
                  value={task.status}
                  onChange={(e) => moveStatus(task.id, e.target.value as TaskStatus)}
                  className="h-8 rounded-full border bg-white dark:bg-slate-950 px-3 text-xs font-semibold"
                >
                  <option value="todo">Cần thực hiện</option>
                  <option value="in_progress">Đang tiến hành</option>
                  <option value="done">Đã hoàn thành</option>
                </select>
                <button
                  onClick={() => deleteTask(task.id)}
                  className="text-slate-400 hover:text-rose-500 p-1.5"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
