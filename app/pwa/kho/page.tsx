import { QrViewport } from "../_components/QrViewport";

export default function PwaKhoPage() {
  return (
    <>
      <div className="overflow-hidden rounded-lg border bg-card">
        <div className="flex justify-between border-b px-3 py-2">
          <span className="text-xs font-bold">PR-0412 — An Thịnh Food</span>
          <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-1 font-mono text-[10px] font-bold text-amber-600 dark:border-amber-900 dark:bg-amber-950/30">Chờ duyệt</span>
        </div>
        <div className="p-3">
          <div className="font-mono text-xs">Tổng: <b>38.200.000 ₫</b></div>
          <div className="mt-2">
            <QrViewport />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 dark:border-amber-900 dark:bg-amber-950/30">
        <span className="text-amber-600">◍</span>
        <div>
          <div className="text-xs font-bold">Offline cache</div>
          <div className="font-mono text-[11px] text-muted-foreground">Tạo QR offline — sẽ đồng bộ khi có mạng</div>
        </div>
      </div>
    </>
  );
}
