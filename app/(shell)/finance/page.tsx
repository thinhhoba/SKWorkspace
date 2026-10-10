"use client";
import * as React from "react";
import Link from "next/link";
import { Wallet, Banknote, TrendingUp, TrendingDown, Search, RefreshCw, Plus, ArrowUpRight, ArrowDownRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { FinanceTransaction, FinanceStats, TxnType, TxnCategory, AccountCode } from "@/packages/modules/finance/types";
import { TXN_CATEGORY_LABEL, ACCOUNT_SHORT, PERFORMER_NAME, BANK_ACCOUNT, CASH_WAREHOUSE } from "@/packages/modules/finance/types";

const fmtVnd = (n: number) => n.toLocaleString("vi-VN") + " ₫";

const TYPE_TABS: { value: string; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "THU", label: "Thu tiền mặt / Chuyển khoản" },
  { value: "CHI_NCC", label: "Chi tiền hàng NCC" },
  { value: "CHI_VAN_HANH", label: "Chi phí vận hành & Chành xe" },
];

function categoryMatch(txn: FinanceTransaction, tab: string): boolean {
  if (tab === "ALL") return true;
  if (tab === "THU") return txn.type === "THU";
  if (tab === "CHI_NCC") return txn.type === "CHI" && txn.category === "chi_tien_hang_ncc";
  if (tab === "CHI_VAN_HANH") return txn.type === "CHI" && (txn.category === "chi_cuoc_chanh_xe" || txn.category === "chi_van_hanh_kho");
  return true;
}

const CATEGORY_OPTIONS: { value: TxnCategory; label: string }[] = [
  { value: "thu_tien_hang_quan_an", label: "Thu tiền hàng quán ăn" },
  { value: "thu_dai_ly_chanh_xe", label: "Thu đại lý chành xe" },
  { value: "thu_ho_cod", label: "Thu hộ COD (Ngô Văn Tân)" },
  { value: "chi_tien_hang_ncc", label: "Chi tiền hàng NCC" },
  { value: "chi_cuoc_chanh_xe", label: "Cước gửi xe bến" },
  { value: "chi_van_hanh_kho", label: "Chi phí vận hành kho" },
];

