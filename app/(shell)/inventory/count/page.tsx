"use client";

import * as React from "react";
import {
  PackageSearch,
  ScanBarcode,
  ClipboardCheck,
  CheckCircle2,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
  RefreshCw,
  Snowflake,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// ────────────────────────────────────────────────────────────────────────────────
// TYPES (duplicated from package for client isolation)
// ────────────────────────────────────────────────────────────────────────────────

type StocktakeZone = "kho_kho" | "kho_dong" | "all";
type VarianceReason = "hao_hut_tu_nhien" | "rach_bao_bi" | "het_han" | "that_thoat" | "khac";

interface StocktakeLine {
  id: string;
  sku: string;
  productName: string;
  zone: string;
  theoreticalQty: number;
  countedQty: number;
  varianceQty: number;
  varianceValue: number;
  unitPrice: number;
  reason: VarianceReason | null;
  note?: string;
}

interface StocktakeSession {
  id: string;
  code: string;
  zone: StocktakeZone;
  status: "draft" | "confirmed";
  lines: StocktakeLine[];
  createdAt: string;
  confirmedAt?: string;
  createdBy: string;
}

const REASON_LABELS: Record<VarianceReason, string> = {
  hao_hut_tu_nhien: "Hao hụt tự nhiên",
  rach_bao_bi: "Rách bao bì",
  het_han: "Hết hạn sử dụng",
  that_thoat: "Thất thoát/Mất mát",
  khac: "Lý do khác",
};

const ZONE_LABELS: Record<StocktakeZone, string> = {
  kho_kho: "Kho khô thường (Thường)",
  kho_dong: "Kho đông (Hầm đông -18°C / Kho mát 0–4°C)",
  all: "Tất cả khu vực",
};

function formatCurrency(v: number): string {
  const sign = v < 0 ? "-" : v > 0 ? "+" : "";
  return `${sign}${Math.abs(v).toLocaleString("vi-VN")} ₫`;
}

function VarianceBadge({ qty, value }: { qty: number; value: number }) {
  if (qty === 0) return <span className="inline-flex items-center gap-1 text-muted-foreground text-xs"><Minus className="w-3.5 h-3.5" />Không lệch</span>;
  const isShort = qty < 0;
  const cls = isShort ? "text-rose-600 bg-rose-50 border-rose-200" : "text-emerald-600 bg-emerald-50 border-emerald-200";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-bold ${cls}`}>
      {isShort ? <ArrowDownRight className="w-3.5 h-3.5" /> : <ArrowUpRight className="w-3.5 h-3.5" />}
      {isShort ? `Thiếu ${Math.abs(qty)}` : `Thừa ${qty}`} · {formatCurrency(value)}
    </span>
  );
}

// ────────────────────────────────────────────────────────────────────────────────
// PAGE
// ────────────────────────────────────────────────────────────────────────────────

export default function InventoryCountPage() {
  const [activeZone, setActiveZone] = React.useState<StocktakeZone>("all");
  const [skuInput, setSkuInput] = React.useState("");
  const [countedInput, setCountedInput] = React.useState("");
  const [reasonInput, setReasonInput] = React.useState<VarianceReason | "">("");
  const [draftLines, setDraftLines] = React.useState<Array<{ sku: string; countedQty: number; reason: VarianceReason | null }>>([]);
  const [sessions, setSessions] = React.useState<StocktakeSession[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [confirmingId, setConfirmingId] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);
  const [historyLoading, setHistoryLoading] = React.useState(false);

  const fetchSessions = React.useCallback(async () => {
    setHistoryLoading(true);
    try {
      const r = await fetch("/api/inventory/count");
      const d = await r.json();
      if (d.success) setSessions(d.sessions || []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setHistoryLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleAddLine = () => {
    const sku = skuInput.trim().toUpperCase();
    const counted = Number(countedInput);
    if (!sku) {
      setToast("Nhập barcode / SKU trước");
      return;
    }
    if (!Number.isFinite(counted) || counted < 0) {
      setToast("Số lượng thực tế không hợp lệ");
      return;
    }
    const reason = reasonInput || null;
    setDraftLines((prev) => {
      const idx = prev.findIndex((l) => l.sku === sku);
      if (idx !== -1) {
        const next = [...prev];
        next[idx] = { ...next[idx], countedQty: counted, reason: reason as VarianceReason | null };
        return next;
      }
      return [...prev, { sku, countedQty: counted, reason: reason as VarianceReason | null }];
    });
    setSkuInput("");
    setCountedInput("");
    setReasonInput("");
  };

  const onSkuKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddLine();
    }
  };

  const removeDraftLine = (sku: string) => {
    setDraftLines((prev) => prev.filter((l) => l.sku !== sku));
  };

  const handleCreateSession = async () => {
    if (draftLines.length === 0) {
      setToast("Chưa có dòng nào — thêm SKU trước");
      return;
    }
    setSubmitting(true);
    try {
      const r = await fetch("/api/inventory/count", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ zone: activeZone, lines: draftLines }),
      });
      const d = await r.json();
      if (d.success) {
        setToast(`Đã lập phiên ${d.session.code} · ${draftLines.length} dòng`);
        setDraftLines([]);
        fetchSessions();
      } else {
        setToast(d.error || "Lỗi tạo phiên");
      }
    } catch (e: unknown) {
      setToast(e instanceof Error ? e.message : String(e));
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmSession = async (sessionId: string) => {
    setConfirmingId(sessionId);
    try {
      const r = await fetch("/api/inventory/count", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const d = await r.json();
      if (d.success) {
        setToast(d.message || "Đã xác nhận & cân chỉnh tồn kho");
        fetchSessions();
      } else {
        setToast(d.error || "Lỗi xác nhận");
      }
    } catch (e: unknown) {
      setToast(e instanceof Error ? e.message : String(e));
    } finally {
      setConfirmingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-emerald-600" /> Kiểm kê Kho Định Công
          </h1>
          <p className="text-xs text-muted-foreground">
            Thủ kho: Trần Thị Ngọc Thúy · Hầm đông B1–C2 (-18°C) · Kho mát M1–M4 (0–4°C) · Kệ kho khô K1–Y3
          </p>
        </div>
        <Button variant="outline" size="sm" className="rounded-full" onClick={fetchSessions} disabled={historyLoading || loading}>
          <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${historyLoading ? "animate-spin" : ""}`} /> Làm mới
        </Button>
      </div>

      {/* Zone tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <Tabs value={activeZone} onValueChange={(v) => setActiveZone(v as StocktakeZone)} className="w-full">
          <TabsList className="rounded-full border">
            <TabsTrigger value="all" className="rounded-full text-xs">Tất cả khu vực</TabsTrigger>
            <TabsTrigger value="kho_dong" className="rounded-full text-xs flex items-center gap-1"><Snowflake className="w-3.5 h-3.5 text-sky-500" />Kho đông / Kho mát</TabsTrigger>
            <TabsTrigger value="kho_kho" className="rounded-full text-xs flex items-center gap-1"><Package className="w-3.5 h-3.5 text-amber-600" />Kho khô thường</TabsTrigger>
          </TabsList>
          <p className="text-[11px] text-muted-foreground mt-2">{ZONE_LABELS[activeZone]}</p>
        </Tabs>
      </div>

      {/* Input barcode / SKU */}
      <Card className="rounded-2xl border">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ScanBarcode className="w-4 h-4 text-sky-600" /> Thêm dòng kiểm kê (Barcode / SKU)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_140px_200px_auto] gap-2 items-end">
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Barcode / SKU</label>
              <Input
                value={skuInput}
                onChange={(e) => setSkuInput(e.target.value)}
                onKeyDown={onSkuKeyDown}
                placeholder="Quét mã vạch hoặc nhập SKU, nhấn Enter"
                className="h-9 text-xs font-mono"
              />
              <p className="text-[10px] text-muted-foreground">Nhấn Enter để thêm dòng</p>
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Tồn thực tế</label>
              <Input
                type="number"
                min={0}
                value={countedInput}
                onChange={(e) => setCountedInput(e.target.value)}
                placeholder="SL đếm được"
                className="h-9 text-xs"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-muted-foreground">Lý do hao hụt</label>
              <select
                value={reasonInput}
                onChange={(e) => setReasonInput(e.target.value as VarianceReason | "")}
                className="w-full h-9 rounded-lg border px-3 text-xs bg-background"
              >
                <option value="">— Chưa chọn —</option>
                {Object.entries(REASON_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <Button
              type="button"
              size="sm"
              className="rounded-full bg-sky-600 text-white h-9 px-5"
              onClick={handleAddLine}
            >
              Thêm dòng
            </Button>
          </div>

          {draftLines.length > 0 && (
            <div className="rounded-xl border bg-muted/20 p-2">
              <p className="text-[11px] font-semibold text-muted-foreground mb-1.5">Nháp — {draftLines.length} dòng sẽ được tạo thành phiên SK-KK</p>
              <div className="space-y-1">
                {draftLines.map((l) => (
                  <div key={l.sku} className="flex items-center justify-between rounded-lg border bg-white px-3 py-1.5 text-xs">
                    <span className="font-mono font-bold">{l.sku}</span>
                    <span className="text-muted-foreground">Thực tế: <span className="font-mono font-semibold">{l.countedQty}</span></span>
                    {l.reason && <Badge variant="outline" className="text-[10px]">{REASON_LABELS[l.reason as VarianceReason]}</Badge>}
                    <Button variant="ghost" size="sm" className="h-6 text-xs rounded-full" onClick={() => removeDraftLine(l.sku)}>Xóa</Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Button
              type="button"
              size="sm"
              className="rounded-full bg-emerald-600 text-white"
              disabled={draftLines.length === 0 || submitting}
              onClick={handleCreateSession}
            >
              <ClipboardCheck className="w-3.5 h-3.5 mr-1.5" />{submitting ? "Đang tạo..." : "Tạo phiên kiểm kê (SK-KK)"}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Sessions history */}
      <Card className="rounded-2xl border">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <PackageSearch className="w-4 h-4 text-emerald-600" /> Lịch sử phiên kiểm kê
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Đang tải...</div>
          ) : sessions.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">Chưa có phiên kiểm kê nào.</div>
          ) : (
            <div className="divide-y">
              {sessions.map((s) => (
                <div key={s.id} className="p-3 sm:p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-mono text-xs font-bold text-sky-700 flex items-center flex-wrap gap-1.5">
                        {s.code}
                        <Badge variant={s.status === "confirmed" ? "default" : "outline"} className={`text-[10px] rounded-full ${s.status === "confirmed" ? "bg-emerald-600" : "border-amber-300 text-amber-700 bg-amber-50"}`}>
                          {s.status === "confirmed" ? "Đã xác nhận" : "Nháp"}
                        </Badge>
                        <Badge variant="outline" className="text-[10px] font-normal">
                          {s.zone === "all" ? "Tất cả" : s.zone === "kho_dong" ? "Kho đông/mát" : "Kho khô"}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{new Date(s.createdAt).toLocaleString("vi-VN")} · {s.createdBy}</p>
                    </div>
                    {s.status === "draft" ? (
                      <Button
                        size="sm"
                        className="rounded-full bg-emerald-600 text-white text-xs h-8"
                        onClick={() => handleConfirmSession(s.id)}
                        disabled={confirmingId === s.id}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />{confirmingId === s.id ? "Đang xử lý..." : "Xác nhận & Cân chỉnh tồn kho"}
                      </Button>
                    ) : (
                      <span className="text-[11px] text-emerald-600 flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />Đã cân chỉnh{s.confirmedAt ? ` · ${new Date(s.confirmedAt).toLocaleString("vi-VN")}` : ""}</span>
                    )}
                  </div>

                  {s.lines.length > 0 && (
                    <div className="mt-3 overflow-x-auto rounded-xl border">
                      <table className="w-full text-xs">
                        <thead className="bg-muted/60 text-[11px] text-muted-foreground border-b">
                          <tr>
                            <th className="px-3 py-2 text-left">SKU &amp; Tên</th>
                            <th className="px-3 py-2 text-right">Tồn lý thuyết</th>
                            <th className="px-3 py-2 text-right">Tồn thực tế</th>
                            <th className="px-3 py-2 text-center">Lệch</th>
                            <th className="px-3 py-2 text-right">Giá trị VNĐ</th>
                            <th className="px-3 py-2 text-left">Lý do</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {s.lines.map((l) => (
                            <tr key={l.id} className="hover:bg-muted/20">
                              <td className="px-3 py-2">
                                <div className="font-mono font-bold">{l.sku}</div>
                                <div className="text-[11px] text-muted-foreground leading-tight">{l.productName}</div>
                              </td>
                              <td className="px-3 py-2 text-right font-mono">{l.theoreticalQty}</td>
                              <td className="px-3 py-2 text-right">
                                <span className="font-mono font-bold">{l.countedQty}</span>
                              </td>
                              <td className="px-3 py-2 text-center">
                                <VarianceBadge qty={l.varianceQty} value={l.varianceValue} />
                              </td>
                              <td className="px-3 py-2 text-right font-mono">
                                <span className={l.varianceValue < 0 ? "text-rose-600" : l.varianceValue > 0 ? "text-emerald-600" : ""}>
                                  {formatCurrency(l.varianceValue)}
                                </span>
                              </td>
                              <td className="px-3 py-2">
                                {l.reason ? (
                                  <Badge variant="outline" className="text-[10px] bg-amber-50 border-amber-200 text-amber-700">
                                    {REASON_LABELS[l.reason]}
                                  </Badge>
                                ) : (
                                  <span className="text-[11px] text-muted-foreground">—</span>
                                )}
                                {l.note && <div className="text-[10px] text-muted-foreground mt-0.5">{l.note}</div>}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-foreground text-background text-sm px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 whitespace-pre-wrap max-w-[min(90vw,420px)]">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />{toast}
        </div>
      )}
    </div>
  );
}
