"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Plus,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { SalesOrder } from "@/packages/modules/sales/types";

const fmtVnd = (n: number) => Number(n).toLocaleString("vi-VN") + " ₫";

interface EditableItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  dvt: string;
  quantity: number;
  unit_price: number;
}

export default function EditSalesOrderPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  const [code, setCode] = React.useState("");
  const [sapoOrderId, setSapoOrderId] = React.useState<string | undefined>();
  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [deliveryAddress, setDeliveryAddress] = React.useState("");
  const [warehouse, setWarehouse] = React.useState<"Q7" | "Q12">("Q7");
  const [paymentMethod, setPaymentMethod] = React.useState<"COD_VIETQR" | "DEBT_B2B" | "TRANSFER">("COD_VIETQR");
  const [deliveryDate, setDeliveryDate] = React.useState("");
  const [notes, setNotes] = React.useState("");
  const [items, setItems] = React.useState<EditableItem[]>([]);

  // Sapo catalog products for fast addition
  const [sapoProducts, setSapoProducts] = React.useState<Array<{ sku: string; name: string; base_price: number }>>([]);

  const fetchOrder = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/sales/${orderId}`);
      const data = await res.json();
      if (!data.success || !data.order) {
        throw new Error(data.error || "Không tìm thấy đơn hàng");
      }
      const ord: SalesOrder = data.order;
      setCode(ord.code);
      setSapoOrderId(ord.sapo_order_id);
      setCustomerName(ord.customer_name);
      setCustomerPhone(ord.customer_phone || "");
      setDeliveryAddress(ord.delivery_address || "");
      setWarehouse(ord.warehouse);
      setPaymentMethod(ord.payment_method);
      setDeliveryDate(ord.delivery_date || "");
      setNotes(ord.notes || "");
      setItems(
        (ord.items || []).map((it) => ({
          id: it.id,
          sku: it.sku,
          name: it.name,
          category: it.category || "Thực phẩm đông lạnh",
          dvt: it.dvt || "Gói",
          quantity: it.quantity,
          unit_price: it.unit_price,
        }))
      );
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi tải thông tin đơn hàng");
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  React.useEffect(() => {
    fetchOrder();
    // fetch live sapo products catalog for adding new items
    fetch("/api/sapo/products?limit=20")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.products)) {
          setSapoProducts(
            d.products.map((p: { sku: string; name: string; base_price: number }) => ({
              sku: p.sku,
              name: p.name,
              base_price: p.base_price,
            }))
          );
        }
      })
      .catch(() => {});
  }, [fetchOrder]);

  const updateItem = (index: number, field: keyof EditableItem, value: unknown) => {
    setItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const removeItem = (index: number) => {
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const addItemFromCatalog = (prod: { sku: string; name: string; base_price: number }) => {
    setItems((prev) => [
      ...prev,
      {
        id: `NEW-ITEM-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
        sku: prod.sku,
        name: prod.name,
        category: "Thực phẩm đông lạnh",
        dvt: "Thùng",
        quantity: 1,
        unit_price: prod.base_price,
      },
    ]);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError("Tên khách hàng không được để trống");
      return;
    }
    if (items.length === 0) {
      setError("Đơn hàng phải có ít nhất 1 mặt hàng");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const mappedItems = items.map((it) => ({
        id: it.id,
        sku: it.sku,
        name: it.name,
        category: it.category,
        dvt: it.dvt,
        quantity: Number(it.quantity) || 1,
        unit_price: Number(it.unit_price) || 0,
        total_price: (Number(it.quantity) || 1) * (Number(it.unit_price) || 0),
      }));

      const res = await fetch(`/api/sales/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          delivery_address: deliveryAddress,
          warehouse,
          payment_method: paymentMethod,
          delivery_date: deliveryDate,
          notes,
          items: mappedItems,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Lỗi lưu cập nhật đơn hàng");
      }

      setSuccess("Cập nhật đơn hàng và đồng bộ Sapo 2 chiều thành công!");
      setTimeout(() => {
        router.push(`/sales/${orderId}`);
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi khi lưu đơn hàng");
      setSaving(false);
    }
  };

  const totalAmount = items.reduce(
    (sum, it) => sum + (Number(it.quantity) || 0) * (Number(it.unit_price) || 0),
    0
  );

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="h-7 w-7 animate-spin text-sky-500" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-20">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Link href={`/sales/${orderId}`}>
            <Button variant="ghost" size="sm" className="rounded-full">
              <ArrowLeft className="mr-1.5 h-4 w-4" /> Quay lại đơn {code}
            </Button>
          </Link>
          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
            Tác vụ: Chỉnh sửa đơn & Đồng bộ Sapo
          </Badge>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card Customer & Header */}
        <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <div>
              <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                Chỉnh sửa đơn hàng <span className="font-mono text-sky-600">{code}</span>
              </h1>
              {sapoOrderId && (
                <p className="text-xs text-muted-foreground">ID Sapo kết nối: #{sapoOrderId} (Đồng bộ 2 chiều)</p>
              )}
            </div>
            <Badge className="bg-sky-600 text-white font-mono">Kho {warehouse}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Tên khách hàng *
              </label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="VD: Quán Ăn Vặt Bé Ba"
                required
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Số điện thoại
              </label>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="VD: 0942 22 60 60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Địa chỉ giao hàng
              </label>
              <Input
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="VD: 27 Đại Cồ Việt, Hai Bà Trưng, Hà Nội"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Kho xuất hàng
              </label>
              <select
                value={warehouse}
                onChange={(e) => setWarehouse(e.target.value as "Q7" | "Q12")}
                className="w-full h-10 rounded-md border bg-white dark:bg-slate-950 px-3 text-sm shadow-sm"
              >
                <option value="Q7">Kho Q7 (Định Công / Tân Thuận)</option>
                <option value="Q12">Kho Q12 (Tân Thới Hiệp)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Phương thức thanh toán
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as "COD_VIETQR" | "DEBT_B2B" | "TRANSFER")}
                className="w-full h-10 rounded-md border bg-white dark:bg-slate-950 px-3 text-sm shadow-sm"
              >
                <option value="COD_VIETQR">COD qua VietQR (Tài xế thu tại điểm)</option>
                <option value="DEBT_B2B">Công nợ B2B hợp đồng (Ghi nợ)</option>
                <option value="TRANSFER">Chuyển khoản trước Techcombank</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Ngày giao dự kiến
              </label>
              <Input
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                placeholder="VD: 10/10/2026"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Ghi chú đơn hàng & yêu cầu đặc biệt
            </label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="VD: Giao trước 10h sáng, cấp đông -18 độ, gọi trước 15p..."
            />
          </div>
        </div>

        {/* Quick Add from Sapo Catalog */}
        {sapoProducts.length > 0 && (
          <div className="rounded-3xl border border-slate-200 bg-slate-50/70 dark:bg-slate-900/50 p-4 space-y-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">
              Thêm nhanh từ danh mục Sapo live:
            </span>
            <div className="flex flex-wrap gap-2">
              {sapoProducts.slice(0, 6).map((sp) => (
                <button
                  key={sp.sku}
                  type="button"
                  onClick={() => addItemFromCatalog(sp)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-sky-200 bg-white dark:bg-slate-800 px-3 py-1 text-xs font-medium text-sky-800 dark:text-sky-300 hover:bg-sky-50 shadow-sm"
                >
                  <Plus className="h-3 w-3" /> {sp.name} ({fmtVnd(sp.base_price)})
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Line Items Table */}
        <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Danh mục mặt hàng ({items.length} món)
            </h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() =>
                setItems((prev) => [
                  ...prev,
                  {
                    id: `CUSTOM-${Date.now()}`,
                    sku: "SK-CUSTOM",
                    name: "Sản phẩm thực phẩm mới",
                    category: "Thực phẩm đông lạnh",
                    dvt: "Thùng",
                    quantity: 1,
                    unit_price: 100000,
                  },
                ])
              }
              className="rounded-full"
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Thêm dòng mới
            </Button>
          </div>

          <div className="space-y-3">
            {items.map((it, idx) => (
              <div
                key={it.id}
                className="flex flex-col md:flex-row md:items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 dark:bg-slate-800/40 p-3.5"
              >
                <div className="flex-1 space-y-1">
                  <Input
                    value={it.name}
                    onChange={(e) => updateItem(idx, "name", e.target.value)}
                    placeholder="Tên sản phẩm"
                    className="font-semibold text-sm h-8"
                  />
                  <div className="flex items-center gap-2">
                    <Input
                      value={it.sku}
                      onChange={(e) => updateItem(idx, "sku", e.target.value)}
                      placeholder="SKU"
                      className="font-mono text-xs h-7 w-36"
                    />
                    <Input
                      value={it.dvt}
                      onChange={(e) => updateItem(idx, "dvt", e.target.value)}
                      placeholder="ĐVT"
                      className="text-xs h-7 w-24"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="w-24">
                    <label className="text-[10px] text-muted-foreground block">Số lượng</label>
                    <Input
                      type="number"
                      min={1}
                      value={it.quantity}
                      onChange={(e) => updateItem(idx, "quantity", Number(e.target.value))}
                      className="font-mono text-sm h-8"
                    />
                  </div>
                  <div className="w-32">
                    <label className="text-[10px] text-muted-foreground block">Đơn giá</label>
                    <Input
                      type="number"
                      min={0}
                      value={it.unit_price}
                      onChange={(e) => updateItem(idx, "unit_price", Number(e.target.value))}
                      className="font-mono text-sm h-8"
                    />
                  </div>
                  <div className="w-32 text-right">
                    <label className="text-[10px] text-muted-foreground block">Thành tiền</label>
                    <div className="font-mono font-bold text-sm text-emerald-600">
                      {fmtVnd((Number(it.quantity) || 0) * (Number(it.unit_price) || 0))}
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem(idx)}
                    className="text-rose-500 hover:text-rose-600 h-8 w-8 p-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t pt-4">
            <span className="font-bold text-slate-700 dark:text-slate-300">Tổng giá trị đơn hàng</span>
            <span className="font-mono text-xl font-black text-emerald-600">{fmtVnd(totalAmount)}</span>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" /> {success}
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href={`/sales/${orderId}`}>
            <Button type="button" variant="outline" className="rounded-full">
              Hủy bỏ
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={saving}
            className="rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold px-8 shadow-md"
          >
            {saving ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Lưu thay đổi & Đồng bộ Sapo
          </Button>
        </div>
      </form>
    </div>
  );
}
