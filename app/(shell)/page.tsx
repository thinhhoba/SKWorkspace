"use client";
import * as React from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { appRegistry, GROUP_LABEL, GROUP_ORDER, type AppGroup, type AppColor } from "@/packages/core/appRegistry";
import { TrendingUp, Package, AlertTriangle, Wallet, Search, ArrowRight, ThermometerSnowflake } from "lucide-react";

const fmt = (n: number) => n.toLocaleString("vi-VN");

function KpiCard({ label, value, sub, tone, icon: Icon, mono }: { label: string; value: string; sub: string; tone: "primary" | "warning" | "danger"; icon: React.ElementType; mono?: boolean }) {
  const border = tone === "primary" ? "border-l-sky-500" : tone === "warning" ? "border-l-amber-500" : "border-l-rose-500";
  const iconBg =
    tone === "primary" ? "bg-sky-50 text-sky-600 border-sky-200" : tone === "warning" ? "bg-amber-50 text-amber-600 border-amber-200" : "bg-rose-50 text-rose-600 border-rose-200";
  return (
    <Card className={`border-l-4 ${border} shadow-sm`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <p className="text-[11px] font-bold tracking-widest text-muted-foreground">{label}</p>
          <span className={`inline-flex h-7 w-7 items-center justify-center rounded-md border text-xs shrink-0 ${iconBg}`}>
            <Icon className="h-3.5 w-3.5" />
          </span>
        </div>
        <p className={`mt-2 text-xl font-extrabold tracking-tight ${mono ? "font-mono" : ""}`}>{value}</p>
        <p className="mt-1 text-xs text-muted-foreground">{sub}</p>
      </CardContent>
    </Card>
  );
}

const GROUP_TONE: Record<AppGroup, AppColor> = {
  "tong-quan": "primary",
  "ban-hang": "primary",
  "van-hanh": "success",
  "tai-chinh": "primary",
  "he-thong": "neutral",
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
      {/* KPI 4 */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="DOANH THU HÔM NAY" value={`${fmt(128400000)} ₫`} sub="+12% vs hôm qua" tone="primary" icon={TrendingUp} mono />
        <KpiCard label="ĐƠN CẦN SOẠN" value="14 đơn" sub="3 đơn gấp · sáng nay" tone="warning" icon={Package} />
        <KpiCard label="CẢNH BÁO TỒN" value="5 SKU" sub="Heo xay thiếu · Rose" tone="danger" icon={AlertTriangle} />
        <KpiCard label="CÔNG NỢ QUÁ HẠN" value={`${fmt(84200000)} ₫`} sub="An Thịnh Mart 12 ngày" tone="danger" icon={Wallet} mono />
      </div>

      {/* Bento 3 tiles */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* A 2/3 */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Đơn hàng sáng nay</CardTitle>
            <Link href="/sales" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
              Xem tất cả <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              { code: "SP-0841", kh: "An Thịnh Mart", amt: 42800000, status: "Chờ soạn", tone: "warning" as const },
              { code: "SP-0840", kh: "Minh Khang Food", amt: 18300000, status: "Đang soạn", tone: "primary" as const },
              { code: "SP-0839", kh: "Hòa Bình Market", amt: 67200000, status: "Chờ soạn", tone: "warning" as const },
            ].map((o) => (
              <div key={o.code} className="flex items-center justify-between rounded-xl border p-3 bg-card">
                <div className="min-w-0">
                  <div className="font-mono text-xs font-bold">{o.code}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {o.kh} · <span className="font-mono">{fmt(o.amt)} ₫</span>
                  </div>
                </div>
                <Badge variant={o.tone === "warning" ? "warning" : "default"} className="shrink-0 font-mono text-[11px]">
                  {o.status}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* B 1/3 */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm inline-flex items-center gap-2">
              <ThermometerSnowflake className="h-4 w-4 text-sky-600" /> Tồn kho lạnh
            </CardTitle>
            <p className="text-xs text-muted-foreground">Q7 68% · Q12 42%</p>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-1">
              <div className="flex justify-between text-xs"><span>Kho Q7</span><span className="font-mono font-bold">68%</span></div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-sky-500 rounded-full" style={{ width: "68%" }} /></div>
              <div className="flex justify-between text-xs"><span>Kho Q12</span><span className="font-mono font-bold">42%</span></div>
              <div className="h-1.5 rounded-full bg-muted overflow-hidden"><div className="h-full bg-amber-500 rounded-full" style={{ width: "42%" }} /></div>
            </div>
            <div className="space-y-2 pt-1 border-t">
              {[
                { name: "Heo xay 500g", qty: 12, label: "Thiếu", tone: "danger" },
                { name: "Bò viên 1kg", qty: 60, label: "Sắp thiếu", tone: "warning" },
                { name: "Chả lụa 500g", qty: 200, label: "Đủ", tone: "success" },
              ].map((s) => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <span className="truncate pr-2">{s.name}</span>
                  <span className="flex items-center gap-2 shrink-0">
                    <span className="font-mono font-bold">{s.qty}</span>
                    <Badge variant={s.tone === "danger" ? "destructive" : s.tone === "warning" ? "warning" : "success"} className="text-[10px] px-1.5 py-0">
                      {s.label}
                    </Badge>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* C full */}
        <Card className="lg:col-span-3">
          <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-sm">Công nợ quá hạn (B2B)</CardTitle>
            <Link href="/customers" className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1">
              Đối soát <ArrowRight className="h-3 w-3" />
            </Link>
          </CardHeader>
          <CardContent className="grid gap-2 sm:grid-cols-2">
            {[
              { kh: "An Thịnh Mart", amt: 84200000, days: 12 },
              { kh: "Minh Khang Food", amt: 42100000, days: 5 },
            ].map((d) => (
              <div key={d.kh} className="flex items-center justify-between rounded-xl border p-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">
                    {d.kh} — <span className="font-mono">{fmt(d.amt)} ₫</span>
                  </div>
                  <div className="font-mono text-[11px] text-muted-foreground">Quá hạn {d.days} ngày</div>
                </div>
                <Badge variant="destructive" className="shrink-0 cursor-pointer" onClick={() => alert(`Đã gửi nhắc nợ — ${d.kh} (mock)`)}>
                  Nhắc
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* 14 mini-app grid */}
      <div>
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <div className="relative flex-1 min-w-[180px] max-w-sm">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Tìm mini-app..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 h-9" />
          </div>
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setGroup("all")}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${group === "all" ? "bg-foreground text-background border-foreground" : "bg-card hover:bg-muted"}`}
            >
              Tất cả
            </button>
            {GROUP_ORDER.map((g) => (
              <button
                key={g}
                onClick={() => setGroup(g)}
                className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${group === g ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"}`}
              >
                {GROUP_LABEL[g]}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
          {filtered.map((app) => {
            const Icon = app.icon;
            return (
              <Link
                key={app.id}
                href={app.href}
                className="group rounded-xl border bg-card p-3 hover:shadow-md hover:border-primary/30 transition-all min-h-[96px] flex flex-col"
              >
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="mt-2 text-xs font-semibold leading-tight line-clamp-2">{app.label}</span>
                <span className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-tight">{app.desc}</span>
                {app.badge && <Badge variant="outline" className="mt-2 w-fit text-[10px] px-1.5 py-0 font-mono">{app.badge}</Badge>}
              </Link>
            );
          })}
        </div>
        {filtered.length === 0 && <p className="text-sm text-muted-foreground text-center py-8">Không tìm thấy mini-app phù hợp.</p>}
      </div>
    </div>
  );
}
