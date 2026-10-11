"use client";
import * as React from "react";
import { TrendingUp, Package, ThermometerSnowflake, Wallet, CheckCircle2 } from "lucide-react";
import KpiCard from "./KpiCard";
import TasksWidget from "./TasksWidget";
import type { WorkdeskTask } from "@/packages/modules/tasks/types";

interface LeftColumnProps {
  revenue: number;
  pendingPickCount: number;
  fleetTemp: number;
  bankBalance: number;
  tasks?: WorkdeskTask[];
}

const fmtVnd = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;

export default function LeftColumn({ revenue, pendingPickCount, fleetTemp, bankBalance, tasks }: LeftColumnProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <KpiCard
          label="Doanh thu hôm nay (Sapo)"
          value={fmtVnd(revenue)}
          subtext="Đồng bộ thời gian thực store"
          subtextColor="text-emerald-600"
          borderColor="border-l-sky-500"
          iconBg="bg-sky-100 dark:bg-sky-950 text-sky-600"
          icon={<TrendingUp className="w-3.5 h-3.5" />}
        />
        <KpiCard
          label="Đơn cần soạn FEFO"
          value={`${pendingPickCount} đơn hàng`}
          subtext={pendingPickCount > 0 ? `${pendingPickCount} đơn chờ xuất kho` : "Không có đơn chờ soạn"}
          borderColor="border-l-amber-500"
          iconBg="bg-amber-100 dark:bg-amber-950 text-amber-600"
          icon={<Package className="w-3.5 h-3.5" />}
        />
        <KpiCard
          label="Xe lạnh 29C-882.60 (Tân)"
          value={`${fleetTemp}°C`}
          subtext="Đạt chuẩn HACCP (-18°C ~ -22°C)"
          subtextColor="text-emerald-600"
          borderColor="border-l-cyan-500"
          iconBg="bg-cyan-100 dark:bg-cyan-950 text-cyan-600"
          icon={<ThermometerSnowflake className="w-3.5 h-3.5" />}
        />
        <KpiCard
          label="Techcombank 22226060"
          value={fmtVnd(bankBalance)}
          subtext="Gạch nợ tự động VietQR"
          borderColor="border-l-emerald-500"
          iconBg="bg-emerald-100 dark:bg-emerald-950 text-emerald-600"
          icon={<Wallet className="w-3.5 h-3.5" />}
        />
      </div>
      <TasksWidget tasks={tasks} />
    </div>
  );
}
