"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import {
  Check,
  Circle,
  ArrowRight,
  Table2,
  Eye,
  EyeOff,
  Download,
  Copy,
  ChevronDown,
  ChevronUp,
  Search,
  RefreshCw,
  History,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MAPPING_ROWS } from "@/constants/misaColumns";
import type { MisaRow } from "./_components/MisaGrid";

const MisaGrid = dynamic(() => import("./_components/MisaGrid"), {
  ssr: false,
  loading: () => <div className="h-[300px] grid place-items-center text-sm text-muted-foreground">Đang tải lưới…</div>
});

type StepStatus = "done" | "current" | "wait";
type Step = { title: string; desc: string; status: StepStatus };

const INITIAL_STEPS: Step[] = [
  { title: "Sapo pull & đồng bộ", desc: "Sapo API · last_synced_at · external_id", status: "done" },
  { title: "Chuẩn hóa CentralOrders", desc: "Map MST (gdt.gov.vn) & SKU → MISA", status: "current" },
  { title: "Sinh Excel 63 cột", desc: "Ledger chống trùng · kiểm tra 63 cột", status: "wait" },
  { title: "Đẩy MISA & phát hành", desc: "Import AMIS · meInvoice · đối soát", status: "wait" },
];

interface LogItem {
  level: "INFO" | "OK" | "WARN" | "RUN" | "ERR";
  text: string;
}

const INITIAL_LOGS: LogItem[] = [
  { level: "INFO", text: "[08:14:02] [INFO] Kết nối Sapo API — xác thực thành công" },
  { level: "OK", text: "[08:14:05] [OK] Sẵn sàng kéo đơn hàng mới nhất từ hệ thống Sơn Khang" },
  { level: "INFO", text: "[08:14:10] [INFO] Bấm 'Đồng bộ Sapo' để cập nhật đơn mới và thẩm định 63 cột" },
];