export default function FinancePage() {
  const [transactions, setTransactions] = React.useState<FinanceTransaction[]>([]);
  const [stats, setStats] = React.useState<FinanceStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState("ALL");
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [toast, setToast] = React.useState<string | null>(null);

  const [open, setOpen] = React.useState(false);
  const [formType, setFormType] = React.useState<TxnType>("THU");
  const [formCategory, setFormCategory] = React.useState<TxnCategory>("thu_tien_hang_quan_an");
  const [formAmount, setFormAmount] = React.useState("");
  const [formAccount, setFormAccount] = React.useState<AccountCode>("TECHCOMBANK_22226060");
  const [formDesc, setFormDesc] = React.useState("");
  const [saving, setSaving] = React.useState(false);

  React.useEffect(() => { const t = setTimeout(() => setDebouncedSearch(search), 300); return () => clearTimeout(t); }, [search]);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (debouncedSearch.trim()) qs.set("search", debouncedSearch.trim());
      const res = await fetch(`/api/finance?${qs.toString()}`);
      const data = await res.json();
      if (data.success) {
        setTransactions(data.transactions || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [debouncedSearch]);

  React.useEffect(() => { fetchData(); }, [fetchData]);
  React.useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 3000); return () => clearTimeout(t); }, [toast]);

  const filtered = transactions.filter((t) => categoryMatch(t, tab));

  const openCreate = (type: TxnType) => {
    setFormType(type);
    setFormCategory(type === "THU" ? "thu_tien_hang_quan_an" : "chi_tien_hang_ncc");
    setFormAmount("");
    setFormAccount(type === "THU" ? "TECHCOMBANK_22226060" : "TECHCOMBANK_22226060");
    setFormDesc("");
    setOpen(true);
  };

  const handleCreate = async () => {
    const amount = Number(formAmount);
    if (!amount || amount <= 0) { setToast("Số tiền phải > 0"); return; }
    if (!formDesc.trim()) { setToast("Thiếu diễn giải"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/finance/transactions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: formType, category: formCategory, amount, account: formAccount, description: formDesc }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error);
      setToast(`Đã lập ${data.transaction.code}`);
      setOpen(false);
      fetchData();
    } catch (e: unknown) { setToast(e instanceof Error ? e.message : "Lỗi"); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2"><Wallet className="w-5 h-5 text-sky-600" /> Dòng tiền, Thu chi & Đối soát quỹ</h1>
          <p className="text-xs text-muted-foreground">KT {PERFORMER_NAME} · {BANK_ACCOUNT} · {CASH_WAREHOUSE}</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/finance/sapo2misa" className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-sky-50 px-3.5 py-1.5 text-xs font-semibold text-sky-700 hover:bg-sky-100">Đối soát Sapo2Misa <ExternalLink className="w-3 h-3" /></Link>
          <Button size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => openCreate("THU")}><ArrowUpRight className="w-3.5 h-3.5 mr-1" /> Phiếu thu (SK-PT-)</Button>
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => openCreate("CHI")}><ArrowDownRight className="w-3.5 h-3.5 mr-1" /> Phiếu chi (SK-PC-)</Button>
          <Button variant="outline" size="sm" className="rounded-full glossy-pill" onClick={fetchData} disabled={loading}><RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin text-sky-500" : ""}`} /> Làm mới</Button>
        </div>
      </div>

      {/* 4 Clay-KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="clay-card rounded-2xl p-4 border-l-4 border-l-sky-500">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Banknote className="w-3.5 h-3.5 text-sky-500" /> Số dư Techcombank 22226060</div>
          <div className="mt-1 text-xl font-bold">{stats ? fmtVnd(stats.balance_techcombank) : "—"}</div>
          <div className="text-[11px] text-muted-foreground">CONG TY TNHH THUC PHAM SON KHANG</div>
        </div>
        <div className="clay-card rounded-2xl p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Wallet className="w-3.5 h-3.5 text-emerald-500" /> Quỹ tiền mặt Định Công</div>
          <div className="mt-1 text-xl font-bold">{stats ? fmtVnd(stats.balance_cash) : "—"}</div>
          <div className="text-[11px] text-muted-foreground">Kho Tổng — Hoàng Mai, Hà Nội</div>
        </div>
        <div className="clay-card rounded-2xl p-4 border-l-4 border-l-cyan-500">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingUp className="w-3.5 h-3.5 text-cyan-500" /> Tổng thu tháng</div>
          <div className="mt-1 text-xl font-bold text-cyan-700">{stats ? fmtVnd(stats.total_thu_month) : "—"}</div>
          <div className="text-[11px] text-muted-foreground">Thu quán ăn · đại lý chành xe · COD</div>
        </div>
        <div className="clay-card rounded-2xl p-4 border-l-4 border-l-rose-500">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingDown className="w-3.5 h-3.5 text-rose-500" /> Tổng chi tháng</div>
          <div className="mt-1 text-xl font-bold text-rose-600">{stats ? fmtVnd(stats.total_chi_month) : "—"}</div>
          <div className="text-[11px] text-muted-foreground">Net: {stats ? fmtVnd(stats.net_cashflow) : "—"} {stats && stats.net_cashflow >= 0 ? "▲" : "▼"}</div>
        </div>
      </div>

      {/* Tabs + search */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {TYPE_TABS.map((t) => (
            <button key={t.value} onClick={() => setTab(t.value)} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all ${tab === t.value ? "bg-sky-600 text-white border-sky-600 shadow" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300"}`}>{t.label}</button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[180px] max-w-[320px] ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm mã phiếu, hạng mục, diễn giải..." className="h-8 rounded-full pl-9 text-xs glossy-pill" />
        </div>
      </div>

      {/* Bảng nhật ký */}
      {loading ? (
        <div className="grid gap-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-16 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="clay-card rounded-2xl p-10 text-center text-sm text-muted-foreground">Không có giao dịch phù hợp</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white dark:bg-slate-900">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="text-left px-3 py-2.5 font-semibold whitespace-nowrap">Mã phiếu</th>
                <th className="text-left px-3 py-2.5 font-semibold whitespace-nowrap">Thời gian</th>
                <th className="text-left px-2 py-2.5 font-semibold">Hạng mục</th>
                <th className="text-right px-2 py-2.5 font-semibold">Số tiền</th>
                <th className="text-center px-2 py-2.5 font-semibold">Tài khoản</th>
                <th className="text-left px-2 py-2.5 font-semibold">Người thực hiện</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <tr key={t.id} className="border-t hover:bg-sky-50/50 dark:hover:bg-slate-800/50">
                  <td className="px-3 py-2.5 font-mono text-[11px] font-semibold whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 border text-[11px] ${t.type === "THU" ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"}`}>{t.type === "THU" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}{t.code}</span>
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap text-muted-foreground">{t.created_at}</td>
                  <td className="px-2 py-2.5">
                    <Badge variant="outline" className="text-[11px]">{TXN_CATEGORY_LABEL[t.category]}</Badge>
                    <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-[320px]">{t.description}</div>
                  </td>
                  <td className={`px-2 py-2.5 text-right font-bold whitespace-nowrap ${t.type === "THU" ? "text-emerald-600" : "text-rose-600"}`}>{t.type === "THU" ? "+" : "-"}{fmtVnd(t.amount)}</td>
                  <td className="px-2 py-2.5 text-center"><Badge variant="outline" className={`text-[11px] ${t.account === "TECHCOMBANK_22226060" ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>{ACCOUNT_SHORT[t.account]}</Badge></td>
                  <td className="px-2 py-2.5 whitespace-nowrap">{t.performer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal lập phiếu */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md rounded-2xl max-h-[90vh] overflow-auto">
          <DialogHeader><DialogTitle className="text-sm flex items-center gap-2">{formType === "THU" ? <ArrowUpRight className="w-4 h-4 text-emerald-600" /> : <ArrowDownRight className="w-4 h-4 text-rose-600" />} Lập {formType === "THU" ? "Phiếu Thu (SK-PT-)" : "Phiếu Chi (SK-PC-)"}</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-medium">Loại phiếu</label>
                <select value={formType} onChange={(e) => setFormType(e.target.value as TxnType)} className="mt-1 w-full h-9 rounded-full border bg-white dark:bg-slate-800 px-3 text-sm">
                  <option value="THU">Phiếu thu (SK-PT-)</option>
                  <option value="CHI">Phiếu chi (SK-PC-)</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Tài khoản</label>
                <select value={formAccount} onChange={(e) => setFormAccount(e.target.value as AccountCode)} className="mt-1 w-full h-9 rounded-full border bg-white dark:bg-slate-800 px-3 text-sm">
                  <option value="TECHCOMBANK_22226060">Techcombank 22226060</option>
                  <option value="CASH">Quỹ tiền mặt Định Công</option>
                </select>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium">Hạng mục</label>
              <select value={formCategory} onChange={(e) => setFormCategory(e.target.value as TxnCategory)} className="mt-1 w-full h-9 rounded-full border bg-white dark:bg-slate-800 px-3 text-sm">
                {CATEGORY_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium">Số tiền (VNĐ)</label>
              <Input type="number" value={formAmount} onChange={(e) => setFormAmount(e.target.value)} className="mt-1 h-9 rounded-full text-sm" placeholder="Nhập số tiền" />
            </div>
            <div>
              <label className="text-xs font-medium">Diễn giải</label>
              <Input value={formDesc} onChange={(e) => setFormDesc(e.target.value)} className="mt-1 h-9 rounded-full text-sm" placeholder="VD: Thu tiền hàng quán A — CK" />
            </div>
            <p className="text-[11px] text-muted-foreground">Người lập: {PERFORMER_NAME} · {formAccount === "TECHCOMBANK_22226060" ? BANK_ACCOUNT : CASH_WAREHOUSE}</p>
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="flex-1 rounded-full" onClick={() => setOpen(false)}>Hủy</Button>
              <Button className={`flex-1 rounded-full text-white ${formType === "THU" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"}`} onClick={handleCreate} disabled={saving}><Plus className="w-3.5 h-3.5 mr-1" />{saving ? "Đang lập..." : formType === "THU" ? "Lập phiếu thu" : "Lập phiếu chi"}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {toast && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full bg-slate-900 text-white px-4 py-2 text-xs shadow-lg">{toast}</div>}
    </div>
  );
}
