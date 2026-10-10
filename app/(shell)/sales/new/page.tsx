"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, Trash2, ShoppingCart, Building2, MapPin, Truck, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const SAMPLE_SKUS = [
  { sku: "SK-GA-POP-10KG", name: "Gà Viên Chiên Popcorn CP Thùng 10kg", price: 450000, dvt: "Thùng", category: "Gà rán" },
  { sku: "SK-MI-INDO-DB", name: "Mì trộn Indomie Vị Đặc Biệt (Thùng 40 gói)", price: 165000, dvt: "Thùng", category: "Mì" },
  { sku: "SK-MI-KORENO-CJ", name: "Mì Koreno Jjajangmen Tương Đen (Thùng 24 gói)", price: 106000, dvt: "Thùng", category: "Mì" },
  { sku: "SK-GV-TUONG-OT-SG", name: "Tương ớt Sài Gòn Can 2L (Thùng 6 can)", price: 196000, dvt: "Thùng", category: "Gia vị" },
  { sku: "SK-CHA-TOM-SURIMI", name: "Chả Tôm Surimi Ô Ngon 500g (Gói 31 con)", price: 44000, dvt: "Gói", category: "Xiên que" },
  { sku: "SK-XUC-XICH-HO-LO", name: "Xúc xích Hồ lô Đồng Quê LC Foods 500g", price: 47000, dvt: "Gói", category: "Xiên que" },
];

