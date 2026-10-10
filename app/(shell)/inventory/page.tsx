"use client";
import * as React from "react";
import { Warehouse, Search, ArrowRightLeft, AlertTriangle, Clock, RefreshCw, CheckCircle2, Truck, Package, Snowflake, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { InventoryItem, StockTransfer, WarehouseMetrics, StorageTempZone } from "@/packages/modules/inventory/types";

const TEMP_BADGE: Record<StorageTempZone, { label: string; cls: string }> = {
  dong_lanh: { label: "-18°C", cls: "bg-sky-100 text-sky-700 border-sky-200" },
  kho_mat: { label: "0–4°C", cls: "bg-cyan-100 text-cyan-700 border-cyan-200" },
  kho_kho: { label: "Thường", cls: "bg-amber-100 text-amber-700 border-amber-200" },
};
function expiryBadgeCls(days: number): string {
  if (days < 30) return "bg-rose-50 border-rose-200 text-rose-600";
  if (days < 60) return "bg-amber-50 border-amber-200 text-amber-600";
  return "bg-emerald-50 border-emerald-200 text-emerald-600";
}

export default function InventoryPage() {
  const [items, setItems] = React.useState<InventoryItem[]>([]);
  const [metrics, setMetrics] = React.useState<WarehouseMetrics | null>(null);
  const [transfers, setTransfers] = React.useState<StockTransfer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [wh, setWh] = React.useState<"ALL" | "KHO_DINH_CONG" | "KHO_YEN_BINH">("ALL");
  const [tempZone, setTempZone] = React.useState<StorageTempZone | "ALL">("ALL");
  const [status, setStatus] = React.useState<"ALL" | "thieu" | "sap-thieu" | "can-han">("ALL");
  const [transferOpen, setTransferOpen] = React.useState(false);
  const [auditOpen, setAuditOpen] = React.useState(false);
  const [sku, setSku] = React.useState("");
  const [qty, setQty] = React.useState(20);
  const [from, setFrom] = React.useState<"KHO_YEN_BINH" | "KHO_DINH_CONG">("KHO_YEN_BINH");
  const [to, setTo] = React.useState<"KHO_YEN_BINH" | "KHO_DINH_CONG">("KHO_DINH_CONG");
  const [note, setNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [auditWh, setAuditWh] = React.useState<"KHO_DINH_CONG" | "KHO_YEN_BINH">("KHO_DINH_CONG");
  const [auditNote, setAuditNote] = React.useState("");

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (wh !== "ALL") q.set("warehouse", wh);
      if (tempZone !== "ALL") q.set("tempZone", tempZone);
      if (status !== "ALL") q.set("status", status);
      if (search.trim()) q.set("search", search.trim());
      const r = await fetch(`/api/inventory?${q.toString()}`);
      const d = await r.json();
      if (d.success) { setItems(d.items || []); setMetrics(d.metrics || null); }
      const rt = await fetch("/api/inventory/transfer");
      const dt = await rt.json();
      if (dt.success) setTransfers(dt.transfers || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };
  React.useEffect(() => { fetchData(); }, [wh, tempZone, status, search]);
  React.useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }, [toast]);

  const handleTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sku || qty <= 0) { setToast("Chọn SKU và số lượng hợp lệ"); return; }
    setSubmitting(true);
    try {
      const r = await fetch("/api/inventory/transfer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sku, quantity: qty, from, to, note, createdBy: "Trần Thị Ngọc Thúy (Thủ kho)" }) });
      const d = await r.json();
      if (d.success) { setToast(d.message); setTransferOpen(false); fetchData(); } else setToast(d.error);
    } catch (e: any) { setToast(e.message); } finally { setSubmitting(false); }
  };
  const handleAudit = async (e: React.FormEvent) => {
    e.preventDefault(); setSubmitting(true);
    try {
      const r = await fetch("/api/inventory/transfer", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ audit: true, warehouse: auditWh, items: [], note: auditNote, createdBy: "Trần Thị Ngọc Thúy" }) });
      const d = await r.json();
      if (d.success) { setToast(d.message); setAuditOpen(false); } else setToast(d.error);
    } catch (e: any) { setToast(e.message); } finally { setSubmitting(false); }
  };
  const openFor = (it: InventoryItem) => {
    setSku(it.sku); setQty(it.min_stock > it.quantity ? it.min_stock - it.quantity : 20);
    setFrom(it.warehouse === "KHO_DINH_CONG" ? "KHO_YEN_BINH" : "KHO_DINH_CONG");
    setTo(it.warehouse as typeof to); setNote("Điều chuyển bù tồn " + it.name); setTransferOpen(true);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><Warehouse className="w-5 h-5 text-sky-500" /> Quản Lý Kho Lạnh Sơn Khang</h1>
          <p className="text-xs text-muted-foreground">Thủ kho: Trần Thị Ngọc Thúy (0942 22 60 60) · 2 kho: Định Công & Yên Bình</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" size="sm" className="rounded-full" onClick={fetchData} disabled={loading}><RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />Làm mới</Button>
          <Dialog open={auditOpen} onOpenChange={setAuditOpen}>
            <DialogTrigger asChild><Button variant="outline" size="sm" className="rounded-full"><ClipboardCheck className="w-3.5 h-3.5 mr-1.5" />Kiểm kê SK-KK</Button></DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle className="text-sm flex items-center gap-2"><ClipboardCheck className="w-4 h-4 text-emerald-600" />Phiếu kiểm kê kho lạnh (SK-KK-...)</DialogTitle></DialogHeader>
              <form onSubmit={handleAudit} className="space-y-3 pt-2">
                <div><label className="text-xs font-semibold">Kho kiểm kê</label><select value={auditWh} onChange={(e) => setAuditWh(e.target.value as any)} className="w-full h-9 rounded-lg border px-3 text-xs mt-1"><option value="KHO_DINH_CONG">Kho Tổng Định Công</option><option value="KHO_YEN_BINH">Kho Yên Bình</option></select></div>
                <div><label className="text-xs font-semibold">Ghi chú</label><Input value={auditNote} onChange={(e) => setAuditNote(e.target.value)} placeholder="Vd: Kiểm kê định kỳ hầm đông" className="h-9 text-xs mt-1" /></div>
                <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" size="sm" onClick={() => setAuditOpen(false)}>Hủy</Button><Button type="submit" size="sm" className="rounded-full bg-emerald-600 text-white" disabled={submitting}>{submitting ? "..." : "Lập phiếu SK-KK"}</Button></div>
              </form>
            </DialogContent>
          </Dialog>
          <Dialog open={transferOpen} onOpenChange={setTransferOpen}>
            <DialogTrigger asChild><Button size="sm" className="rounded-full bg-sky-600 text-white" onClick={() => { setSku(items[0]?.sku || ""); setQty(30); setFrom("KHO_YEN_BINH"); setTo("KHO_DINH_CONG"); }}><ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" />Luân chuyển SK-DC</Button></DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle className="text-sm flex items-center gap-2"><Truck className="w-4 h-4 text-sky-500" />Phiếu luân chuyển nội bộ (SK-DC-...)</DialogTitle></DialogHeader>
              <form onSubmit={handleTransfer} className="space-y-3 pt-2">
                <div><label className="text-xs font-semibold">SKU</label><select value={sku} onChange={(e) => setSku(e.target.value)} className="w-full h-9 rounded-lg border px-3 text-xs mt-1">{items.map((i) => <option key={i.id} value={i.sku}>{i.sku} — {i.name} ({i.warehouse} {i.quantity}{i.dvt})</option>)}</select></div>
                <div className="grid grid-cols-2 gap-2"><div><label className="text-xs font-semibold">Từ kho</label><select value={from} onChange={(e) => setFrom(e.target.value as any)} className="w-full h-9 rounded-lg border px-3 text-xs mt-1"><option value="KHO_YEN_BINH">Kho Yên Bình</option><option value="KHO_DINH_CONG">Kho Định Công</option></select></div><div><label className="text-xs font-semibold">Đến kho</label><select value={to} onChange={(e) => setTo(e.target.value as any)} className="w-full h-9 rounded-lg border px-3 text-xs mt-1"><option value="KHO_DINH_CONG">Kho Định Công</option><option value="KHO_YEN_BINH">Kho Yên Bình</option></select></div></div>
                <div><label className="text-xs font-semibold">Số lượng</label><Input type="number" min={1} value={qty} onChange={(e) => setQty(Number(e.target.value))} className="h-9 text-xs mt-1" /></div>
                <div><label className="text-xs font-semibold">Ghi chú</label><Input value={note} onChange={(e) => setNote(e.target.value)} placeholder="Xe lạnh SK-02..." className="h-9 text-xs mt-1" /></div>
                <div className="flex justify-end gap-2 pt-2"><Button type="button" variant="ghost" size="sm" onClick={() => setTransferOpen(false)}>Hủy</Button><Button type="submit" size="sm" className="rounded-full bg-sky-600 text-white" disabled={submitting}>{submitting ? "..." : "Tạo SK-DC"}</Button></div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="clay-card p-4 space-y-2"><div className="flex justify-between text-muted-foreground"><span className="text-xs font-semibold">Tổng tồn trị giá</span><Package className="w-4 h-4 text-emerald-500" /></div><div className="text-xl font-bold font-mono text-emerald-600">{Number(metrics?.total_value || 0).toLocaleString("vi-VN")} ₫</div><p className="text-[11px] text-muted-foreground">{metrics?.total_skus || 0} SKU · {metrics?.total_quantity || 0} đơn vị</p></div>
        <div className="clay-card p-4 space-y-2"><div className="flex justify-between text-muted-foreground"><span className="text-xs font-semibold">Sắp hết hàng</span><AlertTriangle className="w-4 h-4 text-amber-500" /></div><div className="text-2xl font-black text-amber-600">{(metrics?.low_stock_count || 0) + (metrics?.out_of_stock_count || 0)} <span className="text-xs font-normal text-muted-foreground">SKU</span></div><p className="text-[11px] text-muted-foreground">{metrics?.out_of_stock_count || 0} thiếu · {metrics?.low_stock_count || 0} sắp thiếu</p></div>
        <div className="clay-card p-4 space-y-2 border-rose-200"><div className="flex justify-between text-muted-foreground"><span className="text-xs font-semibold">Cận hạn FEFO &lt;30 ngày</span><Clock className="w-4 h-4 text-rose-500" /></div><div className="text-2xl font-black text-rose-600">{metrics?.near_expiry_count || 0} <span className="text-xs font-normal text-muted-foreground">lô</span></div><p className="text-[11px] text-rose-600">Ưu tiên xuất trước (FEFO) — kiểm tra ngay</p></div>
        <div className="clay-card p-4 space-y-2"><div className="flex justify-between text-muted-foreground"><span className="text-xs font-semibold">Tồn đông &amp; mát</span><Snowflake className="w-4 h-4 text-sky-500" /></div><div className="text-sm font-bold"><span className="text-sky-600">{metrics?.dong_lanh_qty || 0}</span> <span className="text-xs font-normal">đông (-18°C)</span> · <span className="text-cyan-600">{metrics?.kho_mat_qty || 0}</span> <span className="text-xs font-normal">mát (0–4°C)</span></div><p className="text-[11px] text-muted-foreground">Còn lại kho khô thường</p></div>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex gap-1 flex-wrap">
          <div className="glossy-pill p-1 flex gap-1 rounded-full border">{(["ALL", "KHO_DINH_CONG", "KHO_YEN_BINH"] as const).map((w) => (<button key={w} onClick={() => setWh(w)} className={`px-3 py-1 text-xs rounded-full font-medium ${wh === w ? "bg-sky-500 text-white" : "text-muted-foreground"}`}>{w === "ALL" ? "Tất cả kho" : w === "KHO_DINH_CONG" ? "Kho Tổng Định Công" : "Kho Yên Bình"}</button>))}</div>
          <div className="glossy-pill p-1 flex gap-1 rounded-full border">{(["ALL", "dong_lanh", "kho_mat", "kho_kho"] as const).map((z) => (<button key={z} onClick={() => setTempZone(z as any)} className={`px-2.5 py-1 text-xs rounded-full font-medium ${tempZone === z ? "bg-foreground text-background" : "text-muted-foreground"}`}>{z === "ALL" ? "Mọi nhiệt độ" : z === "dong_lanh" ? "-18°C" : z === "kho_mat" ? "0–4°C" : "Thường"}</button>))}</div>
          <div className="glossy-pill p-1 flex gap-1 rounded-full border"><button onClick={() => setStatus("ALL")} className={`px-3 py-1 text-xs rounded-full ${status === "ALL" ? "bg-foreground text-background" : "text-muted-foreground"}`}>Tất cả</button><button onClick={() => setStatus("can-han")} className={`px-3 py-1 text-xs rounded-full ${status === "can-han" ? "bg-rose-500 text-white" : "text-muted-foreground"}`}>FEFO cận hạn</button></div>
        </div>
        <div className="relative min-w-[220px]"><Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" /><Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="SKU, tên, số lô..." className="pl-8 h-9 text-xs rounded-full" /></div>
      </div>
      <div className="clay-card overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-xs"><thead className="bg-muted/70 text-[11px] text-muted-foreground border-b"><tr><th className="px-3 py-2 text-left">SKU &amp; Tên</th><th className="px-3 py-2 text-left">Kho</th><th className="px-3 py-2 text-center">Nhiệt độ</th><th className="px-3 py-2 text-right">Tồn/Min</th><th className="px-3 py-2 text-left">Hạn dùng &amp; Còn lại</th><th className="px-3 py-2 text-right">Giá trị</th><th className="px-3 py-2 text-center">Trạng thái</th><th className="px-3 py-2 text-right"></th></tr></thead><tbody className="divide-y">{items.length === 0 ? <tr><td colSpan={8} className="py-8 text-center text-muted-foreground">Không có dữ liệu.</td></tr> : items.map((it) => (<tr key={it.id} className="hover:bg-muted/30"><td className="px-3 py-2"><div className="font-semibold">{it.name}</div><div className="font-mono text-[10px] text-muted-foreground">{it.sku} · {it.dvt} · {it.location}</div></td><td className="px-3 py-2"><Badge variant="outline" className={`text-[10px] font-mono ${it.warehouse === "KHO_DINH_CONG" ? "border-sky-300 text-sky-600 bg-sky-50" : "border-indigo-300 text-indigo-600 bg-indigo-50"}`}>{it.warehouse === "KHO_DINH_CONG" ? "ĐỊNH CÔNG" : "YÊN BÌNH"}</Badge></td><td className="px-3 py-2 text-center"><Badge variant="outline" className={`text-[10px] ${TEMP_BADGE[it.temp_zone].cls}`}>{TEMP_BADGE[it.temp_zone].label}</Badge></td><td className="px-3 py-2 text-right font-mono font-bold">{it.quantity} <span className="font-normal text-muted-foreground">/ {it.min_stock}</span></td><td className="px-3 py-2"><div className="font-mono text-[11px]">{it.lot_number} · HSD {it.expiry_date}</div><Badge variant="outline" className={`text-[10px] mt-1 ${expiryBadgeCls(it.days_until_expiry)}`}>{it.days_until_expiry > 0 ? "Còn " + it.days_until_expiry + " ngày" : "Quá hạn " + Math.abs(it.days_until_expiry) + " ngày"}</Badge></td><td className="px-3 py-2 text-right font-mono">{Number(it.total_value).toLocaleString("vi-VN")} ₫</td><td className="px-3 py-2 text-center"><Badge variant={it.status === "du" ? "default" : it.status === "can-han" ? "destructive" : "outline"} className={`text-[10px] rounded-full ${it.status === "can-han" ? "bg-rose-500" : ""} ${it.status === "sap-thieu" ? "border-amber-300 text-amber-600 bg-amber-50" : ""}`}>{it.status_label}</Badge></td><td className="px-3 py-2 text-right"><Button variant="ghost" size="sm" className="h-7 text-xs rounded-full" onClick={() => openFor(it)}><ArrowRightLeft className="w-3 h-3 mr-1" />Chuyển</Button></td></tr>))}</tbody></table></div></div>
      {transfers.length > 0 && (<div className="clay-card p-4 space-y-2"><h3 className="text-xs font-semibold flex items-center gap-1.5"><Truck className="w-3.5 h-3.5 text-sky-500" />Phiếu luân chuyển gần đây (SK-DC-...)</h3><div className="grid md:grid-cols-2 gap-2">{transfers.slice(0, 4).map((t) => (<div key={t.id} className="rounded-xl border p-2.5 bg-white/40 flex justify-between text-xs"><div><div className="font-mono font-bold text-sky-600">{t.code} · {t.from_warehouse === "KHO_DINH_CONG" ? "ĐC" : "YB"} → {t.to_warehouse === "KHO_DINH_CONG" ? "ĐC" : "YB"}</div><div className="text-muted-foreground">{t.item_name} — {t.quantity} {t.dvt} · {t.lot_number}</div><div className="text-[10px] text-muted-foreground">{t.created_at} · {t.created_by}</div></div><Badge variant={t.status === "completed" ? "default" : "outline"} className="text-[10px] h-fit">{t.status_label}</Badge></div>))}</div></div>)}
      {toast && (<div className="fixed bottom-4 right-4 z-50 bg-foreground text-background text-sm px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400" />{toast}</div>)}
    </div>
  );
}