function Stepper({ steps }: { steps: Step[] }) {
  const doneCount = steps.filter((s) => s.status === "done").length;
  const currentIdx = steps.findIndex((s) => s.status === "current");
  const progressPct = ((doneCount + (currentIdx >= 0 ? 0.5 : 0)) / steps.length) * 100;

  return (
    <>
      {/* desktop horizontal */}
      <div className="hidden md:block">
        <div className="relative flex items-start gap-0">
          <div className="absolute left-[48px] right-[48px] top-[18px] h-2 rounded-full bg-muted shadow-inner overflow-hidden hidden lg:block">
            <div
              className="h-full rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)] transition-all duration-500"
              style={{ width: `${progressPct}%`, background: "linear-gradient(90deg,#0284C7,#38BDF8)" }}
            />
          </div>
          {steps.map((s, i) => (
            <div key={s.title} className="flex flex-1 flex-col items-center text-center gap-2 relative">
              <div
                className={
                  s.status === "done"
                    ? "w-9 h-9 rounded-full grid place-items-center bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border border-white/80 shadow-[0_4px_12px_rgba(16,185,129,0.35),inset_0_1px_0_rgba(255,255,255,0.9)]"
                    : s.status === "current"
                      ? "w-9 h-9 rounded-full grid place-items-center bg-gradient-to-br from-sky-500 to-sky-600 text-white border border-white/80 shadow-[0_4px_12px_rgba(14,165,233,0.4),inset_0_1px_0_rgba(255,255,255,0.9)] ring-4 ring-sky-100 dark:ring-sky-900/40"
                      : "w-9 h-9 rounded-full grid place-items-center glossy-pill text-muted-foreground"
                }
              >
                {s.status === "done" ? <Check className="w-4 h-4" /> : s.status === "current" ? <Circle className="w-4 h-4 fill-white" /> : <span className="text-xs font-bold">{i + 1}</span>}
              </div>
              <div className={`glossy-pill px-3 py-1.5 ${s.status === "current" ? "bg-sky-50 border-sky-200 dark:bg-sky-900/30" : ""}`}>
                <div className="text-xs font-semibold leading-tight">{s.title}</div>
                <div className="text-[11px] text-muted-foreground leading-tight">{s.desc}</div>
              </div>
              <Badge variant={s.status === "done" ? "success" : s.status === "current" ? "default" : "outline"} className="text-[10px] capitalize rounded-full">
                {s.status === "done" ? "Hoàn tất" : s.status === "current" ? "Đang xử lý" : "Chờ"}
              </Badge>
            </div>
          ))}
        </div>
      </div>
      {/* mobile vertical */}
      <div className="flex md:hidden flex-col gap-4">
        {steps.map((s, i) => (
          <div key={s.title} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={
                  s.status === "done"
                    ? "w-8 h-8 rounded-full grid place-items-center bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border border-white/80 shadow-[0_4px_10px_rgba(16,185,129,0.3)] shrink-0"
                    : s.status === "current"
                      ? "w-8 h-8 rounded-full grid place-items-center bg-gradient-to-br from-sky-500 to-sky-600 text-white border border-white/80 shadow-[0_4px_10px_rgba(14,165,233,0.35)] ring-4 ring-sky-100 shrink-0"
                      : "w-8 h-8 rounded-full grid place-items-center glossy-pill text-muted-foreground shrink-0"
                }
              >
                {s.status === "done" ? <Check className="w-3.5 h-3.5" /> : s.status === "current" ? <Circle className="w-3.5 h-3.5 fill-white" /> : <span className="text-xs font-bold">{i + 1}</span>}
              </div>
              {i < steps.length - 1 && (
                <div className="w-1 flex-1 rounded-full mt-1 min-h-[12px] bg-muted overflow-hidden">
                  <div className="w-full rounded-full" style={{ height: s.status === "done" ? "100%" : "40%", background: s.status === "done" ? "linear-gradient(180deg,#0284C7,#38BDF8)" : "transparent" }} />
                </div>
              )}
            </div>
            <div className="pb-2 flex-1">
              <div className="glossy-pill inline-block px-3 py-2">
                <div className="text-sm font-semibold">{s.title}</div>
                <div className="text-xs text-muted-foreground">{s.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

export default function Sapo2MisaPage() {
  const [showAllCols, setShowAllCols] = React.useState(false);
  const [filter, setFilter] = React.useState("");
  const [termOpen, setTermOpen] = React.useState(false);
  const [termFilter, setTermFilter] = React.useState<"ALL" | "INFO" | "OK" | "WARN" | "RUN" | "ERR">("ALL");
  const [toast, setToast] = React.useState<string | null>(null);
  const [steps, setSteps] = React.useState<Step[]>(INITIAL_STEPS);
  const [logs, setLogs] = React.useState<LogItem[]>(INITIAL_LOGS);
  const [rows, setRows] = React.useState<MisaRow[] | undefined>(undefined);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [isExporting, setIsExporting] = React.useState(false);
  const [ledgerModalOpen, setLedgerModalOpen] = React.useState(false);
  const [ledgerItems, setLedgerItems] = React.useState<any[]>([]);

  const logRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (termOpen && logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [termOpen, termFilter, logs]);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  // Thực hiện đồng bộ thật từ API
  const handleSync = async () => {
    setIsSyncing(true);
    setTermOpen(true);
    setSteps([
      { title: "Sapo pull & đồng bộ", desc: "Đang gọi Sapo API…", status: "current" },
      { title: "Chuẩn hóa CentralOrders", desc: "Map MST & SKU", status: "wait" },
      { title: "Sinh Excel 63 cột", desc: "Ledger chống trùng", status: "wait" },
      { title: "Đẩy MISA & phát hành", desc: "Import AMIS", status: "wait" },
    ]);

    try {
      const res = await fetch("/api/sapo2misa/sync", { method: "POST" });
      const data = await res.json();

      if (data.success && data.rows) {
        setRows(data.rows);

        const newLogs: LogItem[] = (data.logs || []).map((l: string) => {
          let lvl: LogItem["level"] = "INFO";
          if (l.includes("[OK]")) lvl = "OK";
          else if (l.includes("[WARN]")) lvl = "WARN";
          else if (l.includes("[ERR]")) lvl = "ERR";
          else if (l.includes("[RUN]")) lvl = "RUN";
          return { level: lvl, text: l };
        });

        setLogs(newLogs);

        setSteps([
          { title: "Sapo pull & đồng bộ", desc: `Đã kéo ${data.orders_count} đơn hàng`, status: "done" },
          { title: "Chuẩn hóa CentralOrders", desc: `Map ${data.rows_count} dòng vật tư`, status: "done" },
          { title: "Sinh Excel 63 cột", desc: "Kiểm tra 63 cột hoàn tất", status: "current" },
          { title: "Đẩy MISA & phát hành", desc: "Sẵn sàng xuất file AMIS", status: "wait" },
        ]);

        setToast(`Đã đồng bộ ${data.orders_count} đơn Sapo (${data.rows_count} dòng)`);
      } else {
        throw new Error(data.error || "Lỗi đồng bộ");
      }
    } catch (err: any) {
      setToast(`Lỗi: ${err.message}`);
      setLogs((prev) => [...prev, { level: "ERR", text: `[LỖI] ${err.message}` }]);
    } finally {
      setIsSyncing(false);
    }
  };

  // Thực hiện xuất file Excel thật và kích hoạt tải về máy
  const handleExportExcel = async () => {
    setIsExporting(true);
    try {
      const res = await fetch("/api/sapo2misa/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows })
      });

      if (!res.ok) throw new Error("Lỗi khi tải file từ server");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      a.href = url;
      a.download = `MISA_63COT_SONKHANG_${timestamp}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setSteps((prev) =>
        prev.map((s, idx) =>
          idx === 2
            ? { ...s, status: "done", desc: "Đã xuất file .xlsx" }
            : idx === 3
              ? { ...s, status: "done", desc: "Đã ghi nhận Ledger" }
              : s
        )
      );

      const now = new Date().toLocaleTimeString("vi-VN");
      setLogs((prev) => [
        ...prev,
        { level: "OK", text: `[${now}] [OK] Đã xuất file Excel 63 cột và ghi nhận vào Ledger chống trùng.` }
      ]);

      setToast("Đã tải xuống file Excel MISA 63 cột thành công!");
    } catch (err: any) {
      setToast(`Lỗi xuất Excel: ${err.message}`);
    } finally {
      setIsExporting(false);
    }
  };

  // Đọc danh sách Ledger
  const handleOpenLedger = async () => {
    setLedgerModalOpen(true);
    try {
      const res = await fetch("/api/sapo2misa/ledger");
      const data = await res.json();
      if (data.success) {
        setLedgerItems(data.ledger || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredLogs = logs.filter((l) => termFilter === "ALL" || l.level === termFilter);

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Sapo2Misa — Đồng bộ 63 cột</h1>
          <p className="text-xs text-muted-foreground">Sapo ↔ Data Hub ↔ MISA AMIS · 1/14 app · Tài chính Sơn Khang</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Nút Đồng bộ Sapo */}
          <Button
            variant="outline"
            size="sm"
            className="rounded-full glossy-pill"
            onClick={handleSync}
            disabled={isSyncing}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSyncing ? "animate-spin text-sky-500" : ""}`} />
            {isSyncing ? "Đang kéo đơn…" : "Đồng bộ Sapo"}
          </Button>

          {/* Dialog xem lịch sử Ledger */}
          <Button
            variant="outline"
            size="sm"
            className="rounded-full glossy-pill"
            onClick={handleOpenLedger}
          >
            <History className="w-3.5 h-3.5 mr-1.5" /> Lịch sử Ledger
          </Button>

          {/* Dialog xem cấu trúc Mapping 63 cột */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="rounded-full"><Table2 className="w-3.5 h-3.5 mr-1" /> Mapping</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader><DialogTitle className="text-sm">Xem trước mapping — Sapo → MISA 63 cột</DialogTitle></DialogHeader>
              <p className="mono text-[11px] text-muted-foreground">Ledger external_id · last_synced_at · chống trùng</p>
              <div className="overflow-auto rounded-lg border max-h-[60vh]">
                <table className="w-full text-xs">
                  <thead className="sticky top-0 bg-muted">
                    <tr className="text-muted-foreground text-[11px]">
                      <th className="text-left px-3 py-2 border-b">Sapo field</th>
                      <th className="text-left px-3 py-2 border-b">MISA cột</th>
                      <th className="text-left px-3 py-2 border-b">Ghi chú</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MAPPING_ROWS.map((r) => (
                      <tr key={r.sapo} className="border-b last:border-0">
                        <td className="mono px-3 py-2">{r.sapo}</td>
                        <td className="px-3 py-2">{r.misa}</td>
                        <td className="px-3 py-2 text-muted-foreground">{r.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="rounded-lg border p-3 mono text-[11px] leading-relaxed bg-muted/40">
                Adapter <code>packages/integrations/misa</code> · sync/push/pull/webhook · integration_logs
              </div>
            </DialogContent>
          </Dialog>

          {/* Nút Xuất Excel thật */}
          <Button
            size="sm"
            className="rounded-full shadow-[0_4px_12px_rgba(14,165,233,0.3)] bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white"
            onClick={handleExportExcel}
            disabled={isExporting}
          >
            <Download className={`w-3.5 h-3.5 mr-1.5 ${isExporting ? "animate-bounce" : ""}`} />
            {isExporting ? "Đang tạo Excel…" : "Xuất Excel 63 cột"}
          </Button>
        </div>
      </div>

      <div className="clay-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-sm font-semibold flex items-center gap-2">
            Tiến trình 4 bước <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
          </h2>
        </div>
        <Stepper steps={steps} />
      </div>

      {/* grid toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            placeholder="Lọc Số CT / Tên KH / SKU…"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="pl-8 h-9 rounded-full border-white/80 bg-white/90"
          />
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowAllCols((v) => !v)}
          className="shrink-0 rounded-full glossy-pill"
        >
          {showAllCols ? <EyeOff /> : <Eye />} {showAllCols ? "Thu gọn 12 cột" : "Hiện đủ 63 cột"}
        </Button>
        <span className="text-xs text-muted-foreground">
          {showAllCols ? "63" : "12"}/63 cột · ghim 2 cột đầu
        </span>
      </div>

      <div className="clay-card p-2 sm:p-3 overflow-hidden">
        <MisaGrid showAllCols={showAllCols} filterText={filter} rows={rows} />
      </div>

      {/* terminal drawer */}
      <div className="clay-card overflow-hidden">
        <button
          onClick={() => setTermOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-white/40 dark:hover:bg-white/5 transition-colors"
        >
          <span className="text-sm font-semibold flex items-center gap-2">
            Nhật ký đồng bộ{" "}
            <Badge variant="secondary" className="mono text-[10px] rounded-full">
              {logs.length} dòng
            </Badge>
          </span>
          {termOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {termOpen && (
          <div className="px-4 pb-4 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {(["ALL", "INFO", "OK", "WARN", "RUN", "ERR"] as const).map((lvl) => (
                <Button
                  key={lvl}
                  variant={termFilter === lvl ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs rounded-full"
                  onClick={() => setTermFilter(lvl)}
                >
                  {lvl}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs ml-auto rounded-full"
                onClick={() => {
                  navigator.clipboard.writeText(filteredLogs.map((l) => l.text).join("\n"));
                  setToast("Đã copy log");
                }}
              >
                <Copy className="w-3.5 h-3.5 mr-1" /> Copy
              </Button>
            </div>
            <div
              ref={logRef}
              className="rounded-xl bg-zinc-950 text-zinc-100 mono text-[11px] leading-relaxed p-3 max-h-[180px] overflow-auto border border-zinc-800"
            >
              {filteredLogs.map((l, i) => (
                <div
                  key={i}
                  className={
                    l.level === "ERR"
                      ? "text-rose-400 font-semibold"
                      : l.level === "WARN"
                        ? "text-amber-300"
                        : l.level === "OK"
                          ? "text-emerald-300"
                          : l.level === "RUN"
                            ? "text-sky-300"
                            : "text-zinc-300"
                  }
                >
                  {l.text}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dialog xem danh sách Ledger */}
      <Dialog open={ledgerModalOpen} onOpenChange={setLedgerModalOpen}>
        <DialogContent className="max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <History className="w-4 h-4 text-sky-500" /> Sổ cái Ledger chống trùng (sapo2misaLedgerDb)
            </DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Danh sách các mã đơn hàng (external_id) đã được xuất file Excel trước đó để ngăn chặn việc nhập trùng lặp vào MISA AMIS.
          </p>
          <div className="rounded-lg border overflow-auto max-h-[50vh]">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-muted text-[11px] text-muted-foreground">
                <tr>
                  <th className="px-3 py-2 text-left border-b">Mã đơn (External ID)</th>
                  <th className="px-3 py-2 text-left border-b">Khách hàng</th>
                  <th className="px-3 py-2 text-right border-b">Tổng tiền</th>
                  <th className="px-3 py-2 text-left border-b">Thời điểm xuất</th>
                </tr>
              </thead>
              <tbody>
                {ledgerItems.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-4 text-center text-muted-foreground">
                      Chưa có đơn hàng nào được ghi nhận.
                    </td>
                  </tr>
                ) : (
                  ledgerItems.map((item, idx) => (
                    <tr key={idx} className="border-b last:border-0">
                      <td className="px-3 py-2 font-mono font-bold text-sky-600">{item.external_id}</td>
                      <td className="px-3 py-2 truncate max-w-[150px]">{item.customer_name}</td>
                      <td className="px-3 py-2 text-right font-mono">
                        {Number(item.total_amount).toLocaleString("vi-VN")} đ
                      </td>
                      <td className="px-3 py-2 text-muted-foreground text-[10px]">
                        {new Date(item.exported_at).toLocaleString("vi-VN")}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </DialogContent>
      </Dialog>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-foreground text-background text-sm px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2">
          <Check className="w-4 h-4" /> {toast}
        </div>
      )}
    </div>
  );
}
