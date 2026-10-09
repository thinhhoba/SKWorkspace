"use client";
import * as React from "react";
import {
  ShoppingBag,
  Search,
  PackageCheck,
  Wallet,
  Store,
  Filter,
  RefreshCw,
  Eye,
  Plus,
  Trash2,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { PurchaseOrder, PurchaseOrderItem, PurchaseStatus, Supplier } from "@/packages/modules/purchase/types";
import { PURCHASE_STATUS_LABEL, PURCHASE_STATUS_COLOR } from "@/packages/modules/purchase/types";

const fmtVnd = (n: number) => Number(n).toLocaleString("vi-VN") + " ₫";

const STATUS_OPTIONS: { value: PurchaseStatus | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "draft", label: "Dự thảo" },
  { value: "ordered", label: "Đã đặt" },
  { value: "received", label: "Đã nhập kho" },
  { value: "cancelled", label: "Đã hủy" },
];

const WH_OPTIONS: { value: "ALL" | "Q7" | "Q12"; label: string }[] = [
  { value: "ALL", label: "Tất cả kho" },
  { value: "Q7", label: "Kho Q7" },
  { value: "Q12", label: "Kho Q12" },
];

type ReceiveRow = { itemId: string; received_quantity: number; lot_number: string; expiry_date: string; location: string };
type NewLine = { sku: string; name: string; quantity: number; unit_price: number; dvt: string };