export default function NewSalesOrderPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [deliveryAddress, setDeliveryAddress] = React.useState("");
  const [warehouse, setWarehouse] = React.useState<"Q7" | "Q12">("Q7");
  const [paymentMethod, setPaymentMethod] = React.useState<"COD_VIETQR" | "DEBT_B2B" | "TRANSFER">("COD_VIETQR");
  const [notes, setNotes] = React.useState("");

  const [items, setItems] = React.useState<Array<{
    sku: string;
    name: string;
    quantity: number;
    unit_price: number;
    dvt: string;
    category: string;
  }>>([
    { sku: "SK-GA-POP-10KG", name: "Gà Viên Chiên Popcorn CP Thùng 10kg", quantity: 2, unit_price: 450000, dvt: "Thùng", category: "Gà rán" }
  ]);

  const [sapoCatalog, setSapoCatalog] = React.useState<Array<{ sku: string; name: string; base_price: number }>>([]);

  React.useEffect(() => {
    fetch("/api/sapo/products?limit=30")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.products) && d.products.length > 0) {
          setSapoCatalog(
            d.products.map((p: { sku: string; name: string; base_price: number }) => ({
              sku: p.sku,
              name: p.name,
              base_price: p.base_price,
            }))
          );
        }
      })
      .catch(() => {});
  }, []);

  const addItem = (template?: { sku: string; name: string; base_price?: number; price?: number; dvt?: string; category?: string }) => {
    if (template) {
      setItems(prev => [...prev, {
        sku: template.sku,
        name: template.name,
        quantity: 1,
        unit_price: template.base_price || template.price || 50000,
        dvt: template.dvt || "Gói",
        category: template.category || "Thực phẩm đông lạnh"
      }]);
    } else {
      setItems(prev => [...prev, {
        sku: "SK-NEW-ITEM",
        name: "Sản phẩm Sơn Khang",
        quantity: 1,
        unit_price: 100000,
        dvt: "Gói",
        category: "Thực phẩm"
      }]);
    }
  };

  const removeItem = (idx: number) => {
    setItems(prev => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: string, val: any) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: val } : item));
  };

  const totalAmount = items.reduce((sum, it) => sum + (it.quantity * it.unit_price), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError("Vui lòng nhập tên khách hàng");
      return;
    }
    if (items.length === 0) {
      setError("Vui lòng thêm ít nhất 1 dòng sản phẩm");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          delivery_address: deliveryAddress,
          warehouse,
          payment_method: paymentMethod,
          notes,
          items
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không thể tạo đơn hàng");
      }

      router.push(`/sales/${data.order.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Navigation header */}
      <div className="flex items-center justify-between">
        <Link href="/sales" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Quay lại danh sách đơn hàng
        </Link>
        <Badge variant="outline" className="border-sky-300 text-sky-600 bg-sky-50">
          Đồng bộ tự động 2 chiều lên Sapo API
        </Badge>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-sky-600" /> Tạo Đơn Bán Hàng Mới
          </h1>
          <p className="text-sm text-muted-foreground">Tạo đơn bán buôn B2B & bán lẻ kho lạnh — đồng bộ thời gian thực sang Sapo</p>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information Card */}
        <div className="clay-card p-5 space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2 text-slate-800">
            <Building2 className="w-4 h-4 text-sky-600" /> Thông Tin Khách Hàng & Nơi Giao
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Tên khách hàng / Quán ăn / Đại lý *</label>
              <Input
                placeholder="VD: Quán Ăn Vặt Bé Bự / Nhà Xe Hưng Thịnh"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Số điện thoại liên hệ</label>
              <Input
                placeholder="VD: 0912 345 678"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Địa chỉ giao hàng / Bến xe nhận</label>
              <Input
                placeholder="VD: Số 5 Ngõ 27 Đại Cồ Việt / Bến xe Giáp Bát gửi xe Tuấn Bình"
                value={deliveryAddress}
                onChange={e => setDeliveryAddress(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Kho xuất hàng</label>
              <select
                className="w-full h-10 px-3 border rounded-md text-sm bg-background"
                value={warehouse}
                onChange={e => setWarehouse(e.target.value as any)}
              >
                <option value="Q7">Kho Lạnh Định Công (Hà Nội)</option>
                <option value="Q12">Kho Lạnh Yên Bình</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">Phương thức thanh toán</label>
              <select
                className="w-full h-10 px-3 border rounded-md text-sm bg-background"
                value={paymentMethod}
                onChange={e => setPaymentMethod(e.target.value as any)}
              >
                <option value="COD_VIETQR">Thu hộ COD / Quét VietQR</option>
                <option value="DEBT_B2B">Ghi nhận công nợ B2B</option>
                <option value="TRANSFER">Chuyển khoản trước (Techcombank 22226060)</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="text-xs font-semibold text-slate-600 block mb-1">Ghi chú đơn hàng & Chành xe</label>
              <Input
                placeholder="VD: Gửi chuyến 11h trưa - Đóng 3 thùng xốp đá gel lạnh"
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Line Items Card */}
        <div className="clay-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2 text-slate-800">
              <Truck className="w-4 h-4 text-sky-600" /> Danh Mục Sản Phẩm & Số Lượng
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Chọn nhanh:</span>
              <div className="flex flex-wrap gap-1">
                {(sapoCatalog.length > 0 ? sapoCatalog.slice(0, 5) : SAMPLE_SKUS.slice(0, 3)).map((s) => (
                  <Button key={s.sku} type="button" variant="outline" size="sm" className="text-xs h-7" onClick={() => addItem(s)}>
                    + {s.name.split(' ').slice(0, 3).join(' ')}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-xs text-muted-foreground">
                  <th className="text-left py-2 font-medium">Sản phẩm</th>
                  <th className="text-left py-2 font-medium w-28">ĐVT</th>
                  <th className="text-center py-2 font-medium w-28">Số lượng</th>
                  <th className="text-right py-2 font-medium w-36">Đơn giá (₫)</th>
                  <th className="text-right py-2 font-medium w-36">Thành tiền (₫)</th>
                  <th className="w-12"></th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {items.map((it, idx) => (
                  <tr key={idx}>
                    <td className="py-2.5 pr-2">
                      <Input
                        value={it.name}
                        onChange={e => updateItem(idx, 'name', e.target.value)}
                        placeholder="Tên sản phẩm"
                        className="text-xs font-medium"
                      />
                      <span className="text-[11px] text-muted-foreground font-mono">{it.sku}</span>
                    </td>
                    <td className="py-2.5 px-1">
                      <Input
                        value={it.dvt}
                        onChange={e => updateItem(idx, 'dvt', e.target.value)}
                        className="text-xs text-center w-20"
                      />
                    </td>
                    <td className="py-2.5 px-1 text-center">
                      <Input
                        type="number"
                        min="1"
                        value={it.quantity}
                        onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                        className="text-xs text-center font-bold"
                      />
                    </td>
                    <td className="py-2.5 px-1 text-right">
                      <Input
                        type="number"
                        min="0"
                        step="1000"
                        value={it.unit_price}
                        onChange={e => updateItem(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                        className="text-xs text-right font-mono"
                      />
                    </td>
                    <td className="py-2.5 pl-2 text-right font-bold text-sky-600 font-mono">
                      {(it.quantity * it.unit_price).toLocaleString()} ₫
                    </td>
                    <td className="py-2.5 text-center">
                      <button
                        type="button"
                        onClick={() => removeItem(idx)}
                        className="text-slate-400 hover:text-red-500 p-1"
                        title="Xóa dòng"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pt-2 flex justify-between items-center border-t">
            <Button type="button" variant="outline" size="sm" onClick={() => addItem()}>
              <Plus className="w-4 h-4 mr-1" /> Thêm dòng hàng
            </Button>
            <div className="text-right">
              <span className="text-xs text-muted-foreground mr-3">Tổng cộng:</span>
              <span className="text-xl font-extrabold text-sky-600 font-mono">
                {totalAmount.toLocaleString()} ₫
              </span>
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <Link href="/sales">
            <Button type="button" variant="outline">Hủy bỏ</Button>
          </Link>
          <Button type="submit" disabled={submitting} className="bg-sky-600 hover:bg-sky-700 text-white min-w-[160px]">
            <Save className="w-4 h-4 mr-1.5" />
            {submitting ? "Đang xử lý..." : "Lưu Đơn Hàng"}
          </Button>
        </div>
      </form>
    </div>
  );
}
