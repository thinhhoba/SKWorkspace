export default function PwaGiaoVanPage() {
  return (
    <>
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="flex justify-between border-b px-3 py-2">
          <span className="text-xs font-bold">SO-1021 — An Thịnh Mart</span>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-[10px] font-bold text-amber-600 dark:border-amber-900 dark:bg-amber-950/30">Chờ giao</span>
        </div>
        <div className="p-3">
          <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
            <span>SKU</span>
            <span>SL · Tiền</span>
          </div>
          <div className="mt-1 flex min-h-[44px] items-center justify-between border-t py-2 text-sm">
            <span>Bò viên 1kg</span>
            <span className="font-mono font-bold">20 · 1.760.000</span>
          </div>
          <div className="mt-2 flex gap-2">
            <button className="tap-target flex min-h-[44px] flex-1 items-center justify-center rounded-full border bg-card px-3 font-mono text-xs font-bold">Báo giá</button>
            <button className="tap-target flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-emerald-600 px-3 font-mono text-xs font-bold text-white">Giao</button>
          </div>
        </div>
      </div>
      <div className="rounded-lg border bg-card p-4 text-center">
        <div className="font-mono text-2xl font-bold">08:04</div>
        <div className="font-mono text-[11px] text-muted-foreground">07/10/2026 — Ca sáng · Vào 07:58 — Đúng giờ</div>
        <button className="tap-target mt-2 flex min-h-[44px] w-full items-center justify-center rounded-full bg-emerald-600 font-mono text-xs font-bold text-white">✓ Check-in GPS</button>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 dark:border-emerald-900 dark:bg-emerald-950/30">
        <span className="h-2 w-2 rounded-full bg-emerald-500" />
        <div>
          <div className="text-xs font-bold">Online</div>
          <div className="font-mono text-[11px] text-muted-foreground">GPS · last_synced 08:14</div>
        </div>
      </div>
    </>
  );
}
