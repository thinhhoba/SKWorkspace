"use client";
import * as React from "react";
import { TrendingUp, Wallet, Package, BadgePercent, Download, FileSpreadsheet, Truck, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ReportData, ReportPeriod } from "@/packages/modules/reports/types";

const PERIODS: { key: ReportPeriod; label: string }[] = [
  { key: "today", label: "Hôm nay" },
  { key: "7d", label: "7 ngày qua" },
  { key: "month", label: "Tháng này" },
  { key: "quarter", label: "Quý này" },
];

export default function ReportsPage() {
  const [period, setPeriod] = React.useState<ReportPeriod>("month");
  const [data, setData] = React.useState<ReportData | null>(null);

  React.useEffect(() => {
    fetch(`/api/reports?period=${period}`).then((r) => r.json()).then((j) => j.success && setData(j.data));
  }, [period]);

  const exportExcel = () => {
    if (!data) return;
    const rows = [
      ["KPI", "Giá trị"],
      ["Doanh thu", String(data.kpi.revenueMonth)],
      ["Lãi gộp", String(data.kpi.grossProfit)],
      ["Biên lãi", data.kpi.grossMargin + "%"],
      ["Thùng mì", String(data.kpi.noodleCartons)],
      ["Thu hồi công nợ", data.kpi.debtRecoveryRate + "%"],
      [],
      ["Kênh", "Doanh thu", "Đơn", "Tỷ trọng"],
      ...data.channels.map((c) => [c.label, String(c.revenue), String(c.orders), c.share + "%"]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `bao-cao-son-khang-${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!data) return <div className="p-8 text-sm text-muted-foreground">Đang tải báo cáo...</div>;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold flex items-center gap-2"><BarChart3 className="w-5 h-5 text-sky-600" />Báo cáo Quản trị — Sơn Khang</h1>
          <p className="text-xs text-muted-foreground">GĐ Hồ Bá Thịnh · KTT Hoàng Thị Nho · 6 kênh · 4 nhóm hàng · biên lãi ~21.4%</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="glossy-pill p-1 flex gap-1 rounded-full border">
            {PERIODS.map((p) => (
              <button key={p.key} onClick={() => setPeriod(p.key)} className={`px-3 py-1 text-xs rounded-full font-medium ${period === p.key ? "bg-sky-600 text-white" : "text-muted-foreground"}`}>{p.label}</button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="rounded-full" onClick={exportExcel}><FileSpreadsheet className="w-3.5 h-3.5 mr-1.5" />Xuất Excel</Button>
          <Button variant="outline" size="sm" className="rounded-full" onClick={() => window.print()}><Download className="w-3.5 h-3.5 mr-1.5" />Xuất PDF</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="clay-card p-4 space-y-1 border-sky-200">
          <div className="flex justify-between text-muted-foreground"><span className="text-xs font-semibold">Doanh thu tháng</span><TrendingUp className="w-4 h-4 text-sky-500" /></div>
          <div className="text-xl font-black text-sky-600">{data.kpi.revenueMonth.toLocaleString("vi-VN")} ₫</div>
          <Badge variant="outline" className="text-[11px] border-sky-200 text-sky-600 bg-sky-50">Sky</Badge>
        </div>
        <div className="clay-card p-4 space-y-1 border-emerald-200">
          <div className="flex justify-between text-muted-foreground"><span className="text-xs font-semibold">Lãi gộp ước tính</span><Wallet className="w-4 h-4 text-emerald-500" /></div>
          <div className="text-xl font-black text-emerald-600">{data.kpi.grossProfit.toLocaleString("vi-VN")} ₫</div>
          <span className="text-xs text-emerald-600">Biên {data.kpi.grossMargin}%</span>
        </div>
        <div className="clay-card p-4 space-y-1 border-cyan-200">
          <div className="flex justify-between text-muted-foreground"><span className="text-xs font-semibold">Thùng mì xuất kho</span><Package className="w-4 h-4 text-cyan-500" /></div>
          <div className="text-xl font-black text-cyan-600">{data.kpi.noodleCartons.toLocaleString("vi-VN")} thùng</div>
          <span className="text-xs text-muted-foreground">Indomie / Koreno</span>
        </div>
        <div className="clay-card p-4 space-y-1 border-amber-200">
          <div className="flex justify-between text-muted-foreground"><span className="text-xs font-semibold">Thu hồi công nợ B2B</span><BadgePercent className="w-4 h-4 text-amber-500" /></div>
          <div className="text-xl font-black text-amber-600">{data.kpi.debtRecoveryRate}%</div>
          <span className="text-xs text-muted-foreground">Tỷ lệ thu hồi</span>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <div className="clay-card p-4 space-y-3">
          <h3 className="text-sm font-semibold">Tỷ trọng doanh thu theo kênh (6 kênh)</h3>
          <div className="space-y-2.5">
            {data.channels.map((c) => (
              <div key={c.channel} className="space-y-1">
                <div className="flex justify-between text-xs"><span className="font-medium">{c.label}</span><span className="text-muted-foreground">{c.share}% · {c.revenue.toLocaleString("vi-VN")} ₫</span></div>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden"><div className="h-full bg-sky-500 rounded-full" style={{ width: `${c.share}%` }} /></div>
              </div>
            ))}
          </div>
        </div>
        <div className="space-y-4">
          <div className="clay-card p-4 space-y-3">
            <h3 className="text-sm font-semibold">Cơ cấu & lãi gộp theo nhóm hàng</h3>
            <div className="space-y-2">
              {data.productGroups.map((g) => (
                <div key={g.group} className="flex items-center justify-between text-xs border-b last:border-0 py-2">
                  <span className="font-medium">{g.label}</span>
                  <span className="text-muted-foreground">{g.revenue.toLocaleString("vi-VN")} ₫ · lãi {g.grossProfit.toLocaleString("vi-VN")} ₫</span>
                  <Badge variant="outline" className="text-[11px] border-emerald-200 text-emerald-600 bg-emerald-50">{g.margin}%</Badge>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground">Biên lãi bình quân ~21.4%</p>
          </div>
          <div className="clay-card p-4 space-y-2">
            <h3 className="text-sm font-semibold">Tỷ trọng xuất kho</h3>
            <div className="flex gap-3 text-xs">
              {data.warehouseShare.map((w) => (
                <div key={w.warehouse} className="flex-1">
                  <div className="font-medium">{w.label}</div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden mt-1"><div className={`h-full rounded-full ${w.warehouse === "KHO_DINH_CONG" ? "bg-sky-500" : "bg-indigo-500"}`} style={{ width: `${w.share}%` }} /></div>
                  <div className="text-muted-foreground mt-1">{w.qty.toLocaleString("vi-VN")} đơn vị · {w.share}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="clay-card p-4">
        <h3 className="text-sm font-semibold flex items-center gap-2"><Truck className="w-4 h-4 text-sky-600" />Hiệu suất giao vận — {data.driver.driver}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 text-xs">
          <div><div className="text-muted-foreground">Tổng chuyến</div><div className="text-lg font-bold">{data.driver.totalTrips}</div></div>
          <div><div className="text-muted-foreground">Giao thành công</div><div className="text-lg font-bold text-emerald-600">{data.driver.successRate}%</div></div>
          <div><div className="text-muted-foreground">Kiện chành xe</div><div className="text-lg font-bold">{data.driver.chanhXeCount}</div></div>
          <div><div className="text-muted-foreground">Tổng COD</div><div className="text-lg font-bold">{data.driver.totalCod.toLocaleString("vi-VN")} ₫</div></div>
        </div>
      </div>

      <div className="clay-card p-4">
        <h3 className="text-sm font-semibold">Top 5 Sản phẩm bán chạy</h3>
        <div className="overflow-x-auto mt-2">
          <table className="w-full text-xs">
            <thead><tr className="text-muted-foreground border-b"><th className="text-left py-2">#</th><th className="text-left">SKU</th><th className="text-left">Tên</th><th className="text-right">SL</th><th className="text-right">Doanh thu</th></tr></thead>
            <tbody>
              {data.topProducts.map((p) => (
                <tr key={p.rank} className="border-b last:border-0"><td className="py-2 font-bold">{p.rank}</td><td className="font-mono">{p.sku}</td><td>{p.name}</td><td className="text-right">{p.qty.toLocaleString("vi-VN")}</td><td className="text-right font-medium">{p.revenue.toLocaleString("vi-VN")} ₫</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
