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
} from "lucide-react";
import { Badge } from "@/components/ui/badge";

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

export default function OrderPipelineWidget({
  stats,
  fleetTemp = -18.4,
  fefoAlertCount = 3,
}: PipelineProps) {
  const choDuyet = stats?.cho_duyet ?? 2;
  const choSoan = (stats?.cho_soan ?? 4) + (stats?.dang_soan ?? 1);
  const dangGiao = stats?.dang_giao ?? 3;
  const hoanTat = stats?.hoan_tat ?? 18;

  const isTempWarn = fleetTemp > -15;

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
            className="rounded-xl border border-slate-200/90 dark:border-slate-800 p-2.5 bg-slate-50/60 dark:bg-slate-800/40 hover:border-sky-400 transition-all text-left group"
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-500 uppercase">2. Soạn FEFO</span>
              <PackageCheck className="w-3.5 h-3.5 text-sky-500" />
            </div>
            <div className="text-xl font-mono font-extrabold text-sky-600 mt-1">
              {choSoan}
            </div>
            <div className="text-[10px] text-muted-foreground truncate">Kho Định Công & YB</div>
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
      </div>

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
