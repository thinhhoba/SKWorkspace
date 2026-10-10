"use client";

import { useState, useEffect, useCallback } from "react";
import { Phone, MapPin, Copy, Check, X, Truck, Package, QrCode } from "lucide-react";
import { buildOrderVietQr } from "@/packages/modules/payment/vietqr";
import type { DeliveryTrip, DeliveryStop } from "@/packages/modules/delivery/types";
import { STOP_STATUS_LABEL } from "@/packages/modules/delivery/types";

const vnd = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;

export default function PwaGiaoVanPage() {
  const [trips, setTrips] = useState<DeliveryTrip[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeStop, setActiveStop] = useState<{ trip: DeliveryTrip; stop: DeliveryStop } | null>(null);
  const [copied, setCopied] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);

  const fetchTrips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/delivery");
      const data = await res.json();
      if (data.success) setTrips(data.trips || []);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchTrips(); }, [fetchTrips]);
  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); }, [toast]);

  // Flatten stops of trips that are not hoan_tat — prioritize dang_giao then cho_xep_xe
  const activeTrips = trips.filter((t) => t.status === "dang_giao" || t.status === "cho_xep_xe" || t.status === "da_giao");
  const displayTrips = activeTrips.length ? activeTrips : trips.slice(0, 3);

  const qrUrl = activeStop ? buildOrderVietQr(activeStop.trip.code, activeStop.stop.amount_cod) : "";

  const handleCopy = async () => {
    if (!qrUrl) return;
    try { await navigator.clipboard.writeText(qrUrl); setCopied(true); setTimeout(() => setCopied(false), 1800); }
    catch { window.prompt("Copy QR link:", qrUrl); }
  };

  const handleDaGiao = async () => {
    if (!activeStop) return;
    const { trip, stop } = activeStop;
    setUpdating(stop.id);
    try {
      const res = await fetch(`/api/delivery/${encodeURIComponent(trip.id)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stopId: stop.id, stopStatus: "da_giao" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setTrips((prev) => prev.map((t) => (t.id === trip.id ? data.trip : t)));
      setToast(`Đã giao — ${stop.customer}`);
      setActiveStop(null);
    } catch (e: unknown) { setToast(e instanceof Error ? e.message : "Lỗi cập nhật"); }
    finally { setUpdating(null); }
  };

  // Quick "Đã Giao" from card without opening QR
  const handleQuickDaGiao = async (trip: DeliveryTrip, stop: DeliveryStop) => {
    if (stop.status === "da_giao") return;
    setUpdating(stop.id);
    try {
      const res = await fetch(`/api/delivery/${encodeURIComponent(trip.id)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stopId: stop.id, stopStatus: "da_giao" }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setTrips((prev) => prev.map((t) => (t.id === trip.id ? data.trip : t)));
      setToast(`Đã giao — ${stop.customer}`);
    } catch (e: unknown) { setToast(e instanceof Error ? e.message : "Lỗi"); }
    finally { setUpdating(null); }
  };

  return (
    <div className="flex flex-col gap-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
      {/* Header */}
      <div className="clay-card p-3">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-extrabold flex items-center gap-1.5"><Truck className="w-4 h-4 text-sky-600" /> Giao vận — Ngô Văn Tân</h1>
          <span className="rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-bold text-sky-700 dark:bg-sky-950/40">{activeStop ? "VietQR" : `${displayTrips.reduce((a, t) => a + t.stops.length, 0)} điểm hôm nay`}</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">0942 22 60 60 · 29C-882.60 · Thu hộ Techcombank 22226060 — Chạm Thu COD để hiện VietQR</p>
      </div>

      {loading ? (
        <div className="grid gap-2">{Array.from({ length: 3 }).map((_, i) => <div key={i} className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
      ) : displayTrips.length === 0 ? (
        <div className="clay-card rounded-2xl p-6 text-center text-sm text-muted-foreground">Không có chuyến nào</div>
      ) : (
        displayTrips.map((trip) => (
          <div key={trip.id} className="clay-card overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-white/60 px-3 py-2 bg-slate-50/50 dark:bg-slate-800/30">
              <span className="mono text-xs font-bold">{trip.code}</span>
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold border ${trip.route_type === "chanh_xe_tinh" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-sky-50 text-sky-700 border-sky-200"}`}>{trip.route_type === "chanh_xe_tinh" ? "Chành xe" : "Nội thành"} · {trip.license_plate}</span>
            </div>
            {trip.stops.map((s, idx) => {
              const done = s.status === "da_giao";
              return (
                <div key={s.id} className={`p-3 ${idx > 0 ? "border-t" : ""} ${done ? "opacity-60" : ""}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold">Điểm {s.seq} · {s.customer}</span>
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold border ${done ? "bg-emerald-50 text-emerald-700 border-emerald-200" : s.status === "dang_giao" ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{STOP_STATUS_LABEL[s.status]}</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground line-clamp-1">{s.address}</div>
                  <div className="mono mt-1 text-base font-extrabold flex items-center gap-1.5"><Package className="w-3.5 h-3.5 text-muted-foreground" /> {s.thung_xop} thùng · {vnd(s.amount_cod)}</div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <a href={`tel:${s.phone}`} className="flex min-h-[44px] items-center justify-center gap-1.5 rounded-full bg-emerald-600 text-xs font-bold text-white"><Phone className="h-3.5 w-3.5" /> Gọi</a>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.address)}`} target="_blank" rel="noreferrer" className="glossy-pill flex min-h-[44px] items-center justify-center gap-1.5 text-xs font-bold"><MapPin className="h-3.5 w-3.5" /> Bản đồ</a>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setActiveStop({ trip, stop: s })} disabled={done} className={`flex min-h-[44px] items-center justify-center gap-1 rounded-full text-xs font-bold ${done ? "border bg-muted text-muted-foreground" : "bg-sky-600 text-white"}`}><QrCode className="h-3.5 w-3.5" /> Quét VietQR 22226060</button>
                    <button type="button" onClick={() => handleQuickDaGiao(trip, s)} disabled={done || updating === s.id} className={`flex min-h-[44px] items-center justify-center rounded-full text-xs font-bold ${done ? "border bg-muted text-muted-foreground" : "bg-emerald-600 text-white"}`}>{updating === s.id ? "..." : done ? "Đã giao" : "Đã Giao"}</button>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}

      {/* Clock card */}
      <div className="rounded-2xl border bg-card p-3 text-center">
        <div className="mono text-lg font-bold">{new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</div>
        <div className="mono text-[11px] text-muted-foreground">{new Date().toLocaleDateString("vi-VN")} — Ngô Văn Tân · 29C-882.60</div>
        <div className="mt-2 flex items-center justify-center gap-2 text-xs"><span className="h-2 w-2 rounded-full bg-emerald-500" /><span className="font-bold">Online</span><span className="mono text-[11px] text-muted-foreground">Kho Định Công 96/337</span></div>
      </div>

      {/* VietQR dialog */}
      {activeStop ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="giaovan-cod-title">
          <button type="button" aria-label="Đóng" onClick={() => setActiveStop(null)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <div className="clay-card absolute inset-x-3 top-1/2 max-h-[90dvh] -translate-y-1/2 overflow-auto p-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 id="giaovan-cod-title" className="text-sm font-extrabold">Quét VietQR 22226060 — {activeStop.stop.customer}</h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{activeStop.trip.code} · Điểm #{activeStop.stop.seq} · {activeStop.stop.address}</p>
              </div>
              <button type="button" onClick={() => setActiveStop(null)} className="grid h-9 w-9 place-items-center rounded-full border bg-white/70 dark:bg-white/5"><X className="h-4 w-4" /></button>
            </div>
            <p className="mono mt-3 text-center text-2xl font-extrabold">{vnd(activeStop.stop.amount_cod)}</p>
            <p className="mt-1 text-center text-[11px] text-muted-foreground">Nội dung CK: <span className="mono font-bold text-foreground">{activeStop.trip.code}</span> · {activeStop.stop.thung_xop} thùng xốp · Techcombank 22226060</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={qrUrl} alt={`VietQR ${activeStop.trip.code} ${vnd(activeStop.stop.amount_cod)}`} className="mx-auto mt-3 w-full max-w-[280px] rounded-2xl bg-white p-2" width={280} height={280} />
            <div className="mt-3 flex gap-2">
              <button type="button" onClick={handleCopy} className="glossy-pill glossy-btn flex min-h-[52px] flex-1 items-center justify-center gap-1.5 text-sm font-semibold">{copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}{copied ? "Đã copy" : "Copy QR link"}</button>
              <button type="button" onClick={handleDaGiao} disabled={!!updating} className="flex min-h-[52px] flex-1 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white disabled:opacity-50">{updating ? "..." : "Đã Giao"}</button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">Chành xe tỉnh: CK 100% trước khi xuất — VietQR Techcombank 22226060 (Sơn Khang Food). Đối soát tự động.</p>
          </div>
        </div>
      ) : null}

      {toast && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full bg-slate-900 text-white px-4 py-2 text-xs shadow-lg">{toast}</div>}
    </div>
  );
}
