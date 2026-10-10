"use client";
import * as React from "react";
import Link from "next/link";
import {
  ShoppingCart,
  Truck,
  Building2,
  Phone,
  MapPin,
  CheckCircle2,
  Sparkles,
  QrCode,
  ShieldCheck,
  Plus,
  Minus,
  RefreshCw,
  Search,
  ArrowRight,
  Flame,
  Award,
  X,
  Package,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

const fmtVnd = (n: number) => Number(n).toLocaleString("vi-VN") + " ₫";

interface B2BProduct {
  sku: string;
  name: string;
  category: string;
  dvt: string;
  retailPrice: number;
  wholesaleTier1: number; // Chành xe
  wholesaleTier2: number; // Căn tin
  wholesaleTier3: number; // Quán ăn
  highlight?: string;
}

const B2B_PRODUCTS: B2BProduct[] = [
  {
    sku: "HH053",
    name: "Gà Viên Chiên Popcorn CP Túi 1kg (Thùng 10kg)",
    category: "Gà chiên giòn",
    dvt: "Thùng",
    retailPrice: 450000,
    wholesaleTier1: 396000,
    wholesaleTier2: 418000,
    wholesaleTier3: 432000,
    highlight: "Bán chạy nhất quán ăn vặt",
  },
  {
    sku: "HH027",
    name: "Bánh Gà Nét Việt 800g (18 Chiếc) - Hộp",
    category: "Gà chiên giòn",
    dvt: "Hộp",
    retailPrice: 60000,
    wholesaleTier1: 52000,
    wholesaleTier2: 55000,
    wholesaleTier3: 57000,
    highlight: "Giòn rụm thơm ngon",
  },
  {
    sku: "SKU-MI-INDO-DB",
    name: "Mì trộn Indomie Vị Đặc Biệt 85g (Thùng 40 gói)",
    category: "Mì ăn liền",
    dvt: "Thùng",
    retailPrice: 178000,
    wholesaleTier1: 156000,
    wholesaleTier2: 165000,
    wholesaleTier3: 170000,
    highlight: "Sốt đậm đà chuẩn vị",
  },
  {
    sku: "SKU-MI-KORENO-CJ",
    name: "Mì Koreno Jjajangmen Tương Đen 115g (Thùng 24 gói)",
    category: "Mì ăn liền",
    dvt: "Thùng",
    retailPrice: 115000,
    wholesaleTier1: 101000,
    wholesaleTier2: 107000,
    wholesaleTier3: 110000,
  },
  {
    sku: "HH092",
    name: "Xúc xích Hồ lô Đồng Quê LC Foods 500g (Gói 45 viên)",
    category: "Xiên que & thả lẩu",
    dvt: "Gói",
    retailPrice: 47000,
    wholesaleTier1: 41000,
    wholesaleTier2: 43000,
    wholesaleTier3: 45000,
    highlight: "Thịt dai giòn thơm béo",
  },
  {
    sku: "HH123",
    name: "Cá viên Munchee 500g (Gói)",
    category: "Xiên que & thả lẩu",
    dvt: "Gói",
    retailPrice: 23500,
    wholesaleTier1: 20500,
    wholesaleTier2: 21800,
    wholesaleTier3: 22500,
  },
  {
    sku: "HH201",
    name: "Bò viên Muwono 500g (Gói 80 viên)",
    category: "Xiên que & thả lẩu",
    dvt: "Gói",
    retailPrice: 28000,
    wholesaleTier1: 24500,
    wholesaleTier2: 26000,
    wholesaleTier3: 27000,
  },
  {
    sku: "SKU-GV-TUONG-OT-SG",
    name: "Tương ớt Sài Gòn Can 2L (Thùng 6 can)",
    category: "Gia vị & xốt",
    dvt: "Thùng",
    retailPrice: 196000,
    wholesaleTier1: 172000,
    wholesaleTier2: 182000,
    wholesaleTier3: 188000,
    highlight: "Đậm đà cay ngọt dịu",
  },
];

export default function FastWebOrderPage() {
  const [selectedTier, setSelectedTier] = React.useState<"tier1" | "tier2" | "tier3">("tier3");
  const [cartQuantities, setCartQuantities] = React.useState<Record<string, number>>({});
  const [customerName, setCustomerName] = React.useState("");
  const [customerPhone, setCustomerPhone] = React.useState("");
  const [customerAddress, setCustomerAddress] = React.useState("");
  const [busStationNote, setBusStationNote] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [orderResult, setOrderResult] = React.useState<any | null>(null);

  // Tra cứu đơn hàng thời gian thực qua SĐT
  const [showLookupModal, setShowLookupModal] = React.useState(false);
  const [lookupPhone, setLookupPhone] = React.useState("");
  const [lookupLoading, setLookupLoading] = React.useState(false);
  const [lookupOrders, setLookupOrders] = React.useState<any[] | null>(null);

  const handleLookupOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    const phone = lookupPhone.trim();
    if (!phone) return;
    setLookupLoading(true);
    try {
      const res = await fetch(`/api/sales?phone=${encodeURIComponent(phone)}`);
      const data = await res.json();
      if (data.success && Array.isArray(data.orders)) {
        setLookupOrders(data.orders);
      } else {
        setLookupOrders([]);
      }
    } catch {
      setLookupOrders([]);
    } finally {
      setLookupLoading(false);
    }
  };

  const getPrice = (p: B2BProduct) => {
    if (selectedTier === "tier1") return p.wholesaleTier1;
    if (selectedTier === "tier2") return p.wholesaleTier2;
    return p.wholesaleTier3;
  };

  const updateQuantity = (sku: string, delta: number) => {
    setCartQuantities((prev) => {
      const cur = prev[sku] || 0;
      const next = Math.max(0, cur + delta);
      return { ...prev, [sku]: next };
    });
  };

  const totalItemsCount = Object.values(cartQuantities).reduce((a, b) => a + b, 0);

  const totalAmount = B2B_PRODUCTS.reduce((sum, p) => {
    const q = cartQuantities[p.sku] || 0;
    return sum + q * getPrice(p);
  }, 0);

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (totalItemsCount === 0) {
      alert("Vui lòng chọn ít nhất 1 mặt hàng");
      return;
    }
    if (!customerName.trim() || !customerPhone.trim()) {
      alert("Vui lòng nhập tên và số điện thoại nhận hàng");
      return;
    }

    setSubmitting(true);
    try {
      const items = B2B_PRODUCTS.filter((p) => (cartQuantities[p.sku] || 0) > 0).map((p) => ({
        sku: p.sku,
        name: p.name,
        quantity: cartQuantities[p.sku],
        unit_price: getPrice(p),
        dvt: p.dvt,
        category: p.category,
      }));

      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-channel": "web_order" },
        body: JSON.stringify({
          channel: "web_order",
          customer_name: customerName.trim(),
          customer_phone: customerPhone.trim(),
          delivery_address: customerAddress.trim() || "Nhận tại bến xe",
          warehouse: "Q7",
          payment_method: "COD_VIETQR",
          notes: `Web Order nhanh (dathang.sonkhang.vn) - Bảng giá: ${
            selectedTier === "tier1" ? "Cấp 1 Chành xe (-12%)" : selectedTier === "tier2" ? "Cấp 2 Căn tin (-7%)" : "Cấp 3 Quán ăn"
          } | Ghi chú chành xe: ${busStationNote}`,
          items,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Không thể đặt hàng");

      const aliasCode: string = data.alias_code || data.order?.code || data.order?.alias_code || "";
      setOrderResult({
        orderCode: aliasCode,
        alias_code: aliasCode,
        sapoId: data.order.sapo_order_id,
        customerName,
        customerPhone,
        totalAmount,
        items,
      });
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const vietQrUrl = `https://img.vietqr.io/image/Techcombank-22226060-compact2.png?amount=${totalAmount}&addInfo=DATHANG%20${customerPhone}&accountName=CONG%20TY%20TNHH%20THUC%20PHAM%20SON%20KHANG`;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans pb-24">
      {/* Top Brand Banner */}
      <div className="bg-gradient-to-r from-sky-600 via-cyan-600 to-indigo-700 text-white p-6 md:p-10 shadow-lg">
        <div className="max-w-4xl mx-auto space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs font-bold tracking-widest bg-white/20 backdrop-blur-md px-3 py-1 rounded-full uppercase">
              dathang.sonkhang.vn • Cung Cấp Sỉ Thực Phẩm Đông Lạnh
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowLookupModal(true)}
                className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-xs font-bold flex items-center gap-1.5 transition-all text-white backdrop-blur-sm shadow-sm"
              >
                <Search className="w-3.5 h-3.5" /> Tra Cứu Đơn Hàng
              </button>
              <Link href="/" className="text-xs text-white/80 hover:text-white underline">
                Cổng nội bộ Sơn Khang
              </Link>
            </div>
          </div>
          <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-tight">
            Đặt Hàng Sỉ B2B Nhanh Cho Quán Ăn, Căn Tin &amp; Chành Xe
          </h1>
          <p className="text-xs md:text-sm text-sky-100 max-w-2xl leading-relaxed">
            Hàng chính hãng CP, Indomie, Thoại An, Ô Ngon. Vận chuyển chuyên nghiệp bằng xe tải lạnh Isuzu <strong>29C-882.60</strong> giữ nhiệt -18°C. Hỗ trợ giao tận chành xe bến Giáp Bát &amp; Nước Ngầm.
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-6 space-y-6">
        {/* Tier Price Matrix Selector */}
        <div className="rounded-3xl border border-sky-200 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
            Chọn nhóm đối tượng để áp dụng giá sỉ tốt nhất:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setSelectedTier("tier1")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedTier === "tier1"
                  ? "bg-sky-50 dark:bg-sky-950/40 border-sky-500 ring-2 ring-sky-500 shadow-sm"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-sky-700 dark:text-sky-300">Cấp 1: Chành Xe Tỉnh</span>
                <Badge className="bg-sky-600 text-[10px]">Giảm ~12%</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">Đơn gửi xe khách đi các tỉnh miền Bắc & miền Trung (đóng thùng xốp đá gel lạnh).</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTier("tier2")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedTier === "tier2"
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500 shadow-sm"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-emerald-700 dark:text-emerald-300">Cấp 2: Bếp Ăn & Căn Tin</span>
                <Badge className="bg-emerald-600 text-[10px]">Giảm ~7%</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">Trường học, đại học, nhà máy, căn tin hợp đồng giao định kỳ theo tuần.</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedTier("tier3")}
              className={`p-4 rounded-2xl border text-left transition-all ${
                selectedTier === "tier3"
                  ? "bg-amber-50 dark:bg-amber-950/40 border-amber-500 ring-2 ring-amber-500 shadow-sm"
                  : "border-slate-200 hover:bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-amber-700 dark:text-amber-300">Cấp 3: Quán Ăn Vặt</span>
                <Badge className="bg-amber-600 text-[10px]">Giá Sỉ Gốc</Badge>
              </div>
              <p className="text-[11px] text-muted-foreground">Quán trà sữa, xiên que, quán ăn nhanh lấy từ 1–3 thùng/đơn.</p>
            </button>
          </div>
        </div>

        {/* Product Catalog with Quantity Pickers */}
        <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Flame className="w-5 h-5 text-amber-500" /> Danh mục món sỉ Sơn Khang ({B2B_PRODUCTS.length} mặt hàng)
            </h2>
            <span className="text-xs text-muted-foreground">Bấm (+) để chọn số lượng</span>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {B2B_PRODUCTS.map((prod) => {
              const currentPrice = getPrice(prod);
              const q = cartQuantities[prod.sku] || 0;
              return (
                <div key={prod.sku} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="space-y-1 min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{prod.name}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">{prod.sku}</Badge>
                      {prod.highlight && (
                        <span className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full">
                          {prod.highlight}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>ĐVT: <strong>{prod.dvt}</strong></span>
                      <span>Giá sỉ: <strong className="font-mono text-emerald-600 font-bold">{fmtVnd(currentPrice)}</strong></span>
                      {currentPrice < prod.retailPrice && (
                        <span className="line-through text-[11px]">{fmtVnd(prod.retailPrice)}</span>
                      )}
                    </div>
                  </div>

                  {/* Quantity Controller */}
                  <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                    <div className="flex items-center gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-800 p-1">
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => updateQuantity(prod.sku, -1)}
                        className="h-8 w-8 p-0 rounded-xl"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </Button>
                      <span className="font-mono text-sm font-black w-8 text-center">{q}</span>
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => updateQuantity(prod.sku, 1)}
                        className="h-8 w-8 p-0 rounded-xl bg-sky-600 text-white hover:bg-sky-700"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </Button>
                    </div>

                    <div className="w-24 text-right">
                      <span className="font-mono text-xs font-bold text-emerald-600">
                        {fmtVnd(q * currentPrice)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Customer Information Form */}
        <form onSubmit={handleSubmitOrder} className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h2 className="text-base font-bold flex items-center gap-2 border-b pb-3">
            <Truck className="w-5 h-5 text-sky-600" /> Thông tin nhận hàng &amp; Chành xe
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold block mb-1">Tên khách hàng / Quán ăn / Đại lý *</label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="VD: Quán Ăn Vặt Cầu Giấy"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold block mb-1">Số điện thoại nhận hàng *</label>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="VD: 0942 22 60 60"
                required
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold block mb-1">Địa chỉ giao hàng chi tiết</label>
              <Input
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder="VD: Số 27 Đại Cồ Việt, Hai Bà Trưng, Hà Nội"
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-xs font-bold block mb-1">Thông tin chành xe gửi hàng (Nếu ở các tỉnh)</label>
              <Input
                value={busStationNote}
                onChange={(e) => setBusStationNote(e.target.value)}
                placeholder="VD: Bến xe Giáp Bát - Nhà xe Tuấn Bình - Biển số xe / Giờ xe chạy..."
              />
            </div>
          </div>

          {/* Sticky Checkout Bar Preview */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20 p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <span className="text-xs text-muted-foreground block">TỔNG ĐƠN ĐẶT HÀNG:</span>
              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-black text-emerald-600">{fmtVnd(totalAmount)}</span>
                <span className="text-xs text-muted-foreground font-semibold">({totalItemsCount} món)</span>
              </div>
              <p className="text-[11px] text-muted-foreground">Thanh toán khi nhận hàng hoặc quét VietQR Techcombank (22226060)</p>
            </div>

            <Button
              type="submit"
              disabled={totalItemsCount === 0 || submitting}
              className="rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base h-12 px-8 shadow-lg shadow-emerald-600/20"
            >
              {submitting ? (
                <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <ArrowRight className="mr-2 h-5 w-5" />
              )}
              Gửi Đơn Đặt Hàng Ngay
            </Button>
          </div>
        </form>
      </div>

      {/* Order Success Popup */}
      {orderResult && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95 text-center">
            <div className="h-16 w-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
                ĐẶT HÀNG THÀNH CÔNG!
              </h2>
              <p className="font-mono text-base font-bold text-sky-600">Mã đơn: {orderResult.orderCode}</p>
              {orderResult.sapoId && (
                <p className="text-xs text-muted-foreground font-mono">Đồng bộ Sapo ID: #{orderResult.sapoId}</p>
              )}
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 dark:bg-slate-800/60 p-4 text-xs text-left space-y-1.5">
              <div>Khách nhận: <strong>{orderResult.customerName}</strong> ({orderResult.customerPhone})</div>
              <div>Tổng tiền thanh toán: <strong className="font-mono text-emerald-600 text-sm">{fmtVnd(orderResult.totalAmount)}</strong></div>
              <div>Hình thức giao: Xe tải lạnh 29C-882.60 hoặc gửi chành xe</div>
            </div>

            {/* Dynamic VietQR code */}
            <div className="p-3 bg-white rounded-2xl border flex flex-col items-center gap-2">
              <img src={vietQrUrl} alt="VietQR" className="w-36 h-36 rounded-xl object-contain" />
              <div className="text-[11px] text-muted-foreground">
                Quét mã Techcombank <strong>22226060</strong> để thanh toán trước
              </div>
            </div>

            <Button
              className="w-full rounded-full bg-sky-600 text-white font-bold"
              onClick={() => {
                setOrderResult(null);
                setCartQuantities({});
              }}
            >
              Hoàn tất &amp; Đặt đơn khác
            </Button>
          </div>
        </div>
      )}

      {/* Order Tracking Lookup Modal */}
      {showLookupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <Search className="w-5 h-5 text-sky-600" />
                <h2 className="text-base font-black text-slate-900 dark:text-slate-100">
                  TRA CỨU TIẾN ĐỘ ĐƠN HÀNG
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowLookupModal(false);
                  setLookupOrders(null);
                }}
                className="text-muted-foreground hover:text-slate-900 dark:hover:text-white p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleLookupOrder} className="flex gap-2">
              <Input
                value={lookupPhone}
                onChange={(e) => setLookupPhone(e.target.value)}
                placeholder="Nhập số điện thoại người nhận hàng..."
                className="rounded-2xl"
              />
              <Button
                type="submit"
                disabled={lookupLoading || !lookupPhone.trim()}
                className="rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-bold shrink-0"
              >
                {lookupLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Tra Cứu"}
              </Button>
            </form>

            {lookupOrders && (
              <div className="space-y-3 max-h-80 overflow-y-auto pt-2">
                {lookupOrders.length === 0 ? (
                  <p className="text-xs text-center text-muted-foreground py-4">
                    Không tìm thấy đơn hàng nào với số điện thoại này.
                  </p>
                ) : (
                  lookupOrders.map((ord: any) => (
                    <div
                      key={ord.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-800 p-3.5 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-sky-600">{ord.code}</span>
                        <Badge
                          className={
                            ord.status === "hoan_tat"
                              ? "bg-emerald-600 text-white"
                              : ord.status === "dang_giao"
                              ? "bg-amber-600 text-white"
                              : "bg-sky-600 text-white"
                          }
                        >
                          {ord.status === "cho_duyet"
                            ? "Chờ duyệt"
                            : ord.status === "cho_soan"
                            ? "Chờ soạn kho"
                            : ord.status === "dang_soan"
                            ? "Đang soạn kho"
                            : ord.status === "da_soan"
                            ? "Đã đóng gói"
                            : ord.status === "dang_giao"
                            ? "Đang giao xe tải lạnh"
                            : ord.status === "hoan_tat"
                            ? "Hoàn tất / Đã giao"
                            : ord.status}
                        </Badge>
                      </div>

                      <div className="text-muted-foreground space-y-0.5 text-[11px]">
                        <div>Khách: <strong>{ord.customer_name}</strong></div>
                        <div>Địa chỉ: {ord.delivery_address}</div>
                        <div>Tổng tiền: <strong className="font-mono text-emerald-600">{fmtVnd(ord.total_amount)}</strong></div>
                      </div>

                      {ord.notes && (
                        <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-2 text-[10px] text-muted-foreground">
                          {ord.notes}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
