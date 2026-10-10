"use client";
import * as React from "react";
import { Tag, Search, TrendingUp, Snowflake, Store, Truck, MessageCircle, Copy, Check, Pencil, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { PricingItem, PricingStats, PriceChannel } from "@/packages/modules/pricing/types";
import { PRICE_CHANNEL_LABEL, PRICING_CATEGORY_LABEL, CHANNEL_ORDER, STORAGE_TEMP_LABEL, getMarginPct } from "@/packages/modules/pricing/types";

const fmtVnd = (n: number) => Number(n).toLocaleString("vi-VN") + " ₫";

const CHANNEL_TABS: { value: PriceChannel | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả kênh" },
  { value: "quan_an", label: "Quán ăn HN" },
  { value: "dai_ly", label: "Đại lý chành xe" },
  { value: "bep_an", label: "Bếp ăn căn tin" },
  { value: "web_order", label: "Web Order" },
  { value: "pos", label: "POS Quầy" },
];

const CATEGORY_TABS: { value: string; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "hang_kho", label: "Hàng khô" },
  { value: "gia_vi", label: "Gia vị & Xốt" },
  { value: "hang_mat", label: "Hàng mát" },
  { value: "hang_dong", label: "Hàng đông" },
];

export default function PricingPage() {
  const [items, setItems] = React.useState<PricingItem[]>([]);
  const [stats, setStats] = React.useState<PricingStats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [channelTab, setChannelTab] = React.useState<PriceChannel | "ALL">("ALL");
  const [category, setCategory] = React.useState("ALL");
  const [search, setSearch] = React.useState("");
  const [debouncedSearch, setDebouncedSearch] = React.useState("");
  const [toast, setToast] = React.useState<string | null>(null);

  const [editItem, setEditItem] = React.useState<PricingItem | null>(null);
  const [editChannel, setEditChannel] = React.useState<PriceChannel>("ban_le");
  const [editPrice, setEditPrice] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const [quoteOpen, setQuoteOpen] = React.useState(false);
  const [quoteChannel, setQuoteChannel] = React.useState<PriceChannel>("quan_an");
  const [quoteText, setQuoteText] = React.useState("");
  const [quoteLoading, setQuoteLoading] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (category !== "ALL") qs.set("category", category);
      if (debouncedSearch.trim()) qs.set("search", debouncedSearch.trim());
      const res = await fetch(`/api/pricing?${qs.toString()}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, [category, debouncedSearch]);

  React.useEffect(() => { fetchData(); }, [fetchData]);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const openEdit = (item: PricingItem, channel?: PriceChannel) => {
    const ch = channel ?? (channelTab !== "ALL" ? (channelTab as PriceChannel) : "quan_an");
    setEditItem(item);
    setEditChannel(ch);
    setEditPrice(String(item.prices[ch] ?? item.prices.ban_le ?? 0));
  };

  const handleSavePrice = async () => {
    if (!editItem) return;
    const price = Number(editPrice);
    if (!Number.isFinite(price) || price <= 0) { setToast("Giá bán phải > 0"); return; }
    setSaving(true);
    try {
      const res = await fetch(`/api/pricing/${encodeURIComponent(editItem.sku)}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: editChannel, price }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Lỗi cập nhật giá");
      setItems((prev) => prev.map((i) => (i.sku === editItem.sku ? data.item : i)));
      if (data.warning) setToast(data.warning);
      else setToast(`Đã cập nhật ${editItem.sku} — ${PRICE_CHANNEL_LABEL[editChannel]}: ${fmtVnd(price)}`);
      setEditItem(null);
      fetchData();
    } catch (e: unknown) { setToast(e instanceof Error ? e.message : "Lỗi"); } finally { setSaving(false); }
  };

  const handleQuote = async () => {
    setQuoteLoading(true);
    try {
      const res = await fetch("/api/pricing/quote", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: quoteChannel }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Lỗi sinh báo giá");
      setQuoteText(data.text);
    } catch (e: unknown) { setToast(e instanceof Error ? e.message : "Lỗi"); } finally { setQuoteLoading(false); }
  };

  React.useEffect(() => { if (quoteOpen) handleQuote(); }, [quoteOpen, quoteChannel]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopy = async () => {
    try { await navigator.clipboard.writeText(quoteText); setCopied(true); setToast("Đã copy mẫu báo giá!"); setTimeout(() => setCopied(false), 2000); }
    catch { setToast("Không copy được — hãy bôi đen thủ công"); }
  };

  const coldCount = stats ? stats.fresh_meat_count + stats.frozen_meat_count : 0;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Tag className="w-5 h-5 text-violet-500" /> Bảng giá đa kênh &amp; Báo giá Zalo
          </h1>
          <p className="text-xs text-muted-foreground">24 SKU · 6 kênh phân phối · Cảnh báo dưới vốn &amp; báo giá Zalo 1-chạm</p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setQuoteOpen(true)}>
            <MessageCircle className="w-3.5 h-3.5 mr-1" /> Xuất báo giá Zalo
          </Button>
          <Button variant="outline" size="sm" className="rounded-full glossy-pill" onClick={fetchData} disabled={loading}>
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin text-sky-500" : ""}`} /> Làm mới
          </Button>
        </div>
      </div>

      {/* 4 Clay-KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="clay-card rounded-2xl p-4 border-l-4 border-l-sky-500">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Tag className="w-3.5 h-3.5 text-sky-500" /> Tổng SKU niêm yết</div>
          <div className="mt-1 text-2xl font-bold">{stats ? stats.total_skus : items.length}</div>
          <div className="text-[11px] text-muted-foreground">Cập nhật {stats?.last_updated || "—"}</div>
        </div>
        <div className="clay-card rounded-2xl p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><TrendingUp className="w-3.5 h-3.5 text-emerald-500" /> Biên lợi nhuận gộp TB</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{stats ? stats.avg_margin_pct.toFixed(1) : "—"}%</div>
          <div className="text-[11px] text-muted-foreground">Theo giá Bán lẻ</div>
        </div>
        <div className="clay-card rounded-2xl p-4 border-l-4 border-l-cyan-500">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Snowflake className="w-3.5 h-3.5 text-cyan-500" /> Bảo quản đông &amp; mát</div>
          <div className="mt-1 text-2xl font-bold">{coldCount} SKU</div>
          <div className="text-[11px] text-muted-foreground">Mát {stats?.fresh_meat_count ?? "—"} · Đông {stats?.frozen_meat_count ?? "—"}</div>
        </div>
        <div className="clay-card rounded-2xl p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Truck className="w-3.5 h-3.5 text-amber-500" /> Kênh sỉ chủ lực</div>
          <div className="mt-1 text-lg font-bold">Quán ăn &amp; Chành xe tỉnh</div>
          <div className="text-[11px] text-muted-foreground">Giá tốt nhất · Gửi bến Giáp Bát/Nước Ngầm</div>
        </div>
      </div>

      {/* Tabs kênh */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {CHANNEL_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setChannelTab(t.value)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold border transition-all ${channelTab === t.value ? "bg-sky-600 text-white border-sky-600 shadow" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-300"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      {/* Tabs nhóm hàng + search */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORY_TABS.map((t) => (
            <button
              key={t.value}
              onClick={() => setCategory(t.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold border transition-all ${category === t.value ? "bg-violet-600 text-white border-violet-600 shadow" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-violet-300"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 min-w-[180px] max-w-[320px] ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm SKU hoặc tên..." className="h-8 rounded-full pl-9 text-xs glossy-pill" />
        </div>
      </div>

      {/* Bảng giá */}
      {loading ? (
        <div className="grid gap-2">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />)}</div>
      ) : items.length === 0 ? (
        <div className="clay-card rounded-2xl p-10 text-center text-sm text-muted-foreground">Không có sản phẩm phù hợp bộ lọc</div>
      ) : (
        <div className="overflow-x-auto rounded-2xl border bg-white dark:bg-slate-900">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800 text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="text-left px-3 py-2.5 font-semibold whitespace-nowrap">Mã SKU</th>
                <th className="text-left px-3 py-2.5 font-semibold">Tên</th>
                <th className="text-center px-2 py-2.5 font-semibold">ĐVT</th>
                <th className="text-center px-2 py-2.5 font-semibold">Nhiệt độ</th>
                <th className="text-right px-2 py-2.5 font-semibold whitespace-nowrap">Giá vốn</th>
                {(channelTab === "ALL" ? CHANNEL_ORDER : [channelTab]).map((ch) => (
                  <th key={ch} className="text-right px-2 py-2.5 font-semibold whitespace-nowrap">{PRICE_CHANNEL_LABEL[ch as PriceChannel]}</th>
                ))}
                <th className="text-center px-2 py-2.5 font-semibold">% Margin</th>
                <th className="px-2 py-2.5" />
              </tr>
            </thead>
            <tbody>
              {items.map((it) => {
                const displayChannels: PriceChannel[] = channelTab === "ALL" ? [...CHANNEL_ORDER] : [channelTab as PriceChannel];
                return (
                  <tr key={it.id} className="border-t hover:bg-sky-50/50 dark:hover:bg-slate-800/50">
                    <td className="px-3 py-2.5 font-mono text-[11px] font-semibold whitespace-nowrap">{it.sku}</td>
                    <td className="px-3 py-2.5">
                      <div className="font-medium text-xs leading-tight">{it.name}</div>
                      <div className="text-[11px] text-muted-foreground">{PRICING_CATEGORY_LABEL[it.category]}</div>
                    </td>
                    <td className="px-2 py-2.5 text-center">{it.dvt}</td>
                    <td className="px-2 py-2.5 text-center whitespace-nowrap">
                      <Badge variant="outline" className={`text-[11px] ${it.category === "hang_dong" ? "bg-cyan-50 text-cyan-700 border-cyan-200" : it.category === "hang_mat" ? "bg-sky-50 text-sky-700 border-sky-200" : "bg-amber-50 text-amber-700 border-amber-200"}`}>
                        {STORAGE_TEMP_LABEL[it.category]}
                      </Badge>
                    </td>
                    <td className="px-2 py-2.5 text-right text-slate-500 whitespace-nowrap">{fmtVnd(it.cost_price)}</td>
                    {displayChannels.map((ch) => {
                      const price = it.prices[ch] ?? 0;
                      const margin = getMarginPct(it.cost_price, price);
                      const thin = margin < (it.min_margin_pct ?? 10);
                      const negative = price < it.cost_price;
                      return (
                        <td key={ch} className="px-2 py-2.5 text-right whitespace-nowrap">
                          <button onClick={() => openEdit(it, ch)} className={`rounded-full px-2 py-1 text-xs font-semibold border ${negative ? "bg-rose-100 text-rose-700 border-rose-300" : thin ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-emerald-50 text-emerald-700 border-emerald-200"} hover:opacity-80`}>
                            {fmtVnd(price)}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-2 py-2.5 text-center whitespace-nowrap">
                      {(() => {
                        const refPrice = channelTab === "ALL" ? it.prices.ban_le : (it.prices[channelTab as PriceChannel] ?? it.prices.ban_le);
                        const m = getMarginPct(it.cost_price, refPrice);
                        const thin = m < (it.min_margin_pct ?? 10);
                        const neg = refPrice < it.cost_price;
                        return <Badge variant="outline" className={`text-[11px] ${neg ? "bg-rose-100 text-rose-700 border-rose-200" : thin ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-emerald-100 text-emerald-700 border-emerald-200"}`}>{m.toFixed(1)}%</Badge>;
                      })()}
                    </td>
                    <td className="px-2 py-2.5">
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full" onClick={() => openEdit(it)}><Pencil className="w-3.5 h-3.5" /></Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal cập nhật giá */}
      <Dialog open={!!editItem} onOpenChange={(o) => !o && setEditItem(null)}>
        <DialogContent className="max-w-sm rounded-2xl">
          <DialogHeader><DialogTitle className="text-sm">Cập nhật giá — {editItem?.sku}</DialogTitle></DialogHeader>
          {editItem && (
            <div className="space-y-4">
              <div className="text-xs">
                <div className="font-medium">{editItem.name}</div>
                <div className="text-muted-foreground">Giá vốn: {fmtVnd(editItem.cost_price)} · ĐVT: {editItem.dvt} · {STORAGE_TEMP_LABEL[editItem.category]}</div>
              </div>
              <div>
                <label className="text-xs font-medium">Kênh áp dụng</label>
                <select value={editChannel} onChange={(e) => { setEditChannel(e.target.value as PriceChannel); setEditPrice(String(editItem.prices[e.target.value as PriceChannel] ?? editItem.prices.ban_le)); }} className="mt-1 w-full h-9 rounded-full border bg-white dark:bg-slate-800 px-3 text-sm">
                  {CHANNEL_ORDER.map((ch) => <option key={ch} value={ch}>{PRICE_CHANNEL_LABEL[ch]}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-medium">Giá bán mới (VNĐ)</label>
                <Input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} className="mt-1 h-9 rounded-full" placeholder="Nhập giá bán" />
                {Number(editPrice) > 0 && Number(editPrice) < editItem.cost_price && (
                  <p className="mt-1.5 rounded-lg bg-rose-50 border border-rose-200 px-3 py-2 text-xs text-rose-700">⚠️ Giá bán thấp hơn giá vốn nhập kho!</p>
                )}
                {Number(editPrice) >= editItem.cost_price && getMarginPct(editItem.cost_price, Number(editPrice)) < (editItem.min_margin_pct ?? 10) && Number(editPrice) > 0 && (
                  <p className="mt-1.5 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-700">⚠️ Biên lợi nhuận mỏng &lt; {editItem.min_margin_pct ?? 10}%</p>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-full" onClick={() => setEditItem(null)}>Hủy</Button>
                <Button className="flex-1 rounded-full bg-sky-600 hover:bg-sky-700 text-white" onClick={handleSavePrice} disabled={saving}>{saving ? "Đang lưu..." : "Lưu giá"}</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal báo giá Zalo */}
      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent className="max-w-lg rounded-2xl">
          <DialogHeader><DialogTitle className="text-sm flex items-center gap-2"><MessageCircle className="w-4 h-4 text-emerald-500" /> Xuất báo giá Zalo 1-chạm</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-1.5">
              {CHANNEL_ORDER.map((ch) => (
                <button key={ch} onClick={() => setQuoteChannel(ch)} className={`rounded-full px-3 py-1.5 text-xs font-semibold border ${quoteChannel === ch ? "bg-emerald-600 text-white border-emerald-600" : "bg-white border-slate-200 hover:border-emerald-300"}`}>
                  {PRICE_CHANNEL_LABEL[ch]}
                </button>
              ))}
            </div>
            {quoteLoading ? <div className="h-40 rounded-xl bg-slate-100 animate-pulse" /> : (
              <textarea readOnly value={quoteText} className="w-full h-[280px] rounded-xl border bg-slate-50 p-3 text-xs font-mono leading-relaxed" />
            )}
            <div className="flex gap-2">
              <Button className="flex-1 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleCopy}>
                {copied ? <Check className="w-3.5 h-3.5 mr-1" /> : <Copy className="w-3.5 h-3.5 mr-1" />} {copied ? "Đã copy!" : "Copy mẫu báo giá"}
              </Button>
              <Button variant="outline" className="rounded-full" onClick={() => window.open("https://zalo.me", "_blank")}>Mở Zalo</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {toast && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full bg-slate-900 text-white px-4 py-2 text-xs shadow-lg">{toast}</div>}
    </div>
  );
}
