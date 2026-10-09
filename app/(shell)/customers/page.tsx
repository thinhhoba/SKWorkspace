"use client";
import * as React from "react";
import { Search, Copy, CheckCircle2, AlertTriangle, Wallet, Clock3, ShieldCheck, TrendingUp, Eye, FileText, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { CustomerB2B, DebtSummary, RiskLevel } from "@/packages/modules/customers/types";
import { RISK_LABEL } from "@/packages/modules/customers/mockData";

const vnd = (n: number) => n.toLocaleString("vi-VN") + " ₫";

const RISK_BADGE: Record<RiskLevel, string> = {
  safe: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-orange-50 text-orange-700 border-orange-200",
  blocked: "bg-rose-50 text-rose-700 border-rose-300",
};

const AGING_OPTS = [
  { v: "ALL", label: "Tất cả" },
  { v: "current", label: "Trong hạn" },
  { v: "overdue_1_15", label: "1-15 ngày" },
  { v: "overdue_16_30", label: "16-30 ngày" },
  { v: "overdue_gt30", label: ">30 ngày" },
] as const;

const RISK_OPTS: { v: RiskLevel | "ALL"; label: string }[] = [
  { v: "ALL", label: "Tất cả" },
  { v: "safe", label: "An toàn" },
  { v: "warning", label: "Cảnh báo" },
  { v: "danger", label: "Nguy cơ" },
  { v: "blocked", label: "Chặn" },
];

function creditTone(c: CustomerB2B) {
  if (c.risk_level === "blocked") return { bg: "bg-rose-600", label: "Chặn xuất kho", text: "text-rose-600" };
  if (c.risk_level === "danger") return { bg: "bg-rose-500", label: "Nguy cơ", text: "text-rose-500" };
  if (c.risk_level === "warning") return { bg: "bg-amber-500", label: "Cảnh báo", text: "text-amber-600" };
  return { bg: "bg-emerald-500", label: "An toàn", text: "text-emerald-600" };
}

export default function CustomersPage() {
  const [customers, setCustomers] = React.useState<CustomerB2B[]>([]);
  const [summary, setSummary] = React.useState<DebtSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [aging, setAging] = React.useState<string>("ALL");
  const [risk, setRisk] = React.useState<string>("ALL");
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  const [remindOpen, setRemindOpen] = React.useState(false);
  const [remindMsg, setRemindMsg] = React.useState("");
  const [remindCode, setRemindCode] = React.useState("");
  const [copied, setCopied] = React.useState(false);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (search.trim()) q.set("search", search.trim());
      if (aging !== "ALL") q.set("aging", aging);
      if (risk !== "ALL") q.set("risk", risk);
      const res = await fetch(`/api/customers?${q.toString()}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
        setSummary(data.summary || null);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [search, aging, risk]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleRemind = async (c: CustomerB2B) => {
    try {
      const res = await fetch(`/api/customers/${c.id}/remind`, { method: "POST" });
      const data = await res.json();
      if (data.success) {
        setRemindMsg(data.message);
        setRemindCode(c.code);
        setRemindOpen(true);
      } else setToast(data.error || "Lỗi tạo tin nhắn");
    } catch (e: any) { setToast(e.message); }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(remindMsg);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = (code: string) => {
    setToast(`Đã xuất BB đối soát ${code} — TODO Excel`);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <Wallet className="w-5 h-5 text-sky-500" /> Khách hàng B2B &amp; Công nợ
        </h1>
        <p className="text-xs text-muted-foreground">Theo dõi dư nợ, tuổi nợ và hạn mức tín dụng — nhắc nợ Zalo &amp; đối soát định kỳ</p>
      </div>

      {/* KPI 4 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="clay-kpi clay-kpi--sky p-4 space-y-1 border-l-4 border-l-sky-500">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Tổng dư nợ B2B</span>
            <Wallet className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl font-black tracking-tight text-sky-600">{summary ? vnd(summary.total_debt) : "—"}</div>
          <p className="text-[11px] text-muted-foreground">{customers.length} khách hàng B2B</p>
        </div>

        <div className="clay-kpi p-4 space-y-1 border-l-4 border-l-emerald-500" style={{ boxShadow: "0 14px 28px -6px rgba(5,150,105,0.18), inset 0 2px 3px rgba(255,255,255,0.95)" }}>
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Nợ trong hạn</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-black tracking-tight text-emerald-600">{summary ? vnd(summary.current) : "—"}</div>
          <p className="text-[11px] text-muted-foreground">Chưa đến hạn thanh toán</p>
        </div>

        <div className={`clay-kpi p-4 space-y-1 border-l-4 border-l-rose-500 ${summary && summary.overdue_total > 0 ? "clay-kpi--danger" : ""}`}>
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Nợ quá hạn</span>
            <AlertTriangle className={`w-4 h-4 text-rose-500 ${summary && summary.overdue_total > 0 ? "animate-pulse" : ""}`} />
          </div>
          <div className={`text-xl font-black tracking-tight ${summary && summary.overdue_total > 0 ? "text-rose-600 animate-pulse" : "text-slate-600"}`}>{summary ? vnd(summary.overdue_total) : "—"}</div>
          <p className="text-[11px] text-muted-foreground">
            {summary ? `1-15: ${vnd(summary.overdue_1_15)} · 16-30: ${vnd(summary.overdue_16_30)} · >30: ${vnd(summary.overdue_gt30)}` : ""}
          </p>
        </div>

        <div className="clay-kpi clay-kpi--warning p-4 space-y-1 border-l-4 border-l-amber-500">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Tỷ lệ thu hồi</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black tracking-tight text-amber-600">{summary ? `${summary.collection_rate_pct}%` : "—"}</div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full" style={{ width: `${summary?.collection_rate_pct || 0}%` }} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm MST / Tên / Mã / SĐT..." className="pl-8 h-9 text-xs rounded-full glossy-pill" />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <div className="glossy-pill p-1 flex gap-1 rounded-full border">
            {AGING_OPTS.map((o) => (
              <button key={o.v} onClick={() => setAging(o.v)} className={`px-3 py-1 text-xs rounded-full font-medium transition-all ${aging === o.v ? "bg-sky-500 text-white shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"}`}>{o.label}</button>
            ))}
          </div>
          <div className="glossy-pill p-1 flex gap-1 rounded-full border">
            {RISK_OPTS.map((o) => (
              <button key={o.v} onClick={() => setRisk(o.v)} className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all ${risk === o.v ? "bg-foreground text-background shadow-sm font-semibold" : "text-muted-foreground hover:text-foreground"}`}>{o.label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* List */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="clay-card p-4 animate-pulse space-y-3">
              <div className="h-4 bg-muted rounded w-1/3" />
              <div className="h-3 bg-muted rounded w-2/3" />
              <div className="h-2 bg-muted rounded w-full" />
            </div>
          ))}
        </div>
      ) : customers.length === 0 ? (
        <div className="clay-card p-10 text-center text-sm text-muted-foreground">Không tìm thấy khách hàng phù hợp bộ lọc.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {customers.map((c) => {
            const tone = creditTone(c);
            const pct = c.credit_limit > 0 ? Math.min(100, Math.round((c.current_debt / c.credit_limit) * 100)) : 0;
            const isExpanded = expanded === c.id;
            return (
              <div key={c.id} className="clay-card p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-bold text-sky-600">{c.code}</span>
                      <Badge variant="outline" className={`text-[10px] border ${RISK_BADGE[c.risk_level]}`}>{RISK_LABEL[c.risk_level]}</Badge>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 border text-muted-foreground font-medium">{c.payment_term} ngày</span>
                    </div>
                    <div className="font-semibold text-sm leading-tight mt-1 truncate">{c.company_name}</div>
                    <div className="text-[11px] text-muted-foreground font-mono">MST: {c.mst}</div>
                  </div>
                </div>

                <div className="text-xs text-muted-foreground flex flex-wrap gap-x-3 gap-y-1">
                  <span>{c.contact_name}</span>
                  <span className="font-mono">{c.phone}</span>
                </div>

                {/* Credit limit */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Hạn mức tín dụng</span>
                    <span className={`font-semibold ${tone.text}`}>{tone.label} · {pct}%</span>
                  </div>
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${tone.bg}`} style={{ width: `${pct}%` }} />
                  </div>
                  <div className="flex justify-between text-[11px] font-mono text-muted-foreground">
                    <span>{vnd(c.current_debt)}</span>
                    <span>{vnd(c.credit_limit)}</span>
                  </div>
                  {c.risk_level === "blocked" && (
                    <div className="text-xs font-semibold text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Chặn xuất kho
                    </div>
                  )}
                </div>

                {/* Aging 4 boxes */}
                <div className="grid grid-cols-4 gap-1.5">
                  {([
                    ["Trong hạn", c.aging.current, "bg-emerald-50 border-emerald-200 text-emerald-700"],
                    ["1-15", c.aging.overdue_1_15, "bg-amber-50 border-amber-200 text-amber-700"],
                    ["16-30", c.aging.overdue_16_30, "bg-orange-50 border-orange-200 text-orange-700"],
                    [">30", c.aging.overdue_gt30, "bg-rose-50 border-rose-200 text-rose-700"],
                  ] as const).map(([label, val, cls]) => (
                    <div key={label} className={`rounded-xl border p-2 text-center ${cls}`}>
                      <div className="text-[10px] font-semibold opacity-70">{label}</div>
                      <div className="text-[11px] font-mono font-bold leading-tight">{val === 0 ? "—" : vnd(val).replace(" ₫","")}</div>
                    </div>
                  ))}
                </div>

                {isExpanded && (
                  <div className="rounded-xl bg-muted/50 border p-3 space-y-1 text-xs">
                    <div><span className="text-muted-foreground">Địa chỉ:</span> {c.address}</div>
                    <div><span className="text-muted-foreground">Quá hạn:</span> {c.overdue_days} ngày · <span className="text-muted-foreground">Đơn gần nhất:</span> {c.last_order_date || "—"}</div>
                  </div>
                )}

                <div className="flex flex-wrap gap-1.5 pt-1">
                  <Button size="sm" variant="outline" className="h-7 text-xs rounded-full glossy-pill" onClick={() => handleRemind(c)}>
                    <MessageCircle className="w-3 h-3 mr-1" /> Nhắc nợ Zalo
                  </Button>
                  <Button size="sm" variant="outline" className="h-7 text-xs rounded-full" onClick={() => handleExport(c.code)}>
                    <FileText className="w-3 h-3 mr-1" /> Xuất biên bản
                  </Button>
                  <Button size="sm" variant="ghost" className="h-7 text-xs rounded-full ml-auto" onClick={() => setExpanded(isExpanded ? null : c.id)}>
                    <Eye className="w-3 h-3 mr-1" /> {isExpanded ? "Thu gọn" : "Xem chi tiết"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Remind dialog */}
      <Dialog open={remindOpen} onOpenChange={setRemindOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2"><MessageCircle className="w-4 h-4 text-sky-500" /> Tin nhắn nhắc nợ — {remindCode}</DialogTitle>
          </DialogHeader>
          <pre className="whitespace-pre-wrap text-xs bg-muted/60 border rounded-xl p-3 font-mono leading-relaxed max-h-[320px] overflow-auto">{remindMsg}</pre>
          <div className="flex justify-end gap-2">
            <Button size="sm" variant="outline" className="rounded-full" onClick={() => setRemindOpen(false)}>Đóng</Button>
            <Button size="sm" className="rounded-full bg-sky-600 text-white" onClick={handleCopy}>
              {copied ? <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />} {copied ? "Đã copy" : "Copy"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-foreground text-background text-sm px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toast}
        </div>
      )}
    </div>
  );
}
