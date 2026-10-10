"use client";
import * as React from "react";
import { ShoppingBag, Wallet, Truck, BadgeCheck, RefreshCw, Zap, ArrowLeftRight, Printer, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const fmtVnd = (n: number) => Number(n).toLocaleString("vi-VN") + " ₫";
const fmtTime = (s?: string) => {
  if (!s) return "—";
  try { return new Date(s).toLocaleString("vi-VN", { hour: "2-digit", minute: "2-digit", day: "2-digit", month: "2-digit" }); } catch { return s; }
};

interface HubState {
  telemetry: { totalToday: number; revenueToday: number; chanhXePending: number; syncedMisa: number; pendingSync: number; rateLimit: string; shopDomain: string; liveConnected: boolean };
  orders: { id: number; code?: string; name?: string; order_number?: number; created_on?: string; created_at?: string; customer?: { name: string; phone?: string; address?: string }; total_price: number; financial_status?: string; note?: string }[];
}

export default function SapoLiveHubPage() {
  const [data, setData] = React.useState<HubState | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [actioning, setActioning] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  const fetchHub = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/sapo/hub");
      const j = await res.json();
      if (j.success) setData({ telemetry: j.telemetry, orders: j.orders });
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  React.useEffect(() => { fetchHub(); }, [fetchHub]);
  React.useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }, [toast]);

  const handlePull = async () => {
    setActioning("pull");
    try { await fetchHub(); setToast("Đã kéo đơn tức thì từ Sapo live"); } finally { setActioning(null); }
  };
  const handleEod = async () => {
    setActioning("eod");
    try {
      const res = await fetch("/api/sapo/cron/eod-accounting", { method: "POST" });
      const j = await res.json();
      setToast(j.message || j.error || (j.success ? "Đã đối soát MISA" : "Lỗi đối soát"));
      await fetchHub();
    } catch (e: unknown) { setToast(e instanceof Error ? e.message : "Lỗi"); } finally { setActioning(null); }
  };

  const t = data?.telemetry;

  return (
    <div className="space-y-5">
      {/* Header + Live badge */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-sky-500" /> Sapo Live Hub
          </h1>
          <p className="text-xs text-muted-foreground">sonkhang.mysapo.net — đơn live hôm nay → chành xe / MISA AMIS (KTT Hoàng Thị Nho)</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> Live Connected: sonkhang.mysapo.net (Cloudflare 1/40 calls/s)
          </span>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap gap-2">
        <Button onClick={handlePull} disabled={!!actioning} className="rounded-full bg-sky-600 hover:bg-sky-700 text-white glossy-btn">
          <Zap className={`w-4 h-4 ${actioning === "pull" ? "animate-pulse" : ""}`} /> Kéo đơn tức thì
        </Button>
        <Button variant="outline" onClick={handleEod} disabled={!!actioning} className="rounded-full glossy-pill">
          <ArrowLeftRight className="w-4 h-4" /> Đối soát MISA ngay
        </Button>
        <Button variant="outline" size="sm" className="rounded-full glossy-pill ml-auto" onClick={fetchHub} disabled={loading}>
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} /> Làm mới
        </Button>
      </div>

      {/* 4 Clay KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="clay-kpi clay-kpi--sky border-l-4 border-l-sky-500 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-muted-foreground">ĐƠN SAPO HÔM NAY</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-white border border-white/80 shadow-[0_4px_12px_rgba(14,165,233,0.35),inset_0_1px_1px_rgba(255,255,255,0.9)]"><ShoppingBag className="h-4 w-4" /></span>
          </div>
          <p className="text-xl font-extrabold tracking-tight">{t ? t.totalToday : loading ? "—" : "0"} <span className="text-xs font-semibold text-muted-foreground">đơn</span></p>
          <p className="text-xs text-muted-foreground">Live từ Sapo API</p>
        </div>
        <div className="clay-kpi border-l-4 border-l-emerald-500 p-4 space-y-1" style={{ boxShadow: "0 14px 28px -6px rgba(16,185,129,0.18), inset 0 2px 3px rgba(255,255,255,0.95)" }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-muted-foreground">DOANH THU TỨC THỜI</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white border border-white/80 shadow-[0_4px_12px_rgba(16,185,129,0.3),inset_0_1px_1px_rgba(255,255,255,0.9)]"><Wallet className="h-4 w-4" /></span>
          </div>
          <p className="text-lg font-extrabold tracking-tight font-mono text-emerald-600">{t ? fmtVnd(t.revenueToday) : loading ? "—" : fmtVnd(0)}</p>
          <p className="text-xs text-muted-foreground">Tổng tiền hôm nay</p>
        </div>
        <div className="clay-kpi clay-kpi--warning border-l-4 border-l-amber-500 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-muted-foreground">CHÀNH XE TỈNH CHỜ GỬI</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white border border-white/80 shadow-[0_4px_12px_rgba(217,119,6,0.35),inset_0_1px_1px_rgba(255,255,255,0.9)]"><Truck className="h-4 w-4" /></span>
          </div>
          <p className="text-xl font-extrabold tracking-tight text-amber-600">{t ? t.chanhXePending : loading ? "—" : "0"} <span className="text-xs font-semibold text-muted-foreground">đơn</span></p>
          <p className="text-xs text-muted-foreground">Đại lý tỉnh — cần in phiếu</p>
        </div>
        <div className="clay-kpi p-4 space-y-1 border-l-4 border-l-cyan-500" style={{ boxShadow: "0 14px 28px -6px rgba(6,182,212,0.18), inset 0 2px 3px rgba(255,255,255,0.95)" }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-muted-foreground">ĐÃ VÀO MISA AMIS</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-cyan-400 to-sky-500 text-white border border-white/80 shadow-[0_4px_12px_rgba(6,182,212,0.3),inset_0_1px_1px_rgba(255,255,255,0.9)]"><BadgeCheck className="h-4 w-4" /></span>
          </div>
          <p className="text-xl font-extrabold tracking-tight text-cyan-600">{t ? t.syncedMisa : loading ? "—" : "0"} <span className="text-xs font-semibold text-muted-foreground">/ {t ? t.totalToday : "—"}</span></p>
          <p className="text-xs text-muted-foreground">{t ? `${t.pendingSync} chờ đối soát` : "—"}</p>
        </div>
      </div>

      {/* Bang don live */}
      <div className="clay-card p-4">
        <h2 className="text-sm font-bold mb-3 flex items-center gap-2"><FileSpreadsheet className="w-4 h-4 text-sky-600" /> Đơn hàng Sapo thời gian thực</h2>
        {loading ? (
          <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-14 rounded-xl bg-muted/50 animate-pulse" />)}</div>
        ) : !data || data.orders.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">Chưa có đơn nào hôm nay.</p>
        ) : (
          <div className="overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[11px] tracking-widest text-muted-foreground border-b">
                  <th className="text-left py-2 px-2">Mã đơn</th>
                  <th className="text-left py-2 px-2">Thời gian</th>
                  <th className="text-left py-2 px-2">Khách hàng & SĐT</th>
                  <th className="text-left py-2 px-2">Địa chỉ / Tuyến giao</th>
                  <th className="text-right py-2 px-2">Tổng tiền</th>
                  <th className="text-center py-2 px-2">Thanh toán</th>
                  <th className="text-right py-2 px-2">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {data.orders.map((o) => (
                  <tr key={o.id} className="border-b last:border-0 hover:bg-muted/40">
                    <td className="py-2.5 px-2 font-mono font-bold">#{o.order_number || o.code || o.name || o.id}</td>
                    <td className="py-2.5 px-2 font-mono text-[11px]">{fmtTime(o.created_on || o.created_at)}</td>
                    <td className="py-2.5 px-2">
                      <div className="font-semibold truncate max-w-[180px]">{o.customer?.name || "Khách lẻ"}</div>
                      <div className="font-mono text-[11px] text-muted-foreground">{o.customer?.phone || "—"}</div>
                    </td>
                    <td className="py-2.5 px-2 max-w-[220px] truncate text-muted-foreground">{o.customer?.address || "—"}</td>
                    <td className="py-2.5 px-2 text-right font-mono font-bold text-emerald-600">{fmtVnd(o.total_price)}</td>
                    <td className="py-2.5 px-2 text-center">
                      <Badge variant="outline" className={`text-[10px] ${o.financial_status === "paid" ? "border-emerald-200 text-emerald-700 bg-emerald-50" : "border-amber-200 text-amber-700 bg-amber-50"}`}>
                        {o.financial_status === "paid" ? "Đã thanh toán" : "Chờ thu"}
                      </Badge>
                    </td>
                    <td className="py-2.5 px-2 text-right">
                      <span className="inline-flex gap-1">
                        <Button variant="outline" size="sm" className="h-7 text-[11px] rounded-full glossy-pill" title="In phiếu chành xe"><Printer className="w-3 h-3" /> In phiếu</Button>
                        <Button variant="outline" size="sm" className="h-7 text-[11px] rounded-full" title="Hạch toán MISA"><FileSpreadsheet className="w-3 h-3" /> MISA</Button>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-foreground text-background text-sm px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toast}
        </div>
      )}
    </div>
  );
}
