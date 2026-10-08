"use client";
import * as React from "react";
import dynamic from "next/dynamic";
import { Check, Circle, ArrowRight, Table2, Eye, EyeOff, Download, Copy, ChevronDown, ChevronUp, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MAPPING_ROWS } from "@/constants/misaColumns";

const MisaGrid = dynamic(() => import("./_components/MisaGrid"), { ssr: false, loading: () => <div className="h-[300px] grid place-items-center text-sm text-muted-foreground">Đang tải lưới…</div> });

type StepStatus = "done" | "current" | "wait";
type Step = { title: string; desc: string; status: StepStatus };

const STEPS: Step[] = [
  { title: "Sapo pull & đồng bộ", desc: "Sapo API · last_synced_at · external_id", status: "done" },
  { title: "Chuẩn hóa CentralOrders", desc: "Map MST (gdt.gov.vn) & SKU → MISA", status: "current" },
  { title: "Sinh Excel 63 cột", desc: "Ledger chống trùng · kiểm tra 63 cột", status: "wait" },
  { title: "Đẩy MISA & phát hành", desc: "Import AMIS · meInvoice · đối soát", status: "wait" },
];

const LOGS: { level: "INFO" | "OK" | "WARN" | "RUN"; text: string }[] = [
  { level: "INFO", text: "[08:14:02] [INFO] Kết nối Sapo API — token OK" },
  { level: "OK", text: "[08:14:05] [OK] Pull 48 đơn incremental (last_synced_at 07/10)" },
  { level: "OK", text: "[08:14:07] [OK] Map SKU · Sapo Variant → MISA Vật tư" },
  { level: "WARN", text: "[08:14:09] [WARN] MST rỗng: SP-0839 (SaiGon Fresh) — cần bổ sung" },
  { level: "WARN", text: "[08:14:10] [WARN] SKU chưa map: UNKNOWN-SKU (SP-0838)" },
  { level: "RUN", text: "[08:14:12] [RUN] Kiểm tra trùng external_id — phát hiện 1 trùng (SP-0841)" },
  { level: "OK", text: "[08:14:20] [OK] RBAC hasAppAccess('sapo2misa') — allow" },
  { level: "INFO", text: "[08:14:24] [INFO] Sẵn sàng xuất MISA AMIS — còn 2m 14s" },
];

