import { QrViewport } from "./_components/QrViewport";

export default function PwaHomePage() {
  return (
    <>
      {/* Online card */}
      <div className="flex items-center gap-2 rounded-lg border bg-card p-2.5">
        <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-emerald-500" />
        <div>
          <div className="text-xs font-bold">Online</div>
          <div className="font-mono text-[11px] text-muted-foreground">Cache tới 08/10 08:00 · Sapo sync</div>
        </div>
        <span className="ml-auto rounded-full border bg-emerald-50 px-2 py-1 font-mono text-[10px] font-bold text-emerald-600 dark:bg-emerald-950/30">● Live</span>
      </div>

      <div className="flex min-h-[44px] items-center gap-2 rounded-full border bg-card px-3 text-xs text-muted-foreground">⌕ Tìm đơn, KH, NCC…</div>

      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-l-4 border-l-sky-500 bg-card p-3">
          <div className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">Doanh thu T10</div>
          <div className="mt-1 font-mono text-sm font-extrabold">1.842T ₫</div>
          <div className="font-mono text-[11px] text-emerald-600">↗ +8,4%</div>
        </div>
        <div className="rounded-lg border border-l-4 border-l-rose-500 bg-card p-3">
          <div className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">Công nợ</div>
          <div className="mt-1 font-mono text-sm font-extrabold">642T ₫</div>
          <div className="font-mono text-[11px] text-rose-600">12 quá hạn</div>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="flex items-center justify-between border-b px-3 py-2">
          <span className="text-xs font-bold">Kho lạnh Q7 / Q12</span>
          <span className="rounded-full border bg-muted px-2 py-1 font-mono text-[10px]">Sapo sync</span>
        </div>
        <div className="divide-y text-sm">
          <div className="flex min-h-[44px] items-center justify-between px-3 py-2">
            <span>Heo xay 500g</span>
            <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 font-mono text-xs font-bold text-rose-600 dark:border-rose-900 dark:bg-rose-950/30">Thiếu · 12</span>
          </div>
          <div className="flex min-h-[44px] items-center justify-between px-3 py-2">
            <span>Bò viên 1kg</span>
            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-xs font-bold text-amber-600 dark:border-amber-900 dark:bg-amber-950/30">Sắp thiếu · 60</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-3">
        <div className="mb-2 text-xs font-bold">Quét VietQR</div>
        <QrViewport />
      </div>
    </>
  );
}
