"use client";
import * as React from "react";

interface KpiCardProps {
  label: string;
  value: string;
  subtext: string;
  subtextColor?: string;
  borderColor: string;
  icon: React.ReactNode;
  iconBg: string;
}

export default function KpiCard({ label, value, subtext, subtextColor = "text-muted-foreground", borderColor, icon, iconBg }: KpiCardProps) {
  return (
    <div className={`clay-card p-4 space-y-1 border-l-4 ${borderColor}`}>
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className={`h-7 w-7 rounded-full flex items-center justify-center ${iconBg}`}>{icon}</span>
      </div>
      <div className="font-mono text-xl font-black tracking-tight">{value}</div>
      <div className={`text-[10px] font-semibold flex items-center gap-1 ${subtextColor}`}>{subtext}</div>
    </div>
  );
}
