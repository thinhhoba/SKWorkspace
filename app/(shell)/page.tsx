"use client";
import * as React from "react";
import Link from "next/link";
import { CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { appRegistry, GROUP_LABEL, GROUP_ORDER, type AppGroup, type AppColor } from "@/packages/core/appRegistry";
import { TrendingUp, Package, AlertTriangle, Wallet, Search, ArrowRight, ThermometerSnowflake } from "lucide-react";

const fmt = (n: number) => n.toLocaleString("vi-VN");

// Clay KPI — tone maps to .clay-kpi[data-tone]
const TONE_MAP: Record<"primary" | "warning" | "danger", "sky" | "warning" | "danger"> = {
  primary: "sky",
  warning: "warning",
  danger: "danger",
};

function KpiCard({ label, value, sub, tone, icon: Icon, mono }: { label: string; value: string; sub: string; tone: "primary" | "warning" | "danger"; icon: React.ElementType; mono?: boolean }) {
  const dataTone = TONE_MAP[tone];
  const borderAccent = tone === "primary" ? "border-l-sky-500" : tone === "warning" ? "border-l-amber-500" : "border-l-rose-500";
  // icon puffy circle with light border
  const iconWrap =
    tone === "primary"
      ? "bg-gradient-to-br from-sky-400 to-sky-600 text-white border-white/80 shadow-[0_4px_12px_rgba(14,165,233,0.35),inset_0_1px_1px_rgba(255,255,255,0.9)]"
      : tone === "warning"
        ? "bg-gradient-to-br from-amber-400 to-orange-500 text-white border-white/80 shadow-[0_4px_12px_rgba(217,119,6,0.35),inset_0_1px_1px_rgba(255,255,255,0.9)]"
        : "bg-gradient-to-br from-rose-400 to-rose-600 text-white border-white/80 shadow-[0_4px_12px_rgba(225,29,72,0.35),inset_0_1px_1px_rgba(255,255,255,0.9)]";
  return (
    <div data-tone={dataTone} className={`clay-kpi clay-kpi--${dataTone} border-l-4 ${borderAccent} p-4 flex flex-col gap-1`}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[11px] font-bold tracking-widest text-muted-foreground">{label}</p>
        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full border shrink-0 ${iconWrap}`}>
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p
        className={`mt-1 text-xl font-extrabold tracking-tight ${mono ? "mono" : ""}`}
        style={mono ? { textShadow: "0 1px 0 rgba(255,255,255,0.9), 0 2px 6px rgba(14,165,233,0.12)" } : undefined}
      >
        {value}
      </p>
      <p className="text-xs text-muted-foreground">{sub}</p>
    </div>
  );
}

// Icon gradient by group (Tài chính Sky, Bán hàng Emerald, Vận hành Amber...)
const GROUP_ICON_GRADIENT: Record<AppGroup, string> = {
  "tong-quan": "from-violet-400 to-indigo-500",
  "ban-hang": "from-emerald-400 to-teal-500",
  "van-hanh": "from-amber-400 to-orange-500",
  "tai-chinh": "from-sky-400 to-sky-600",
  "he-thong": "from-slate-400 to-slate-600",
};

export default function HomePage() {
  const [q, setQ] = React.useState("");
  const [group, setGroup] = React.useState<AppGroup | "all">("all");

  const filtered = React.useMemo(() => {
    let list = appRegistry.filter((a) => a.id !== "dashboard");
    if (group !== "all") list = list.filter((a) => a.group === group);
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter((a) => a.label.toLowerCase().includes(t) || a.desc.toLowerCase().includes(t) || a.id.includes(t));
    }
    return list;
  }, [q, group]);

  return (
    <div className="space-y-5 max-w-[1280px] mx-auto">
      {/* KPI 4 — clay-kpi */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="DOANH THU HÔM NAY" value={`${fmt(128400000)} ₫`} sub="+12% vs hôm qua" tone="primary" icon={TrendingUp} mono />
        <KpiCard label="ĐƠN CẦN SOẠN" value="14 đơn" sub="3 đơn gấp · sáng nay" tone="warning" icon={Package} />
        <KpiCard label="CẢNH BÁO TỒN" value="5 SKU" sub="Heo xay thiếu · Rose" tone="danger" icon={AlertTriangle} />
        <KpiCard label="CÔNG NỢ QUÁ HẠN" value={`${fmt(84200000)} ₫`} sub="An Thịnh Mart 12 ngày" tone="danger" icon={Wallet} mono />
      </div>

      {/* Bento 3 tiles — clay-card + glass border */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* A 2/3 — Đơn sáng nay */}
        <div className="clay-card lg:col-span-2 overflow-hidden">
          <div className="flex flex-row items-center justify-between p-6 pb-3">
            <h3 className="font-semibold leading-none tracking-tight text-sm">Đơn hàng sáng nay</h3>
            <Link href="/sales" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
              Xem tất cả <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-6 pt-0 space-y-2">
            {[
              { code: "SP-0841", kh: "An Thịnh Mart", amt: 42800000, status: "Chờ soạn", tone: "warning" as const },
              { code: "SP-0840", kh: "Minh Khang Food", amt: 18300000, status: "Đang soạn", tone: "primary" as const },
              { code: "SP-0839", kh: "Hòa Bình Market", amt: 67200000, status: "Chờ soạn", tone: "warning" as const },
            ].map((o) => (
              <div
                key={o.code}
                className="flex items-center justify-between rounded-full border border-white/80 bg-white/90 backdrop-blur-sm px-4 py-2.5 shadow-[0_2px_8px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:bg-white/[0.06] dark:border-white/10"
              >
                <div className="min-w-0">
                  <div className="mono text-xs font-bold">{o.code}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {o.kh} · <span className="mono">{fmt(o.amt)} ₫</span>
                  </div>
                </div>
                <Badge variant={o.tone === "warning" ? "warning" : "default"} className="shrink-0 mono text-[11px] rounded-full">
                  {o.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>

        {/* B 1/3 — Tồn kho lạnh */}
        <div className="clay-card overflow-hidden">
          <div className="flex flex-col space-y-1.5 p-6 pb-3">
            <h3 className="font-semibold leading-none tracking-tight text-sm inline-flex items-center gap-2">
              <ThermometerSnowflake className="h-4 w-4 text-sky-600" /> Tồn kho lạnh
            </h3>
            <p className="text-xs text-muted-foreground">Q7 68% · Q12 42%</p>
          </div>
          <div className="p-6 pt-0 space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs"><span>Kho Q7</span><span className="mono font-bold">68%</span></div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden p-0.5 shadow-inner">
                <div className="h-full rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]" style={{ width: "68%", background: "linear-gradient(90deg,#0284C7,#38BDF8)" }} />
              </div>
              <div className="flex justify-between text-xs"><span>Kho Q12</span><span className="mono font-bold">42%</span></div>
              <div className="h-2.5 rounded-full bg-muted overflow-hidden p-0.5 shadow-inner">
                <div className="h-full rounded-full shadow-[inset_0_1px_1px_rgba(255,255,255,0.6)]" style={{ width: "42%", background: "linear-gradient(90deg,#0284C7,#38BDF8)" }} />
              </div>
            </div>
            <div className="space-y-2 pt-2 border-t border-white/60 dark:border-white/10">
              {[
                { name: "Heo xay 500g", qty: 12, label: "Thiếu", tone: "danger" },
                { name: "Bò viên 1kg", qty: 60, label: "Sắp thiếu", tone: "warning" },
                { name: "Chả lụa 500g", qty: 200, label: "Đủ", tone: "success" },
              ].map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <span className="truncate pr-2">{s.name}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="mono font-bold">{s.qty}</span>
                    <Badge variant={s.tone === "danger" ? "destructive" : s.tone === "warning" ? "warning" : "success"} className="text-[10px] px-1.5 py-0 rounded-full">
                      {s.label}
                    </Badge>
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* C full — Công nợ */}
        <div className="clay-card lg:col-span-3 overflow-hidden">
          <div className="flex flex-row items-center justify-between p-6 pb-3">
            <h3 className="font-semibold leading-none tracking-tight text-sm">Công nợ quá hạn (B2B)</h3>
            <Link href="/customers" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
              Đối soát <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="p-6 pt-0 grid gap-2 sm:grid-cols-2">
            {[
              { kh: "An Thịnh Mart", amt: 84200000, days: 12 },
              { kh: "Minh Khang Food", amt: 42100000, days: 5 },
            ].map((d) => (
              <div key={d.kh} className="flex items-center justify-between rounded-2xl border border-white/80 bg-white/90 px-4 py-3 shadow-[0_2px_8px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] dark:bg-white/[0.06] dark:border-white/10">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {d.kh} — <span className="mono">{fmt(d.amt)} ₫</span>
                  </div>
                  <div className="mono text-[11px] text-muted-foreground">Quá hạn {d.days} ngày</div>
                </div>
                <Badge variant="destructive" className="shrink-0 cursor-pointer rounded-full" onClick={() => alert(`Đã gửi nhắc nợ — ${d.kh} (mock)`)}>
                  Nhắc
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 14 mini-app grid — clay-tile */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Tìm mini-app..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 h-9 rounded-full border-white/80 bg-white/90 shadow-sm" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setGroup("all")}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${group === "all" ? "bg-foreground text-background border-foreground shadow-md" : "glossy-pill hover:shadow-md"}`}
            >
              Tất cả
            </button>
            {GROUP_ORDER.map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${group === g ? "bg-primary text-primary-foreground border-primary shadow-[0_4px_12px_rgba(14,165,233,0.3)]" : "glossy-pill hover:shadow-md"}`}
              >
                {GROUP_LABEL[g]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {filtered.map((app) => {
            const Icon = app.icon;
            const grad = GROUP_ICON_GRADIENT[app.group];
            return (
              <Link
                key={app.id}
                href={app.href}
                className="clay-tile group p-3 min-h-[104px] flex flex-col"
              >
                <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-white shadow-[0_4px_10px_rgba(15,23,42,0.15),inset_0_1px_1px_rgba(255,255,255,0.7)] border border-white/60 shrink-0`}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className="mt-2.5 text-xs font-semibold leading-tight line-clamp-2">{app.label}</span>
                <span className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-tight">{app.desc}</span>
                {app.badge && <Badge variant="outline" className="mt-2 w-fit text-[10px] px-1.5 py-0 mono rounded-full bg-white/80">{app.badge}</Badge>}
              </Link>
            );
          })}
        </div>
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Không tìm thấy mini-app phù hợp.</p>}
      </div>
    </div>
  );
}