export default function PurchasePage() {
  const [orders, setOrders] = React.useState<PurchaseOrder[]>([]);
  const [stats, setStats] = React.useState<{ totalMonth: number; pendingReceipt: number; payable331: number; supplierCount: number } | null>(null);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<PurchaseStatus | "ALL">("ALL");
  const [warehouseFilter, setWarehouseFilter] = React.useState<"ALL" | "Q7" | "Q12">("ALL");
  const [toast, setToast] = React.useState<string | null>(null);

  const [detailOrder, setDetailOrder] = React.useState<PurchaseOrder | null>(null);

  // receive modal
  const [receiveOrder, setReceiveOrder] = React.useState<PurchaseOrder | null>(null);
  const [receiveRows, setReceiveRows] = React.useState<ReceiveRow[]>([]);
  const [receiving, setReceiving] = React.useState(false);

  // create modal
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createSupplier, setCreateSupplier] = React.useState("");
  const [createWarehouse, setCreateWarehouse] = React.useState<"Q7" | "Q12">("Q7");
  const [createLines, setCreateLines] = React.useState<NewLine[]>([{ sku: "", name: "", quantity: 1, unit_price: 0, dvt: "kg" }]);
  const [createNote, setCreateNote] = React.useState("");
  const [creating, setCreating] = React.useState(false);

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
      const res = await fetch(`/api/purchase?${q.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        if (data.stats) setStats(data.stats);
        if (data.suppliers) setSuppliers(data.suppliers);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [statusFilter, warehouseFilter, debouncedSearch]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  React.useEffect(() => {
    // fetch suppliers for create select (also provided via /api/purchase but ensure)
    fetch("/api/purchase/suppliers").then(r=>r.json()).then(d=>{ if(d.success) setSuppliers(d.suppliers); }).catch(()=>{});
  }, []);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const patchStatus = async (id: string, status: PurchaseStatus) => {
    const res = await fetch(`/api/purchase/${id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Lỗi");
    return data.order as PurchaseOrder;
  };

  const handleQuickStatus = async (order: PurchaseOrder, next: PurchaseStatus) => {
    try {
      const updated = await patchStatus(order.id, next);
      setOrders((prev) => prev.map((o) => (o.id === updated.id ? updated : o)));
      setToast(`Đã chuyển ${order.code} → ${PURCHASE_STATUS_LABEL[next]}`);
      fetchData();
    } catch (e: unknown) { setToast(e instanceof Error ? e.message : "Lỗi"); }
  };

  const openReceive = (order: PurchaseOrder) => {
    setReceiveOrder(order);
    setReceiveRows(order.items.map((it) => ({ itemId: it.id, received_quantity: it.quantity, lot_number: "", expiry_date: "", location: "" })));
  };

  const canConfirmReceive = receiveRows.length > 0 && receiveRows.every((r) => r.lot_number.trim() && r.expiry_date.trim() && Number(r.received_quantity) > 0);

  const handleReceive = async () => {
    if (!receiveOrder) return;
    if (!canConfirmReceive) { setToast("Vui lòng nhập đủ SL thực nhận, số lô và hạn dùng"); return; }
    setReceiving(true);
    try {
      const res = await fetch(`/api/purchase/${receiveOrder.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "receive", items: receiveRows }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Lỗi nhập kho");
      setOrders((prev) => prev.map((o) => (o.id === receiveOrder.id ? data.order : o)));
      setReceiveOrder(null); setReceiveRows([]);
      setToast(`${receiveOrder.code} đã nhập kho — tăng tồn FEFO`);
      fetchData();
    } catch (e: unknown) { setToast(e instanceof Error ? e.message : "Lỗi"); } finally { setReceiving(false); }
  };

  const createTotal = createLines.reduce((a, l) => a + Number(l.quantity || 0) * Number(l.unit_price || 0), 0);
  const canCreate = createSupplier && createLines.length > 0 && createLines.every((l) => l.sku.trim() && l.name.trim() && Number(l.quantity) > 0 && Number(l.unit_price) >= 0);

  const handleCreate = async () => {
    if (!canCreate) { setToast("Điền đủ NCC và dòng hàng"); return; }
    setCreating(true);
    try {
      const res = await fetch("/api/purchase", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ supplier_id: createSupplier, warehouse: createWarehouse, items: createLines, notes: createNote || undefined }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Lỗi tạo đơn");
      setCreateOpen(false);
      setCreateSupplier(""); setCreateLines([{ sku: "", name: "", quantity: 1, unit_price: 0, dvt: "kg" }]); setCreateNote("");
      setToast(`Đã tạo ${data.order.code}`);
      fetchData();
    } catch (e: unknown) { setToast(e instanceof Error ? e.message : "Lỗi"); } finally { setCreating(false); }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-sky-500" /> Quản lý Mua hàng & Nhập kho
          </h1>
          <p className="text-xs text-muted-foreground">Nhà cung cấp → Phiếu nhập kho lạnh Q7/Q12 — FEFO & công nợ 331</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="rounded-full bg-sky-600 hover:bg-sky-700 text-white" onClick={() => setCreateOpen(true)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Tạo đơn mua
          </Button>
          <Button variant="outline" size="sm" className="rounded-full glossy-pill" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin text-sky-500" : ""}`} /> Làm mới
          </Button>
        </div>
      </div>

      {/* 4 Clay KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="clay-kpi clay-kpi--sky border-l-4 border-l-sky-500 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-muted-foreground">TỔNG MUA THÁNG</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-white border border-white/80 shadow-[0_4px_12px_rgba(14,165,233,0.35),inset_0_1px_1px_rgba(255,255,255,0.9)]">
              <Wallet className="h-4 w-4" />
            </span>
          </div>
          <p className="text-lg font-extrabold tracking-tight font-mono text-sky-700">{stats ? fmtVnd(stats.totalMonth) : loading ? "—" : fmtVnd(0)}</p>
          <p className="text-xs text-muted-foreground">Chưa tính đơn hủy</p>
        </div>

        <div className="clay-kpi clay-kpi--warning border-l-4 border-l-amber-500 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-muted-foreground">CHỜ NHẬP KHO</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white border border-white/80 shadow-[0_4px_12px_rgba(217,119,6,0.35),inset_0_1px_1px_rgba(255,255,255,0.9)]">
              <PackageCheck className="h-4 w-4" />
            </span>
          </div>
          <p className="text-xl font-extrabold tracking-tight text-amber-600">{stats ? stats.pendingReceipt : "—"} <span className="text-xs font-semibold text-muted-foreground">đơn</span></p>
          <p className="text-xs text-muted-foreground">Trạng thái Đã đặt</p>
        </div>

        <div className="clay-kpi clay-kpi--danger border-l-4 border-l-rose-500 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-muted-foreground">CÔNG NỢ PHẢI TRẢ 331</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-white border border-white/80 shadow-[0_4px_12px_rgba(225,29,72,0.35),inset_0_1px_1px_rgba(255,255,255,0.9)]">
              <Wallet className="h-4 w-4" />
            </span>
          </div>
          <p className="text-lg font-extrabold tracking-tight font-mono text-rose-600">{stats ? fmtVnd(stats.payable331) : loading ? "—" : fmtVnd(0)}</p>
          <p className="text-xs text-muted-foreground">331 — phải trả NCC</p>
        </div>

        <div className="clay-kpi border-l-4 border-l-emerald-500 p-4 space-y-1" style={{ boxShadow: "0 14px 28px -6px rgba(16,185,129,0.18), inset 0 2px 3px rgba(255,255,255,0.95)" }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-muted-foreground">SỐ NCC</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white border border-white/80 shadow-[0_4px_12px_rgba(16,185,129,0.3),inset_0_1px_1px_rgba(255,255,255,0.9)]">
              <Store className="h-4 w-4" />
            </span>
          </div>
          <p className="text-xl font-extrabold tracking-tight text-emerald-600">{stats ? stats.supplierCount : "—"} <span className="text-xs font-semibold text-muted-foreground">NCC</span></p>
          <p className="text-xs text-muted-foreground">Đang hợp tác</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Filter className="w-3 h-3" /> Trạng thái</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as PurchaseStatus | "ALL")} className="h-9 rounded-full border bg-white/90 px-3 text-xs font-medium shadow-sm">
            {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-muted-foreground inline-flex items-center gap-1"><Store className="w-3 h-3" /> Kho</span>
          <select value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value as "ALL"|"Q7"|"Q12")} className="h-9 rounded-full border bg-white/90 px-3 text-xs font-medium shadow-sm">
            {WH_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <div className="relative min-w-[220px] flex-1 max-w-sm ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm mã PO / tên NCC..." className="pl-8 h-9 text-xs rounded-full border-white/80 bg-white/90 glossy-pill" />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {[0,1,2,3,4,5].map((i) => <div key={i} className="clay-card p-4 animate-pulse h-[200px] bg-muted/50" />)}
        </div>
      ) : orders.length === 0 ? (
        <div className="clay-card p-10 text-center"><p className="text-sm text-muted-foreground">Không tìm thấy đơn mua phù hợp bộ lọc.</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {orders.map((order) => (
            <div key={order.id} className="clay-card p-4 flex flex-col gap-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <div className="font-mono text-sm font-bold tracking-tight truncate">{order.code}</div>
                  <div className="text-xs font-semibold truncate">{order.supplier_name}</div>
                  <div className="text-[11px] text-muted-foreground">{order.order_date}{order.invoice_no ? ` · ${order.invoice_no}` : ""}</div>
                </div>
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <Badge variant="outline" className={`text-[10px] font-mono ${order.warehouse==="Q7"?"border-sky-300 text-sky-700 bg-sky-50":"border-indigo-300 text-indigo-700 bg-indigo-50"}`}>{order.warehouse}</Badge>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${PURCHASE_STATUS_COLOR[order.status]}`}>{PURCHASE_STATUS_LABEL[order.status]}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-[11px] text-muted-foreground">{order.items.length} món</span>
                <span className="text-[11px] font-mono font-bold text-emerald-600 ml-auto">{fmtVnd(order.total_amount)}</span>
              </div>
              {order.notes && <div className="text-[11px] text-muted-foreground line-clamp-2 bg-white/60 rounded-lg px-2 py-1 border">{order.notes}</div>}
              <div className="flex flex-wrap gap-1.5 pt-1 border-t border-white/60 mt-1">
                {order.status === "ordered" && (
                  <Button size="sm" className="h-7 text-xs rounded-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => openReceive(order)}>
                    <PackageCheck className="w-3.5 h-3.5 mr-1" /> Nhập kho
                  </Button>
                )}
                <Button variant="outline" size="sm" className="h-7 text-xs rounded-full glossy-pill" onClick={() => setDetailOrder(order)}>
                  <Eye className="w-3 h-3 mr-1" /> Chi tiết
                </Button>
                {order.status === "draft" && (
                  <Button variant="outline" size="sm" className="h-7 text-xs rounded-full" onClick={() => handleQuickStatus(order, "ordered")}>Đặt hàng</Button>
                )}
                {order.status === "ordered" && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs rounded-full" onClick={() => handleQuickStatus(order, "cancelled")}>Hủy</Button>
                )}
                {order.status === "draft" && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs rounded-full" onClick={() => handleQuickStatus(order, "cancelled")}>Hủy</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail */}
      <Dialog open={!!detailOrder} onOpenChange={(v) => { if(!v) setDetailOrder(null); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-auto">
          {detailOrder && (
            <>
              <DialogHeader><DialogTitle className="text-sm flex items-center gap-2"><span className="font-mono">{detailOrder.code}</span><span className={`inline-flex rounded-full border px-2 py-0.5 text-xs ${PURCHASE_STATUS_COLOR[detailOrder.status]}`}>{PURCHASE_STATUS_LABEL[detailOrder.status]}</span></DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2 text-xs">
                <div><div className="font-semibold">{detailOrder.supplier_name}</div><div className="text-muted-foreground">Kho {detailOrder.warehouse} · {detailOrder.order_date}{detailOrder.received_date?` → ${detailOrder.received_date}`:""} {detailOrder.invoice_no?`· ${detailOrder.invoice_no}`:""}</div>{detailOrder.notes && <div className="text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 mt-2">{detailOrder.notes}</div>}</div>
                <div className="border-t pt-3 space-y-1.5">
                  {detailOrder.items.map((it) => (
                    <div key={it.id} className="flex items-start justify-between gap-2 rounded-xl border bg-white/60 px-2.5 py-2">
                      <div className="min-w-0"><div className="font-semibold truncate">{it.name}</div><div className="font-mono text-[11px] text-muted-foreground">{it.sku} · {it.quantity} {it.dvt}{it.lot_number?` · ${it.lot_number}`:""}{it.expiry_date?` · HSD ${it.expiry_date}`:""}{it.location?` · ${it.location}`:""}</div></div>
                      <div className="text-right shrink-0"><div className="font-mono font-bold">{fmtVnd(it.total_price)}</div><div className="text-[11px] text-muted-foreground">{it.quantity} × {fmtVnd(it.unit_price)}</div></div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-bold text-sm border-t pt-2"><span>Tổng</span><span className="font-mono text-emerald-600">{fmtVnd(detailOrder.total_amount)}</span></div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Goods Receipt Modal */}
      <Dialog open={!!receiveOrder} onOpenChange={(v) => { if(!v){ setReceiveOrder(null); setReceiveRows([]); }}}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          {receiveOrder && (
            <>
              <DialogHeader><DialogTitle className="text-sm flex items-center gap-2"><PackageCheck className="w-4 h-4 text-emerald-600" /> Nhập kho — <span className="font-mono">{receiveOrder.code}</span><span className="text-xs font-normal text-muted-foreground">Kho {receiveOrder.warehouse} · {receiveOrder.supplier_name}</span></DialogTitle></DialogHeader>
              <div className="space-y-3 pt-2">
                <p className="text-xs text-muted-foreground">Nhập đủ số lô, hạn dùng và vị trí kệ để tăng tồn kho theo FEFO.</p>
                <div className="space-y-3">
                  {receiveOrder.items.map((it, idx) => {
                    const row = receiveRows[idx];
                    if (!row) return null;
                    return (
                      <div key={it.id} className="rounded-2xl border bg-white/70 p-3 space-y-2">
                        <div className="flex justify-between gap-2">
                          <div className="min-w-0"><div className="text-sm font-semibold truncate">{it.name}</div><div className="font-mono text-[11px] text-muted-foreground">{it.sku} · Đặt: {it.quantity} {it.dvt} · {fmtVnd(it.unit_price)}/{it.dvt}</div></div>
                          <Badge variant="outline" className="h-6 text-[11px] shrink-0">{it.dvt}</Badge>
                        </div>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                          <div><label className="text-[11px] font-semibold">SL thực nhận ({it.dvt})</label><Input type="number" min={0} value={row.received_quantity} onChange={(e)=> setReceiveRows(prev=> prev.map((r,i)=> i===idx?{...r, received_quantity: Number(e.target.value)}:r))} className="h-8 text-xs" /></div>
                          <div><label className="text-[11px] font-semibold">Số lô *</label><Input value={row.lot_number} onChange={(e)=> setReceiveRows(prev=> prev.map((r,i)=> i===idx?{...r, lot_number: e.target.value}:r))} placeholder="VD L2610-CP01" className="h-8 text-xs font-mono" /></div>
                          <div><label className="text-[11px] font-semibold">Hạn dùng *</label><Input type="date" value={row.expiry_date} onChange={(e)=> setReceiveRows(prev=> prev.map((r,i)=> i===idx?{...r, expiry_date: e.target.value}:r))} className="h-8 text-xs" /></div>
                          <div><label className="text-[11px] font-semibold">Vị trí kệ</label><Input value={row.location} onChange={(e)=> setReceiveRows(prev=> prev.map((r,i)=> i===idx?{...r, location: e.target.value}:r))} placeholder="VD Kệ A1-N1" className="h-8 text-xs" /></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button variant="ghost" size="sm" className="rounded-full" onClick={()=>{ setReceiveOrder(null); setReceiveRows([]);}}>Đóng</Button>
                  <Button size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50" disabled={!canConfirmReceive || receiving} onClick={handleReceive}>{receiving?"Đang nhập...":"Xác nhận Nhập kho & Tăng tồn FEFO"}</Button>
                </div>
                {!canConfirmReceive && <p className="text-[11px] text-muted-foreground text-right">Cần nhập đủ số lô và hạn dùng cho mọi món.</p>}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Create PO Modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle className="text-sm flex items-center gap-2"><Plus className="w-4 h-4 text-sky-600" /> Tạo đơn mua mới</DialogTitle></DialogHeader>
          <div className="space-y-3 pt-2 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div><label className="text-xs font-semibold">Nhà cung cấp *</label>
                <select value={createSupplier} onChange={(e)=> setCreateSupplier(e.target.value)} className="mt-1 w-full h-9 rounded-xl border bg-white px-3 text-xs">
                  <option value="">-- Chọn NCC --</option>
                  {suppliers.map((s)=> <option key={s.id} value={s.id}>{s.name} ({s.code})</option>)}
                </select>
              </div>
              <div><label className="text-xs font-semibold">Kho nhập *</label>
                <select value={createWarehouse} onChange={(e)=> setCreateWarehouse(e.target.value as "Q7"|"Q12")} className="mt-1 w-full h-9 rounded-xl border bg-white px-3 text-xs">
                  <option value="Q7">Kho lạnh Q7</option>
                  <option value="Q12">Kho tổng Q12</option>
                </select>
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between"><label className="text-xs font-semibold">Dòng hàng *</label><Button variant="outline" size="sm" className="h-7 text-xs rounded-full" onClick={()=> setCreateLines(prev=> [...prev, { sku:"", name:"", quantity:1, unit_price:0, dvt:"kg"}])}><Plus className="w-3 h-3 mr-1" /> Thêm dòng</Button></div>
              <div className="space-y-2 mt-2">
                {createLines.map((l, idx)=> (
                  <div key={idx} className="grid grid-cols-12 gap-1.5 items-end rounded-xl border bg-white/60 p-2">
                    <div className="col-span-3"><label className="text-[11px] font-semibold">SKU</label><Input value={l.sku} onChange={(e)=> setCreateLines(prev=> prev.map((x,i)=> i===idx?{...x, sku:e.target.value}:x))} placeholder="SKU" className="h-8 text-xs font-mono" /></div>
                    <div className="col-span-4"><label className="text-[11px] font-semibold">Tên SP</label><Input value={l.name} onChange={(e)=> setCreateLines(prev=> prev.map((x,i)=> i===idx?{...x, name:e.target.value}:x))} placeholder="Tên sản phẩm" className="h-8 text-xs" /></div>
                    <div className="col-span-2"><label className="text-[11px] font-semibold">SL</label><Input type="number" min={0} value={l.quantity} onChange={(e)=> setCreateLines(prev=> prev.map((x,i)=> i===idx?{...x, quantity:Number(e.target.value)}:x))} className="h-8 text-xs" /></div>
                    <div className="col-span-2"><label className="text-[11px] font-semibold">Đơn giá</label><Input type="number" min={0} value={l.unit_price} onChange={(e)=> setCreateLines(prev=> prev.map((x,i)=> i===idx?{...x, unit_price:Number(e.target.value)}:x))} className="h-8 text-xs font-mono" /></div>
                    <div className="col-span-1 flex gap-1">
                      <Input value={l.dvt} onChange={(e)=> setCreateLines(prev=> prev.map((x,i)=> i===idx?{...x, dvt:e.target.value}:x))} className="h-8 text-xs w-12 px-1" placeholder="dvt" />
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0" onClick={()=> setCreateLines(prev=> prev.filter((_,i)=> i!==idx))} disabled={createLines.length===1}><Trash2 className="w-3.5 h-3.5" /></Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div><label className="text-xs font-semibold">Ghi chú</label><Input value={createNote} onChange={(e)=> setCreateNote(e.target.value)} placeholder="Ghi chú đơn mua..." className="h-8 text-xs mt-1" /></div>
            <div className="flex justify-between font-bold text-sm border-t pt-2"><span>Tạm tính</span><span className="font-mono text-emerald-600">{fmtVnd(createTotal)}</span></div>
            <div className="flex justify-end gap-2">
              <Button variant="ghost" size="sm" className="rounded-full" onClick={()=> setCreateOpen(false)}>Đóng</Button>
              <Button size="sm" className="rounded-full bg-sky-600 hover:bg-sky-700 text-white disabled:opacity-50" disabled={!canCreate || creating} onClick={handleCreate}>{creating?"Đang tạo...":"Tạo đơn mua"}</Button>
            </div>
          </div>
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
