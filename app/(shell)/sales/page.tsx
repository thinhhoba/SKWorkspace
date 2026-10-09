"use client";
import * as React from "react";
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
  RotateCcw,
  Filter,
  Store,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { SalesOrder, SalesOrderItem, OrderStatus } from "@/packages/modules/sales/types";
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

  // detail modal
  const [detailOrder, setDetailOrder] = React.useState<SalesOrder | null>(null);
  // picking modal
  const [pickingOrder, setPickingOrder] = React.useState<SalesOrder | null>(null);
  const [pickingItems, setPickingItems] = React.useState<SalesOrderItem[]>([]);
  const [completing, setCompleting] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (statusFilter !== "ALL") q.set("status", statusFilter);
      if (warehouseFilter !== "ALL") q.set("warehouse", warehouseFilter);
      if (debouncedSearch.trim()) q.set("search", debouncedSearch.trim());
      const res = await fetch(`/api/sales?${q.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        if (data.stats) setStats(data.stats);
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
      // refresh stats
      fetchData();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Lỗi";
      setToast(msg);
    }
  };

  const openPicking = (order: SalesOrder) => {
    setPickingOrder(order);
    setPickingItems(order.items.map((it) => ({ ...it })));
  };

  const togglePicked = async (itemId: string) => {
    if (!pickingOrder) return;
    const target = pickingItems.find((it) => it.id === itemId);
    if (!target) return;
    const nextPicked = !target.picked;
    // haptic
    try { (navigator as unknown as { vibrate?: (n: number) => void }).vibrate?.(50); } catch { /* ignore */ }
    // optimistic
    setPickingItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, picked: nextPicked } : it)));
    try {
      const updated = await patchOrder(pickingOrder.id, { action: "toggle", itemId, picked: nextPicked });
      // sync pickingItems from server
      setPickingItems(updated.items);
      setPickingOrder(updated);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      // if status changed implicitly? not here
    } catch (e: unknown) {
      // revert
      setPickingItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, picked: !nextPicked } : it)));
      const msg = e instanceof Error ? e.message : "Lỗi";
      setToast(msg);
    }
  };

  const handleComplete = async () => {
    if (!pickingOrder) return;
    setCompleting(true);
    try {
      const updated = await patchOrder(pickingOrder.id, { action: "complete" });
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setPickingOrder(null);
      setPickingItems([]);
      setToast(`Đã soạn xong ${updated.code} — sẵn sàng giao`);
      fetchData();
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "Lỗi";
      setToast(msg);
    } finally {
      setCompleting(false);
    }
  };

  const pickedCount = pickingItems.filter((it) => it.picked).length;
  const totalPick = pickingItems.length;
  const percent = totalPick === 0 ? 0 : Math.round((pickedCount / totalPick) * 100);
  const allPicked = totalPick > 0 && pickedCount === totalPick;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-5 h-5 text-sky-500" /> Quản lý Đơn hàng & Soạn kho
          </h1>
          <p className="text-xs text-muted-foreground">Kinh doanh → Thủ kho Q7/Q12 → Tài xế giao nhận — FEFO & VietQR COD</p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full glossy-pill" onClick={fetchData} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin text-sky-500" : ""}`} /> Làm mới
        </Button>
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
        <div className="clay-card p-10 text-center">
          <p className="text-sm text-muted-foreground">Không tìm thấy đơn hàng phù hợp bộ lọc.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {orders.map((order) => (
            <div key={order.id} className="clay-card p-4 flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-mono text-sm font-bold tracking-tight truncate">{order.code}</div>
                  <div className="text-xs font-semibold truncate">{order.customer_name}</div>
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

              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/60 dark:border-white/10 mt-1">
                {canPick(order.status) && (
                  <Button size="sm" className="h-7 text-xs rounded-full bg-sky-600 hover:bg-sky-700 text-white" onClick={() => openPicking(order)}>
                    <PackageCheck className="w-3.5 h-3.5 mr-1" /> Soạn hàng
                  </Button>
                )}
                <Button variant="outline" size="sm" className="h-7 text-xs rounded-full glossy-pill" onClick={() => setDetailOrder(order)}>
                  <Eye className="w-3 h-3 mr-1" /> Chi tiết
                </Button>
                {order.status === "cho_duyet" && (
                  <Button variant="outline" size="sm" className="h-7 text-xs rounded-full" onClick={() => handleQuickStatus(order, "cho_soan")}>
                    <Play className="w-3 h-3 mr-1" /> Duyệt
                  </Button>
                )}
                {order.status === "da_soan" && (
                  <Button variant="outline" size="sm" className="h-7 text-xs rounded-full" onClick={() => handleQuickStatus(order, "dang_giao")}>
                    <Send className="w-3 h-3 mr-1" /> Giao
                  </Button>
                )}
                {order.status === "cho_soan" && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs rounded-full" onClick={() => handleQuickStatus(order, "dang_soan")}>Bắt đầu soạn</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!detailOrder} onOpenChange={(v) => { if (!v) setDetailOrder(null); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-auto">
          {detailOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="text-sm flex items-center gap-2">
                  <span className="font-mono">{detailOrder.code}</span>
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${ORDER_STATUS_COLOR[detailOrder.status]}`}>{ORDER_STATUS_LABEL[detailOrder.status]}</span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <div className="font-semibold">{detailOrder.customer_name} {detailOrder.customer_phone ? `· ${detailOrder.customer_phone}` : ""}</div>
                  <div className="text-muted-foreground">{detailOrder.delivery_address}</div>
                  <div className="text-muted-foreground">Kho {detailOrder.warehouse} · {paymentLabel(detailOrder.payment_method)} · Giao {detailOrder.delivery_date || "—"}</div>
                  {detailOrder.notes && <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mt-2">{detailOrder.notes}</div>}
                </div>
                <div className="border-t pt-3 space-y-1.5">
                  {detailOrder.items.map((it) => (
                    <div key={it.id} className="flex items-start justify-between gap-2 rounded-xl border bg-white/60 px-2.5 py-2">
                      <div className="min-w-0">
                        <div className="font-semibold truncate">{it.name}</div>
                        <div className="font-mono text-[11px] text-muted-foreground">{it.sku} · {it.quantity} {it.dvt} {it.lot_number ? `· ${it.lot_number}` : ""}</div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold">{fmtVnd(it.total_price)}</div>
                        <div className="text-[11px] text-muted-foreground">{it.quantity} × {fmtVnd(it.unit_price)}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-sm border-t pt-2">
                  <span>Tổng</span><span className="font-mono text-emerald-600">{fmtVnd(detailOrder.total_amount)}</span>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Picking Checklist Modal */}
      <Dialog open={!!pickingOrder} onOpenChange={(v) => { if (!v) { setPickingOrder(null); setPickingItems([]); } }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-auto">
          {pickingOrder && (
            <>
              <DialogHeader>
                <DialogTitle className="text-sm flex items-center gap-2">
                  <PackageCheck className="w-4 h-4 text-sky-600" /> Soạn hàng — <span className="font-mono">{pickingOrder.code}</span>
                  <span className="text-xs font-normal text-muted-foreground">Kho {pickingOrder.warehouse}</span>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-3 pt-2">
                <div className="text-xs text-muted-foreground">{pickingOrder.customer_name} · {pickingOrder.delivery_address}</div>

                {/* Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Đã soạn {pickedCount}/{totalPick} món</span>
                    <span className="font-mono">{percent}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-muted rounded-full overflow-hidden p-0.5">
                    <div className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all" style={{ width: `${percent}%` }} />
                  </div>
                </div>

                <div className="space-y-2">
                  {pickingItems.map((it) => (
                    <label
                      key={it.id}
                      className={`flex items-center gap-3 rounded-2xl border p-3 cursor-pointer transition-colors ${it.picked ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30" : "bg-white/70 hover:bg-white"}`}
                    >
                      <input
                        type="checkbox"
                        checked={!!it.picked}
                        onChange={() => togglePicked(it.id)}
                        className="min-h-[52px] min-w-[52px] rounded-xl accent-emerald-600 w-[52px] h-[52px] shrink-0"
                      />
                      <span className="flex-1 min-w-0">
                        <span className={`block text-sm font-semibold leading-tight ${it.picked ? "line-through text-muted-foreground" : ""}`}>{it.name}</span>
                        <span className="block font-mono text-[11px] text-muted-foreground">{it.sku} {it.lot_number ? `· ${it.lot_number}` : ""}</span>
                        <span className="block text-xs">{it.quantity} {it.dvt} · {fmtVnd(it.unit_price)}/ {it.dvt}</span>
                      </span>
                      {it.picked && <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />}
                    </label>
                  ))}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" size="sm" className="rounded-full" onClick={() => { setPickingOrder(null); setPickingItems([]); }}> Đóng</Button>
                  <Button
                    size="sm"
                    className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
                    disabled={!allPicked || completing}
                    onClick={handleComplete}
                  >
                    {completing ? " Đang xử lý..." : "Hoàn tất soạn hàng & Sẵn sàng giao"}
                  </Button>
                </div>
                {!allPicked && <p className="text-[11px] text-muted-foreground text-right">Cần tích đủ 100% món mới hoàn tất.</p>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-foreground text-background text-sm px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toast}
        </div>
      )}
    </div>
  );
}
