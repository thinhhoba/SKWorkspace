"use client";
import * as React from "react";
import {
  Warehouse,
  Search,
  ArrowRightLeft,
  AlertTriangle,
  Clock,
  ThermometerSnowflake,
  Plus,
  RefreshCw,
  CheckCircle2,
  Filter,
  TrendingDown,
  Box,
  Truck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import type { InventoryItem, StockTransfer, WarehouseMetrics } from "@/packages/modules/inventory/types";

export default function InventoryPage() {
  const [items, setItems] = React.useState<InventoryItem[]>([]);
  const [metrics, setMetrics] = React.useState<WarehouseMetrics | null>(null);
  const [transfers, setTransfers] = React.useState<StockTransfer[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [selectedWarehouse, setSelectedWarehouse] = React.useState<"ALL" | "Q7" | "Q12">("ALL");
  const [selectedStatus, setSelectedStatus] = React.useState<"ALL" | "thieu" | "sap-thieu" | "can-han">("ALL");

  // State modal điều chuyển
  const [transferModalOpen, setTransferModalOpen] = React.useState(false);
  const [transferSku, setTransferSku] = React.useState("");
  const [transferQty, setTransferQty] = React.useState(20);
  const [transferFrom, setTransferFrom] = React.useState<"Q12" | "Q7">("Q12");
  const [transferTo, setTransferTo] = React.useState<"Q12" | "Q7">("Q7");
  const [transferNote, setTransferNote] = React.useState("");
  const [isSubmittingTransfer, setIsSubmittingTransfer] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (selectedWarehouse !== "ALL") q.set("warehouse", selectedWarehouse);
      if (selectedStatus !== "ALL") q.set("status", selectedStatus);
      if (search.trim()) q.set("search", search.trim());

      const res = await fetch(`/api/inventory?${q.toString()}`);
      const data = await res.json();
      if (data.success) {
        setItems(data.items || []);
        setMetrics(data.metrics || null);
      }

      const resT = await fetch("/api/inventory/transfer");
      const dataT = await resT.json();
      if (dataT.success) {
        setTransfers(dataT.transfers || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [selectedWarehouse, selectedStatus, search]);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleCreateTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferSku || transferQty <= 0) {
      setToast("Vui lòng chọn sản phẩm và nhập số lượng hợp lệ");
      return;
    }

    setIsSubmittingTransfer(true);
    try {
      const res = await fetch("/api/inventory/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku: transferSku,
          quantity: transferQty,
          from: transferFrom,
          to: transferTo,
          note: transferNote,
          createdBy: "Giám đốc / Điều phối SK"
        })
      });
      const data = await res.json();
      if (data.success) {
        setToast(`Đã tạo phiếu điều chuyển ${data.transfer.code} thành công!`);
        setTransferModalOpen(false);
        fetchData();
      } else {
        setToast(`Lỗi: ${data.error}`);
      }
    } catch (err: any) {
      setToast(`Lỗi: ${err.message}`);
    } finally {
      setIsSubmittingTransfer(false);
    }
  };

  const openTransferForItem = (item: InventoryItem) => {
    setTransferSku(item.sku);
    setTransferQty(item.min_stock > item.quantity ? item.min_stock - item.quantity : 20);
    setTransferFrom(item.warehouse === "Q7" ? "Q12" : "Q7");
    setTransferTo(item.warehouse === "Q7" ? "Q7" : "Q12");
    setTransferNote(`Điều chuyển bù tồn cho ${item.name}`);
    setTransferModalOpen(true);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Warehouse className="w-5 h-5 text-sky-500" /> Quản Lý Kho Lạnh Sơn Khang
          </h1>
          <p className="text-xs text-muted-foreground">
            Hệ thống 2 kho lạnh: Kho Q7 (Trung tâm Bán lẻ/Sỉ) & Kho Q12 (Kho tổng Sơ chế/Trữ đông)
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
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

          <Dialog open={transferModalOpen} onOpenChange={setTransferModalOpen}>
            <DialogTrigger asChild>
              <Button
                size="sm"
                className="rounded-full shadow-[0_4px_12px_rgba(14,165,233,0.3)] bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-600 hover:to-sky-700 text-white"
                onClick={() => {
                  setTransferSku(items[0]?.sku || "HEO-XAY-500");
                  setTransferQty(30);
                  setTransferFrom("Q12");
                  setTransferTo("Q7");
                  setTransferNote("Xe lạnh SK-02 điều chuyển định kỳ");
                }}
              >
                <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" /> Điều chuyển kho
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle className="text-base flex items-center gap-2">
                  <Truck className="w-4 h-4 text-sky-500" /> Lập phiếu điều chuyển kho nội bộ
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateTransfer} className="space-y-3 pt-2">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Sản phẩm điều chuyển</label>
                  <select
                    value={transferSku}
                    onChange={(e) => setTransferSku(e.target.value)}
                    className="w-full text-xs h-9 rounded-lg border bg-background px-3 mt-1"
                  >
                    {items.map((i) => (
                      <option key={i.id} value={i.sku}>
                        {i.sku} — {i.name} (Tồn {i.warehouse}: {i.quantity} {i.dvt})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Từ kho xuất</label>
                    <select
                      value={transferFrom}
                      onChange={(e) => setTransferFrom(e.target.value as any)}
                      className="w-full text-xs h-9 rounded-lg border bg-background px-3 mt-1"
                    >
                      <option value="Q12">Kho Tổng Q12</option>
                      <option value="Q7">Kho Lạnh Q7</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">Đến kho nhận</label>
                    <select
                      value={transferTo}
                      onChange={(e) => setTransferTo(e.target.value as any)}
                      className="w-full text-xs h-9 rounded-lg border bg-background px-3 mt-1"
                    >
                      <option value="Q7">Kho Lạnh Q7</option>
                      <option value="Q12">Kho Tổng Q12</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Số lượng chuyển</label>
                  <Input
                    type="number"
                    min="1"
                    value={transferQty}
                    onChange={(e) => setTransferQty(Number(e.target.value))}
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Ghi chú điều chuyển</label>
                  <Input
                    value={transferNote}
                    onChange={(e) => setTransferNote(e.target.value)}
                    placeholder="Vd: Xe lạnh SK-02 điều chuyển ca chiều"
                    className="mt-1 h-9 text-xs"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setTransferModalOpen(false)}
                  >
                    Hủy
                  </Button>
                  <Button
                    type="submit"
                    size="sm"
                    className="rounded-full bg-sky-600 text-white"
                    disabled={isSubmittingTransfer}
                  >
                    {isSubmittingTransfer ? "Đang xử lý…" : "Xác nhận điều chuyển"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* KPI Bento Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Card 1: Kho Q7 */}
        <div className="clay-card p-4 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Kho Lạnh Q7 (Bán sỉ & lẻ)</span>
            <ThermometerSnowflake className="w-4 h-4 text-cyan-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black tracking-tight">{metrics?.q7_capacity_pct || 68}%</span>
            <Badge variant="outline" className="text-[10px] bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 border-cyan-200">
              -2°C ~ 4°C
            </Badge>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-sky-500 rounded-full"
              style={{ width: `${metrics?.q7_capacity_pct || 68}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">Sức chứa: 500 khay/thùng · Vận hành liên tục</p>
        </div>

        {/* Card 2: Kho Q12 */}
        <div className="clay-card p-4 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Kho Tổng Q12 (Hầm đông)</span>
            <ThermometerSnowflake className="w-4 h-4 text-indigo-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black tracking-tight">{metrics?.q12_capacity_pct || 42}%</span>
            <Badge variant="outline" className="text-[10px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 border-indigo-200">
              -18°C Cấp đông
            </Badge>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full"
              style={{ width: `${metrics?.q12_capacity_pct || 42}%` }}
            />
          </div>
          <p className="text-[11px] text-muted-foreground">Hầm trữ đông lớn · Sơ chế & pha lóc sỉ</p>
        </div>

        {/* Card 3: Thiếu tồn */}
        <div className="clay-card p-4 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Cảnh Báo Thiếu Hàng</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-black text-rose-500">
              {(metrics?.out_of_stock_count || 0) + (metrics?.low_stock_count || 0)} <span className="text-xs font-normal text-muted-foreground">mặt hàng</span>
            </span>
            <Badge variant="destructive" className="text-[10px]">
              Cần bù tồn
            </Badge>
          </div>
          <p className="text-[11px] text-muted-foreground">
            Gồm {metrics?.out_of_stock_count || 0} hết hàng và {metrics?.low_stock_count || 0} sắp chạm Min Stock
          </p>
        </div>

        {/* Card 4: Tổng giá trị tồn */}
        <div className="clay-card p-4 space-y-2">
          <div className="flex items-center justify-between text-muted-foreground">
            <span className="text-xs font-semibold">Tổng Giá Trị Tồn Kho</span>
            <Box className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-xl font-bold font-mono text-emerald-600">
              {Number(metrics?.total_value || 0).toLocaleString("vi-VN")} <span className="text-xs font-normal">₫</span>
            </span>
          </div>
          <p className="text-[11px] text-muted-foreground">
            {metrics?.total_skus || 0} danh mục SKU · FEFO quản lý theo hạn dùng
          </p>
        </div>
      </div>

      {/* Bộ lọc và Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {/* Lọc theo Kho */}
          <div className="glossy-pill p-1 flex gap-1 rounded-full border">
            {(["ALL", "Q7", "Q12"] as const).map((w) => (
              <button
                key={w}
                onClick={() => setSelectedWarehouse(w)}
                className={`px-3 py-1 text-xs rounded-full transition-all font-medium ${
                  selectedWarehouse === w
                    ? "bg-sky-500 text-white shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {w === "ALL" ? "2 Kho" : `Kho ${w}`}
              </button>
            ))}
          </div>

          {/* Lọc theo trạng thái cảnh báo */}
          <div className="glossy-pill p-1 flex gap-1 rounded-full border">
            <button
              onClick={() => setSelectedStatus("ALL")}
              className={`px-3 py-1 text-xs rounded-full transition-all font-medium ${
                selectedStatus === "ALL"
                  ? "bg-foreground text-background shadow-sm font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Tất cả
            </button>
            <button
              onClick={() => setSelectedStatus("thieu")}
              className={`px-3 py-1 text-xs rounded-full transition-all font-medium ${
                selectedStatus === "thieu"
                  ? "bg-rose-500 text-white font-semibold"
                  : "text-muted-foreground hover:text-rose-600"
              }`}
            >
              Thiếu tồn
            </button>
            <button
              onClick={() => setSelectedStatus("can-han")}
              className={`px-3 py-1 text-xs rounded-full transition-all font-medium ${
                selectedStatus === "can-han"
                  ? "bg-amber-500 text-white font-semibold"
                  : "text-muted-foreground hover:text-amber-600"
              }`}
            >
              Cận hạn (FEFO)
            </button>
          </div>
        </div>

        {/* Ô tìm kiếm */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm SKU, tên sản phẩm, số lô…"
            className="pl-8 h-9 text-xs rounded-full border-white/80 bg-white/90"
          />
        </div>
      </div>

      {/* Bảng dữ liệu tồn kho */}
      <div className="clay-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-muted/70 text-[11px] text-muted-foreground border-b">
              <tr>
                <th className="px-3 py-2.5 text-left">SKU & Tên Sản Phẩm</th>
                <th className="px-3 py-2.5 text-left">Kho & Vị trí</th>
                <th className="px-3 py-2.5 text-center">Nhiệt độ</th>
                <th className="px-3 py-2.5 text-right">Tồn / Tồn Min</th>
                <th className="px-3 py-2.5 text-left">Số Lô & Hạn Dùng</th>
                <th className="px-3 py-2.5 text-right">Tổng Giá Trị</th>
                <th className="px-3 py-2.5 text-center">Trạng Thái</th>
                <th className="px-3 py-2.5 text-right">Hành Động</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-muted-foreground">
                    Không tìm thấy sản phẩm nào phù hợp với bộ lọc.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-3 py-2.5">
                      <div className="font-semibold text-foreground">{item.name}</div>
                      <div className="font-mono text-[10px] text-muted-foreground">{item.sku} · {item.dvt}</div>
                    </td>
                    <td className="px-3 py-2.5">
                      <Badge variant="outline" className={`font-mono text-[10px] mr-1.5 ${item.warehouse === "Q7" ? "border-sky-300 text-sky-600 bg-sky-50" : "border-indigo-300 text-indigo-600 bg-indigo-50"}`}>
                        {item.warehouse}
                      </Badge>
                      <span className="text-muted-foreground">{item.location}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono text-[11px] text-muted-foreground">
                      {item.temperature}
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <div className="font-mono font-bold text-sm">
                        {item.quantity}{" "}
                        <span className="text-xs font-normal text-muted-foreground">/ {item.min_stock} {item.dvt}</span>
                      </div>
                      <div className="w-20 ml-auto h-1 bg-muted rounded-full overflow-hidden mt-1">
                        <div
                          className={`h-full ${item.quantity <= item.min_stock ? "bg-rose-500" : "bg-emerald-500"}`}
                          style={{ width: `${Math.min(100, Math.round((item.quantity / item.min_stock) * 100))}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-3 py-2.5">
                      <div className="font-mono text-[11px] font-medium">{item.lot_number}</div>
                      <div className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> HSD: {item.expiry_date}
                        {item.days_until_expiry <= 30 && (
                          <span className="text-rose-500 font-semibold">({item.days_until_expiry} ngày)</span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-2.5 text-right font-mono">
                      {Number(item.total_value).toLocaleString("vi-VN")} ₫
                    </td>
                    <td className="px-3 py-2.5 text-center">
                      <Badge
                        variant={
                          item.status === "du"
                            ? "success"
                            : item.status === "can-han"
                              ? "outline"
                              : item.status === "sap-thieu"
                                ? "warning"
                                : "destructive"
                        }
                        className={`text-[10px] rounded-full capitalize ${item.status === "can-han" ? "border-amber-400 text-amber-600 bg-amber-50" : ""}`}
                      >
                        {item.status_label}
                      </Badge>
                    </td>
                    <td className="px-3 py-2.5 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs rounded-full hover:bg-sky-50 hover:text-sky-600"
                        onClick={() => openTransferForItem(item)}
                      >
                        <ArrowRightLeft className="w-3 h-3 mr-1" /> Chuyển kho
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lịch sử phiếu điều chuyển gần đây */}
      {transfers.length > 0 && (
        <div className="clay-card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold flex items-center gap-1.5">
              <Truck className="w-3.5 h-3.5 text-sky-500" /> Phiếu Điều Chuyển Nội Bộ Gần Đây
            </h3>
            <span className="text-[11px] text-muted-foreground">{transfers.length} phiếu</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {transfers.slice(0, 4).map((trf) => (
              <div key={trf.id} className="rounded-xl border p-2.5 bg-white/40 dark:bg-zinc-900/40 flex items-center justify-between text-xs">
                <div>
                  <div className="font-mono font-bold text-sky-600">{trf.code} · {trf.from_warehouse} ➔ {trf.to_warehouse}</div>
                  <div className="text-muted-foreground">{trf.item_name} — {trf.quantity} {trf.dvt}</div>
                  <div className="text-[10px] text-muted-foreground">{trf.created_at} · {trf.created_by}</div>
                </div>
                <Badge
                  variant={trf.status === "completed" ? "success" : "outline"}
                  className={`text-[10px] ${trf.status === "in_transit" ? "border-sky-300 text-sky-600 bg-sky-50" : ""}`}
                >
                  {trf.status_label}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-foreground text-background text-sm px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toast}
        </div>
      )}
    </div>
  );
}
