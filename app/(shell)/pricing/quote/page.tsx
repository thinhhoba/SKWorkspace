"use client";
import * as React from "react";
import { ArrowLeft, Plus, Trash2, Download, Copy, Check, FileText } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QuotePreviewCard } from "@/components/pricing/QuotePreviewCard";
import type { PricingItem } from "@/packages/modules/pricing/types";
import type { CustomerB2B } from "@/packages/modules/customers/types";

interface QuoteLine {
  id: string;
  sku: string;
  name: string;
  dvt: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

interface QuoteCustomer {
  name: string;
  phone: string;
  address: string;
}

const fmtVnd = (n: number) => Number(n).toLocaleString("vi-VN") + " ₫";

export default function QuotePage() {
  const router = useRouter();
  const [customers, setCustomers] = React.useState<CustomerB2B[]>([]);
  const [pricingItems, setPricingItems] = React.useState<PricingItem[]>([]);
  const [loadingData, setLoadingData] = React.useState(true);

  // Form state
  const [useExistingCustomer, setUseExistingCustomer] = React.useState(true);
  const [selectedCustomerId, setSelectedCustomerId] = React.useState("");
  const [manualCustomer, setManualCustomer] = React.useState<QuoteCustomer>({
    name: "",
    phone: "",
    address: "",
  });

  const [lines, setLines] = React.useState<QuoteLine[]>([]);
  const [currentSku, setCurrentSku] = React.useState("");
  const [currentQty, setCurrentQty] = React.useState("1");
  const [note, setNote] = React.useState("");
  const [validUntil, setValidUntil] = React.useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split("T")[0];
  });

  const [toast, setToast] = React.useState<string | null>(null);
  const [copyStatus, setCopyStatus] = React.useState<"idle" | "copying" | "success">("idle");

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, pricingRes] = await Promise.all([
          fetch("/api/customers"),
          fetch("/api/pricing"),
        ]);
        const custData = await custRes.json();
        const pricingData = await pricingRes.json();
        if (custData.success) setCustomers(custData.customers || []);
        if (pricingData.success) setPricingItems(pricingData.items || []);
      } catch (e) {
        console.error(e);
        setToast("Lỗi tải dữ liệu");
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const selectedItem = pricingItems.find((it) => it.sku === currentSku);

  const handleAddLine = () => {
    if (!selectedItem) {
      setToast("Vui lòng chọn sản phẩm");
      return;
    }
    const qty = Number(currentQty);
    if (!Number.isFinite(qty) || qty <= 0) {
      setToast("Số lượng phải > 0");
      return;
    }
    const unitPrice = selectedItem.prices.quan_an || selectedItem.prices.ban_le || 0;
    const lineTotal = qty * unitPrice;
    const newLine: QuoteLine = {
      id: `line-${Date.now()}-${Math.random()}`,
      sku: selectedItem.sku,
      name: selectedItem.name,
      dvt: selectedItem.dvt,
      qty,
      unitPrice,
      lineTotal,
    };
    setLines((prev) => [...prev, newLine]);
    setCurrentSku("");
    setCurrentQty("1");
    setToast(`Đã thêm ${selectedItem.name}`);
  };

  const handleRemoveLine = (id: string) => {
    setLines((prev) => prev.filter((l) => l.id !== id));
  };

  const totalAmount = lines.reduce((sum, l) => sum + l.lineTotal, 0);

  const getCustomerForPreview = (): QuoteCustomer => {
    if (useExistingCustomer && selectedCustomerId) {
      const cust = customers.find((c) => c.id === selectedCustomerId);
      if (cust) {
        return {
          name: cust.company_name || cust.name,
          phone: cust.phone,
          address: cust.address,
        };
      }
    }
    return manualCustomer;
  };

  const handleCopyImage = async () => {
    setCopyStatus("copying");
    try {
      const { toPng } = await import("html-to-image");
      const node = document.getElementById("quote-preview-card");
      if (!node) throw new Error("Không tìm thấy preview card");

      const dataUrl = await toPng(node, { quality: 1, pixelRatio: 2 });
      const blob = await (await fetch(dataUrl)).blob();

      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blob }),
      ]);

      setCopyStatus("success");
      setToast("Đã sao chép ảnh báo giá vào clipboard!");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch (err) {
      console.error(err);
      setCopyStatus("idle");
      setToast("Không sao chép được — hãy dùng nút Tải ảnh");
    }
  };

  const handleDownloadImage = async () => {
    try {
      const { toPng } = await import("html-to-image");
      const node = document.getElementById("quote-preview-card");
      if (!node) throw new Error("Không tìm thấy preview card");

      const dataUrl = await toPng(node, { quality: 1, pixelRatio: 2 });
      const link = document.createElement("a");
      link.download = `bao-gia-son-khang-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      setToast("Đã tải ảnh báo giá!");
    } catch (err) {
      console.error(err);
      setToast("Lỗi xuất ảnh");
    }
  };

  const handleSaveQuote = async () => {
    if (lines.length === 0) {
      setToast("Vui lòng thêm ít nhất 1 dòng sản phẩm");
      return;
    }
    const customer = getCustomerForPreview();
    if (!customer.name.trim()) {
      setToast("Vui lòng nhập tên khách hàng");
      return;
    }

    try {
      const res = await fetch("/api/pricing/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customer, lines, note, validUntil }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Lỗi lưu báo giá");
      setToast("Đã lưu báo giá thành công!");
    } catch (err) {
      console.error(err);
      setToast(err instanceof Error ? err.message : "Lỗi lưu báo giá");
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full"
            onClick={() => router.push("/pricing")}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <FileText className="w-5 h-5 text-violet-500" /> Báo giá B2B
            </h1>
            <p className="text-xs text-muted-foreground">
              Xuất ảnh/PDF báo giá gửi Zalo khách hàng
            </p>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        {/* Left: Form */}
        <div className="space-y-4">
          {/* Khách hàng */}
          <div className="clay-card rounded-2xl p-4 space-y-3">
            <h2 className="text-sm font-bold">Thông tin khách hàng</h2>
            <div className="flex gap-2">
              <button
                onClick={() => setUseExistingCustomer(true)}
                className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold border ${
                  useExistingCustomer
                    ? "bg-sky-600 text-white border-sky-600"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                }`}
              >
                Chọn từ danh sách
              </button>
              <button
                onClick={() => setUseExistingCustomer(false)}
                className={`flex-1 rounded-full px-3 py-2 text-xs font-semibold border ${
                  !useExistingCustomer
                    ? "bg-sky-600 text-white border-sky-600"
                    : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                }`}
              >
                Nhập thủ công
              </button>
            </div>

            {useExistingCustomer ? (
              <div>
                <label className="text-xs font-medium">Khách hàng</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(e.target.value)}
                  className="mt-1 w-full h-9 rounded-full border bg-white dark:bg-slate-800 px-3 text-xs"
                  disabled={loadingData}
                >
                  <option value="">-- Chọn khách hàng --</option>
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} — {c.company_name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <label className="text-xs font-medium">Tên khách hàng</label>
                  <Input
                    value={manualCustomer.name}
                    onChange={(e) =>
                      setManualCustomer((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="mt-1 h-9 rounded-full text-xs"
                    placeholder="VD: Quán Mì Trộn ABC"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Số điện thoại</label>
                  <Input
                    value={manualCustomer.phone}
                    onChange={(e) =>
                      setManualCustomer((prev) => ({ ...prev, phone: e.target.value }))
                    }
                    className="mt-1 h-9 rounded-full text-xs"
                    placeholder="0942226060"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium">Địa chỉ</label>
                  <Input
                    value={manualCustomer.address}
                    onChange={(e) =>
                      setManualCustomer((prev) => ({ ...prev, address: e.target.value }))
                    }
                    className="mt-1 h-9 rounded-full text-xs"
                    placeholder="Số nhà, đường, quận, TP"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Thêm dòng sản phẩm */}
          <div className="clay-card rounded-2xl p-4 space-y-3">
            <h2 className="text-sm font-bold">Thêm dòng sản phẩm</h2>
            <div>
              <label className="text-xs font-medium">Chọn sản phẩm (SKU)</label>
              <select
                value={currentSku}
                onChange={(e) => setCurrentSku(e.target.value)}
                className="mt-1 w-full h-9 rounded-full border bg-white dark:bg-slate-800 px-3 text-xs"
                disabled={loadingData}
              >
                <option value="">-- Chọn SKU --</option>
                {pricingItems.map((it) => (
                  <option key={it.id} value={it.sku}>
                    {it.sku} — {it.name} ({it.dvt})
                  </option>
                ))}
              </select>
            </div>

            {selectedItem && (
              <div className="rounded-lg bg-sky-50 dark:bg-slate-800 border border-sky-200 dark:border-slate-700 p-3 text-xs space-y-1">
                <div className="font-semibold">{selectedItem.name}</div>
                <div className="text-muted-foreground">
                  Đơn vị: {selectedItem.dvt} | Giá:{" "}
                  {fmtVnd(selectedItem.prices.quan_an || selectedItem.prices.ban_le)}
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-medium">Số lượng</label>
              <Input
                type="number"
                value={currentQty}
                onChange={(e) => setCurrentQty(e.target.value)}
                className="mt-1 h-9 rounded-full text-xs"
                placeholder="1"
                min="1"
              />
            </div>

            <Button
              className="w-full rounded-full bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={handleAddLine}
              disabled={!currentSku || !selectedItem}
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Thêm dòng
            </Button>
          </div>

          {/* Danh sách dòng */}
          {lines.length > 0 && (
            <div className="clay-card rounded-2xl p-4 space-y-3">
              <h2 className="text-sm font-bold">
                Danh sách dòng ({lines.length})
              </h2>
              <div className="space-y-2">
                {lines.map((line) => (
                  <div
                    key={line.id}
                    className="flex items-center gap-2 rounded-lg border bg-white dark:bg-slate-800 p-2 text-xs"
                  >
                    <div className="flex-1">
                      <div className="font-semibold">{line.name}</div>
                      <div className="text-muted-foreground">
                        {line.qty} {line.dvt} × {fmtVnd(line.unitPrice)} ={" "}
                        <span className="font-semibold text-emerald-600">
                          {fmtVnd(line.lineTotal)}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-full text-rose-600 hover:bg-rose-50"
                      onClick={() => handleRemoveLine(line.id)}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t flex items-center justify-between">
                <span className="text-sm font-bold">Tổng tiền:</span>
                <span className="text-lg font-bold text-emerald-600">
                  {fmtVnd(totalAmount)}
                </span>
              </div>
            </div>
          )}

          {/* Ghi chú & Hiệu lực */}
          <div className="clay-card rounded-2xl p-4 space-y-3">
            <div>
              <label className="text-xs font-medium">Ghi chú (tùy chọn)</label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="mt-1 h-9 rounded-full text-xs"
                placeholder="VD: Giao trước 8h sáng"
              />
            </div>
            <div>
              <label className="text-xs font-medium">Hiệu lực đến</label>
              <Input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="mt-1 h-9 rounded-full text-xs"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-full"
              onClick={handleSaveQuote}
              disabled={lines.length === 0}
            >
              Lưu báo giá
            </Button>
            <Button
              className="flex-1 rounded-full bg-sky-600 hover:bg-sky-700 text-white"
              onClick={handleCopyImage}
              disabled={lines.length === 0 || copyStatus === "copying"}
            >
              {copyStatus === "success" ? (
                <>
                  <Check className="w-3.5 h-3.5 mr-1" /> Đã copy!
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 mr-1" /> Sao chép ảnh
                </>
              )}
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={handleDownloadImage}
              disabled={lines.length === 0}
            >
              <Download className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="clay-card rounded-2xl p-4">
          <h2 className="text-sm font-bold mb-3">Xem trước báo giá</h2>
          <div className="rounded-xl overflow-hidden">
            <QuotePreviewCard
              customer={getCustomerForPreview()}
              lines={lines}
              note={note || undefined}
              validUntil={validUntil}
            />
          </div>
        </div>
      </div>

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full bg-slate-900 text-white px-4 py-2 text-xs shadow-lg">
          {toast}
        </div>
      )}
    </div>
  );
}
