"use client";
import * as React from "react";
import { Wallet, RefreshCw, TrendingUp, AlertTriangle, FileBarChart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AgingTableWidget } from "@/components/finance/AgingTableWidget";
import type { CustomerB2B } from "@/packages/modules/customers/types";
import { getAgingSummary, AGING_LABEL, AGING_COLOR, type AgingBucket4 } from "@/packages/modules/finance/agingService";

const vnd = (n: number) => n.toLocaleString("vi-VN") + " ₫";

export default function AgingPage() {
  const [customers, setCustomers] = React.useState<CustomerB2B[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [toast, setToast] = React.useState<string | null>(null);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/customers");
      const data = await res.json();
      if (data.success) {
        setCustomers(data.customers || []);
      }
    } catch (e) {
      console.error(e);
      setToast("Lỗi tải dữ liệu khách hàng");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const summary = React.useMemo(() => {
    if (customers.length === 0) return null;
    return getAgingSummary(customers);
  }, [customers]);

  const buckets: Array<{ key: AgingBucket4; icon: typeof TrendingUp }> = [
    { key: "trong_han_15", icon: TrendingUp },
    { key: "chom_qua_han_15_30", icon: AlertTriangle },
    { key: "qua_han_30_60", icon: AlertTriangle },
    { key: "qua_han_60", icon: AlertTriangle },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <FileBarChart className="w-5 h-5 text-sky-600" /> Báo cáo Tuổi nợ B2B — 4 mốc
          </h1>
          <p className="text-xs text-muted-foreground">
            Phân tích công nợ khách hàng theo 4 mốc thời gian: Trong hạn · Chớm quá hạn 15-30 · Quá hạn 30-60 · Quá hạn &gt;60 ngày
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full glossy-pill"
            onClick={fetchData}
            disabled={loading}
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin text-sky-500" : ""}`} />
            Làm mới
          </Button>
        </div>
      </div>

      {/* KPI 4 mốc */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="clay-card rounded-2xl p-4 animate-pulse">
              <div className="h-4 bg-muted rounded w-2/3 mb-2" />
              <div className="h-6 bg-muted rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {buckets.map(({ key, icon: Icon }) => {
            const color = AGING_COLOR[key];
            const value = summary?.[key] || 0;
            return (
              <div
                key={key}
                className="clay-card rounded-2xl p-4 border-l-4 transition-all hover:scale-[1.02]"
                style={{ borderLeftColor: color.bg }}
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Icon className="w-3.5 h-3.5" style={{ color: color.bg }} />
                  {AGING_LABEL[key]}
                </div>
                <div className="mt-1 text-xl font-bold" style={{ color: color.text }}>
                  {vnd(value)}
                </div>
                <div className="text-[11px] text-muted-foreground">
                  {customers.filter((c) => {
                    const aging = getAgingSummary([c]);
                    return aging[key] > 0;
                  }).length}{" "}
                  khách hàng
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Bảng tuổi nợ */}
      {loading ? (
        <div className="clay-card rounded-2xl p-8 text-center">
          <div className="animate-spin w-6 h-6 border-2 border-sky-500 border-t-transparent rounded-full mx-auto" />
          <p className="text-sm text-muted-foreground mt-3">Đang tải dữ liệu...</p>
        </div>
      ) : customers.length === 0 ? (
        <div className="clay-card rounded-2xl p-10 text-center text-sm text-muted-foreground">
          Không có dữ liệu khách hàng
        </div>
      ) : (
        <AgingTableWidget customers={customers} />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full bg-slate-900 text-white px-4 py-2 text-xs shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
