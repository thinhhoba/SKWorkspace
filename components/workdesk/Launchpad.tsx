"use client";
import Link from "next/link";
import { Store, QrCode, Package, FileCheck } from "lucide-react";

export default function Launchpad() {
  return (
    <div className="clay-card p-4 space-y-3">
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">Phim tat tac vu nhanh (1-Click)</span>
      <div className="grid grid-cols-2 gap-2 text-xs font-bold">
        <Link href="/pos" className="p-2.5 rounded-xl border border-sky-200 bg-sky-50/60 dark:bg-sky-950/20 hover:border-sky-400 flex flex-col items-center justify-center text-center gap-1 text-sky-700 dark:text-sky-300 transition-all">
          <Store className="w-4 h-4" /><span>Quay POS</span>
        </Link>
        <Link href="/dathang" className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20 hover:border-emerald-400 flex flex-col items-center justify-center text-center gap-1 text-emerald-700 dark:text-emerald-300 transition-all">
          <QrCode className="w-4 h-4" /><span>Web Order B2B</span>
        </Link>
        <Link href="/sales" className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 hover:border-amber-400 flex flex-col items-center justify-center text-center gap-1 text-amber-700 dark:text-amber-300 transition-all">
          <Package className="w-4 h-4" /><span>Soan Kho FEFO</span>
        </Link>
        <Link href="/finance/sapo2misa" className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 dark:bg-purple-950/20 hover:border-purple-400 flex flex-col items-center justify-center text-center gap-1 text-purple-700 dark:text-purple-300 transition-all">
          <FileCheck className="w-4 h-4" /><span>Sapo2MISA 63 Cot</span>
        </Link>
      </div>
    </div>
  );
}
