"use client";
import * as React from "react";
import { Truck, MapPin, Package, Wallet, Search, RefreshCw, Eye, Printer, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { DeliveryTrip, DeliveryStats, RouteType } from "@/packages/modules/delivery/types";
import { ROUTE_TYPE_LABEL, TRIP_STATUS_LABEL, TRIP_STATUS_COLOR, STOP_STATUS_LABEL, DRIVER_NAME, WAREHOUSE_ADDRESS, COLLECTION_ACCOUNT } from "@/packages/modules/delivery/types";

const fmtVnd = (n: number) => n.toLocaleString("vi-VN") + " ₫";

const ROUTE_TABS: { value: string; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "noi_thanh_hn", label: "Tuyến Nội Thành HN" },
  { value: "chanh_xe_tinh", label: "Tuyến Chành Xe Bến Bãi" },
];

export default function DeliveryPage() {
  const [trips, setTrips] = React.useState<DeliveryTrip[]>([]);
  const [stats, setStats] = React.useState<DeliveryStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [routeType, setRouteType] = React.useState("ALL");
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [toast, setToast] = React.useState<string | null>(null);

  const [detail, setDetail] = React.useState<DeliveryTrip | null>(null);
  const [slipText, setSlipText] = React.useState<string | null>(null);
  const [slipLoading, setSlipLoading] = React.useState(false);

  // Create modal
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createRoute, setCreateRoute] = React.useState<RouteType>("noi_thanh_hn");
  const [createPlate, setCreatePlate] = React.useState("29C-882.60");
  const [createStops, setCreateStops] = React.useState([{ customer: "", address: "", phone: "", thung_xop: 1, amount_cod: 0 }]);
  const [creating, setCreating] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (routeType !== "ALL") qs.set("route_type", routeType);
      if (debouncedSearch.trim()) qs.set("search", debouncedSearch.trim());
      const res = await fetch(`/api/delivery?${qs.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTrips(data.trips || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [routeType, debouncedSearch]);

  React.useEffect(() => { fetchData(); }, [fetchData]);
  React.useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }, [toast]);

  const openDetail = async (trip: DeliveryTrip) => {
    setDetail(trip);
    setSlipText(null);
  };

  const handlePrintSlip = async (tripId: string, stopId?: string) => {
    setSlipLoading(true);
    try {
      const res = await fetch(`/api/delivery/${encodeURIComponent(tripId)}?action=slip${stopId ? `&stopId=${encodeURIComponent(stopId)}` : ""}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "slip", stopId }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setSlipText(data.text);
      // Print window
      const w = window.open("", "_blank");
      if (w) {
        w.document.write(`<pre style="font-family:monospace;font-size:12px;white-space:pre-wrap;padding:16px;">${data.text.replace(/</g, "&lt;")}</pre><p style="font-size:11px;color:#666;text-align:center;">STK thu hộ: ${COLLECTION_ACCOUNT} — In dán lên thùng xốp</p>`);
        w.document.close();
        w.print();
      }
    } catch (e: unknown) { setToast(e instanceof Error ? e.message : "Lỗi in phiếu"); } finally { setSlipLoading(false); }
  };

  const handleCreate = async () => {
    if (!createPlate.trim()) { setToast("Thiếu biển số xe"); return; }
    const validStops = createStops.filter((s) => s.customer.trim() && s.address.trim());
    if (!validStops.length) { setToast("Cần ít nhất 1 điểm dừng"); return; }
    setCreating(true);
    try {
      const res = await fetch("/api/delivery", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ route_type: createRoute, license_plate: createPlate, stops: validStops }) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setToast(`Đã tạo ${data.trip.code}`);
      setCreateOpen(false);
      setCreateStops([{ customer: "", address: "", phone: "", thung_xop: 1, amount_cod: 0 }]);
      fetchData();
    } catch (e: unknown) { setToast(e instanceof Error ? e.message : "Lỗi tạo chuyến"); } finally { setCreating(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2"><Truck className="w-5 h-5 text-sky-600" /> Giao vận &amp; Điều phối chành xe</h1>
          <p className="text-xs text-muted-foreground">Tài xế {DRIVER_NAME} · Kho {WAREHOUSE_ADDRESS} · Thu hộ {COLLECTION_ACCOUNT}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">Nội thành: Freeship 1tr (&lt;8km) · 3tr (&lt;12km) · Dưới 500k phụ thu +10% · Chành xe: thùng xốp — Giáp Bát/Nước Ngầm/Mỹ Đình/Gia Lâm — CK 100% trước khi xuất kho</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="rounded-full bg-sky-600 hover:bg-sky-700 text-white" onClick={() => setCreateOpen(true)}><Plus className="w-3.5 h-3.5 mr-1" /> Tạo chuyến</Button>
          <Button variant="outline" size="sm" className="rounded-full glossy-pill" onClick={fetchData} disabled={loading}><RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin text-sky-500" : ""}`} /> Làm mới</Button>
        </div>
      </div>

      {/* 4 Clay-KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="clay-card rounded-2xl p-4 border-l-4 border-l-sky-500">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Truck className="w-3.5 h-3.5 text-sky-500" /> Chuyến đang lăn bánh</div>
          <div className="mt-1 text-2xl font-bold">{stats ? stats.dang_giao : "—"}</div>
          <div className="text-[11px] text-muted-foreground">Tổng {stats?.total_trips ?? "—"} chuyến</div>
        </div>
        <div className="clay-card rounded-2xl p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><MapPin className="w-3.5 h-3.5 text-emerald-500" /> Đơn giao nội thành HN</div>
          <div className="mt-1 text-2xl font-bold">{stats ? stats.noi_thanh_count : "—"}</div>
          <div className="text-[11px] text-muted-foreground">Tuyến Nội thành</div>
        </div>
        <div className="clay-card rounded-2xl p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Package className="w-3.5 h-3.5 text-amber-500" /> Kiện gửi chành xe tỉnh</div>
          <div className="mt-1 text-2xl font-bold">{stats ? stats.tong_thung_xop : "—"} <span className="text-sm font-medium">thùng xốp</span></div>
          <div className="text-[11px] text-muted-foreground">{stats ? stats.chanh_xe_count : "—"} chuyến chành xe</div>
        </div>
        <div className="clay-card rounded-2xl p-4 border-l-4 border-l-violet-500">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Wallet className="w-3.5 h-3.5 text-violet-500" /> Tổng tiền đối soát</div>
          <div className="mt-1 text-xl font-bold">{stats ? fmtVnd(stats.tong_thu_ho) : "—"}</div>
          <div className="text-[11px] text-muted-foreground">Thu hộ VietQR 22226060</div>
        </div>
      </div>

      {/* Tabs + search */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {ROUTE_TABS.map((t) => (
            <button key={t.value} onClick={() => setRouteType(t.value)} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all ${routeType === t.value ? "bg-sky-600 text-white border-sky-600 shadow" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300"}`}>{t.label}</button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[180px] max-w-[320px] ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm mã chuyến, biển số, khách..." className="h-8 rounded-full pl-9 text-xs glossy-pill" />
        </div>
      </div>

      {/* Bảng chuyến xe */}
      {loading ? (
        <div className="grid gap-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
      ) : trips.length === 0 ? (
        <div className="clay-card rounded-2xl p-10 text-center text-sm text-muted-foreground">Không có chuyến phù hợp bộ lọc</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white dark:bg-slate-900">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="text-left px-3 py-2.5 font-semibold whitespace-nowrap">Mã chuyến</th>
                <th className="text-left px-3 py-2.5 font-semibold">Tài xế</th>
                <th className="text-center px-2 py-2.5 font-semibold">Biển số</th>
                <th className="text-left px-2 py-2.5 font-semibold">Lộ trình</th>
                <th className="text-center px-2 py-2.5 font-semibold">Điểm giao</th>
                <th className="text-center px-2 py-2.5 font-semibold">Trạng thái</th>
                <th className="px-2 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {trips.map((t) => (
                <tr key={t.id} className="border-t hover:bg-sky-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-3 py-2.5 font-mono text-[11px] font-semibold whitespace-nowrap">{t.code}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">{t.driver} <span className="text-muted-foreground">· {t.driver_phone}</span></td>
                  <td className="px-2 py-2.5 text-center font-mono">{t.license_plate}</td>
                  <td className="px-2 py-2.5">
                    <Badge variant="outline" className={`text-[11px] ${t.route_type === "chanh_xe_tinh" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-sky-50 text-sky-700 border-sky-200"}`}>{ROUTE_TYPE_LABEL[t.route_type]}</Badge>
                    <div className="text-[11px] text-muted-foreground truncate max-w-[260px]">{t.stops.map((s) => s.customer).join(" → ")}</div>
                  </td>
                  <td className="px-2 py-2.5 text-center">{t.stops.length}</td>
                  <td className="px-2 py-2.5 text-center"><Badge variant="outline" className={`text-[11px] ${TRIP_STATUS_COLOR[t.status]}`}>{TRIP_STATUS_LABEL[t.status]}</Badge></td>
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => openDetail(t)}><Eye className="w-3.5 h-3.5" /></Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => { setDetail(t); handlePrintSlip(t.id); }} title="In phiếu chành xe"><Printer className="w-3.5 h-3.5" /></Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Detail modal */}
      <Dialog open={!!detail} onOpenChange={(o) => { if (!o) { setDetail(null); setSlipText(null); } }}>
        <DialogContent className="max-w-2xl rounded-2xl max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle className="text-sm flex items-center gap-2"><Truck className="w-4 h-4 text-sky-600" /> {detail?.code} — {detail ? ROUTE_TYPE_LABEL[detail.route_type] : ""}</DialogTitle></DialogHeader>
          {detail && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-muted-foreground">Tài xế:</span> {detail.driver} · {detail.driver_phone}</div>
                <div><span className="text-muted-foreground">Xe:</span> {detail.license_plate}</div>
                <div><span className="text-muted-foreground">Ngày:</span> {detail.created_at}</div>
                <div><Badge variant="outline" className={TRIP_STATUS_COLOR[detail.status]}>{TRIP_STATUS_LABEL[detail.status]}</Badge></div>
              </div>
              <div className="space-y-2">
                {detail.stops.map((s) => (
                  <div key={s.id} className="rounded-xl border p-3 bg-slate-50 dark:bg-slate-800/50">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="text-xs font-semibold">#{s.seq} — {s.customer}</div>
                        <div className="text-[11px] text-muted-foreground">{s.address}</div>
                        <div className="text-[11px]">LH: {s.phone} · Thùng xốp: {s.thung_xop} · Thu hộ: <span className="font-bold">{fmtVnd(s.amount_cod)}</span></div>
                        {s.note && <div className="text-[11px] text-amber-700 mt-1">{s.note}</div>}
                        <Badge variant="outline" className="mt-1 text-[11px]">{STOP_STATUS_LABEL[s.status]}</Badge>
                      </div>
                      <Button variant="outline" size="sm" className="rounded-full text-xs shrink-0" onClick={() => handlePrintSlip(detail.id, s.id)} disabled={slipLoading}><Printer className="w-3 h-3 mr-1" /> Phiếu</Button>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button className="flex-1 rounded-full bg-sky-600 hover:bg-sky-700 text-white" onClick={() => handlePrintSlip(detail.id)} disabled={slipLoading}><Printer className="w-3.5 h-3.5 mr-1" /> In Phiếu Gửi Chành Xe (toàn chuyến)</Button>
              </div>
              {slipText && (
                <div className="rounded-xl border bg-white p-3">
                  <div className="text-[11px] font-semibold mb-1">Phiếu dán thùng xốp — kèm QR Techcombank 22226060</div>
                  <pre className="text-[11px] font-mono whitespace-pre-wrap leading-relaxed bg-slate-50 p-3 rounded-lg overflow-auto max-h-[300px]">{slipText}</pre>
                  <p className="text-[11px] text-muted-foreground mt-1">Dán lên thùng xốp kèm thông tin nhà xe, người nhận tỉnh, mã QR {COLLECTION_ACCOUNT}</p>
                </div>
              )}
              <p className="text-[11px] text-muted-foreground">Kho xuất: {WAREHOUSE_ADDRESS}</p>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Create modal */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="max-w-lg rounded-2xl max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle className="text-sm">Tạo chuyến giao hàng mới</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium">Loại tuyến</label>
                <select value={createRoute} onChange={(e) => setCreateRoute(e.target.value as RouteType)} className="mt-1 w-full h-9 rounded-full border bg-white dark:bg-slate-800 px-3 text-sm">
                  <option value="noi_thanh_hn">Nội thành HN</option>
                  <option value="chanh_xe_tinh">Chành xe tỉnh</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Biển số xe</label>
                <Input value={createPlate} onChange={(e) => setCreatePlate(e.target.value)} className="mt-1 h-9 rounded-full text-sm" placeholder="29C-882.60" />
              </div>
            </div>
            <div className="text-xs font-semibold">Điểm dừng ({createStops.length})</div>
            {createStops.map((s, idx) => (
              <div key={idx} className="rounded-xl border p-3 space-y-2 bg-slate-50 dark:bg-slate-800/30">
                <div className="flex items-center justify-between"><span className="text-xs font-bold">Điểm #{idx + 1}</span>{createStops.length > 1 && <button onClick={() => setCreateStops((prev) => prev.filter((_, i) => i !== idx))} className="h-7 w-7 grid place-items-center rounded-full border bg-white"><X className="w-3 h-3" /></button>}</div>
                <Input value={s.customer} onChange={(e) => setCreateStops((prev) => prev.map((p, i) => i === idx ? { ...p, customer: e.target.value } : p))} placeholder="Khách / Bến xe..." className="h-8 rounded-full text-xs" />
                <Input value={s.address} onChange={(e) => setCreateStops((prev) => prev.map((p, i) => i === idx ? { ...p, address: e.target.value } : p))} placeholder="Địa chỉ / Bến xe Giáp Bát → ..." className="h-8 rounded-full text-xs" />
                <div className="grid grid-cols-3 gap-2">
                  <Input value={s.phone} onChange={(e) => setCreateStops((prev) => prev.map((p, i) => i === idx ? { ...p, phone: e.target.value } : p))} placeholder="SĐT" className="h-8 rounded-full text-xs" />
                  <Input type="number" value={String(s.thung_xop)} onChange={(e) => setCreateStops((prev) => prev.map((p, i) => i === idx ? { ...p, thung_xop: Number(e.target.value) || 1 } : p))} placeholder="Thùng xốp" className="h-8 rounded-full text-xs" />
                  <Input type="number" value={String(s.amount_cod)} onChange={(e) => setCreateStops((prev) => prev.map((p, i) => i === idx ? { ...p, amount_cod: Number(e.target.value) || 0 } : p))} placeholder="Thu hộ" className="h-8 rounded-full text-xs" />
                </div>
              </div>
            ))}
            <Button variant="outline" size="sm" className="rounded-full w-full" onClick={() => setCreateStops((prev) => [...prev, { customer: "", address: "", phone: "", thung_xop: 1, amount_cod: 0 }])}><Plus className="w-3 h-3 mr-1" /> Thêm điểm dừng</Button>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setCreateOpen(false)}>Hủy</Button>
              <Button className="flex-1 rounded-full bg-sky-600 hover:bg-sky-700 text-white" onClick={handleCreate} disabled={creating}>{creating ? "Đang tạo..." : "Tạo chuyến"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {toast && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full bg-slate-900 text-white px-4 py-2 text-xs shadow-lg">{toast}</div>}
    </div>
  );
}
