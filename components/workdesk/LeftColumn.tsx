"use client";
import * as React from "react";
import { TrendingUp, Package, ThermometerSnowflake, Wallet, CheckCircle2 } from "lucide-react";
import KpiCard from "./KpiCard";
import Launchpad from "./Launchpad";
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
          label="Doanh thu hom nay (Sapo)"
          value={fmtVnd(revenue)}
          subtext="Dong bo thoi gian thuc store"
          subtextColor="text-emerald-600"
          borderColor="border-l-sky-500"
          iconBg="bg-sky-100 dark:bg-sky-950 text-sky-600"
          icon={<TrendingUp className="w-3.5 h-3.5" />}
        />
        <KpiCard
          label="Don can soan FEFO"
          value={`${pendingPickCount} don hang`}
          subtext="Kho Q7: 9 don · Kho Q12: 5 don"
          borderColor="border-l-amber-500"
          iconBg="bg-amber-100 dark:bg-amber-950 text-amber-600"
          icon={<Package className="w-3.5 h-3.5" />}
        />
        <KpiCard
          label="Isuzu 29C-882.60 (Tan)"
          value={`${fleetTemp}°C`}
          subtext="Dat chuan HACCP (-18°C ~ -22°C)"
          subtextColor="text-emerald-600"
          borderColor="border-l-cyan-500"
          iconBg="bg-cyan-100 dark:bg-cyan-950 text-cyan-600"
          icon={<ThermometerSnowflake className="w-3.5 h-3.5" />}
        />
        <KpiCard
          label="Techcombank 22226060"
          value={fmtVnd(bankBalance)}
          subtext="Gach no tu dong VietQR"
          borderColor="border-l-emerald-500"
          iconBg="bg-emerald-100 dark:bg-emerald-950 text-emerald-600"
          icon={<Wallet className="w-3.5 h-3.5" />}
        />
      </div>
      <Launchpad />
      <TasksWidget tasks={tasks} />
    </div>
  );
}
