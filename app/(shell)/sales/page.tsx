"use client";
import * as React from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Search,
  PackageCheck,
  Truck,
  Wallet,
  ClipboardList,
  CheckCircle2,
  RefreshCw,
  Eye,
  Play,
  Send,
  Plus,
  Edit,
  Filter,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { SalesOrder, OrderStatus } from "@/packages/modules/sales/types";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/packages/modules/sales/types";

const fmtVnd = (n: number) => Number(n).toLocaleString("vi-VN") + " ₫";

const STATUS_OPTIONS: { value: OrderStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "cho_duyet", label: "Chờ duyệt" },
  { value: "cho_soan", label: "Chờ soạn" },
  { value: "dang_soan", label: "Đang soạn" },
  { value: "da_soan", label: "Đã soạn" },
  { value: "dang_giao", label: "Đang giao" },
  { value: "hoan_tat", label: "Hoàn tất" },
  { value: "huy", label: "Đã hủy" },
];

const WAREHOUSE_OPTIONS: { value: "ALL" | "Q7" | "Q12"; label: string }[] = [
  { value: "ALL", label: "Tất cả kho" },
  { value: "Q7", label: "Kho Q7" },
  { value: "Q12", label: "Kho Q12" },
];

function canPick(status: OrderStatus): boolean {
  return status === "cho_soan" || status === "dang_soan";
}

function paymentLabel(m: string): string {
  if (m === "COD_VIETQR") return "VietQR";
  if (m === "DEBT_B2B") return "Công nợ";
  return "Chuyển khoản";
}

function paymentBadgeClass(m: string): string {
  if (m === "COD_VIETQR") return "border-sky-200 text-sky-700 bg-sky-50";
  if (m === "DEBT_B2B") return "border-amber-200 text-amber-700 bg-amber-50";
  return "border-emerald-200 text-emerald-700 bg-emerald-50";
}

