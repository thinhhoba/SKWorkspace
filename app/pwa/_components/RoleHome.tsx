"use client";

import { useState, type ElementType } from "react";
import {
  AlertTriangle,
  Check,
  Phone,
  MapPin,
  ThermometerSnowflake,
  TrendingUp,
  Wallet,
  Package,
  Camera,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { QrViewport } from "./QrViewport";
import { usePwaRole } from "./RoleProvider";
import type { PwaTabId } from "./roleNav";

const vnd = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;

const VIETQR_URL =
  "https://img.vietqr.io/image/970422-0123456789-compact2.png?amount=42800000&addInfo=SP-0841%20Son%20Khang&accountName=CONG%20TY%20SON%20KHANG";

type ApprovalState = "pending" | "approved" | "rejected";

export function RoleHome() {
  const { role, tab } = usePwaRole();
  return (
    <div className="flex flex-col gap-2.5">
      {role === "admin" ? <AdminHome tab={tab} /> : null}
      {role === "accountant" ? <AccountantHome tab={tab} /> : null}
      {role === "warehouse" ? <WarehouseHome tab={tab} /> : null}
      {role === "delivery" ? <DeliveryHome tab={tab} /> : null}
    </div>
  );
}

function Kpi({
  label,
  value,
  sub,
  tone,
  icon: Icon,
  mono,
}: {
  label: string;
  value: string;
  sub: string;
  tone: "sky" | "warning" | "danger";
  icon: ElementType;
  mono?: boolean;
}) {
  const border = tone === "sky" ? "border-l-sky-500" : tone === "warning" ? "border-l-amber-500" : "border-l-rose-500";
  const iconWrap =
    tone === "sky"
      ? "bg-gradient-to-br from-sky-400 to-sky-600"
      : tone === "warning"
        ? "bg-gradient-to-br from-amber-400 to-orange-500"
        : "bg-gradient-to-br from-rose-400 to-rose-600";
  return (
    <div data-tone={tone} className={cn("clay-kpi flex flex-col gap-1 border-l-4 p-3", `clay-kpi--${tone}`, border)}>
      <div className="flex items-start justify-between gap-2">
        <p className="text-[10px] font-bold tracking-widest text-muted-foreground">{label}</p>
        <span className={cn("inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/80 text-white", iconWrap)}>
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <p className={cn("mt-0.5 text-sm font-extrabold tracking-tight", mono && "mono")}>{value}</p>
      <p className="text-[11px] text-muted-foreground">{sub}</p>
    </div>
  );
}

function ApprovalRow({
  title,
  sub,
  state,
  onApprove,
  onReject,
}: {
  title: string;
  sub: string;
  state: ApprovalState;
  onApprove: () => void;
  onReject: () => void;
}) {
  return (
    <div className="border-b border-white/50 px-3 py-3 last:border-b-0 dark:border-white/10">
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-0.5 text-[11px] text-muted-foreground">{sub}</div>
      {state === "pending" ? (
        <div className="mt-2 flex gap-2">
          <button
            type="button"
            onClick={onApprove}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white"
          >
            Duyệt
          </button>
          <button
            type="button"
            onClick={onReject}
            className="flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-rose-600 text-xs font-bold text-white"
          >
            Từ chối
          </button>
        </div>
      ) : (
        <span
          className={cn(
            "mt-2 inline-flex rounded-full px-2 py-1 text-[11px] font-bold",
            state === "approved" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
          )}
        >
          {state === "approved" ? "Đã duyệt" : "Đã từ chối"}
        </span>
      )}
    </div>
  );
}

function AdminHome({ tab }: { tab: PwaTabId }) {
  const [a1, setA1] = useState<ApprovalState>("pending");
  const [a2, setA2] = useState<ApprovalState>("pending");
  const [a3, setA3] = useState<ApprovalState>("pending");

  if (tab === "duyet-lenh") {
    return (
      <div className="clay-card overflow-hidden p-0">
        <div className="border-b border-white/60 px-3 py-2 text-xs font-bold">Lệnh chờ duyệt</div>
        <ApprovalRow
          title="Phiếu chi khẩn 15.000.000 ₫"
          sub="Kho Q7 · NCC đá khô · hôm nay"
          state={a1}
          onApprove={() => setA1("approved")}
          onReject={() => setA1("rejected")}
        />
        <ApprovalRow
          title="Đơn SP-0842 xuất vượt hạn mức"
          sub="Minh Khang Food · công nợ 42.1tr"
          state={a2}
          onApprove={() => setA2("approved")}
          onReject={() => setA2("rejected")}
        />
        <ApprovalRow
          title="Điều chuyển Q12 → Q7"
          sub="Heo xay 500g · 80 gói"
          state={a3}
          onApprove={() => setA3("approved")}
          onReject={() => setA3("rejected")}
        />
      </div>
    );
  }

  if (tab === "dong-tien") {
    return (
      <>
        <div className="clay-card p-3">
          <div className="text-xs font-bold">Số dư quỹ</div>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex min-h-[44px] items-center justify-between">
              <span>Tiền mặt két</span>
              <span className="mono font-bold">{vnd(42000000)}</span>
            </div>
            <div className="flex min-h-[44px] items-center justify-between">
              <span>Vietcombank</span>
              <span className="mono font-bold">{vnd(318200000)}</span>
            </div>
            <div className="flex min-h-[44px] items-center justify-between">
              <span>MB Bank</span>
              <span className="mono font-bold">{vnd(180000000)}</span>
            </div>
          </div>
        </div>
        <div className="clay-card p-3">
          <div className="text-xs font-bold">Giao dịch gần đây</div>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>SP-0841 An Thịnh · VietQR</span>
              <span className="mono font-bold text-emerald-600">+{vnd(42800000)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phiếu chi kho Q7</span>
              <span className="mono font-bold text-rose-600">−{vnd(15000000)}</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  if (tab === "cai-dat") {
    return (
      <div className="clay-card overflow-hidden p-0">
        <div className="border-b border-white/60 px-3 py-2 text-xs font-bold">Cài đặt</div>
        {["Thông báo đẩy", "Đồng bộ Sapo", "Máy in nhiệt Q7", "Đăng xuất"].map((item) => (
          <button
            key={item}
            type="button"
            className="flex min-h-[44px] w-full items-center justify-between border-b border-white/40 px-3 text-sm last:border-b-0"
          >
            {item}
            <span className="text-muted-foreground">→</span>
          </button>
        ))}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Kpi label="DOANH THU THỰC THU" value={vnd(128400000)} sub="Hôm nay · thực thu" tone="sky" icon={TrendingUp} mono />
        <Kpi label="SỐ DƯ QUỸ" value={vnd(540200000)} sub="Tiền mặt + NH" tone="sky" icon={Wallet} mono />
        <Kpi label="CÔNG NỢ QUÁ HẠN" value={vnd(84200000)} sub="An Thịnh Mart 12 ngày" tone="danger" icon={AlertTriangle} mono />
        <Kpi label="TỒN CẢNH BÁO" value="5 SKU" sub="Heo xay thiếu · Q7" tone="warning" icon={Package} />
      </div>

      <div className="clay-card overflow-hidden p-0">
        <div className="border-b border-white/60 px-3 py-2 text-xs font-bold">Quick Approvals</div>
        <ApprovalRow
          title="Phiếu chi khẩn 15.000.000 ₫"
          sub="Kho Q7 · NCC đá khô"
          state={a1}
          onApprove={() => setA1("approved")}
          onReject={() => setA1("rejected")}
        />
        <ApprovalRow
          title="Đơn SP-0842 xuất vượt hạn mức"
          sub="Minh Khang Food"
          state={a2}
          onApprove={() => setA2("approved")}
          onReject={() => setA2("rejected")}
        />
      </div>

      <div className="clay-card p-3">
        <div className="mb-2 flex items-center gap-1.5 text-xs font-bold">
          <ThermometerSnowflake className="h-3.5 w-3.5 text-sky-600" />
          Radar nhiệt
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-2xl bg-sky-50 p-3 dark:bg-sky-950/30">
            <div className="text-[11px] text-muted-foreground">Kho Q7</div>
            <div className="mono text-lg font-extrabold text-sky-700 dark:text-sky-300">-18.2°C</div>
          </div>
          <div className="rounded-2xl bg-sky-50 p-3 dark:bg-sky-950/30">
            <div className="text-[11px] text-muted-foreground">Kho Q12</div>
            <div className="mono text-lg font-extrabold text-sky-700 dark:text-sky-300">-17.9°C</div>
          </div>
        </div>
      </div>
    </>
  );
}

function AccountantHome({ tab }: { tab: PwaTabId }) {
  const [zalo, setZalo] = useState<Record<string, boolean>>({});
  const [retried, setRetried] = useState(false);
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({});

  if (tab === "sapo-misa") {
    return (
      <div className="clay-card p-3">
        <div className="text-xs font-bold">Sapo ↔ MISA</div>
        <div className="mt-3 grid grid-cols-3 gap-2 text-center">
          <div>
            <div className="mono text-lg font-extrabold text-emerald-600">48</div>
            <div className="text-[11px] text-muted-foreground">Đã sync</div>
          </div>
          <div>
            <div className="mono text-lg font-extrabold text-amber-600">3</div>
            <div className="text-[11px] text-muted-foreground">Chờ duyệt</div>
          </div>
          <div>
            <div className="mono text-lg font-extrabold text-rose-600">1</div>
            <div className="text-[11px] text-muted-foreground">Lỗi MST</div>
          </div>
        </div>
        <div className="mt-3 flex min-h-[44px] items-center justify-between rounded-2xl bg-rose-50 px-3 py-2 dark:bg-rose-950/30">
          <div>
            <div className="text-sm font-semibold">SP-0840 · MST sai</div>
            <div className="text-[11px] text-muted-foreground">Minh Khang Food</div>
          </div>
          <button
            type="button"
            onClick={() => setRetried(true)}
            className="glossy-pill glossy-btn min-h-[44px] px-3 text-xs font-semibold"
          >
            {retried ? "Đã đẩy lại" : "Đẩy sync lại"}
          </button>
        </div>
      </div>
    );
  }

  const payments = [
    { id: "SP-0841", kh: "An Thịnh Mart", amt: 42800000 },
    { id: "SP-0839", kh: "Hòa Bình Market", amt: 18600000 },
  ];

  if (tab === "thu-chi" || tab === "doi-soat") {
    return (
      <>
        {tab === "doi-soat" ? (
          <div className="clay-card p-3 text-sm">
            <div className="text-xs font-bold">Đối soát VietQR</div>
            <p className="mt-1 text-[11px] text-muted-foreground">48 phiếu khớp · 1 chờ xác nhận</p>
          </div>
        ) : (
          <div className="clay-card p-3 text-sm">
            <div className="text-xs font-bold">Thu / Chi hôm nay</div>
            <p className="mt-1 text-[11px] text-muted-foreground">Khách vừa CK theo đơn — xác nhận 1 chạm</p>
          </div>
        )}
        {payments.map((p) => (
          <div key={p.id} className="clay-card flex items-center gap-3 p-3">
            <div className="min-w-0 flex-1">
              <div className="mono text-xs font-bold">{p.id}</div>
              <div className="truncate text-sm">{p.kh}</div>
              <div className="mono text-sm font-extrabold">{vnd(p.amt)}</div>
            </div>
            <button
              type="button"
              onClick={() => setConfirmed((s) => ({ ...s, [p.id]: true }))}
              className="glossy-pill glossy-btn min-h-[44px] px-3 text-xs font-semibold"
            >
              {confirmed[p.id] ? "Đã xác nhận" : "Xác nhận"}
            </button>
          </div>
        ))}
      </>
    );
  }

  return (
    <>
      {[
        { id: "at", name: "An Thịnh Mart", amt: "84.2tr", days: 12 },
        { id: "mk", name: "Minh Khang Food", amt: "42.1tr", days: 5 },
      ].map((c) => (
        <div key={c.id} className="clay-card p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-bold">{c.name}</div>
              <div className="text-[11px] text-rose-600">
                Quá {c.days} ngày · <span className="mono font-bold">{c.amt}</span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setZalo((s) => ({ ...s, [c.id]: true }))}
              className="glossy-pill glossy-btn min-h-[44px] px-3 text-xs font-semibold"
            >
              {zalo[c.id] ? "Đã gửi nhắc" : "Nhắc Zalo"}
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

function WarehouseHome({ tab }: { tab: PwaTabId }) {
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setChecked((s) => {
      const next = !s[id];
      if (next) navigator.vibrate?.(12);
      return { ...s, [id]: next };
    });
  };

  if (tab === "nhap-hang") {
    return (
      <div className="clay-card overflow-hidden p-0">
        <div className="flex items-center justify-between border-b border-white/60 px-3 py-2">
          <span className="text-xs font-bold">PN-0412 — NCC Đá khô Nam Việt</span>
          <span className="glossy-pill px-2 py-1 text-[10px] font-bold">Chờ nhận</span>
        </div>
        <div className="divide-y divide-white/40 text-sm">
          {[
            { name: "Đá khô 10kg", qty: "40 thùng" },
            { name: "Túi PE thực phẩm", qty: "20 bịch" },
          ].map((row) => (
            <div key={row.name} className="flex min-h-[52px] items-center justify-between px-3">
              <span>{row.name}</span>
              <span className="font-bold">{row.qty}</span>
            </div>
          ))}
        </div>
        <div className="p-3">
          <button type="button" className="flex min-h-[52px] w-full items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
            Xác nhận nhập
          </button>
        </div>
      </div>
    );
  }

  if (tab === "kho-lanh") {
    return (
      <>
        <div className="grid grid-cols-2 gap-2">
          <div className="clay-card p-3">
            <div className="text-[11px] text-muted-foreground">Kho Q7</div>
            <div className="mono text-xl font-extrabold text-sky-700">-18°C</div>
          </div>
          <div className="clay-card p-3">
            <div className="text-[11px] text-muted-foreground">Kho Q12</div>
            <div className="mono text-xl font-extrabold text-sky-700">-18°C</div>
          </div>
        </div>
        <div className="clay-card overflow-hidden p-0">
          <div className="border-b border-white/60 px-3 py-2 text-xs font-bold">Tồn cảnh báo</div>
          <div className="flex min-h-[52px] items-center justify-between px-3">
            <span className="text-sm">Heo xay 500g</span>
            <span className="rounded-full border border-rose-200 bg-rose-50 px-2 py-1 font-bold text-rose-600">Thiếu · 12</span>
          </div>
        </div>
      </>
    );
  }

  if (tab === "quet-ma") {
    return (
      <div className="clay-card p-3">
        <div className="mb-2 text-xs font-bold">Quét mã lô / HSD</div>
        <QrViewport />
      </div>
    );
  }

  const lines = [
    { id: "heo", name: "Heo xay 500g", qty: "40 gói" },
    { id: "bo", name: "Bò viên 1kg", qty: "20 gói" },
    { id: "cha", name: "Chả lụa 500g", qty: "50 đòn" },
  ];
  const done = lines.every((l) => checked[l.id]);

  return (
    <div className="clay-card overflow-hidden p-0">
      <div className="flex items-center justify-between border-b border-white/60 px-3 py-2">
        <div>
          <div className="mono text-xs font-bold">SP-0841</div>
          <div className="text-sm font-semibold">An Thịnh Mart</div>
        </div>
        <span className={cn("glossy-pill px-2 py-1 text-[10px] font-bold", done && "text-emerald-700")}>
          {done ? "Đã soạn xong" : "Đang soạn"}
        </span>
      </div>
      {lines.map((l) => (
        <button
          key={l.id}
          type="button"
          onClick={() => toggle(l.id)}
          className={cn(
            "flex min-h-[52px] w-full items-center justify-between border-b border-white/40 px-3 text-left last:border-b-0",
            checked[l.id] && "bg-emerald-50 dark:bg-emerald-950/30"
          )}
        >
          <span className="flex items-center gap-2 text-sm">
            <span
              className={cn(
                "grid h-6 w-6 place-items-center rounded-full border",
                checked[l.id] ? "border-emerald-500 bg-emerald-500 text-white" : "border-slate-300"
              )}
            >
              {checked[l.id] ? <Check className="h-3.5 w-3.5" /> : null}
            </span>
            {l.name}
          </span>
          <span className="font-bold">{l.qty}</span>
        </button>
      ))}
    </div>
  );
}

function DeliveryHome({ tab }: { tab: PwaTabId }) {
  const [codOpen, setCodOpen] = useState(false);
  const [pod, setPod] = useState<Record<string, boolean>>({});

  const stops = [
    { id: "1", name: "An Thịnh Mart", dist: "Q7", tel: "0900000001", maps: "An+Thinh+Mart+Q7", order: "SP-0841", amt: 42800000 },
    { id: "2", name: "Minh Khang Food", dist: "Q1", tel: "0900000002", maps: "Minh+Khang+Food+Q1", order: "SP-0840", amt: 18300000 },
    { id: "3", name: "Hòa Bình Market", dist: "Q4", tel: "0900000003", maps: "Hoa+Binh+Market+Q4", order: "SP-0839", amt: 67200000 },
  ];

  if (tab === "quet-qr") {
    return (
      <div className="clay-card p-3">
        <div className="mb-2 text-xs font-bold">Quét QR giao hàng</div>
        <QrViewport />
      </div>
    );
  }

  if (tab === "lich-su") {
    return (
      <>
        {[
          { code: "SP-0838", kh: "Hòa Bình Market", time: "07:40", amt: 22100000 },
          { code: "SP-0837", kh: "Tân Phong Mart", time: "07:15", amt: 15400000 },
        ].map((t) => (
          <div key={t.code} className="clay-card p-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="mono text-xs font-bold">{t.code}</div>
                <div className="text-sm font-semibold">{t.kh}</div>
              </div>
              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-bold text-emerald-700">Đã giao {t.time}</span>
            </div>
            <div className="mono mt-1 text-sm font-bold">{vnd(t.amt)}</div>
          </div>
        ))}
      </>
    );
  }

  if (tab === "thu-cod") {
    return (
      <>
        <div className="clay-card p-3">
          <div className="mono text-xs font-bold">SP-0841</div>
          <div className="text-sm font-semibold">An Thịnh Mart · Q7</div>
          <div className="mono mt-1 text-lg font-extrabold">{vnd(42800000)}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">Nội dung CK: SP-0841 Son Khang</div>
          <button
            type="button"
            onClick={() => setCodOpen(true)}
            className="mt-3 flex min-h-[52px] w-full items-center justify-center rounded-full bg-sky-600 text-sm font-bold text-white"
          >
            Thu tiền COD
          </button>
        </div>
        {codOpen ? (
          <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="cod-title">
            <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" aria-label="Đóng" onClick={() => setCodOpen(false)} />
            <div className="clay-card absolute inset-x-3 top-1/2 max-h-[90dvh] -translate-y-1/2 overflow-auto p-4">
              <h2 id="cod-title" className="text-sm font-bold">
                Thu tiền COD
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">SP-0841 · An Thịnh Mart</p>
              <p className="mono mt-2 text-xl font-extrabold">{vnd(42800000)}</p>
              <p className="mt-1 text-[11px] text-muted-foreground">Nội dung CK: SP-0841 Son Khang</p>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={VIETQR_URL} alt="VietQR SP-0841" className="mx-auto mt-3 w-full max-w-[260px] rounded-2xl bg-white" width={260} height={260} />
              <p className="mt-2 text-center text-[11px] text-muted-foreground">Tài khoản demo — thay STK thật khi go-live</p>
              <button
                type="button"
                onClick={() => setCodOpen(false)}
                className="glossy-pill glossy-btn mt-3 flex min-h-[44px] w-full items-center justify-center text-sm font-semibold"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : null}
      </>
    );
  }

  return (
    <>
      {stops.map((s, i) => (
        <div key={s.id} className="clay-card p-3">
          <div className="text-[11px] font-bold text-muted-foreground">Điểm {i + 1}</div>
          <div className="text-sm font-bold">
            {s.name} · {s.dist}
          </div>
          <div className="mono text-[11px] text-muted-foreground">
            {s.order} · {vnd(s.amt)}
          </div>
          <div className="mt-2 grid grid-cols-2 gap-2">
            <a
              href={`tel:${s.tel}`}
              className="flex min-h-[52px] items-center justify-center gap-1.5 rounded-full bg-emerald-600 text-sm font-bold text-white"
            >
              <Phone className="h-4 w-4" /> Gọi
            </a>
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${s.maps}`}
              target="_blank"
              rel="noreferrer"
              className="glossy-pill flex min-h-[52px] items-center justify-center gap-1.5 text-sm font-bold"
            >
              <MapPin className="h-4 w-4" /> Mở bản đồ
            </a>
          </div>
          <button
            type="button"
            onClick={() => setPod((p) => ({ ...p, [s.id]: true }))}
            className="mt-2 flex min-h-[52px] w-full items-center justify-center gap-1.5 rounded-full border border-white/80 bg-white/70 text-sm font-semibold dark:bg-white/5"
          >
            <Camera className="h-4 w-4" />
            {pod[s.id] ? "Đã chụp PoD" : "Chụp PoD"}
          </button>
        </div>
      ))}
    </>
  );
}
