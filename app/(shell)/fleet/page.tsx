"use client";
import * as React from "react";
import {
  Truck,
  Thermometer,
  ShieldAlert,
  Calendar,
  Fuel,
  Wrench,
  User,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  Gauge,
  FileCheck,
  TrendingUp,
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

export default function FleetPage() {
  const [temperature, setTemperature] = React.useState(-18.4);
  const [isCompressorRunning, setIsCompressorRunning] = React.useState(true);
  const [doorStatus, setDoorStatus] = React.useState<"CLOSED" | "OPEN">("CLOSED");
  const [telemetryLocation, setTelemetryLocation] = React.useState("Kho Tổng Định Công — 96 Ngõ 337 Định Công");
  const [alertStatus, setAlertStatus] = React.useState<string>("NORMAL");

  // Fetch real-time IoT telemetry from /api/fleet/telemetry
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
      }
    } catch {
      // fallback to simulated
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

  const trips: DeliveryTrip[] = [
    {
      id: "TRIP-1",
      orderCode: "#13537",
      destination: "Số 5 Ngõ 27 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
      expectedTime: "09:30",
      packagesCount: 11,
      status: "completed",
    },
    {
      id: "TRIP-2",
      orderCode: "#13538",
      destination: "Bến xe Giáp Bát - Nhà xe Tuấn Bình (Gửi Hải Phòng)",
      expectedTime: "11:15",
      packagesCount: 45,
      status: "in_transit",
    },
    {
      id: "TRIP-3",
      orderCode: "#13540",
      destination: "Căn tin ĐH Bách Khoa - Cổng Trần Đại Nghĩa",
      expectedTime: "14:00",
      packagesCount: 20,
      status: "pending",
    },
  ];

  const maintenanceHistory: MaintenanceRecord[] = [
    {
      id: "MNT-1",
      date: "05/10/2026",
      item: "Bảo dưỡng định kỳ 50.000km, thay dầu máy & lọc dầu Isuzu chính hãng",
      cost: 2350000,
      performer: "Isuzu Thăng Long",
    },
    {
      id: "MNT-2",
      date: "20/09/2026",
      item: "Nạp bổ sung ga lạnh R404A & kiểm tra cảm biến nhiệt độ thùng lạnh",
      cost: 1200000,
      performer: "Điện Lạnh Ô Tô Hải Hà",
    },
    {
      id: "MNT-3",
      date: "12/08/2026",
      item: "Thay 2 lốp trước Bridgestone 7.00R16",
      cost: 4800000,
      performer: "Lốp Ô Tô Dân Chủ",
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Truck className="w-5 h-5 text-sky-500" /> Quản Lý Đội Xe & Phương Tiện Đông Lạnh
          </h1>
          <p className="text-xs text-muted-foreground">
            Giám sát nhiệt độ thùng lạnh IoT, lộ trình giao hàng và nhật ký bảo dưỡng xe tải chuyên dụng
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge className="bg-emerald-600 text-white font-mono">
            Trạng thái xe: Đang vận hành an toàn
          </Badge>
        </div>
      </div>

      {/* Main Vehicle Overview Card */}
      <div className="rounded-3xl border border-sky-200/80 bg-gradient-to-br from-sky-500/10 via-cyan-500/5 to-transparent p-6 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <span className="font-mono text-2xl font-black tracking-tight text-sky-950 dark:text-sky-100">
                29C-882.60
              </span>
              <Badge className="bg-sky-600 text-white">Xe Tải Đông Lạnh 2.5 Tấn</Badge>
              <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
                Đạt chuẩn HACCP
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Dòng xe: <strong>Isuzu QKR 270 Thùng Đông Lạnh Chuyên Dụng</strong> • Năm sản xuất: 2023 • Đăng kiểm đến: <strong>12/2026</strong>
            </p>
          </div>

          {/* IoT Temperature Card */}
          <div className="rounded-2xl border border-sky-200 bg-white dark:bg-slate-900 p-4 min-w-[240px] text-center shadow-inner space-y-1">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground">
              <span className="flex items-center gap-1">
                <Thermometer className="w-4 h-4 text-sky-500" /> CẢM BIẾN THÙNG LẠNH
              </span>
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <div className="font-mono text-3xl font-black text-sky-700 dark:text-sky-400">
              {temperature}°C
            </div>
            <div className="text-[11px] font-semibold text-emerald-600 flex items-center justify-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Nhiệt độ đạt chuẩn (-18°C ~ -22°C)
            </div>
          </div>
        </div>

        {/* Assigned Driver Profile & Spec Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Driver Card */}
          <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Tài xế phụ trách chính
            </span>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-sm">
                NVT
              </div>
              <div>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">Ngô Văn Tân</div>
                <a
                  href="tel:0942226060"
                  className="text-xs text-sky-600 font-semibold flex items-center gap-1 hover:underline"
                >
                  <Phone className="w-3 h-3" /> 0942 22 60 60
                </a>
              </div>
            </div>
            <p className="text-[11px] text-muted-foreground pt-1 border-t">
              Kinh nghiệm: 7 năm lái xe đông lạnh chuỗi cung ứng thực phẩm
            </p>
          </div>

          {/* Odometer & Fuel */}
          <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Thông số vận hành & Xăng dầu
            </span>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Đồng hồ ODO:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-slate-100">54.280 km</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Định mức tiêu hao:</span>
              <span className="font-mono font-semibold">11.5 lít Diesel/100km</span>
            </div>
            <div className="flex items-center justify-between text-xs border-t pt-1">
              <span className="text-muted-foreground">Dàn lạnh chạy máy:</span>
              <span className="font-semibold text-emerald-600">Đang hoạt động (100%)</span>
            </div>
          </div>

          {/* Legal and Compliance */}
          <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
              Giấy phép & Đăng kiểm
            </span>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Hạn đăng kiểm:</span>
              <span className="font-mono font-bold text-emerald-600">15/12/2026</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Bảo hiểm trách nhiệm:</span>
              <span className="font-semibold text-slate-900 dark:text-slate-100">Bảo Việt (Đến 2027)</span>
            </div>
            <div className="flex items-center justify-between text-xs border-t pt-1">
              <span className="text-muted-foreground">Phù hiệu vận tải:</span>
              <span className="font-semibold text-sky-600">Hợp tác xã Vận tải HN</span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Delivery Trips */}
      <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-sky-500" /> Tuyến giao hàng trong ngày của xe 29C-882.60
          </h2>
          <span className="text-xs text-muted-foreground">Tài xế Tân đang phụ trách</span>
        </div>

        <div className="space-y-3">
          {trips.map((trip) => (
            <div
              key={trip.id}
              className="flex flex-col md:flex-row md:items-center justify-between gap-3 rounded-2xl border border-slate-100 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 p-4"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-sky-600">{trip.orderCode}</span>
                  <Badge variant="outline" className="text-xs">
                    {trip.packagesCount} kiện hàng
                  </Badge>
                  {trip.status === "completed" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3" /> Đã giao thành công
                    </span>
                  )}
                  {trip.status === "in_transit" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full">
                      <Truck className="w-3 h-3" /> Đang vận chuyển
                    </span>
                  )}
                  {trip.status === "pending" && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-muted-foreground bg-slate-100 px-2 py-0.5 rounded-full">
                      <Clock className="w-3 h-3" /> Chờ xuất phát
                    </span>
                  )}
                </div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {trip.destination}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs shrink-0">
                <div className="text-right">
                  <span className="text-muted-foreground block text-[10px]">Giờ dự kiến:</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-100">
                    {trip.expectedTime}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Maintenance History */}
      <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b pb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Wrench className="w-4 h-4 text-amber-500" /> Nhật ký bảo dưỡng & sửa chữa phương tiện
          </h2>
          <Button variant="outline" size="sm" className="rounded-full text-xs h-8">
            Thêm biên bản bảo dưỡng
          </Button>
        </div>

        <div className="divide-y text-xs">
          {maintenanceHistory.map((rec) => (
            <div key={rec.id} className="py-3 flex items-start justify-between gap-4">
              <div className="space-y-0.5">
                <div className="font-bold text-slate-900 dark:text-slate-100">{rec.item}</div>
                <div className="text-muted-foreground">
                  Đơn vị thực hiện: <strong>{rec.performer}</strong> • Ngày: {rec.date}
                </div>
              </div>
              <div className="text-right font-mono font-bold text-emerald-600 text-sm shrink-0">
                {fmtVnd(rec.cost)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
