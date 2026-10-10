"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  PackageCheck,
  Truck,
  Building2,
  Phone,
  MapPin,
  Calendar,
  CreditCard,
  Edit,
  Trash2,
  Printer,
  CheckCircle2,
  Clock,
  QrCode,
  FileSpreadsheet
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { SalesOrder, OrderStatus } from "@/packages/modules/sales/types";
import { ORDER_STATUS_LABEL, ORDER_STATUS_COLOR } from "@/packages/modules/sales/types";

export default function SalesOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [order, setOrder] = React.useState<SalesOrder | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);
  const [actioning, setActioning] = React.useState(false);

  const fetchOrder = React.useCallback(async () => {
    if (!id) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/sales/${id}`);
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Không tìm thấy đơn hàng");
      }
      setOrder(data.order);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const handleStatusChange = async (nextStatus: OrderStatus) => {
    if (!order) return;
    setActioning(true);
    try {
      const res = await fetch(`/api/sales/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus })
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Lỗi đổi trạng thái");
      }
      setOrder(data.order);
      setToast(`Đã chuyển trạng thái sang: ${ORDER_STATUS_LABEL[nextStatus]}`);
    } catch (err: any) {
      setToast(`Lỗi: ${err.message}`);
    } finally {
      setActioning(false);
    }
  };

  const handleDelete = async () => {
    if (!order) return;
    if (!confirm(`Bạn có chắc muốn xóa đơn hàng ${order.code}? Thao tác này sẽ hủy đơn trên Sapo.`)) return;

    setActioning(true);
    try {
      const res = await fetch(`/api/sales/${order.id}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Lỗi xóa đơn");
      }
      alert("Đã xóa đơn hàng thành công");
      router.push("/sales");
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
      setActioning(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-muted-foreground">
        ⏳ Đang tải thông tin đơn hàng {id}...
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center space-y-4">
        <p className="text-red-500 font-semibold">⚠️ {error || "Đơn hàng không tồn tại"}</p>
        <Link href="/sales">
          <Button variant="outline"><ArrowLeft className="w-4 h-4 mr-1" /> Quay lại danh sách</Button>
        </Link>
      </div>
    );
  }

  const isChanhXe = (order.delivery_address || "").toLowerCase().includes("bến xe") ||
                    (order.notes || "").toLowerCase().includes("chành xe") ||
                    (order.notes || "").toLowerCase().includes("gửi xe");

  const vietQrUrl = `https://img.vietqr.io/image/Techcombank-22226060-compact2.png?amount=${order.total_amount}&addInfo=TT%20DH%20${order.code}&accountName=CONG%20TY%20TNHH%20THUC%20PHAM%20SON%20KHANG`;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      {/* Toast notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-lg shadow-xl text-sm animate-in fade-in">
          {toast}
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/sales" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
          <ArrowLeft className="w-4 h-4" /> Danh sách đơn hàng
        </Link>
        <div className="flex items-center gap-2">
          {order.sapo_order_id && (
            <Badge variant="outline" className="border-sky-300 text-sky-700 bg-sky-50 font-mono">
              🔗 Sapo ID: #{order.sapo_order_id}
            </Badge>
          )}
          <Badge className={`font-semibold ${ORDER_STATUS_COLOR[order.status]}`}>
            {ORDER_STATUS_LABEL[order.status]}
          </Badge>
        </div>
      </div>

      {/* Title & Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            Đơn Hàng <span className="text-sky-600 font-mono">{order.code}</span>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ngày tạo: {order.created_at} • Kho xuất: Kho {order.warehouse}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Deep link to Picking task */}
          <Link href={`/sales/${order.id}/pick`}>
            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
              <PackageCheck className="w-4 h-4 mr-1.5" /> Soạn Hàng
            </Button>
          </Link>
          <Link href={`/sales/${order.id}/edit`}>
            <Button variant="outline">
              <Edit className="w-4 h-4 mr-1.5" /> Sửa Đơn
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="w-4 h-4 mr-1.5" /> In Phiếu
          </Button>
          <Button variant="destructive" size="sm" onClick={handleDelete} disabled={actioning}>
            <Trash2 className="w-4 h-4 mr-1" /> Xóa
          </Button>
        </div>
      </div>

      {/* Status Transition Toolbar */}
      <div className="clay-card p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-semibold text-muted-foreground">Chuyển trạng thái nhanh:</span>
        <div className="flex flex-wrap gap-1.5">
          {order.status !== "cho_soan" && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleStatusChange("cho_soan")}>
              Chờ soạn
            </Button>
          )}
          {order.status !== "dang_soan" && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleStatusChange("dang_soan")}>
              Đang soạn
            </Button>
          )}
          {order.status !== "da_soan" && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleStatusChange("da_soan")}>
              Đã soạn
            </Button>
          )}
          {order.status !== "dang_giao" && (
            <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => handleStatusChange("dang_giao")}>
              Đang giao (Tài xế Tân)
            </Button>
          )}
          {order.status !== "hoan_tat" && (
            <Button size="sm" className="h-7 text-xs bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleStatusChange("hoan_tat")}>
              ✓ Hoàn tất
            </Button>
          )}
          {order.status !== "huy" && (
            <Button size="sm" variant="outline" className="h-7 text-xs text-red-600 hover:bg-red-50" onClick={() => handleStatusChange("huy")}>
              Hủy đơn
            </Button>
          )}
        </div>
      </div>

      {/* Information Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Customer Information */}
        <div className="clay-card p-5 space-y-3">
          <h2 className="text-sm font-bold flex items-center gap-2 text-slate-800 border-b pb-2">
            <Building2 className="w-4 h-4 text-sky-600" /> Khách Hàng & Giao Nhận
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tên khách hàng:</span>
              <span className="font-bold text-slate-800">{order.customer_name}</span>
            </div>
            {order.customer_phone && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Điện thoại:</span>
                <span className="font-mono">{order.customer_phone}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Địa chỉ nhận:</span>
              <span className="text-right max-w-[240px] font-medium">{order.delivery_address || "Tại kho"}</span>
            </div>
            {order.notes && (
              <div className="pt-2 border-t text-amber-700 bg-amber-50/50 p-2 rounded">
                <b>Ghi chú:</b> {order.notes}
              </div>
            )}
          </div>
        </div>

        {/* Payment & Logistics */}
        <div className="clay-card p-5 space-y-3">
          <h2 className="text-sm font-bold flex items-center gap-2 text-slate-800 border-b pb-2">
            <CreditCard className="w-4 h-4 text-emerald-600" /> Thanh Toán & Vận Chuyển
          </h2>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Hình thức:</span>
              <Badge variant="outline" className="text-xs">
                {order.payment_method === "COD_VIETQR" ? "Thu hộ COD / VietQR" : order.payment_method === "DEBT_B2B" ? "Công nợ B2B" : "Chuyển khoản"}
              </Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Đã thanh toán:</span>
              <span className="font-mono font-bold text-emerald-600">{order.paid_amount.toLocaleString()} ₫</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Còn phải thu:</span>
              <span className="font-mono font-bold text-amber-600">
                {Math.max(0, order.total_amount - order.paid_amount).toLocaleString()} ₫
              </span>
            </div>
            <div className="flex justify-between pt-1">
              <span className="text-muted-foreground">Tuyến điều vận:</span>
              <span className="font-semibold">{isChanhXe ? "🚚 Chành xe gửi tỉnh" : "🚛 Xe lạnh 29C-882.60 (Nội thành HN)"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Line Items Table */}
      <div className="clay-card p-5 space-y-3">
        <h2 className="text-sm font-bold flex items-center justify-between text-slate-800 border-b pb-2">
          <span>Chi Tiết Sản Phẩm ({order.items.length} mặt hàng)</span>
          <span className="text-xs text-muted-foreground font-normal">
            Trạng thái soạn: {order.items.filter(i => i.picked).length}/{order.items.length} món
          </span>
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b text-muted-foreground">
                <th className="text-left py-2 font-medium">STT</th>
                <th className="text-left py-2 font-medium">Sản phẩm</th>
                <th className="text-center py-2 font-medium">ĐVT</th>
                <th className="text-center py-2 font-medium">Số lượng</th>
                <th className="text-right py-2 font-medium">Đơn giá</th>
                <th className="text-right py-2 font-medium">Thành tiền</th>
                <th className="text-center py-2 font-medium">Đã soạn</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {order.items.map((it, idx) => (
                <tr key={it.id || idx}>
                  <td className="py-2.5 text-muted-foreground">{idx + 1}</td>
                  <td className="py-2.5 font-medium">
                    <div>{it.name}</div>
                    <span className="text-[11px] text-muted-foreground font-mono">{it.sku}</span>
                  </td>
                  <td className="py-2.5 text-center">{it.dvt}</td>
                  <td className="py-2.5 text-center font-bold">{it.quantity}</td>
                  <td className="py-2.5 text-right font-mono">{it.unit_price.toLocaleString()} ₫</td>
                  <td className="py-2.5 text-right font-mono font-bold text-sky-600">
                    {it.total_price.toLocaleString()} ₫
                  </td>
                  <td className="py-2.5 text-center">
                    {it.picked ? (
                      <span className="text-emerald-600 font-bold">✓ Xong</span>
                    ) : (
                      <span className="text-slate-400">Chưa</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pt-3 border-t flex justify-end items-center gap-4">
          <span className="text-sm font-semibold text-muted-foreground">Tổng tiền đơn hàng:</span>
          <span className="text-2xl font-black text-sky-600 font-mono">
            {order.total_amount.toLocaleString()} ₫
          </span>
        </div>
      </div>

      {/* QR VietQR Payment Box */}
      <div className="clay-card p-5 flex flex-wrap items-center justify-between gap-4 bg-gradient-to-r from-sky-50 to-emerald-50 border border-sky-200">
        <div className="space-y-1">
          <div className="text-sm font-bold flex items-center gap-2 text-slate-800">
            <QrCode className="w-5 h-5 text-sky-600" /> Mã VietQR Thu Tiền Techcombank
          </div>
          <p className="text-xs text-muted-foreground">
            Quét mã VietQR trên app ngân hàng để chuyển khoản chính xác số tiền {order.total_amount.toLocaleString()} ₫
          </p>
          <p className="text-xs font-mono text-slate-600">
            STK: <b>22226060</b> • Ngân hàng: <b>Techcombank</b> • Chủ TK: <b>CONG TY TNHH THUC PHAM SON KHANG</b>
          </p>
        </div>
        <div>
          <img src={vietQrUrl} alt="VietQR" className="w-32 h-32 rounded-lg border shadow-sm bg-white p-1" />
        </div>
      </div>
    </div>
  );
}
