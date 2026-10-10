"use client";
import * as React from "react";
import Link from "next/link";
import { TrendingUp, Landmark, ArrowRight } from "lucide-react";

const fmt = (n: number) => n.toLocaleString("vi-VN");

interface FinanceWidgetProps {
  revenue?: number;
  bankBalance?: number;
}

export default function FinanceWidget({ revenue: propRevenue, bankBalance: propBalance }: FinanceWidgetProps) {
  const [revenue, setRevenue] = React.useState<number | undefined>(propRevenue);
  const [bankBalance, setBankBalance] = React.useState<number | undefined>(propBalance);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (propRevenue !== undefined && propBalance !== undefined) return;
    setLoading(true);
    fetch("/api/finance")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.stats) {
          if (propRevenue === undefined) setRevenue(d.stats.total_thu_month ?? 0);
          if (propBalance === undefined) setBankBalance(d.stats.balance_techcombank ?? 0);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [propRevenue, propBalance]);

  const rev = revenue ?? 0;
  const bal = bankBalance ?? 0;

  return (
    <div className="clay-card overflow-hidden">
      <div className="flex items-center justify-between p-5 pb-3">
        <h3 className="font-semibold text-sm">Tài chính</h3>
        <Link href="/finance" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
          Xem chi tiết <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="px-5 pb-5 space-y-3">
        {/* Revenue row - green */}
        <div className="flex items-center gap-3 rounded-2xl border border-emerald-200/60 bg-emerald-50/70 px-4 py-3 dark:bg-emerald-950/20 dark:border-emerald-800/40">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-sm shrink-0">
            <TrendingUp className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold tracking-widest text-muted-foreground">DOANH THU HÔM NAY</p>
            <p className="mono text-sm font-extrabold">{loading ? "..." : `${fmt(rev)} ₫`}</p>
          </div>
        </div>
        {/* Bank balance row - blue */}
        <div className="flex items-center gap-3 rounded-2xl border border-sky-200/60 bg-sky-50/70 px-4 py-3 dark:bg-sky-950/20 dark:border-sky-800/40">
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-white shadow-sm shrink-0">
            <Landmark className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-bold tracking-widest text-muted-foreground">TECHCOMBANK 22226060</p>
            <p className="mono text-sm font-extrabold">{loading ? "..." : `${fmt(bal)} ₫`}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
