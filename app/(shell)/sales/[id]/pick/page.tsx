"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  PackageCheck,
  CheckCircle2,
  AlertTriangle,
  Barcode,
  Truck,
  ShieldCheck,
  RefreshCw,
  Warehouse,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SalesOrder, SalesOrderItem } from "@/packages/modules/sales/types";

const fmtVnd = (n: number) => Number(n).toLocaleString("vi-VN") + " ₫";

// Sound synthesis via Web Audio API for warehouse feedback
function playChime(success = true) {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (success) {
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    } else {
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    }
  } catch {
    // ignore audio failure
  }
}

export default function OrderPickTaskPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [order, setOrder] = React.useState<SalesOrder | null>(null);
  const [items, setItems] = React.useState<SalesOrderItem[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [barcodeInput, setBarcodeInput] = React.useState("");

  const fetchOrder = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sales/${orderId}`);
      const data = await res.json();
      if (!data.success || !data.order) {
        throw new Error(data.error || "Không tìm thấy đơn hàng");
      }
      setOrder(data.order);
      setItems(data.order.items || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  React.useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  const toggleItem = async (itemId: string) => {
    const target = items.find((it) => it.id === itemId);
    if (!target) return;
    const nextPicked = !target.picked;

    // Haptic feedback for warehouse staff handheld
    try {
      (navigator as unknown as { vibrate?: (n: number) => void }).vibrate?.(60);
    } catch {
      // ignore
    }
    playChime(nextPicked);

    // Optimistic UI
    setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, picked: nextPicked } : it)));

    try {
      const res = await fetch(`/api/sales/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle", itemId, picked: nextPicked }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Lỗi lưu trạng thái soạn");
      }
      setOrder(data.order);
      setItems(data.order.items);
    } catch (err: unknown) {
      // Revert optimistic update
      setItems((prev) => prev.map((it) => (it.id === itemId ? { ...it, picked: !nextPicked } : it)));
      setError(err instanceof Error ? err.message : "Không thể cập nhật dòng hàng");
    }
  };

  const handleBarcodeScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;
    const clean = barcodeInput.trim().toUpperCase();
    const match = items.find((it) => it.sku.toUpperCase() === clean || it.name.toUpperCase().includes(clean));
    if (match) {
      if (!match.picked) {
        toggleItem(match.id);
      } else {
        playChime(true);
      }
      setBarcodeInput("");
    } else {
      playChime(false);
      setError(`Không tìm thấy mã vạch "${barcodeInput}" trong đơn hàng này`);
      setTimeout(() => setError(null), 3000);
      setBarcodeInput("");
    }
  };

  const handleCompletePicking = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/sales/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "complete" }),
      });
      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Lỗi hoàn tất soạn hàng");
      }
      playChime(true);
      router.push(`/sales/${orderId}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi hoàn tất đơn hàng");
      setSubmitting(false);
    }
  };

  const totalCount = items.length;
  const pickedCount = items.filter((it) => it.picked).length;
  const progressPct = totalCount === 0 ? 0 : Math.round((pickedCount / totalCount) * 100);
  const isAllPicked = totalCount > 0 && pickedCount === totalCount;

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="h-7 w-7 animate-spin text-sky-500" />
      </div>
    );
  }

  if (error && !order) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertTriangle className="mx-auto h-12 w-12 text-rose-500" />
        <h2 className="text-lg font-bold text-rose-600">{error}</h2>
        <Button variant="outline" onClick={() => router.push("/sales")}>Quay lại danh sách</Button>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-5 pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/sales/${order.id}`}>
            <Button variant="ghost" size="sm" className="rounded-full">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Chi tiết đơn {order.code}
            </Button>
          </Link>
          <Badge variant="outline" className="text-xs bg-sky-50 text-sky-700 border-sky-200">
            Tác vụ kho: Soạn hàng FEFO
          </Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={fetchOrder} className="rounded-full">
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Đồng bộ lại
          </Button>
        </div>
      </div>

      {/* Header Banner */}
      <div className="rounded-3xl border border-sky-200/80 bg-gradient-to-r from-sky-500/10 via-cyan-500/5 to-transparent p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xl font-black text-sky-950 dark:text-sky-100">{order.code}</span>
              <Badge className="bg-sky-600 text-white font-mono">Kho {order.warehouse}</Badge>
            </div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">
              Khách nhận: <span className="text-sky-600 font-bold">{order.customer_name}</span> {order.customer_phone ? `(${order.customer_phone})` : ""}
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">{order.delivery_address}</p>
          </div>

          {/* Large Progress Indicator */}
          <div className="bg-white dark:bg-slate-900 border border-sky-100 dark:border-slate-800 rounded-2xl p-4 min-w-[220px] text-center shadow-inner">
            <div className="flex items-center justify-between text-xs font-bold text-muted-foreground mb-1">
              <span>TIẾN ĐỘ KIỂM ĐẾM</span>
              <span className="font-mono text-sky-600 text-sm">{pickedCount}/{totalCount} món</span>
            </div>
            <div className="text-2xl font-black font-mono text-sky-700 dark:text-sky-400">{progressPct}%</div>
            <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-1 p-0.5">
              <div
                className="h-full bg-gradient-to-r from-sky-500 to-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Barcode Scanner Input */}
      <div className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 p-4 shadow-sm">
        <form onSubmit={handleBarcodeScan} className="flex items-center gap-2">
          <Barcode className="h-5 w-5 text-muted-foreground shrink-0" />
          <input
            type="text"
            value={barcodeInput}
            onChange={(e) => setBarcodeInput(e.target.value)}
            placeholder="Quét mã vạch sản phẩm hoặc nhập SKU..."
            className="flex-1 text-sm bg-transparent outline-none placeholder:text-muted-foreground font-mono"
          />
          <Button type="submit" size="sm" variant="secondary" className="rounded-xl">
            Quét SKU
          </Button>
        </form>
      </div>

      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
        </div>
      )}

      {/* Picking Items Checklist */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <PackageCheck className="h-4 w-4 text-sky-600" /> Danh mục sản phẩm cần lấy ({items.length} món)
          </h2>
          <span className="text-xs text-muted-foreground">Tuân thủ nguyên tắc FEFO (Hạn gần lấy trước)</span>
        </div>

        <div className="space-y-2.5">
          {items.map((it) => (
            <div
              key={it.id}
              onClick={() => toggleItem(it.id)}
              className={`flex items-center gap-4 rounded-2xl border p-4 cursor-pointer transition-all ${
                it.picked
                  ? "bg-emerald-50/90 border-emerald-300 dark:bg-emerald-950/20 dark:border-emerald-800 shadow-sm"
                  : "bg-white hover:border-sky-300 dark:bg-slate-900 border-slate-200 hover:shadow-md"
              }`}
            >
              {/* Big Touch Checkbox (Warehouse Friendly >= 52px) */}
              <input
                type="checkbox"
                checked={!!it.picked}
                onChange={() => {}} // handled by div click
                className="h-10 w-10 rounded-xl accent-emerald-600 cursor-pointer shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-base font-bold ${it.picked ? "line-through text-muted-foreground" : "text-slate-900 dark:text-slate-100"}`}>
                    {it.name}
                  </span>
                  <Badge variant="outline" className="font-mono text-xs">
                    {it.sku}
                  </Badge>
                  {it.lot_number && (
                    <Badge variant="secondary" className="text-[11px] font-mono bg-amber-50 text-amber-700 border-amber-200">
                      Lô: {it.lot_number}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    Số lượng: <span className="font-mono text-base font-black text-sky-600">{it.quantity}</span> {it.dvt}
                  </span>
                  <span>Đơn giá: {fmtVnd(it.unit_price)}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-slate-200">
                    Thành tiền: {fmtVnd(it.total_price)}
                  </span>
                </div>
              </div>

              {it.picked ? (
                <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs shrink-0 bg-emerald-100/80 px-3 py-1.5 rounded-full">
                  <CheckCircle2 className="h-4 w-4" /> ĐÃ XÁC NHẬN
                </div>
              ) : (
                <div className="text-slate-400 font-medium text-xs shrink-0">
                  Chưa lấy
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Sticky Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-4 shadow-xl">
        <div className="mx-auto max-w-4xl flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-medium">
            {isAllPicked ? (
              <span className="flex items-center gap-1.5 text-emerald-600 font-bold text-sm">
                <ShieldCheck className="h-5 w-5" /> Đã kiểm đủ 100% dòng hàng
              </span>
            ) : (
              <span className="flex items-center gap-1.5 text-amber-600">
                <AlertTriangle className="h-4 w-4" /> Cần tích đủ 100% món ({pickedCount}/{totalCount}) để hoàn tất
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Link href={`/sales/${order.id}`}>
              <Button variant="ghost" size="sm" className="rounded-full">
                Tạm dừng
              </Button>
            </Link>
            <Button
              disabled={!isAllPicked || submitting}
              onClick={handleCompletePicking}
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-6 shadow-md shadow-emerald-600/20"
            >
              {submitting ? (
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Truck className="mr-2 h-4 w-4" />
              )}
              Hoàn tất soạn kho & Chuyển giao hàng
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
