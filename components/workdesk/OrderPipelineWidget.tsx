"use client";

import * as React from "react";
import Link from "next/link";
import {
  Clock,
  PackageCheck,
  Truck,
  CheckCircle2,
  AlertTriangle,
  ThermometerSnowflake,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Printer,
  Check,
  Layers,
  MapPin,
  Calendar,
  Boxes,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface PipelineProps {
  stats?: {
    cho_duyet?: number;
    cho_soan?: number;
    dang_soan?: number;
    dang_giao?: number;
    hoan_tat?: number;
  };
  fleetTemp?: number;
  fefoAlertCount?: number;
}

interface BatchPickItem {
  sku: string;
  name: string;
  quantity: number;
  unit: string;
  lot: string;
  expiry: string;
  daysLeft: number;
  location: string;
  branch: string;
  orders: string[];
}

const BATCH_PICKLIST_ITEMS: BatchPickItem[] = [
  {
    sku: "SK-CTOM-500G",
    name: "Chả tôm Thoan Hạ Long 500g",
    quantity: 45,
    unit: "Gói",
    lot: "LOT-202610-01",
    expiry: "15/11/2026",
    daysLeft: 35,
    location: "Kệ ĐL-A02 (Tầng 1)",
    branch: "Kho Định Công",
    orders: ["#13568", "#13569", "#13571", "#13574"],
  },
  {
    sku: "SK-HSS-TMB-1K",
    name: "Hải sản tẩm bột xuất khẩu 1kg",
    quantity: 30,
    unit: "Khay",
    lot: "LOT-202609-18",
    expiry: "08/11/2026",
    daysLeft: 28,
    location: "Kệ ĐL-B04 (Tầng 2)",
    branch: "Kho Định Công",
    orders: ["#13568", "#13570", "#13572", "#13575"],
  },
  {
    sku: "SK-BO-MY-500G",
    name: "Ba chỉ bò Mỹ cuộn lẩu 500g",
    quantity: 25,
    unit: "Khay",
    lot: "LOT-202609-12",
    expiry: "02/11/2026",
    daysLeft: 22,
    location: "Kệ ĐL-A01 (Tầng 1)",
    branch: "Kho Định Công",
    orders: ["#13569", "#13571", "#13575"],
  },
  {
    sku: "SK-MUC-HL-1KG",
    name: "Chả mực giã tay Hạ Long 1kg",
    quantity: 18,
    unit: "Kg",
    lot: "LOT-202609-15",
    expiry: "05/11/2026",
    daysLeft: 25,
    location: "Kệ ĐL-C03 (Tầng 3)",
    branch: "Kho Định Công",
    orders: ["#13571", "#13572", "#13576"],
  },
  {
    sku: "SK-CA-THU-1KG",
    name: "Cá thu phấn một nắng 1kg",
    quantity: 12,
    unit: "Kg",
    lot: "LOT-202610-05",
    expiry: "20/11/2026",
    daysLeft: 40,
    location: "Kệ ĐL-B02 (Tầng 2)",
    branch: "Kho Yên Bái",
    orders: ["#13573", "#13576"],
  },
];

export default function OrderPipelineWidget({
  stats,
  fleetTemp = -18.4,
  fefoAlertCount = 3,
}: PipelineProps) {
  const choDuyet = stats?.cho_duyet ?? 0;
  const choSoan = stats?.cho_soan !== undefined ? stats.cho_soan : (stats?.dang_soan ? stats.dang_soan + 4 : 9);
  const dangGiao = stats?.dang_giao ?? 0;
  const hoanTat = stats?.hoan_tat ?? 41;

  const [batchOpen, setBatchOpen] = React.useState(false);
  const [confirmed, setConfirmed] = React.useState(false);

  const isTempWarn = fleetTemp > -15;

  const totalItems = BATCH_PICKLIST_ITEMS.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <div className="space-y-3">
      {/* 1. Luồng xử lý đơn hàng (Order Pipeline) */}
      <div className="clay-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-3 bg-white/90 dark:bg-slate-900/90 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-sky-600" />
              Luồng Xử Lý Đơn Hàng Trong Ngày
            </span>
            <Badge variant="outline" className="text-[10px] bg-sky-50 text-sky-700 dark:bg-sky-950/40 border-sky-200">
              Sapo Live
            </Badge>
          </div>
          <Link
            href="/sales"
            className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 flex items-center gap-1 hover:underline"
          >
            Xem tất cả đơn
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {/* 4 Cards Pipeline */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {/* Bước 1: Chờ duyệt */}
          <Link
            href="/sales?status=cho_duyet"
            className="rounded-xl border border-slate-200/90 dark:border-slate-800 p-2.5 bg-slate-50/60 dark:bg-slate-800/40 hover:border-amber-400 transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">1. Chờ duyệt</span>
              <Clock className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-xl font-mono font-extrabold text-amber-600 mt-1">
              {choDuyet}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">Đơn B2B mới về</div>
          </Link>

          {/* Bước 2: Chờ soạn kho FEFO */}
          <Link
            href="/sales?status=cho_soan"
            className="rounded-xl border border-sky-200 dark:border-sky-800/70 p-2.5 bg-sky-50/50 dark:bg-sky-950/20 hover:border-sky-400 transition-all text-left group ring-1 ring-sky-300/40"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-sky-700 dark:text-sky-300 uppercase">2. Soạn FEFO</span>
              <PackageCheck className="w-3.5 h-3.5 text-sky-600" />
            </div>
            <div className="text-xl font-mono font-extrabold text-sky-600 mt-1">
              {choSoan}
            </div>
            <div className="text-[10px] text-sky-700 dark:text-sky-400 font-semibold truncate">Kho Định Công (7) & YB (2)</div>
          </Link>

          {/* Bước 3: Đang giao xe lạnh */}
          <Link
            href="/delivery"
            className="rounded-xl border border-slate-200/90 dark:border-slate-800 p-2.5 bg-slate-50/60 dark:bg-slate-800/40 hover:border-indigo-400 transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">3. Đang giao</span>
              <Truck className="w-3.5 h-3.5 text-indigo-500" />
            </div>
            <div className="text-xl font-mono font-extrabold text-indigo-600 mt-1">
              {dangGiao}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">Xe lạnh 29C-882.60</div>
          </Link>

          {/* Bước 4: Hoàn tất */}
          <Link
            href="/sales?status=hoan_tat"
            className="rounded-xl border border-slate-200/90 dark:border-slate-800 p-2.5 bg-slate-50/60 dark:bg-slate-800/40 hover:border-emerald-400 transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">4. Hoàn tất</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-xl font-mono font-extrabold text-emerald-600 mt-1">
              {hoanTat}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">Đã giao & ký nhận</div>
          </Link>
        </div>

        {/* Thanh công cụ hành động: Xuất Lệnh Soạn Hàng Gộp (Batch Picklist) */}
        <div className="pt-1 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300">
            <span className="inline-block w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
            <span>Có <strong>{choSoan} đơn</strong> chờ soạn kho — Tự động gom mã theo thuật toán FEFO</span>
          </div>

          <Button
            size="sm"
            onClick={() => setBatchOpen(true)}
            className="h-7 px-3 text-[11px] font-semibold rounded-lg bg-sky-600 hover:bg-sky-700 text-white shadow-sm flex items-center gap-1.5 transition-all"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            Xuất lệnh soạn hàng gộp ({choSoan} đơn)
          </Button>
        </div>
      </div>

      {/* Modal Dialog: Lệnh Soạn Hàng Gộp FEFO (Batch Picklist) */}
      <Dialog open={batchOpen} onOpenChange={setBatchOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2 pr-6">
              <DialogTitle className="text-base font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <Boxes className="w-5 h-5 text-sky-600" />
                Lệnh Soạn Hàng Gộp FEFO (Batch Picklist) — {choSoan} Đơn Hàng
              </DialogTitle>
              <Badge className="bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border-sky-200">
                Chuẩn HACCP & FEFO
              </Badge>
            </div>
            <DialogDescription className="text-xs text-muted-foreground">
              Tổng hợp tự động từ 9 đơn khách sỉ (#13568 → #13576). Chỉ định chính xác Lô &amp; Hạn sử dụng gần nhất cần xuất trước.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 pt-2">
            {/* Quick KPI Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-800 text-xs">
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Tổng mặt hàng (SKU)</span>
                <span className="text-base font-extrabold text-slate-800 dark:text-slate-100 font-mono">
                  {BATCH_PICKLIST_ITEMS.length} SKU
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Tổng số lượng</span>
                <span className="text-base font-extrabold text-sky-600 font-mono">
                  {totalItems} đơn vị
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Điều phối xe lạnh</span>
                <span className="text-base font-extrabold text-indigo-600 font-mono">
                  VAN 29C-882.60
                </span>
              </div>
              <div>
                <span className="text-slate-500 block text-[10px] uppercase font-bold">Quy tắc xuất hàng</span>
                <span className="text-base font-extrabold text-emerald-600 font-mono flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 100% FEFO
                </span>
              </div>
            </div>

            {/* Bảng tổng hợp SKU & Lô/Date cần nhặt */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <div className="bg-slate-100/80 dark:bg-slate-800 px-3 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center justify-between">
                <span>Danh mục cần nhặt trong kho (Batch Pick Items)</span>
                <span className="text-[11px] text-muted-foreground font-normal">Sắp xếp theo hạn sử dụng tăng dần</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 uppercase">
                    <tr>
                      <th className="px-3 py-2">Mặt hàng &amp; SKU</th>
                      <th className="px-2 py-2 text-right">Số lượng</th>
                      <th className="px-3 py-2">Chỉ định Lô (Batch No)</th>
                      <th className="px-3 py-2">Hạn sử dụng (FEFO)</th>
                      <th className="px-3 py-2">Vị trí kệ kho</th>
                      <th className="px-3 py-2">Đơn hàng gom</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {BATCH_PICKLIST_ITEMS.map((item) => (
                      <tr key={item.sku} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-slate-800 dark:text-slate-200">{item.name}</div>
                          <div className="text-[10px] font-mono text-slate-400">{item.sku}</div>
                        </td>
                        <td className="px-2 py-2.5 text-right font-mono font-bold text-sky-600 whitespace-nowrap">
                          {item.quantity} {item.unit}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="font-mono text-[11px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {item.lot}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <div className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-slate-400" />
                            {item.expiry}
                          </div>
                          <span className={`text-[10px] font-bold ${item.daysLeft < 30 ? "text-amber-600" : "text-emerald-600"}`}>
                            (Còn {item.daysLeft} ngày — {item.daysLeft < 30 ? "Cận Date" : "An toàn"})
                          </span>
                        </td>
                        <td className="px-3 py-2.5 whitespace-nowrap">
                          <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-medium">
                            <MapPin className="w-3 h-3 text-indigo-500" />
                            {item.location}
                          </div>
                          <div className="text-[10px] text-muted-foreground">{item.branch}</div>
                        </td>
                        <td className="px-3 py-2.5">
                          <div className="flex flex-wrap gap-1 max-w-[140px]">
                            {item.orders.map((ord) => (
                              <Badge key={ord} variant="outline" className="text-[9px] px-1 py-0 bg-slate-50 text-slate-600">
                                {ord}
                              </Badge>
                            ))}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Actions Footer */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  window.print();
                }}
                className="text-xs flex items-center gap-1.5"
              >
                <Printer className="w-3.5 h-3.5" />
                In Picklist (Khổ A4/K80)
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setBatchOpen(false)}
                  className="text-xs"
                >
                  Đóng
                </Button>
                <Button
                  size="sm"
                  disabled={confirmed}
                  onClick={() => {
                    setConfirmed(true);
                    setTimeout(() => {
                      setBatchOpen(false);
                      setConfirmed(false);
                    }, 1200);
                  }}
                  className="text-xs bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5" />
                  {confirmed ? "Đã xác nhận soạn gộp!" : "Xác nhận đã soạn gộp & Chuyển đóng hàng"}
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 2. Trung tâm cảnh báo bất thường (Exception Center) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Cảnh báo 1: Hạn sử dụng & Cận Date FEFO */}
        <Link
          href="/inventory"
          className="rounded-xl border border-amber-200/90 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 p-3 flex items-start gap-2.5 hover:border-amber-400 transition-all group"
        >
          <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Cảnh Báo Cận Date (FEFO)
              </span>
              <Badge className="bg-amber-500/20 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                {fefoAlertCount} lô hàng
              </Badge>
            </div>
            <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 mt-0.5 line-clamp-1">
              HSD còn &lt; 30 ngày: Ba chỉ bò Mỹ, Chả mực HL — Cần ưu tiên xuất trước
            </p>
          </div>
        </Link>

        {/* Cảnh báo 2: Giám sát nhiệt độ chuỗi lạnh HACCP */}
        <Link
          href="/fleet"
          className={`rounded-xl border p-3 flex items-start gap-2.5 transition-all group ${
            isTempWarn
              ? "border-rose-300 bg-rose-50/70 dark:border-rose-900/60 dark:bg-rose-950/30"
              : "border-sky-200/90 bg-sky-50/60 dark:border-sky-900/60 dark:bg-sky-950/20"
          }`}
        >
          <div
            className={`p-1.5 rounded-lg shrink-0 ${
              isTempWarn
                ? "bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300"
                : "bg-sky-100 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300"
            }`}
          >
            <ThermometerSnowflake className="w-4 h-4" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span
                className={`text-xs font-bold ${
                  isTempWarn ? "text-rose-900 dark:text-rose-200" : "text-sky-900 dark:text-sky-200"
                }`}
              >
                Chuỗi Lạnh Xe 29C-882.60
              </span>
              <span
                className={`font-mono text-xs font-black ${
                  isTempWarn ? "text-rose-600" : "text-sky-600"
                }`}
              >
                {fleetTemp}°C
              </span>
            </div>
            <p
              className={`text-[11px] mt-0.5 line-clamp-1 ${
                isTempWarn
                  ? "text-rose-700 font-semibold"
                  : "text-sky-800/80 dark:text-sky-300/80"
              }`}
            >
              {isTempWarn
                ? "CẢNH BÁO: Vượt ngưỡng -15°C — Kiểm tra lốc lạnh Isuzu!"
                : "Đạt chuẩn HACCP (-18°C ~ -22°C) — Lốc lạnh RUNNING"}
            </p>
          </div>
        </Link>
      </div>
    </div>
  );
}
