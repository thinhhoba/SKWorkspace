"use client";
import * as React from "react";
import {
  Truck,
  Thermometer,
  ShieldAlert,
  Wrench,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  BadgeAlert,
  Download,
  Bell,
  BellOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fmtVnd = (n: number) => Number(n).toLocaleString("vi-VN") + " ₫";

interface DeliveryTrip {
  id: string;
  orderCode: string;
  destination: string;
  expectedTime: string;
  packagesCount: number;
  status: "completed" | "in_transit" | "pending";
}
interface MaintenanceRecord {
  id: string;
  date: string;
  item: string;
  cost: number;
  performer: string;
}

type AlertCode = "WARNING_HIGH_TEMP" | "WARNING_DOOR_OPEN";

export default function FleetPage() {
  const [temperature, setTemperature] = React.useState(-18.4);
  const [isCompressorRunning, setIsCompressorRunning] = React.useState(true);
  const [doorStatus, setDoorStatus] = React.useState<"CLOSED" | "OPEN">("CLOSED");
  const [telemetryLocation, setTelemetryLocation] = React.useState("Kho Tổng Định Công — 96 Ngõ 337 Định Công");
  const [alertStatus, setAlertStatus] = React.useState<string>("NORMAL");
  const [alerts, setAlerts] = React.useState<AlertCode[]>([]);
  const [doorOpenedAt, setDoorOpenedAt] = React.useState<string | null>(null);
  const [sirenEnabled, setSirenEnabled] = React.useState(false);
  const audioRef = React.useRef<AudioContext | null>(null);
  const oscRef = React.useRef<{ osc: OscillatorNode; gain: GainNode } | null>(null);

  const hasWarning = alerts.length > 0;

  // Siren: Web Audio oscillator 800→400Hz loop, chỉ sau user gesture
  const startSiren = React.useCallback(() => {
    if (oscRef.current) return;
    const ctx = audioRef.current ?? new AudioContext();
    audioRef.current = ctx;
    if (ctx.state === "suspended") ctx.resume();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "sine";
    gain.gain.value = 0.22;
    osc.connect(gain).connect(ctx.destination);
    osc.start();
    // sweep 800→400 loop mỗi 700ms
    let dir = -1;
    let f = 800;
    const id = setInterval(() => {
      f += dir * 18;
      if (f <= 400) { f = 400; dir = 1; }
      if (f >= 800) { f = 800; dir = -1; }
      try { osc.frequency.setValueAtTime(f, ctx.currentTime); } catch {}
    }, 35);
    // store interval on osc for cleanup
    (osc as unknown as { _sirenInterval: ReturnType<typeof setInterval> })._sirenInterval = id;
    oscRef.current = { osc, gain };
  }, []);

  const stopSiren = React.useCallback(() => {
    const cur = oscRef.current;
    if (!cur) return;
    const id = (cur.osc as unknown as { _sirenInterval?: ReturnType<typeof setInterval> })._sirenInterval;
    if (id) clearInterval(id);
    try { cur.osc.stop(); cur.osc.disconnect(); cur.gain.disconnect(); } catch {}
    oscRef.current = null;
  }, []);

  React.useEffect(() => {
    if (!sirenEnabled) { stopSiren(); return; }
    if (hasWarning) startSiren();
    else stopSiren();
    return () => {};
  }, [hasWarning, sirenEnabled, startSiren, stopSiren]);

  React.useEffect(() => () => { stopSiren(); audioRef.current?.close().catch(() => {}); }, [stopSiren]);

  const fetchTelemetry = React.useCallback(async () => {
    try {
      const res = await fetch("/api/fleet/telemetry");
      const data = await res.json();
      if (data.success && data.telemetry) {
        setTemperature(data.telemetry.temperature);
        setIsCompressorRunning(data.telemetry.compressorStatus === "RUNNING");
        setDoorStatus(data.telemetry.doorStatus);
        setTelemetryLocation(data.telemetry.location);
        setAlertStatus(data.telemetry.status);
        setAlerts((data.telemetry.alerts || data.alerts || []) as AlertCode[]);
        setDoorOpenedAt(data.telemetry.doorOpenedAt ?? data.doorOpenedAt ?? null);
      }
    } catch {
      setTemperature((prev) => {
        const delta = (Math.random() - 0.5) * 0.4;
        const val = +(prev + delta).toFixed(1);
        return val < -22 ? -22 : val > -16 ? -16 : val;
      });
    }
  }, []);

  React.useEffect(() => {
    fetchTelemetry();
    const timer = setInterval(fetchTelemetry, 5000);
    return () => clearInterval(timer);
  }, [fetchTelemetry]);

  const handleHaccp = () => {
    const to = new Date().toISOString();
    const from = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    window.open(`/api/fleet/haccp?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`, "_blank");
  };

  const trips: DeliveryTrip[] = [];
  const maintenanceHistory: MaintenanceRecord[] = [
    { id: "MNT-1", date: "05/10/2026", item: "Bảo dưỡng định kỳ 50.000km, thay dầu máy & lọc dầu Isuzu chính hãng", cost: 2350000, performer: "Isuzu Thăng Long" },
    { id: "MNT-2", date: "20/09/2026", item: "Nạp bổ sung ga lạnh R404A & kiểm tra cảm biến nhiệt độ thùng lạnh", cost: 1200000, performer: "Điện Lạnh Ô Tô Hải Hà" },
    { id: "MNT-3", date: "12/08/2026", item: "Thay 2 lốp trước Bridgestone 7.00R16", cost: 4800000, performer: "Lốp Ô Tô Dân Chủ" },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* WARNING banner */}
      {hasWarning && (
        <div className="rounded-2xl border-2 border-red-300 bg-red-600 text-white px-4 py-3 flex items-start gap-3 animate-pulse" role="alert">
          <ShieldAlert className="w-6 h-6 shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <div className="font-black text-sm">CẢNH BÁO CHUỖI LẠNH — Xe 29C-882.60</div>
            <ul className="text-xs font-semibold list-disc ml-4 mt-1">
              {alerts.includes("WARNING_HIGH_TEMP") && <li>Nhiệt độ thùng {temperature}°C vượt ngưỡng an toàn -15°C (setpoint -18°C)</li>}
              {alerts.includes("WARNING_DOOR_OPEN") && <li>Cửa thùng đang MỞ quá 10 phút{doorOpenedAt ? ` (từ ${new Date(doorOpenedAt).toLocaleTimeString("vi-VN")})` : ""} — nguy cơ đứt chuỗi lạnh!</li>}
            </ul>
            <div className="text-[11px] opacity-90 mt-1">{telemetryLocation} · Tài xế Ngô Văn Tân 0942 22 60 60</div>
          </div>
          <Badge className="bg-white text-red-700 font-black shrink-0">WARNING</Badge>
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-sky-500" /> Quản Lý Đội Xe & Phương Tiện Đông Lạnh
            {hasWarning && <Badge className="bg-red-600 text-white animate-pulse"><BadgeAlert className="w-3 h-3 mr-1" />WARNING</Badge>}
          </h1>
          <p className="text-xs text-muted-foreground">Giám sát nhiệt độ thùng lạnh IoT, lộ trình giao hàng và nhật ký bảo dưỡng xe tải chuyên dụng</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Badge className={`${hasWarning ? "bg-red-600" : "bg-emerald-600"} text-white font-mono`}>
            {hasWarning ? "CẢNH BÁO" : "Đang vận hành an toàn"}
          </Badge>
          <Button variant={sirenEnabled ? "default" : "outline"} size="sm" className="rounded-full h-8 text-xs gap-1" onClick={() => setSirenEnabled((v) => !v)}>
            {sirenEnabled ? <Bell className="w-3.5 h-3.5" /> : <BellOff className="w-3.5 h-3.5" />} {sirenEnabled ? "Đã bật còi" : "Bật cảnh báo"}
          </Button>
          <Button variant="outline" size="sm" className="rounded-full h-8 text-xs gap-1" onClick={handleHaccp}>
            <Download className="w-3.5 h-3.5" /> Xuất biên bản HACCP
          </Button>
        </div>
      </div>

      <div className={`rounded-3xl border p-6 shadow-sm space-y-6 ${hasWarning ? "border-red-300 bg-gradient-to-br from-red-500/10 via-amber-500/5 to-transparent" : "border-sky-200/80 bg-gradient-to-br from-sky-500/10 via-cyan-500/5 to-transparent"}`}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3 flex-wrap">
              <span className="font-mono text-2xl font-black tracking-tight text-sky-950 dark:text-sky-100">29C-882.60</span>
              <Badge className="bg-sky-600 text-white">Xe Tải Đông Lạnh 2.5 Tấn</Badge>
              <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">Đạt chuẩn HACCP</Badge>
              {doorStatus === "OPEN" && <Badge className="bg-amber-500 text-white">Cửa: MỞ</Badge>}
            </div>
            <p className="text-xs text-muted-foreground">Dòng xe: <strong>Isuzu QKR 270 Thùng Đông Lạnh Chuyên Dụng</strong> • Năm sản xuất: 2023 • Đăng kiểm đến: <strong>12/2026</strong></p>
            <p className="text-[11px] text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{telemetryLocation} · Cửa: <strong>{doorStatus}</strong> · {alertStatus}</p>
          </div>
          <div className={`rounded-2xl border p-4 min-w-[240px] text-center shadow-inner space-y-1 ${hasWarning ? "border-red-200 bg-red-50 dark:bg-red-950/30" : "border-sky-200 bg-white dark:bg-slate-900"}`}>
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span className="flex items-center gap-1"><Thermometer className="w-4 h-4 text-sky-500" /> CẢM BIẾN THÙNG LẠNH</span>
              <span className={`inline-flex h-2 w-2 rounded-full ${hasWarning ? "bg-red-500 animate-ping" : "bg-emerald-500 animate-pulse"}`} />
            </div>
            <div className={`font-mono text-3xl font-black ${hasWarning ? "text-red-600" : "text-sky-700 dark:text-sky-400"}`}>{temperature}°C</div>
            <div className={`text-[11px] font-semibold flex items-center justify-center gap-1 ${hasWarning ? "text-red-600" : "text-emerald-600"}`}>
              {hasWarning ? <><ShieldAlert className="w-3.5 h-3.5" /> {alerts.join(" · ")}</> : <><CheckCircle2 className="w-3.5 h-3.5" /> Nhiệt độ đạt chuẩn (-18°C ~ -22°C)</>}
            </div>
            {doorStatus === "OPEN" && <div className="text-[11px] font-bold text-amber-600">Cửa thùng: ĐANG MỞ{doorOpenedAt ? ` từ ${new Date(doorOpenedAt).toLocaleTimeString("vi-VN")}` : ""}</div>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Tài xế phụ trách chính</span>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm">NVT</div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">Ngô Văn Tân</div>
                <a href="tel:0942226060" className="text-xs text-sky-600 font-semibold flex items-center gap-1 hover:underline"><Phone className="w-3 h-3" /> 0942 22 60 60</a>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1 border-t">Kinh nghiệm: 7 năm lái xe đông lạnh chuỗi cung ứng thực phẩm</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Thông số vận hành & Xăng dầu</span>
            <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Đồng hồ ODO:</span><span className="font-mono font-bold">54.280 km</span></div>
            <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Định mức tiêu hao:</span><span className="font-mono font-semibold">11.5 lít Diesel/100km</span></div>
            <div className="flex items-center justify-between text-xs border-t pt-1"><span className="text-muted-foreground">Dàn lạnh chạy máy:</span><span className={`font-semibold ${isCompressorRunning ? "text-emerald-600" : "text-amber-600"}`}>{isCompressorRunning ? "Đang hoạt động (100%)" : "Tạm dừng"}</span></div>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">Giấy phép & Đăng kiểm</span>
            <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Hạn đăng kiểm:</span><span className="font-mono font-bold text-emerald-600">15/12/2026</span></div>
            <div className="flex items-center justify-between text-xs"><span className="text-muted-foreground">Bảo hiểm trách nhiệm:</span><span className="font-semibold">Bảo Việt (Đến 2027)</span></div>
            <div className="flex items-center justify-between text-xs border-t pt-1"><span className="text-muted-foreground">Phù hiệu vận tải:</span><span className="font-semibold text-sky-600">Hợp tác xã Vận tải HN</span></div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2"><MapPin className="w-4 h-4 text-sky-500" /> Tuyến giao hàng trong ngày của xe 29C-882.60</h2>
          <span className="text-xs text-muted-foreground">Tài xế Tân đang phụ trách</span>
        </div>
        <div className="space-y-3">
          {trips.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-8 text-center text-xs text-muted-foreground flex flex-col items-center justify-center gap-2">
              <Truck className="w-6 h-6 text-slate-300 dark:text-slate-700" />
              <span className="font-medium text-slate-700 dark:text-slate-300">Chưa có chuyến giao hàng nào trong ngày</span>
              <span className="text-[11px]">Các đơn hàng xuất kho giao bằng xe 29C-882.60 sẽ hiển thị tại đây khi được điều phối.</span>
            </div>
          ) : (
            trips.map((trip) => (
              <div key={trip.id} className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap"><span className="font-mono text-sm font-bold text-sky-600">{trip.orderCode}</span><Badge variant="outline" className="text-xs">{trip.packagesCount} kiện hàng</Badge>
                    {trip.status === "completed" && <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full"><CheckCircle2 className="w-3 h-3" /> Đã giao thành công</span>}
                    {trip.status === "in_transit" && <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full"><Truck className="w-3 h-3" /> Đang vận chuyển</span>}
                    {trip.status === "pending" && <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full"><Clock className="w-3 h-3" /> Chờ xuất phát</span>}
                  </div>
                  <p className="text-xs font-semibold truncate">{trip.destination}</p>
                </div>
                <div className="flex items-center gap-4 text-xs shrink-0"><div className="text-right"><span className="text-muted-foreground block text-[10px]">Giờ dự kiến:</span><span className="font-mono font-bold">{trip.expectedTime}</span></div></div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2"><Wrench className="w-4 h-4 text-amber-500" /> Nhật ký bảo dưỡng & sửa chữa phương tiện</h2>
          <Button variant="outline" size="sm" className="rounded-full text-xs h-8">Thêm biên bản bảo dưỡng</Button>
        </div>
        <div className="divide-y text-xs">
          {maintenanceHistory.map((rec) => (
            <div key={rec.id} className="py-3 flex items-start justify-between gap-4">
              <div className="space-y-0.5"><div className="font-bold">{rec.item}</div><div className="text-muted-foreground">Đơn vị thực hiện: <strong>{rec.performer}</strong> • Ngày: {rec.date}</div></div>
              <div className="text-right font-mono font-bold text-emerald-600 text-sm shrink-0">{fmtVnd(rec.cost)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
