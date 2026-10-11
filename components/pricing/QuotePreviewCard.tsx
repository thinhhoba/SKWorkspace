import * as React from "react";

export interface QuoteLine {
  sku: string;
  name: string;
  dvt: string;
  qty: number;
  unitPrice: number;
  lineTotal: number;
}

export interface QuotePreviewCardProps {
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  lines: QuoteLine[];
  note?: string;
  validUntil?: string;
}

const fmtVnd = (n: number) => Number(n).toLocaleString("vi-VN") + " ₫";

export function QuotePreviewCard({ customer, lines, note, validUntil }: QuotePreviewCardProps) {
  const grandTotal = lines.reduce((sum, line) => sum + line.lineTotal, 0);
  const today = new Date().toLocaleDateString("vi-VN");
  const validDate = validUntil || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString("vi-VN");

  return (
    <div id="quote-preview-card" className="bg-white p-8 rounded-xl border-2 border-slate-200 shadow-lg max-w-4xl mx-auto">
      {/* Header công ty */}
      <div className="border-b-2 border-sky-500 pb-4 mb-6">
        <h1 className="text-2xl font-bold text-sky-700 mb-2">CÔNG TY TNHH THỰC PHẨM SƠN KHANG</h1>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm text-slate-700">
          <div>
            <p><strong>MST:</strong> 0111252725</p>
            <p><strong>Hotline:</strong> 0942 22 60 60</p>
            <p><strong>Cố định:</strong> (024) 22 60 60 60</p>
          </div>
          <div>
            <p><strong>Kho Tổng:</strong></p>
            <p className="text-xs">Số 96 Ngõ 337 Định Công, Hoàng Mai, Hà Nội</p>
            <p className="text-xs mt-1"><strong>STK:</strong> Techcombank 22226060</p>
          </div>
        </div>
      </div>

      {/* Thông tin báo giá */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-emerald-700 mb-3">BÁO GIÁ SẢN PHẨM</h2>
        <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
          <div>
            <p><strong>Ngày báo giá:</strong> {today}</p>
            <p><strong>Hiệu lực đến:</strong> {validDate}</p>
          </div>
          <div>
            <p><strong>Khách hàng:</strong> {customer.name}</p>
            <p><strong>SĐT:</strong> {customer.phone}</p>
            <p className="text-xs"><strong>Địa chỉ:</strong> {customer.address}</p>
          </div>
        </div>
      </div>

      {/* Bảng sản phẩm */}
      <div className="mb-6">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-slate-100 border-b-2 border-slate-300">
              <th className="text-left px-3 py-2 font-semibold border border-slate-300">STT</th>
              <th className="text-left px-3 py-2 font-semibold border border-slate-300">Tên hàng</th>
              <th className="text-center px-3 py-2 font-semibold border border-slate-300">Quy cách</th>
              <th className="text-right px-3 py-2 font-semibold border border-slate-300">SL</th>
              <th className="text-right px-3 py-2 font-semibold border border-slate-300">Đơn giá</th>
              <th className="text-right px-3 py-2 font-semibold border border-slate-300">Thành tiền</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="border-b border-slate-200">
                <td className="px-3 py-2 text-center border border-slate-200">{idx + 1}</td>
                <td className="px-3 py-2 border border-slate-200">
                  <div className="font-medium">{line.name}</div>
                  <div className="text-xs text-slate-500">{line.sku}</div>
                </td>
                <td className="px-3 py-2 text-center border border-slate-200">{line.dvt}</td>
                <td className="px-3 py-2 text-right border border-slate-200">{line.qty}</td>
                <td className="px-3 py-2 text-right border border-slate-200">{fmtVnd(line.unitPrice)}</td>
                <td className="px-3 py-2 text-right font-semibold border border-slate-200">{fmtVnd(line.lineTotal)}</td>
              </tr>
            ))}
            <tr className="bg-emerald-50 border-t-2 border-emerald-500">
              <td colSpan={5} className="px-3 py-3 text-right font-bold text-lg">TỔNG CỘNG:</td>
              <td className="px-3 py-3 text-right font-bold text-lg text-emerald-700">{fmtVnd(grandTotal)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Ghi chú */}
      {note && (
        <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm"><strong>Ghi chú:</strong> {note}</p>
        </div>
      )}

      {/* Chính sách */}
      <div className="border-t pt-4">
        <h3 className="font-bold text-sm mb-2 text-slate-700">CHÍNH SÁCH ÁP DỤNG:</h3>
        <ul className="text-xs text-slate-600 space-y-1 list-disc list-inside">
          <li>Freeship đơn từ <strong>1.000.000₫</strong> (bán kính &lt;8km nội thành HN)</li>
          <li>Freeship đơn từ <strong>3.000.000₫</strong> (bán kính &lt;12km nội thành HN)</li>
          <li>Gửi chành xe bến <strong>Giáp Bát</strong> / <strong>Nước Ngầm</strong> đi các tỉnh phía Bắc (thanh toán 100% trước xuất bến)</li>
          <li>Giá áp dụng đến <strong>7 ngày</strong> kể từ ngày báo giá</li>
          <li>Liên hệ đặt hàng: <strong>0942 22 60 60</strong> (Zalo) — <strong>sonkhang.vn</strong></li>
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t text-center">
        <p className="text-sm font-semibold text-sky-700">CÔNG TY TNHH THỰC PHẨM SƠN KHANG</p>
        <p className="text-xs text-slate-600">Cảm ơn Quý khách đã tin tưởng và đồng hành!</p>
      </div>
    </div>
  );
}
