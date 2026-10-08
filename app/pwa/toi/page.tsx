export default function PwaToiPage() {
  return (
    <>
      <div className="rounded-lg border bg-card p-4 text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/assets/logo-sk-circle.png" alt="SK" className="mx-auto h-10 w-10 rounded-full border object-cover" width={40} height={40} />
        <div className="mt-2 text-sm font-extrabold">SK Workspace</div>
        <div className="font-mono text-[11px] text-muted-foreground">Cty TNHH Thực Phẩm Sơn Khang</div>
      </div>
      <div className="rounded-lg border bg-card p-4 text-center">
        <div className="font-mono text-2xl font-bold">08:04</div>
        <div className="font-mono text-[11px] text-muted-foreground">07/10/2026 — Ca sáng · Vào 07:58 — Đúng giờ</div>
        <button className="tap-target mt-2 flex min-h-[44px] w-full items-center justify-center rounded-full bg-emerald-600 font-mono text-xs font-bold text-white">✓ Check-in GPS</button>
      </div>
      <div className="space-y-2">
        <div className="font-mono text-[10px] font-bold tracking-widest text-muted-foreground">Cài đặt</div>
        <button className="tap-target flex min-h-[44px] w-full items-center justify-between rounded-lg border bg-card px-3 text-sm">
          Đăng xuất <span className="text-muted-foreground">→</span>
        </button>
      </div>
    </>
  );
}
