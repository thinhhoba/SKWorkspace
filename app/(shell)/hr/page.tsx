"use client";
import * as React from "react";
import Link from "next/link";
import { Users, UserCheck, Truck, ShieldCheck, Clock3, Eye, Settings2, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { HrEmployee, HrSummary, AttendanceRecord } from "@/packages/modules/hr/types";
import { HR_ROLE_LABEL, HR_ROLE_COLOR, SHIFT_DEFS } from "@/packages/modules/hr/types";

const STATUS_LABEL: Record<string, string> = { active: "Đang làm việc", inactive: "Nghỉ việc", on_leave: "Nghỉ phép" };
const ATT_LABEL: Record<string, string> = { present: "Có mặt", late: "Đi muộn", leave: "Nghỉ phép", absent: "Vắng" };
const ATT_COLOR: Record<string, string> = {
  present: "bg-emerald-100 text-emerald-700 border-emerald-200",
  late: "bg-amber-100 text-amber-700 border-amber-200",
  leave: "bg-sky-100 text-sky-700 border-sky-200",
  absent: "bg-rose-100 text-rose-700 border-rose-200",
};

export default function HrPage() {
  const [employees, setEmployees] = React.useState<HrEmployee[]>([]);
  const [attendance, setAttendance] = React.useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = React.useState<HrSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [selected, setSelected] = React.useState<HrEmployee | null>(null);

  React.useEffect(() => {
    fetch("/api/hr")
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setEmployees(d.employees || []);
          setAttendance(d.attendance || []);
          setSummary(d.summary || null);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const attByEmp = React.useMemo(() => {
    const m = new Map<string, AttendanceRecord[]>();
    for (const a of attendance) {
      const arr = m.get(a.employeeId) || [];
      arr.push(a);
      m.set(a.employeeId, arr);
    }
    return m;
  }, [attendance]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-8 w-48 bg-muted animate-pulse rounded" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="clay-card p-4 h-24 animate-pulse bg-muted" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Users className="w-5 h-5 text-sky-500" /> Nhân sự &amp; Phân quyền
          </h1>
          <p className="text-xs text-muted-foreground">Nhân sự chính thức · Ca làm 08:00–12:00 &amp; 13:30–17:30 (T2–T7) · Tùy biến phân quyền RBAC</p>
        </div>
        <Link href="/hr/new">
          <Button size="sm" className="rounded-full bg-sky-600 hover:bg-sky-700 text-white font-semibold">
            <Plus className="w-4 h-4 mr-1.5" /> Thêm nhân sự mới
          </Button>
        </Link>
      </div>

      {/* 4 Clay KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="clay-kpi clay-kpi--sky p-4 space-y-1 border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Tổng nhân sự</span>
            <Users className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black tracking-tight text-sky-600">{summary?.total ?? 0}</div>
          <p className="text-[11px] text-muted-foreground">Chính thức · Chủ nhật nghỉ</p>
        </div>
        <div className="clay-kpi p-4 space-y-1 border-l-4 border-l-emerald-500" style={{ boxShadow: "0 14px 28px -6px rgba(5,150,105,0.18), inset 0 2px 3px rgba(255,255,255,0.95)" }}>
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Đang làm việc hôm nay</span>
            <UserCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black tracking-tight text-emerald-600">
            {summary?.presentToday ?? 0}/{summary?.total ?? 0}
          </div>
          <p className="text-[11px] text-muted-foreground">Điểm danh {summary?.attendanceRate ?? 0}%</p>
        </div>
        <div className="clay-kpi clay-kpi--warning p-4 space-y-1 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Vận hành kho &amp; xe</span>
            <Truck className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black tracking-tight text-amber-600">{summary?.operations ?? 0}</div>
          <p className="text-[11px] text-muted-foreground">Thủ kho + Tài xế</p>
        </div>
        <div className="clay-kpi p-4 space-y-1 border-l-4 border-l-violet-500">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Phân quyền RBAC</span>
            <ShieldCheck className="w-4 h-4 text-violet-500" />
          </div>
          <div className={`text-sm font-black tracking-tight ${summary?.rbacReady ? "text-emerald-600" : "text-amber-600"}`}>
            {summary?.rbacReady ? "Full RBAC" : "Thiếu quyền"}
          </div>
          <p className="text-[11px] text-muted-foreground">admin · ketoan · thukho · taixe</p>
        </div>
      </div>

      {/* Bảng nhân sự */}
      <div className="clay-card overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Users className="w-4 h-4 text-sky-500" /> Danh sách nhân sự
          </h2>
          <span className="text-xs text-muted-foreground">{employees.length} nhân sự</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-muted-foreground border-b bg-muted/40">
                <th className="text-left px-4 py-2 font-semibold">Nhân sự</th>
                <th className="text-left px-3 py-2 font-semibold">Chức danh</th>
                <th className="text-left px-3 py-2 font-semibold">SĐT</th>
                <th className="text-left px-3 py-2 font-semibold">Vai trò</th>
                <th className="text-left px-3 py-2 font-semibold">Ứng dụng</th>
                <th className="text-left px-3 py-2 font-semibold">Trạng thái</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody>
              {employees.map((e) => (
                <tr key={e.id} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center text-xs font-bold shrink-0">
                        {e.avatar}
                      </div>
                      <div className="min-w-0">
                        <div className="font-semibold leading-tight truncate">{e.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{e.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3 text-xs max-w-[180px] truncate">{e.title}</td>
                  <td className="px-3 py-3 font-mono text-xs whitespace-nowrap">{e.phone}</td>
                  <td className="px-3 py-3">
                    <Badge variant="outline" className={`text-[11px] border ${HR_ROLE_COLOR[e.role]}`}>
                      {HR_ROLE_LABEL[e.role]}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {e.apps.slice(0, 5).map((a) => (
                        <span key={a} className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border text-muted-foreground">
                          {a}
                        </span>
                      ))}
                      {e.apps.length > 5 && <span className="text-[10px] text-muted-foreground">+{e.apps.length - 5}</span>}
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <Badge variant={e.status === "active" ? "success" : "secondary"} className="text-[11px]">
                      {STATUS_LABEL[e.status] || e.status}
                    </Badge>
                  </td>
                  <td className="px-3 py-3">
                    <Link href={`/hr/${e.id}`}>
                      <Button size="sm" variant="outline" className="h-7 text-xs rounded-full">
                        <Eye className="w-3 h-3 mr-1" /> Chi tiết &amp; Phân quyền
                      </Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Thẻ Chấm Công Hàng Ngày */}
      <div className="clay-card overflow-hidden">
        <div className="px-4 py-3 border-b">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            <Clock3 className="w-4 h-4 text-emerald-500" /> Chấm công hôm nay
          </h2>
          <p className="text-[11px] text-muted-foreground">Ca sáng 08:00–12:00 · Ca chiều 13:30–17:30 · {new Date().toLocaleDateString("vi-VN")}</p>
        </div>
        <div className="p-3 space-y-3">
          <div className="flex gap-2 text-[11px]">
            {SHIFT_DEFS.filter((s) => s.key !== "ca_ngay").map((s) => (
              <span key={s.key} className="px-2 py-1 rounded-full bg-muted border text-muted-foreground">
                {s.label}: {s.time}
              </span>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-xs text-muted-foreground border-b bg-muted/40">
                  <th className="text-left px-3 py-2">Nhân sự</th>
                  <th className="text-left px-3 py-2">Ca</th>
                  <th className="text-left px-3 py-2">Trạng thái</th>
                  <th className="text-left px-3 py-2">Check-in</th>
                  <th className="text-left px-3 py-2">Check-out</th>
                  <th className="text-left px-3 py-2">Ghi chú</th>
                </tr>
              </thead>
              <tbody>
                {attendance.map((a, idx) => {
                  const emp = employees.find((e) => e.id === a.employeeId);
                  return (
                    <tr key={idx} className="border-b last:border-0 hover:bg-muted/20">
                      <td className="px-3 py-2 text-xs font-medium whitespace-nowrap">
                        {emp?.name || a.employeeId} <span className="text-muted-foreground font-normal">· {emp ? HR_ROLE_LABEL[emp.role] : ""}</span>
                      </td>
                      <td className="px-3 py-2 text-xs">{a.shift === "sang" ? "Sáng" : a.shift === "chieu" ? "Chiều" : "Cả ngày"}</td>
                      <td className="px-3 py-2">
                        <Badge variant="outline" className={`text-[11px] border ${ATT_COLOR[a.status] || ""}`}>
                          {ATT_LABEL[a.status] || a.status}
                        </Badge>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{a.checkIn || "—"}</td>
                      <td className="px-3 py-2 font-mono text-xs">{a.checkOut || "—"}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground max-w-[200px] truncate">{a.note || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {/* Mini per-employee summary */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {employees.map((e) => {
              const recs = attByEmp.get(e.id) || [];
              const hasLate = recs.some((r) => r.status === "late");
              return (
                <div key={e.id} className="rounded-xl border p-2.5 bg-muted/30">
                  <div className="text-xs font-semibold truncate">{e.name}</div>
                  <div className="text-[11px] text-muted-foreground">{HR_ROLE_LABEL[e.role]} · {recs.length} ca</div>
                  <div className="mt-1 flex gap-1 flex-wrap">
                    {recs.map((r, i) => (
                      <span key={i} className={`text-[10px] px-1.5 py-0.5 rounded-full border ${ATT_COLOR[r.status]}`}>{ATT_LABEL[r.status]}</span>
                    ))}
                  </div>
                  {hasLate && <div className="text-[11px] text-amber-600 mt-1">Có ca đi muộn</div>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
