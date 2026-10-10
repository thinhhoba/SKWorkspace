"use client";
import * as React from "react";
import Link from "next/link";
import {
  Store,
  Barcode,
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  Printer,
  CreditCard,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Warehouse,
  ArrowLeft,
  Banknote,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const fmtVnd = (n: number) => Number(n).toLocaleString("vi-VN") + " ₫";

interface PosProduct {
  sku: string;
  name: string;
  price: number;
  dvt: string;
  category: string;
}

interface CartItem extends PosProduct {
  quantity: number;
}

const FALLBACK_POS_PRODUCTS: PosProduct[] = [
  { sku: "HH053", name: "Gà Viên Chiên Popcorn CP Túi 1kg", price: 117000, dvt: "Túi", category: "Gà chiên" },
  { sku: "HH027", name: "Bánh Gà Nét Việt 800g (18 Chiếc) - Hộp", price: 60000, dvt: "Hộp", category: "Gà chiên" },
  { sku: "HH242", name: "Đùi gà chiên giòn CP 1kg (7-8 chiếc)", price: 110000, dvt: "Gói", category: "Gà chiên" },
  { sku: "SKU-MI-INDO-DB", name: "Mì trộn Indomie Vị Đặc Biệt (Thùng 40 gói)", price: 178000, dvt: "Thùng", category: "Mì" },
  { sku: "SKU-MI-KORENO-CJ", name: "Mì Koreno Jjajangmen Tương Đen (Thùng 24 gói)", price: 115000, dvt: "Thùng", category: "Mì" },
  { sku: "SB237", name: "Viên xốt hải sản Mayonaise 450g Thoại An", price: 41000, dvt: "Gói", category: "Viên thả lẩu" },
  { sku: "HH050", name: "Chả Tôm Surimi Ô Ngon 500g (31 Con)", price: 44000, dvt: "Gói", category: "Viên thả lẩu" },
  { sku: "HH092", name: "Xúc xích Hồ lô Đồng Quê LC Foods 500g", price: 47000, dvt: "Gói", category: "Viên thả lẩu" },
  { sku: "HH123", name: "Cá viên Munchee 500g", price: 23500, dvt: "Gói", category: "Viên thả lẩu" },
  { sku: "HH201", name: "Bò viên Muwono 500g (80 viên)", price: 28000, dvt: "Gói", category: "Viên thả lẩu" },
  { sku: "SKU-GV-TUONG-OT-SG", name: "Tương ớt Sài Gòn Can 2L (Thùng 6 can)", price: 196000, dvt: "Thùng", category: "Gia vị" },
];

export default function PosTerminalPage() {
  const [products, setProducts] = React.useState<PosProduct[]>(FALLBACK_POS_PRODUCTS);
  const [loading, setLoading] = React.useState(false);
  const [cart, setCart] = React.useState<CartItem[]>([]);
  const [search, setSearch] = React.useState("");
  const [selectedCat, setSelectedCat] = React.useState<string>("all");
  const [warehouse, setWarehouse] = React.useState<"Q7" | "Q12">("Q7");
  const [customerName, setCustomerName] = React.useState("Khách Mua Lẻ Tại Kho");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [paymentType, setPaymentType] = React.useState<"CASH" | "VIETQR">("VIETQR");
  const [checkoutDone, setCheckoutDone] = React.useState<any | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  // Fetch live products from Sapo API
  React.useEffect(() => {
    setLoading(true);
    fetch("/api/sapo/products?limit=50")
      .then((r) => r.json())
      .then((d) => {
        if (d.success && Array.isArray(d.products) && d.products.length > 0) {
          setProducts(
            d.products.map((p: any) => ({
              sku: p.sku,
              name: p.name,
              price: p.base_price,
              dvt: "Gói",
              category: p.category === "GA_POPCORN" ? "Gà chiên" : p.category === "MI_KHO" ? "Mì" : p.category === "VIEN_THA_LAU" ? "Viên thả lẩu" : "Gia vị",
            }))
          );
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const addToCart = (prod: PosProduct) => {
    setCart((prev) => {
      const idx = prev.findIndex((i) => i.sku === prod.sku);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...updated[idx], quantity: updated[idx].quantity + 1 };
        return updated;
      }
      return [...prev, { ...prod, quantity: 1 }];
    });
  };

  const updateQuantity = (sku: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.sku === sku) {
            const nextQ = item.quantity + delta;
            return nextQ > 0 ? { ...item, quantity: nextQ } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const clearCart = () => setCart([]);

  const totalAmount = cart.reduce((sum, it) => sum + it.quantity * it.price, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: customerName,
          customer_phone: customerPhone,
          delivery_address: `Bán lẻ trực tiếp tại Kho ${warehouse} (pos.sonkhang.vn)`,
          warehouse,
          payment_method: paymentType === "VIETQR" ? "COD_VIETQR" : "TRANSFER",
          notes: `Đơn POS tại quầy - Thanh toán ${paymentType === "VIETQR" ? "VietQR Techcombank" : "Tiền mặt"}`,
          items: cart.map((it) => ({
            sku: it.sku,
            name: it.name,
            quantity: it.quantity,
            unit_price: it.price,
            dvt: it.dvt,
            category: it.category,
          })),
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Lỗi tạo hóa đơn POS");

      setCheckoutDone({
        orderCode: data.order.code,
        sapoId: data.order.sapo_order_id,
        total: totalAmount,
        items: [...cart],
        customerName,
        paymentType,
        date: new Date().toLocaleString("vi-VN"),
      });
      clearCart();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = products
    .filter((p) => selectedCat === "all" || p.category === selectedCat)
    .filter(
      (p) =>
        !search.trim() ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.sku.toLowerCase().includes(search.toLowerCase())
    );

  const vietQrUrl = `https://img.vietqr.io/image/Techcombank-22226060-compact2.png?amount=${totalAmount}&addInfo=POS%20SONKHANG&accountName=CONG%20TY%20TNHH%20THUC%20PHAM%20SON%20KHANG`;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 p-3 md:p-6 text-slate-900 dark:text-slate-100 font-sans">
      {/* Top Header */}
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <Link href="/">
            <Button variant="ghost" size="sm" className="rounded-full">
              <ArrowLeft className="w-4 h-4 mr-1" /> Về trang chủ
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Store className="w-6 h-6 text-sky-600" />
            <h1 className="text-xl font-black tracking-tight">
              SƠN KHANG POS <span className="text-xs font-mono font-normal text-muted-foreground">(pos.sonkhang.vn)</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Badge className="bg-sky-600 text-white font-mono">
            Kho: {warehouse === "Q7" ? "Kho Q7 (Định Công)" : "Kho Q12 (Tân Thới Hiệp)"}
          </Badge>
          <select
            value={warehouse}
            onChange={(e) => setWarehouse(e.target.value as any)}
            className="h-8 rounded-full border bg-white dark:bg-slate-900 px-3 text-xs font-semibold shadow-sm"
          >
            <option value="Q7">Kho Q7</option>
            <option value="Q12">Kho Q12</option>
          </select>
        </div>
      </div>

      {/* Main Grid: Products on Left, Cart on Right */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4">
        {/* Left Side: Product Selector (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {/* Search & Categories */}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Quét mã vạch hoặc gõ tên sản phẩm..."
                className="pl-9 h-11 rounded-2xl bg-white dark:bg-slate-900 shadow-sm text-sm"
              />
            </div>
            <div className="flex gap-1.5 overflow-x-auto text-xs shrink-0">
              {["all", "Gà chiên", "Mì", "Viên thả lẩu", "Gia vị"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCat(cat)}
                  className={`px-3 py-2 rounded-2xl font-bold transition-all ${
                    selectedCat === cat
                      ? "bg-sky-600 text-white shadow-sm"
                      : "bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-200/60"
                  }`}
                >
                  {cat === "all" ? "Tất cả" : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-[680px] overflow-y-auto p-1">
            {filtered.map((prod) => (
              <div
                key={prod.sku}
                onClick={() => addToCart(prod)}
                className="rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 p-3.5 shadow-sm hover:border-sky-400 hover:shadow-md cursor-pointer transition-all flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <Badge variant="outline" className="text-[10px] font-mono">
                    {prod.sku}
                  </Badge>
                  <h2 className="text-xs font-bold leading-tight line-clamp-2">
                    {prod.name}
                  </h2>
                </div>
                <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 mt-2">
                  <span className="font-mono text-sm font-black text-sky-600">
                    {fmtVnd(prod.price)}
                  </span>
                  <Button size="sm" variant="ghost" className="h-7 w-7 p-0 rounded-full bg-sky-50 text-sky-600">
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Cart & Bill Checkout (5 cols) */}
        <div className="lg:col-span-5 rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-sky-600" />
                <h2 className="text-base font-bold">Giỏ hàng thanh toán ({cart.length})</h2>
              </div>
              {cart.length > 0 && (
                <button onClick={clearCart} className="text-xs text-rose-500 hover:underline font-semibold">
                  Xóa tất cả
                </button>
              )}
            </div>

            {/* Customer Inputs */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <label className="text-[11px] font-bold block mb-1">Tên khách hàng</label>
                <Input
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div>
                <label className="text-[11px] font-bold block mb-1">Số điện thoại</label>
                <Input
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="09xx..."
                  className="h-8 text-xs font-mono"
                />
              </div>
            </div>

            {/* Cart Items List */}
            <div className="max-h-[280px] overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
              {cart.length === 0 ? (
                <div className="py-12 text-center text-xs text-muted-foreground">
                  Chưa có sản phẩm nào trong giỏ. Nhấn chọn sản phẩm bên trái để thêm.
                </div>
              ) : (
                cart.map((item) => (
                  <div key={item.sku} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold truncate">{item.name}</div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        {fmtVnd(item.price)} × {item.quantity} = <strong>{fmtVnd(item.quantity * item.price)}</strong>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0 rounded-full"
                        onClick={() => updateQuantity(item.sku, -1)}
                      >
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="font-mono text-xs font-bold w-6 text-center">
                        {item.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0 rounded-full"
                        onClick={() => updateQuantity(item.sku, 1)}
                      >
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Payment & Totals */}
          <div className="space-y-3 pt-3 border-t">
            {/* Payment Method Selector */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setPaymentType("VIETQR")}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-2xl border text-xs font-bold transition-all ${
                  paymentType === "VIETQR"
                    ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <QrCode className="w-4 h-4" /> Quét VietQR
              </button>
              <button
                type="button"
                onClick={() => setPaymentType("CASH")}
                className={`flex items-center justify-center gap-1.5 p-2 rounded-2xl border text-xs font-bold transition-all ${
                  paymentType === "CASH"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <Banknote className="w-4 h-4" /> Tiền mặt
              </button>
            </div>

            {/* Total Display */}
            <div className="flex items-center justify-between text-base font-bold">
              <span>Tổng thanh toán:</span>
              <span className="font-mono text-xl font-black text-emerald-600">
                {fmtVnd(totalAmount)}
              </span>
            </div>

            {paymentType === "VIETQR" && totalAmount > 0 && (
              <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center gap-3">
                <img
                  src={vietQrUrl}
                  alt="VietQR"
                  className="w-16 h-16 rounded-xl border border-white shadow-sm object-contain bg-white"
                />
                <div className="text-[11px] space-y-0.5">
                  <div className="font-bold text-sky-800 dark:text-sky-300">VietQR Techcombank</div>
                  <div>STK: <strong className="font-mono">22226060</strong></div>
                  <div className="text-[10px] text-muted-foreground">Tự động đối soát khớp mã POS</div>
                </div>
              </div>
            )}

            <Button
              disabled={cart.length === 0 || submitting}
              onClick={handleCheckout}
              className="w-full h-12 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-base shadow-lg shadow-sky-600/20"
            >
              {submitting ? (
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Receipt className="mr-2 h-5 w-5" />
              )}
              Thanh Toán & In Bill K80
            </Button>
          </div>
        </div>
      </div>

      {/* Bill K80 Print Modal */}
      {checkoutDone && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 print:p-0 print:bg-white">
          <div className="w-full max-w-sm rounded-3xl bg-white text-slate-900 p-6 shadow-2xl space-y-4 print:shadow-none print:max-w-none print:p-0">
            <div className="text-center space-y-1 border-b pb-3">
              <h2 className="font-black text-base uppercase tracking-wider">CÔNG TY TNHH THỰC PHẨM SƠN KHANG</h2>
              <p className="text-[11px] text-muted-foreground">Kho Định Công: Số 96 Ngõ 337 Định Công, Hoàng Mai, HN</p>
              <p className="text-[11px] font-bold">Hotline Điều xe & Giao hàng: 0942 22 60 60</p>
              <div className="pt-2 font-mono font-bold text-sm">HÓA ĐƠN BÁN LẺ POS: {checkoutDone.orderCode}</div>
              <p className="text-[10px] text-muted-foreground">{checkoutDone.date}</p>
            </div>

            <div className="text-xs space-y-1">
              <div>Khách hàng: <strong>{checkoutDone.customerName}</strong></div>
              <div>Thanh toán: <strong>{checkoutDone.paymentType === "VIETQR" ? "VietQR Techcombank (22226060)" : "Tiền mặt"}</strong></div>
            </div>

            <table className="w-full text-xs border-t border-b py-2">
              <thead>
                <tr className="text-[10px] text-muted-foreground border-b">
                  <th className="text-left py-1">Tên món</th>
                  <th className="text-center py-1">SL</th>
                  <th className="text-right py-1">Đơn giá</th>
                  <th className="text-right py-1">Tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {checkoutDone.items.map((it: any) => (
                  <tr key={it.sku}>
                    <td className="py-1 max-w-[120px] truncate">{it.name}</td>
                    <td className="text-center py-1 font-mono">{it.quantity}</td>
                    <td className="text-right py-1 font-mono text-[11px]">{fmtVnd(it.price)}</td>
                    <td className="text-right py-1 font-mono font-bold text-[11px]">{fmtVnd(it.quantity * it.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex items-center justify-between font-bold text-sm">
              <span>TỔNG CỘNG:</span>
              <span className="font-mono text-base text-emerald-600">{fmtVnd(checkoutDone.total)}</span>
            </div>

            <div className="text-center text-[10px] text-muted-foreground border-t pt-2">
              Cảm ơn quý khách đã mua thực phẩm đông lạnh Sơn Khang!
              <br />Bảo quản tiêu chuẩn -18°C.
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 print:hidden">
              <Button variant="outline" size="sm" onClick={() => setCheckoutDone(null)}>
                Đóng
              </Button>
              <Button size="sm" className="bg-sky-600 text-white font-bold" onClick={() => window.print()}>
                <Printer className="w-4 h-4 mr-1" /> In Bill K80
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
