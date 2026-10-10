"use client";

import * as React from "react";
import { Thermometer, Snowflake, DoorOpen, DoorClosed, Battery, Download, Truck, Phone, MapPin } from "lucide-react";

type Telemetry = {
  temperature: number;
  compressorStatus: "RUNNING" | "STOPPED" | "DEFROST";
  doorStatus: "CLOSED" | "OPEN";
  batteryVoltage: number;
  location: string;
};

type HistoryPoint = { temperature: number; timestamp: string };

const HACCP_THRESHOLD = -15;

function Sparkline({ data }: { data: number[] }) {
  if (data.length < 2) return <div className="h-[36px] flex items-center justify-center text-[10px] text-muted-foreground">Chưa đủ dữ liệu</div>;
  const W = 160;
  const H = 36;
  const pad = 2;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const stepX = (W - pad * 2) / (data.length - 1);
  const pts = data
    .map((v, i) => {
      const x = pad + i * stepX;
      const y = H - pad - ((v - min) / range) * (H - pad * 2);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  // threshold line if within range
  const threshY = HACCP_THRESHOLD >= min && HACCP_THRESHOLD <= max ? H - pad - ((HACCP_THRESHOLD - min) / range) * (H - pad * 2) : null;

  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[180px]" aria-hidden>
      {threshY !== null && <line x1={pad} x2={W - pad} y1={threshY} y2={threshY} stroke="#f87171" strokeDasharray="3 3" strokeWidth={0.8} opacity={0.7} />}
      <polyline fill="none" stroke="#0ea5e9" strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" points={pts} opacity={0.95} />
      {/* dots */}
      {data.map((v, i) => {
        const x = pad + i * stepX;
        const y = H - pad - ((v - min) / range) * (H - pad * 2);
        const warn = v > HACCP_THRESHOLD;
        return <circle key={i} cx={x} cy={y} r={2} fill={warn ? "#ef4444" : "#0ea5e9"} stroke="white" strokeWidth={0.7} />;
      })}
    </svg>
  );
}

export default function FleetRadarWidget() {
  const [telemetry, setTelemetry] = React.useState<Telemetry | null>(null);
  const [history, setHistory] = React.useState<HistoryPoint[]>([]);
  const [loading, setLoading] = React.useState(true);

  const fetchData = React.useCallback(async () => {
    try {
      const res = await fetch("/api/fleet/telemetry", { cache: "no-store" });
      const j = await res.json();
      if (j.success && j.telemetry) {
        setTelemetry({
          temperature: j.telemetry.temperature,
          compressorStatus: j.telemetry.compressorStatus,
          doorStatus: j.telemetry.doorStatus,
          batteryVoltage: j.telemetry.batteryVoltage,
          location: j.telemetry.location,
        });
        if (Array.isArray(j.history)) setHistory(j.history as HistoryPoint[]);
      }
    } catch {
      // silent — giữ state cũ
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, 30_000);
    return () => clearInterval(id);
  }, [fetchData]);

  const temp = telemetry?.temperature ?? -18.4;
  const isWarning = temp > HACCP_THRESHOLD;
  const compressor = telemetry?.compressorStatus ?? "RUNNING";
  const door = telemetry?.doorStatus ?? "CLOSED";
  const battery = telemetry?.batteryVoltage ?? 24.2;

  const handleHaccp = () => {
    window.open("/api/fleet/haccp", "_blank");
  };

  const sparkData = history.length ? history.slice(-20).map((h) => h.temperature) : [];

  return (
    <div
      className={`rounded-[24px] border p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.7),0_8px_24px_rgba(0,0,0,0.08)] space-y-4 ${
        isWarning ? "border-red-200 bg-gradient-to-br from-red-50 via-orange-50 to-white" : "border-sky-200 bg-gradient-to-br from-sky-50 via-cyan-50/60 to-white"
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="h-8 w-8 rounded-full bg-sky-600 text-white flex items-center justify-center shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_2px_8px_rgba(14,165,233,0.4)]">
            <Truck className="w-4 h-4" />
          </span>
          <div>
            <div className="text-xs font-black tracking-tight flex items-center gap-1.5">
              <Snowflake className="w-3.5 h-3.5 text-sky-500" /> RADAR CHUỖI LẠNH
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">29C-882.60 · Isuzu QKR 270</div>
          </div>
        </div>
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold shadow-sm border ${isWarning ? "bg-red-600 text-white border-red-600" : "bg-emerald-500 text-white border-emerald-500"}`}>
          <span className={`h-2 w-2 rounded-full ${isWarning ? "bg-white animate-ping" : "bg-white animate-pulse"}`} />
          {isWarning ? "CẢNH BÁO" : "AN TOÀN"}
        </span>
      </div>

      {/* Temp block */}
      <div className={`rounded-2xl border p-4 flex items-center justify-between shadow-[inset_0_1px_0_rgba(255,255,255,0.8)] ${isWarning ? "bg-red-50 border-red-200" : "bg-white border-sky-100"}`}>
        <div>
          <div className="text-[10px] font-bold tracking-widest text-muted-foreground flex items-center gap-1">
            <Thermometer className="w-3 h-3" /> NHIỆT ĐỘ THÙNG
          </div>
          <div className={`font-mono text-3xl font-black tracking-tight ${isWarning ? "text-red-600" : "text-sky-700"}`}>
            {loading ? "—" : `${temp.toFixed(1)}°C`}
          </div>
          <div className={`text-[11px] font-semibold ${isWarning ? "text-red-600" : "text-emerald-600"}`}>{isWarning ? "Vượt ngưỡng -15°C" : "Đạt chuẩn HACCP (-18°C)"}</div>
        </div>
        <div className="flex flex-col items-center gap-1">
          <span className={`h-4 w-4 rounded-full border-2 shadow-[inset_0_1px_2px_rgba(0,0,0,0.2)] ${isWarning ? "bg-red-500 border-red-300 shadow-red-400/50 animate-pulse" : "bg-emerald-500 border-emerald-200"}`} aria-label={isWarning ? "Cảnh báo" : "An toàn"} />
          <span className={`text-[9px] font-bold tracking-widest ${isWarning ? "text-red-600" : "text-emerald-600"}`}>HACCP</span>
        </div>
      </div>

      {/* Sparkline */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm">
        <div className="text-[10px] font-bold tracking-widest text-muted-foreground mb-1">BIẾN ĐỘNG NHIỆT ĐỘ (24H)</div>
        {sparkData.length ? <Sparkline data={sparkData} /> : <div className="h-[36px] flex items-center text-[11px] text-muted-foreground">{loading ? "Đang tải..." : "—"}</div>}
        <div className="flex justify-between text-[10px] text-muted-foreground mt-1 font-mono">
          <span>{sparkData.length ? `${Math.min(...sparkData).toFixed(1)}°C` : ""}</span>
          <span className="text-red-400">Ngưỡng -15°C</span>
          <span>{sparkData.length ? `${Math.max(...sparkData).toFixed(1)}°C` : ""}</span>
        </div>
      </div>

      {/* Status grid */}
      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm space-y-1">
          <div className="text-[9px] font-bold tracking-widest text-muted-foreground">LỐC LẠNH</div>
          <div className={`text-xs font-bold ${compressor === "RUNNING" ? "text-emerald-600" : compressor === "DEFROST" ? "text-amber-600" : "text-slate-500"}`}>
            {compressor === "RUNNING" ? "Đang chạy" : compressor === "DEFROST" ? "Xả đá" : "Dừng"}
          </div>
          <div className={`mx-auto h-2 w-2 rounded-full ${compressor === "RUNNING" ? "bg-emerald-500 animate-pulse" : "bg-slate-300"}`} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm space-y-1">
          <div className="text-[9px] font-bold tracking-widest text-muted-foreground flex items-center justify-center gap-1">
            {door === "OPEN" ? <DoorOpen className="w-3 h-3" /> : <DoorClosed className="w-3 h-3" />} CỬA THÙNG
          </div>
          <div className={`text-xs font-bold ${door === "OPEN" ? "text-amber-600" : "text-emerald-600"}`}>{door === "OPEN" ? "Mở" : "Đóng kín"}</div>
          <div className={`mx-auto h-2 w-2 rounded-full ${door === "OPEN" ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm space-y-1">
          <div className="text-[9px] font-bold tracking-widest text-muted-foreground flex items-center justify-center gap-1">
            <Battery className="w-3 h-3" /> ẮC QUY
          </div>
          <div className="text-xs font-mono font-bold text-slate-800">{battery.toFixed(1)}V</div>
          <div className={`mx-auto h-2 w-2 rounded-full ${battery < 22 ? "bg-red-500" : "bg-emerald-500"}`} />
        </div>
      </div>

      {/* Vehicle info */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-sm space-y-1 text-xs">
        <div className="font-bold text-slate-800">Isuzu QKR 270 — 29C-882.60</div>
        <div className="flex items-center gap-1 text-muted-foreground">
          <Phone className="w-3 h-3" /> Tài xế Ngô Văn Tân — <a href="tel:0942226060" className="text-sky-600 font-semibold hover:underline">0942 22 60 60</a>
        </div>
        {telemetry?.location && (
          <div className="flex items-center gap-1 text-muted-foreground truncate">
            <MapPin className="w-3 h-3 shrink-0" /> <span className="truncate">{telemetry.location}</span>
          </div>
        )}
      </div>

      <button
        onClick={handleHaccp}
        className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-sky-600 text-white text-xs font-bold h-9 shadow-[inset_0_1px_0_rgba(255,255,255,0.3),0_4px_12px_rgba(14,165,233,0.4)] hover:bg-sky-700 transition-colors"
      >
        <Download className="w-4 h-4" /> Xuất HACCP
      </button>
    </div>
  );
}