function Stepper({ steps }: { steps: Step[] }) {
  return (
    <>
      {/* desktop horizontal */}
      <div className="hidden md:flex items-start gap-0">
        {steps.map((s, i) => (
          <React.Fragment key={s.title}>
            <div className="flex flex-1 flex-col items-center text-center gap-2">
              <div
                className={
                  s.status === "done"
                    ? "w-9 h-9 rounded-full grid place-items-center bg-emerald-600 text-white"
                    : s.status === "current"
                      ? "w-9 h-9 rounded-full grid place-items-center bg-sky-500 text-white ring-4 ring-sky-100"
                      : "w-9 h-9 rounded-full grid place-items-center bg-muted text-muted-foreground border"
                }
              >
                {s.status === "done" ? <Check className="w-4 h-4" /> : s.status === "current" ? <Circle className="w-4 h-4 fill-white" /> : <span className="text-xs font-bold">{i + 1}</span>}
              </div>
              <div className="text-xs font-semibold leading-tight">{s.title}</div>
              <div className="text-[11px] text-muted-foreground leading-tight">{s.desc}</div>
              <Badge variant={s.status === "done" ? "success" : s.status === "current" ? "default" : "outline"} className="text-[10px] capitalize">
                {s.status === "done" ? "Hoàn tất" : s.status === "current" ? "Đang xử lý" : "Chờ"}
              </Badge>
            </div>
            {i < steps.length - 1 && (
              <div className="flex-1 h-px bg-border mt-4 mx-2 hidden lg:block" />
            )}
          </React.Fragment>
        ))}
      </div>
      {/* mobile vertical */}
      <div className="flex md:hidden flex-col gap-4">
        {steps.map((s, i) => (
          <div key={s.title} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div
                className={
                  s.status === "done"
                    ? "w-8 h-8 rounded-full grid place-items-center bg-emerald-600 text-white shrink-0"
                    : s.status === "current"
                      ? "w-8 h-8 rounded-full grid place-items-center bg-sky-500 text-white ring-4 ring-sky-100 shrink-0"
                      : "w-8 h-8 rounded-full grid place-items-center bg-muted text-muted-foreground border shrink-0"
                }
              >
                {s.status === "done" ? <Check className="w-3.5 h-3.5" /> : s.status === "current" ? <Circle className="w-3.5 h-3.5 fill-white" /> : <span className="text-xs font-bold">{i + 1}</span>}
              </div>
              {i < steps.length - 1 && <div className="w-px flex-1 bg-border mt-1" />}
            </div>
            <div className="pb-4">
              <div className="text-sm font-semibold">{s.title}</div>
              <div className="text-xs text-muted-foreground">{s.desc}</div>
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
  const [termFilter, setTermFilter] = React.useState<"ALL" | "INFO" | "OK" | "WARN" | "RUN">("ALL");
  const [toast, setToast] = React.useState<string | null>(null);
  const logRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (termOpen && logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [termOpen, termFilter]);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2500);
    return () => clearTimeout(t);
  }, [toast]);

  const filteredLogs = LOGS.filter((l) => termFilter === "ALL" || l.level === termFilter);

  return (
    <div className="space-y-4">
      {/* header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight">Sapo2Misa — Đồng bộ 63 cột</h1>
          <p className="text-xs text-muted-foreground">Sapo ↔ Data Hub ↔ MISA AMIS · 1/14 app · Tài chính</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm"><Table2 /> Mapping</Button>
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
              <div className="rounded-lg border p-3 mono text-[11px] leading-relaxed bg-muted/40">Adapter <code>packages/integrations/misa</code> · sync/push/pull/webhook · integration_logs</div>
            </DialogContent>
          </Dialog>
          <Button size="sm" onClick={() => setToast("Đã xuất Excel 63 cột — kiểm tra thư mục tải về")}>
            <Download /> Xuất Excel
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">Tiến trình 4 bước <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" /></CardTitle>
        </CardHeader>
        <CardContent>
          <Stepper steps={STEPS} />
        </CardContent>
      </Card>

      {/* grid toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input placeholder="Lọc Số CT / Tên KH / SKU…" value={filter} onChange={(e) => setFilter(e.target.value)} className="pl-8 h-9" />
        </div>
        <Button variant="outline" size="sm" onClick={() => setShowAllCols((v) => !v)} className="shrink-0">
          {showAllCols ? <EyeOff /> : <Eye />} {showAllCols ? "Thu gọn 12 cột" : "Hiện đủ 63 cột"}
        </Button>
        <span className="text-xs text-muted-foreground">{showAllCols ? "63" : "12"}/63 cột · ghim 2 cột đầu</span>
      </div>

      <MisaGrid showAllCols={showAllCols} filterText={filter} />

      {/* terminal drawer — default closed */}
      <Card>
        <button
          onClick={() => setTermOpen((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-muted/40 rounded-t-xl"
        >
          <span className="text-sm font-semibold flex items-center gap-2">Nhật ký đồng bộ <Badge variant="secondary" className="mono text-[10px]">{LOGS.length} dòng</Badge></span>
          {termOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        {termOpen && (
          <CardContent className="pt-0 space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {(["ALL", "INFO", "OK", "WARN", "RUN"] as const).map((lvl) => (
                <Button
                  key={lvl}
                  variant={termFilter === lvl ? "default" : "outline"}
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => setTermFilter(lvl)}
                >
                  {lvl}
                </Button>
              ))}
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs ml-auto"
                onClick={() => {
                  navigator.clipboard.writeText(filteredLogs.map((l) => l.text).join("\n"));
                  setToast("Đã copy log");
                }}
              >
                <Copy /> Copy
              </Button>
            </div>
            <div ref={logRef} className="rounded-lg bg-zinc-950 text-zinc-100 mono text-[11px] leading-relaxed p-3 max-h-[180px] overflow-auto">
              {filteredLogs.map((l, i) => (
                <div
                  key={i}
                  className={
                    l.level === "WARN" ? "text-amber-300" : l.level === "OK" ? "text-emerald-300" : l.level === "RUN" ? "text-sky-300" : "text-zinc-300"
                  }
                >
                  {l.text}
                </div>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-foreground text-background text-sm px-4 py-2.5 rounded-lg shadow-lg flex items-center gap-2">
          <Check className="w-4 h-4" /> {toast}
        </div>
      )}
    </div>
  );
}
