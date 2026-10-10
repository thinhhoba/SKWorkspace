"use client";
import * as React from "react";
import { Package, ScanLine, ClipboardCheck, ArrowRightLeft, ThermometerSnowflake, Clock, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { InventoryItem } from "@/packages/modules/inventory/types";

export default function PwaKhoPage() {
  const [q, setQ] = React.useState("");
  const [items, setItems] = React.useState<InventoryItem[]>([]);
  const [selected, setSelected] = React.useState<InventoryItem | null>(null);
  const [counted, setCounted] = React.useState<number>(0);
  const [toast, setToast] = React.useState<string | null>(null);

  const fetchItems = async (term: string) => {
    const r = await fetch(`/api/inventory?search=${encodeURIComponent(term)}`);
    const d = await r.json();
    if (d.success) setItems(d.items || []);
  };
  React.useEffect(() => { fetchItems(""); }, []);
  React.useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2500); return () => clearTimeout(t); }, [toast]);

  const handleScan = () => {
    if (!q.trim()) { fetchItems(""); return; }
    fetchItems(q.trim());
    const hit = items.find((i) => i.sku.toLowerCase() === q.trim().toLowerCase());
    if (hit) { setSelected(hit); setCounted(hit.quantity); }
  };

  const handleConfirm = async () => {
    if (!selected) return;
    const diff = counted - selected.quantity;
    setToast(`${selected.sku}: đếm ${counted} (hệ thống ${selected.quantity}, chênh ${diff > 0 ? "+" : ""}${diff}) — đã ghi nhận`);
  };

  return (
    <div className="space-y-4 max-w-lg mx-auto">
      <div className="rounded-xl bg-gradient-to-br from-sky-600 to-cyan-600 text-white p-4">
        <div className="text-xs opacity-90">Thủ kho trung tâm</div>
        <div className="font-bold">Trần Thị Ngọc Thúy — 0942 22 60 60</div>
        <div className="text-xs opacity-80 flex gap-2 mt-1"><span className="bg-white/20 rounded-full px-2 py-0.5">Kho Định Công</span><span className="bg-white/20 rounded-full px-2 py-0.5">Kho Yên Bình</span></div>
      </div>

      <div className="rounded-xl border bg-card p-3 space-y-3">
        <div className="text-xs font-bold flex items-center gap-1.5"><ScanLine className="w-4 h-4 text-sky-600" />Quét mã / Nhập SKU</div>
        <div className="flex gap-2">
          <div className="relative flex-1"><Input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleScan()} placeholder="VD: LC-VIEN-CHIEN-500" className="h-10 text-sm" /></div>
          <Button onClick={handleScan} className="h-10 rounded-full bg-sky-600"><ScanLine className="w-4 h-4 mr-1" />Quét</Button>
        </div>
        <div className="grid grid-cols-2 gap-2 max-h-[32vh] overflow-auto">
          {items.slice(0, 12).map((it) => (
            <button key={it.id} onClick={() => { setSelected(it); setCounted(it.quantity); }} className={`text-left rounded-xl border p-2.5 text-xs ${selected?.id === it.id ? "border-sky-400 bg-sky-50" : "bg-white/60"}`}>
              <div className="font-mono font-bold text-sky-700">{it.sku}</div>
              <div className="font-medium line-clamp-2">{it.name}</div>
              <div className="flex gap-1 mt-1 flex-wrap"><Badge variant="outline" className="text-[10px]">{it.warehouse === "KHO_DINH_CONG" ? "ĐC" : "YB"}</Badge><Badge variant="outline" className="text-[10px]">{it.temp_zone === "dong_lanh" ? "-18°C" : it.temp_zone === "kho_mat" ? "0–4°C" : "Thường"}</Badge></div>
              <div className="text-[11px] text-muted-foreground mt-1">{it.lot_number} · HSD {it.expiry_date} · Còn {it.days_until_expiry}d</div>
            </button>
          ))}
        </div>
      </div>

      {selected && (
        <div className="rounded-xl border bg-card p-3 space-y-3">
          <div className="text-xs font-bold flex items-center gap-1.5"><ClipboardCheck className="w-4 h-4 text-emerald-600" />Kiểm đếm nhanh</div>
          <div className="rounded-lg border p-2.5 bg-muted/30 text-xs space-y-1">
            <div className="font-bold">{selected.name} — {selected.sku}</div>
            <div className="flex gap-1"><Badge variant="outline" className="text-[10px]">{selected.warehouse === "KHO_DINH_CONG" ? "Kho Định Công" : "Kho Yên Bình"}</Badge><Badge variant="outline" className="text-[10px]">{selected.temperature}</Badge><Badge variant={selected.is_near_expiry ? "destructive" : "outline"} className="text-[10px]">{selected.days_until_expiry}d · {selected.lot_number}</Badge></div>
            <div className="text-muted-foreground">Vị trí {selected.location} · Hệ thống: <b className="text-foreground">{selected.quantity} {selected.dvt}</b></div>
          </div>
          <div><label className="text-xs font-semibold">Số lượng đếm thực tế</label><Input type="number" min={0} value={counted} onChange={(e) => setCounted(Number(e.target.value))} className="h-10 text-base font-mono mt-1" /></div>
          <div className="flex gap-2"><Button onClick={handleConfirm} className="flex-1 rounded-full bg-emerald-600"><CheckCircle2 className="w-4 h-4 mr-1" />Xác nhận đếm</Button><Button variant="outline" className="rounded-full" onClick={() => setSelected(null)}>Đóng</Button></div>
          {counted !== selected.quantity && <div className={`text-xs rounded-lg px-2.5 py-2 border ${counted < selected.quantity ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-sky-50 border-sky-200 text-sky-700"}`}>Chênh lệch: {counted - selected.quantity > 0 ? "+" : ""}{counted - selected.quantity} {selected.dvt} — sẽ ghi vào phiếu SK-KK</div>}
        </div>
      )}

      <div className="rounded-xl border bg-amber-50 p-2.5 flex gap-2 text-xs border-amber-200"><span className="text-amber-600">◍</span><div><div className="font-bold">Offline cache</div><div className="text-muted-foreground">Tạo QR / kiểm đếm offline — đồng bộ khi có mạng</div></div></div>

      {toast && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-foreground text-background text-sm px-4 py-2.5 rounded-full shadow-lg">{toast}</div>}
    </div>
  );
}
