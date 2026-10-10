"use client";

import * as React from "react";
import {
  ShieldCheck,
  Activity,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Search,
  RefreshCw,
  Eye,
  FileCode2,
  Calendar,
  User,
  Layers,
  X
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type {
  AuditLog,
  AuditStats,
  AuditModule,
  AuditLevel,
  AuditActor
} from "@/packages/modules/audit/types";
import {
  AUDIT_ACTOR_LABEL,
  AUDIT_MODULE_LABEL,
  AUDIT_ACTION_LABEL,
  AUDIT_LEVEL_COLOR,
  AUDIT_LEVEL_LABEL
} from "@/packages/modules/audit/types";

export default function AuditPage() {
  const [logs, setLogs] = React.useState<AuditLog[]>([]);
  const [stats, setStats] = React.useState<AuditStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [moduleFilter, setModuleFilter] = React.useState<string>("ALL");
  const [levelFilter, setLevelFilter] = React.useState<string>("ALL");
  const [selectedLog, setSelectedLog] = React.useState<AuditLog | null>(null);

  const fetchLogs = React.useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (moduleFilter !== "ALL") params.set("module", moduleFilter);
      if (levelFilter !== "ALL") params.set("level", levelFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/audit?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.items || []);
        setStats(data.stats || null);
      }
    } catch (err) {
      console.error("Lỗi tải nhật ký kiểm toán:", err);
    } finally {
      setLoading(false);
    }
  }, [moduleFilter, levelFilter, search]);

  React.useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-7 h-7 text-sky-600" />
            Nhật Ký Hệ Thống & Kiểm Toán Tích Hợp
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Theo dõi chi tiết vết kiểm toán API: Sapo, MISA AMIS, meInvoice, VietQR Techcombank & phân quyền thao tác
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchLogs}
            disabled={loading}
            className="rounded-xl gap-2 font-medium"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-sky-600" : ""}`} />
            Làm mới logs
          </Button>
        </div>
      </div>

      {/* 4 Clay-KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="clay-card p-5 space-y-2 border-sky-100 dark:border-sky-950">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Tổng ghi nhận hôm nay</span>
            <Activity className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-black text-sky-600">
            {stats?.total_today ?? logs.length}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-1">
            <span className="font-medium text-sky-700">Audit Logs</span> toàn hệ thống
          </div>
        </div>

        <div className="clay-card p-5 space-y-2 border-emerald-100 dark:border-emerald-950">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Đồng bộ thành công</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            {stats?.sync_success ?? 0}
          </div>
          <div className="text-xs text-emerald-700 font-medium">
            Sapo · MISA AMIS · meInvoice
          </div>
        </div>

        <div className="clay-card p-5 space-y-2 border-amber-100 dark:border-amber-950">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Cảnh báo kiểm toán</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {stats?.warning_count ?? 0}
          </div>
          <div className="text-xs text-amber-700 font-medium">
            Cần giám sát & đối chiếu
          </div>
        </div>

        <div className="clay-card p-5 space-y-2 border-rose-100 dark:border-rose-950">
          <div className="flex justify-between items-center text-muted-foreground">
            <span className="text-xs font-semibold uppercase tracking-wider">Lỗi tích hợp & Kết nối</span>
            <XCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-black text-rose-600">
            {stats?.error_count ?? 0}
          </div>
          <div className="text-xs text-rose-700 font-medium">
            Yêu cầu xử lý tức thì
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="clay-card p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[240px] max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm mã log, mô tả, nhân sự, IP..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 rounded-xl bg-background/60"
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={moduleFilter}
              onChange={(e) => setModuleFilter(e.target.value)}
              className="text-xs font-medium px-3 py-2 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">Tất cả Phân hệ</option>
              <option value="SALES">Bán hàng / Sapo</option>
              <option value="FINANCE_MISA">Tài chính / MISA</option>
              <option value="INVENTORY">Kho lạnh</option>
              <option value="DELIVERY">Giao vận</option>
              <option value="PRICING">Bảng giá</option>
            </select>

            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="text-xs font-medium px-3 py-2 rounded-xl bg-background border border-input focus:outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="ALL">Tất cả Mức độ</option>
              <option value="INFO">Thông tin (INFO)</option>
              <option value="SUCCESS">Thành công (SUCCESS)</option>
              <option value="WARNING">Cảnh báo (WARNING)</option>
              <option value="ERROR">Lỗi (ERROR)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="clay-card p-0 overflow-hidden">
        <div className="p-4 border-b border-border/60 flex items-center justify-between">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <Activity className="w-4 h-4 text-sky-600" />
            Nhật Ký Vết Kiểm Toán ({logs.length} sự kiện)
          </h3>
          <span className="text-xs text-muted-foreground">Tự động lưu vết mỗi giao dịch API</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-muted/40 border-b text-muted-foreground font-semibold">
                <th className="py-3 px-4 text-left">Thời gian</th>
                <th className="py-3 px-3 text-left">Mức độ</th>
                <th className="py-3 px-3 text-left">Nhân sự</th>
                <th className="py-3 px-3 text-left">Phân hệ & Hành động</th>
                <th className="py-3 px-4 text-left">Mô tả sự kiện</th>
                <th className="py-3 px-3 text-left">IP & Client</th>
                <th className="py-3 px-3 text-center">Payload</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground">
                    <RefreshCw className="w-5 h-5 animate-spin mx-auto mb-2 text-sky-600" />
                    Đang tải nhật ký kiểm toán...
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-muted-foreground">
                    Không tìm thấy nhật ký kiểm toán nào khớp bộ lọc.
                  </td>
                </tr>
              ) : (
                logs.map((log) => {
                  const levelClass = AUDIT_LEVEL_COLOR[log.level] || "bg-muted text-muted-foreground";
                  const levelText = AUDIT_LEVEL_LABEL[log.level] || log.level;
                  const modText = AUDIT_MODULE_LABEL[log.module] || log.module;
                  const actText = AUDIT_ACTION_LABEL[log.action] || log.action;

                  return (
                    <tr
                      key={log.id}
                      className="border-b last:border-0 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-4 font-mono text-[11px] text-muted-foreground whitespace-nowrap">
                        {new Date(log.timestamp).toLocaleString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric"
                        })}
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <Badge variant="outline" className={`text-[10px] font-bold ${levelClass}`}>
                          {levelText}
                        </Badge>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-semibold">{log.actor_name}</div>
                        <div className="text-[10px] text-muted-foreground">
                          {AUDIT_ACTOR_LABEL[log.actor] || log.actor}
                        </div>
                      </td>
                      <td className="py-3 px-3 whitespace-nowrap">
                        <div className="font-medium text-sky-700 dark:text-sky-400">{modText}</div>
                        <Badge variant="secondary" className="text-[10px] font-mono mt-0.5">
                          {actText}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 max-w-xs font-medium">
                        <div className="line-clamp-2">{log.message}</div>
                      </td>
                      <td className="py-3 px-3 text-[11px] font-mono text-muted-foreground whitespace-nowrap">
                        <div>{log.ip}</div>
                        <div className="text-[10px] opacity-75">{log.client}</div>
                      </td>
                      <td className="py-3 px-3 text-center whitespace-nowrap">
                        {log.payload ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedLog(log)}
                            className="h-7 px-2 text-[11px] text-sky-600 hover:text-sky-700 hover:bg-sky-50 dark:hover:bg-sky-950 rounded-lg gap-1"
                          >
                            <FileCode2 className="w-3.5 h-3.5" />
                            Xem
                          </Button>
                        ) : (
                          <span className="text-[11px] text-muted-foreground italic">None</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal View Payload Details */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-background rounded-2xl border max-w-2xl w-full shadow-2xl p-6 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b">
              <div className="space-y-0.5">
                <h3 className="font-bold text-base flex items-center gap-2">
                  <FileCode2 className="w-5 h-5 text-sky-600" />
                  Chi Tiết Payload Kiểm Toán: <span className="font-mono text-sky-600">{selectedLog.id}</span>
                </h3>
                <div className="text-xs text-muted-foreground">
                  {selectedLog.message} · {new Date(selectedLog.timestamp).toLocaleString("vi-VN")}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedLog(null)}
                className="rounded-full h-8 w-8"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-2 flex-1 overflow-y-auto">
              <div className="flex flex-wrap gap-2 text-xs">
                <Badge variant="outline" className={AUDIT_LEVEL_COLOR[selectedLog.level]}>
                  {AUDIT_LEVEL_LABEL[selectedLog.level]}
                </Badge>
                <Badge variant="secondary">
                  {AUDIT_MODULE_LABEL[selectedLog.module]}: {AUDIT_ACTION_LABEL[selectedLog.action]}
                </Badge>
                <Badge variant="outline" className="font-mono">
                  {selectedLog.actor_name} ({selectedLog.actor})
                </Badge>
              </div>

              <div className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-xs overflow-x-auto border border-slate-800">
                <pre>{JSON.stringify(selectedLog.payload, null, 2)}</pre>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <Button
                variant="default"
                size="sm"
                onClick={() => setSelectedLog(null)}
                className="rounded-xl px-5"
              >
                Đóng
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