export default function SalesPage() {
  const [orders, setOrders] = React.useState<SalesOrder[]>([]);
  const [stats, setStats] = React.useState<{ totalToday: number; choSoan: number; dangGiao: number; revenueToday: number } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | "ALL">("ALL");
  const [warehouseFilter, setWarehouseFilter] = React.useState<"ALL" | "Q7" | "Q12">("ALL");
  const [toast, setToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = React.useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (statusFilter !== "ALL") q.set("status", statusFilter);
      if (warehouseFilter !== "ALL") q.set("warehouse", warehouseFilter);
      if (debouncedSearch.trim()) q.set("search", debouncedSearch.trim());
      if (forceRefresh) q.set("refresh", "1");
      const res = await fetch(`/api/sales?${q.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        if (data.stats) setStats(data.stats);
        if (forceRefresh) setToast("Đã đồng bộ lại dữ liệu thực tế từ Sapo!");
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, warehouseFilter, debouncedSearch]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const patchOrder = async (id: string, body: Record<string, unknown>) => {
    const res = await fetch(`/api/sales/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Lỗi cập nhật");
    return data.order as SalesOrder;
  };

  const handleQuickStatus = async (order: SalesOrder, next: OrderStatus) => {
    try {
      const updated = await patchOrder(order.id, { status: next });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
      setToast(`Đã chuyển ${order.code} → ${ORDER_STATUS_LABEL[next]}`);
      fetchData();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Lỗi";
      setToast(msg);
    }
  };

  return (
    <div className="space-y-5 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-sky-500" /> Quản lý Đơn hàng & Soạn kho
          </h1>
          <p className="text-xs text-muted-foreground">Kinh doanh → Thủ kho Q7/Q12 → Tài xế giao nhận — FEFO & VietQR COD</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/sales/new">
            <Button size="sm" className="rounded-full bg-sky-600 hover:bg-sky-700 text-white font-semibold">
              <Plus className="w-4 h-4 mr-1.5" /> Tạo đơn hàng mới
            </Button>
          </Link>
          <Button variant="outline" size="sm" className="rounded-full glossy-pill" onClick={() => fetchData(true)} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin text-sky-500" : ""}`} /> Đồng bộ Sapo
          </Button>
        </div>
      </div>

      {/* 4 Clay KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="clay-kpi clay-kpi--sky border-l-4 border-l-sky-500 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-muted-foreground">TỔNG ĐƠN HÔM NAY</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-white border border-white/80 shadow-[0_4px_12px_rgba(14,165,233,0.35),inset_0_1px_1px_rgba(255,255,255,0.9)]">
              <ClipboardList className="h-4 w-4" />
            </span>
          </div>
          <p className="text-xl font-extrabold tracking-tight">{stats ? stats.totalToday : loading ? "—" : orders.length} <span className="text-xs font-semibold text-muted-foreground">đơn</span></p>
          <p className="text-xs text-muted-foreground">Chưa tính đơn hủy</p>
        </div>

        <div className="clay-kpi clay-kpi--warning border-l-4 border-l-amber-500 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-muted-foreground">CHỜ SOẠN</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white border border-white/80 shadow-[0_4px_12px_rgba(217,119,6,0.35),inset_0_1px_1px_rgba(255,255,255,0.9)]">
              <PackageCheck className="h-4 w-4" />
            </span>
          </div>
          <p className="text-xl font-extrabold tracking-tight text-amber-600">{stats ? stats.choSoan : "—"} <span className="text-xs font-semibold text-muted-foreground">đơn</span></p>
          <p className="text-xs text-muted-foreground">Chờ soạn + Đang soạn</p>
        </div>

        <div className="clay-kpi clay-kpi--sky border-l-4 border-l-sky-500 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-muted-foreground">ĐANG GIAO</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-white border border-white/80 shadow-[0_4px_12px_rgba(14,165,233,0.35),inset_0_1px_1px_rgba(255,255,255,0.9)]">
              <Truck className="h-4 w-4" />
            </span>
          </div>
          <p className="text-xl font-extrabold tracking-tight text-sky-600">{stats ? stats.dangGiao : "—"} <span className="text-xs font-semibold text-muted-foreground">đơn</span></p>
          <p className="text-xs text-muted-foreground">Đã soạn + Đang giao</p>
        </div>

        <div className="clay-kpi border-l-4 border-l-emerald-500 p-4 space-y-1" style={{ boxShadow: "0 14px 28px -6px rgba(16,185,129,0.18), inset 0 2px 3px rgba(255,255,255,0.95)" }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-muted-foreground">DOANH THU DỰ KIẾN</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white border border-white/80 shadow-[0_4px_12px_rgba(16,185,129,0.3),inset_0_1px_1px_rgba(255,255,255,0.9)]">
              <Wallet className="h-4 w-4" />
            </span>
          </div>
          <p className="text-lg font-extrabold tracking-tight font-mono text-emerald-600">{stats ? fmtVnd(stats.revenueToday) : loading ? "—" : fmtVnd(0)}</p>
          <p className="text-xs text-muted-foreground">Tổng dự kiến hôm nay</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Filter className="w-3 h-3" /> Trạng thái</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as OrderStatus | "ALL")}
            className="h-9 rounded-full border bg-white/90 px-3 text-xs font-medium shadow-sm"
          >
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Store className="w-3 h-3" /> Kho</span>
          <select
            value={warehouseFilter}
            onChange={(e) => setWarehouseFilter(e.target.value as "ALL" | "Q7" | "Q12")}
            className="h-9 rounded-full border bg-white/90 px-3 text-xs font-medium shadow-sm"
          >
            {WAREHOUSE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>
        <div className="relative min-w-[220px] flex-1 max-w-sm ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm mã đơn / tên KH..."
            className="pl-8 h-9 text-xs rounded-full border-white/80 bg-white/90 glossy-pill"
          />
        </div>
      </div>

      {/* Order grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="clay-card p-4 animate-pulse h-[220px] bg-muted/50" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="clay-card p-10 text-center space-y-3">
          <p className="text-sm text-muted-foreground">Không tìm thấy đơn hàng phù hợp bộ lọc.</p>
          <Link href="/sales/new">
            <Button size="sm" className="rounded-full bg-sky-600 text-white">
              <Plus className="w-4 h-4 mr-1" /> Tạo đơn hàng đầu tiên
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {orders.map((order) => (
            <div key={order.id} className="clay-card p-4 flex flex-col gap-2.5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link href={`/sales/${order.id}`} className="hover:underline">
                    <div className="font-mono text-sm font-bold tracking-tight text-sky-700 dark:text-sky-400 truncate">
                      {order.code}
                    </div>
                  </Link>
                  <div className="text-xs font-semibold truncate text-slate-900 dark:text-slate-100">{order.customer_name}</div>
                  <div className="text-[11px] text-muted-foreground line-clamp-1">{order.delivery_address || "—"}</div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant="outline" className={`text-[10px] font-mono ${order.warehouse === "Q7" ? "border-sky-300 text-sky-700 bg-sky-50" : "border-indigo-300 text-indigo-700 bg-indigo-50"}`}>{order.warehouse}</Badge>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${ORDER_STATUS_COLOR[order.status]}`}>{ORDER_STATUS_LABEL[order.status]}</span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-1.5">
                <Badge variant="outline" className={`text-[10px] rounded-full ${paymentBadgeClass(order.payment_method)}`}>{paymentLabel(order.payment_method)}</Badge>
                <span className="text-[11px] text-muted-foreground">{order.items.length} món</span>
                <span className="text-[11px] font-mono font-bold text-emerald-600 ml-auto">{fmtVnd(order.total_amount)}</span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                <span>Giao: {order.delivery_date || "—"}</span>
                <span className="ml-auto font-mono text-[10px]">{order.created_at}</span>
              </div>

              {/* Dedicated Task URL Links */}
              <div className="flex flex-wrap gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 mt-1">
                {canPick(order.status) && (
                  <Link href={`/sales/${order.id}/pick`}>
                    <Button size="sm" className="h-7 text-xs rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium">
                      <PackageCheck className="w-3.5 h-3.5 mr-1" /> Soạn hàng
                    </Button>
                  </Link>
                )}
                <Link href={`/sales/${order.id}`}>
                  <Button variant="outline" size="sm" className="h-7 text-xs rounded-full glossy-pill">
                    <Eye className="w-3 h-3 mr-1" /> Chi tiết
                  </Button>
                </Link>
                <Link href={`/sales/${order.id}/edit`}>
                  <Button variant="ghost" size="sm" className="h-7 text-xs rounded-full">
                    <Edit className="w-3 h-3 mr-1" /> Sửa
                  </Button>
                </Link>
                {order.status === "cho_duyet" && (
                  <Button variant="outline" size="sm" className="h-7 text-xs rounded-full ml-auto" onClick={() => handleQuickStatus(order, "cho_soan")}>
                    <Play className="w-3 h-3 mr-1" /> Duyệt
                  </Button>
                )}
                {order.status === "da_soan" && (
                  <Button variant="outline" size="sm" className="h-7 text-xs rounded-full ml-auto" onClick={() => handleQuickStatus(order, "dang_giao")}>
                    <Send className="w-3 h-3 mr-1" /> Giao
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-foreground text-background text-sm px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toast}
        </div>
      )}
    </div>
  );
}
