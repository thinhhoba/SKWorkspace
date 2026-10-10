"use client";

import { useState } from "react";
import { Phone, MapPin, Copy, Check, X } from "lucide-react";
import { buildOrderVietQr } from "@/packages/modules/payment/vietqr";

const vnd = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;

type GiaoOrder = {
  code: string;
  customer: string;
  address: string;
  amount: number;
  tel: string;
};

const MOCK_ORDERS: GiaoOrder[] = [
  { code: "DH-2026-001", customer: "Tiệm Mì Cay & Ăn Vặt Bách Khoa", address: "Hai Bà Trưng · 45 Tạ Quang Bửu, Hà Nội", amount: 4850000, tel: "0982111222" },
  { code: "DH-2026-002", customer: "Quán Mì Trộn Indomie & Xiên Que Cầu Giấy", address: "Cầu Giấy · 128 Cầu Giấy, Hà Nội", amount: 2650000, tel: "0973222333" },
  { code: "DH-2026-003", customer: "Đại lý Sỉ Minh Quân (Gửi Chành xe Giáp Bát)", address: "Bến xe Giáp Bát · Đi TP. Nam Định", amount: 15800000, tel: "0912333444" },
];

export default function PwaGiaoVanPage() {
  const [active, setActive] = useState<GiaoOrder | null>(null);
  const [collected, setCollected] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState(false);

  const qrUrl = active ? buildOrderVietQr(active.code, active.amount) : "";

  const handleCopy = async () => {
    if (!qrUrl) return;
    try {
      await navigator.clipboard.writeText(qrUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // fallback: select via prompt
      window.prompt("Copy QR link:", qrUrl);
    }
  };

  const handleCollected = () => {
    if (!active) return;
    setCollected((s) => ({ ...s, [active.code]: true }));
    setActive(null);
  };

  return (
    <div className="flex flex-col gap-3 pb-[calc(16px+env(safe-area-inset-bottom))]">
      {/* Header */}
      <div className="clay-card p-3">
        <div className="flex items-center justify-between">
          <h1 className="text-sm font-extrabold">Giao vận — Thu COD</h1>
          <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700 dark:bg-emerald-950/40">3 đơn hôm nay</span>
        </div>
        <p className="mt-1 text-[11px] text-muted-foreground">Chạm Thu COD để hiện VietQR động theo mã đơn + số tiền</p>
      </div>

      {/* Mock orders */}
      {MOCK_ORDERS.map((o, idx) => {
        const done = !!collected[o.code];
        return (
          <div key={o.code} className="clay-card overflow-hidden p-0">
            <div className="flex items-center justify-between border-b border-white/60 px-3 py-2">
              <span className="mono text-xs font-bold">{o.code}</span>
              <span
                className={`rounded-full px-2.5 py-1 text-[10px] font-bold ${done ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40" : "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30"}`}
              >
                {done ? "Đã thu" : `Điểm ${idx + 1} · Chờ thu`}
              </span>
            </div>
            <div className="p-3">
              <div className="text-sm font-bold">{o.customer}</div>
              <div className="text-[11px] text-muted-foreground">{o.address}</div>
              <div className="mono mt-1.5 text-lg font-extrabold">{vnd(o.amount)}</div>
              <div className="mt-2 grid grid-cols-2 gap-2">
                <a
                  href={`tel:${o.tel}`}
                  className="flex min-h-[52px] items-center justify-center gap-1.5 rounded-full bg-emerald-600 text-sm font-bold text-white"
                >
                  <Phone className="h-4 w-4" /> Gọi
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(o.address)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="glossy-pill flex min-h-[52px] items-center justify-center gap-1.5 text-sm font-bold"
                >
                  <MapPin className="h-4 w-4" /> Bản đồ
                </a>
              </div>
              <button
                type="button"
                onClick={() => setActive(o)}
                disabled={done}
                className={`mt-2 flex min-h-[52px] w-full items-center justify-center rounded-full text-sm font-bold ${done ? "border bg-muted text-muted-foreground" : "bg-sky-600 text-white"}`}
              >
                {done ? "Đã thu COD" : "Thu COD — VietQR"}
              </button>
            </div>
          </div>
        );
      })}

      {/* Legacy placeholder card kept compact */}
      <div className="rounded-2xl border bg-card p-3 text-center">
        <div className="mono text-lg font-bold">08:04</div>
        <div className="mono text-[11px] text-muted-foreground">07/10/2026 — Ca sáng · Vào 07:58 — Đúng giờ</div>
        <div className="mt-2 flex items-center justify-center gap-2 text-xs">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          <span className="font-bold">Online</span>
          <span className="mono text-[11px] text-muted-foreground">GPS · last_synced 08:14</span>
        </div>
      </div>

      {/* Dialog VietQR động */}
      {active ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="giaovan-cod-title">
          <button type="button" aria-label="Đóng" onClick={() => setActive(null)} className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" />
          <div className="clay-card absolute inset-x-3 top-1/2 max-h-[90dvh] -translate-y-1/2 overflow-auto p-4 pb-[calc(16px+env(safe-area-inset-bottom))]">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h2 id="giaovan-cod-title" className="text-sm font-extrabold">
                  Thu COD — {active.code}
                </h2>
                <p className="mt-0.5 text-xs text-muted-foreground">{active.customer} · {active.address}</p>
              </div>
              <button type="button" onClick={() => setActive(null)} className="grid h-9 w-9 place-items-center rounded-full border bg-white/70 dark:bg-white/5">
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="mono mt-3 text-center text-2xl font-extrabold">{vnd(active.amount)}</p>
            <p className="mt-1 text-center text-[11px] text-muted-foreground">
              Nội dung CK: <span className="mono font-bold text-foreground">{active.code}</span> · Techcombank 22226060 (Sơn Khang Food)
            </p>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt={`VietQR ${active.code} ${vnd(active.amount)}`}
              className="mx-auto mt-3 w-full max-w-[280px] rounded-2xl bg-white p-2"
              width={280}
              height={280}
            />

            <div className="mt-3 flex gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="glossy-pill glossy-btn flex min-h-[52px] flex-1 items-center justify-center gap-1.5 text-sm font-semibold"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Đã copy" : "Copy QR link"}
              </button>
              <button
                type="button"
                onClick={handleCollected}
                className="flex min-h-[52px] flex-1 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white"
              >
                Đã thu
              </button>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">VietQR động: amount + addInfo = mã đơn — đối soát tự động khi KH chuyển khoản.</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
