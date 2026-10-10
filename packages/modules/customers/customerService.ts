// Service khách hàng B2B — Sơn Khang
// Fallback mock: sẽ thay bằng Prisma khi DATABASE_URL khả dụng — xem packages/core/db.ts
import type { CustomerB2B, DebtSummary, DebtAgingBucket, RiskLevel, CustomerType } from "./types";
import { MOCK_CUSTOMERS } from "./mockData";

let customerStore: CustomerB2B[] = [...MOCK_CUSTOMERS];

// ---------------------------------------------------------------------------
// Hằng số vận hành Sơn Khang
// ---------------------------------------------------------------------------
export const TECHCOMBANK_ACCOUNT = "22226060";
export const TECHCOMBANK_NAME = "CONG TY TNHH THUC PHAM SON KHANG";
export const ACCOUNTANT_NAME = "Hoàng Thị Nho";
export const ACCOUNTANT_PHONE = "0942 22 60 60";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const vndFmt = new Intl.NumberFormat("vi-VN");

function formatVND(n: number): string {
  return `${vndFmt.format(n)} VNĐ`;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("vi-VN"); // dd/mm/yyyy
}

function buildVietQRNote(c: CustomerB2B): string {
  return `Thanh toan cong no ${c.code} - ${c.company_name} - MST ${c.mst}`;
}

function buildVietQRUrl(amount: number, note: string): string {
  // VietQR quick-link: https://vietqr.io — Techcombank 970407
  const encoded = encodeURIComponent(note);
  return `https://img.vietqr.io/image/970407-${TECHCOMBANK_ACCOUNT}-compact.png?amount=${amount}&addInfo=${encoded}&accountName=${encodeURIComponent(TECHCOMBANK_NAME)}`;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getCustomers(opts?: {
  search?: string;
  customer_type?: CustomerType | "ALL";
  aging?: DebtAgingBucket | "ALL";
  risk?: RiskLevel | "ALL";
  overdueOnly?: boolean;
}): CustomerB2B[] {
  let list = [...customerStore];

  if (opts?.search && opts.search.trim()) {
    const q = opts.search.trim().toLowerCase();
    list = list.filter(
      (c) =>
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.company_name.toLowerCase().includes(q) ||
        c.mst.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.delivery_route.toLowerCase().includes(q)
    );
  }

  if (opts?.customer_type && opts.customer_type !== "ALL") {
    list = list.filter((c) => c.customer_type === opts.customer_type);
  }

  if (opts?.overdueOnly) {
    list = list.filter((c) => c.overdue_days > 0);
  }

  if (opts?.aging && opts.aging !== "ALL") {
    list = list.filter((c) => (c.aging[opts.aging as DebtAgingBucket] ?? 0) > 0);
  }

  if (opts?.risk && opts.risk !== "ALL") {
    list = list.filter((c) => c.risk_level === opts.risk);
  }

  return list;
}

export function getDebtSummary(): DebtSummary {
  let current = 0;
  let overdue_1_15 = 0;
  let overdue_16_30 = 0;
  let overdue_gt30 = 0;

  for (const c of customerStore) {
    current += c.aging.current;
    overdue_1_15 += c.aging.overdue_1_15;
    overdue_16_30 += c.aging.overdue_16_30;
    overdue_gt30 += c.aging.overdue_gt30;
  }

  const total_debt = current + overdue_1_15 + overdue_16_30 + overdue_gt30;
  const overdue_total = overdue_1_15 + overdue_16_30 + overdue_gt30;
  const collection_rate_pct =
    total_debt === 0 ? 100 : Math.round(100 - (overdue_total / total_debt) * 100);

  return {
    total_debt,
    current,
    overdue_1_15,
    overdue_16_30,
    overdue_gt30,
    overdue_total,
    collection_rate_pct,
  };
}

export function getCustomerById(id: string): CustomerB2B | undefined {
  return customerStore.find((c) => c.id === id);
}

export function getRiskLevel(c: CustomerB2B): RiskLevel {
  if (c.aging.overdue_gt30 > 0) return "blocked";
  if (c.aging.overdue_16_30 > 0) return "danger";
  if (c.aging.overdue_1_15 > 0) return "warning";
  return "safe";
}

/**
 * Sinh văn bản nhắc nợ Zalo trang trọng kèm bảng kê quá hạn + VietQR Techcombank 22226060.
 * Dùng cho POST /api/customers/[id]/remind — "Nhắc nợ Zalo 1-chạm".
 */
export function generateZaloDebtReminder(customerId: string): {
  customer: CustomerB2B;
  message: string;
  zaloUrl: string;
  vietQrUrl: string;
  vietQrNote: string;
} | null {
  const c = getCustomerById(customerId);
  if (!c) return null;
  return {
    customer: c,
    message: buildZaloRemindMessage(c),
    zaloUrl: `https://zalo.me/${c.phone}`,
    vietQrUrl: buildVietQRUrl(
      c.aging.overdue_1_15 + c.aging.overdue_16_30 + c.aging.overdue_gt30 || c.current_debt,
      buildVietQRNote(c)
    ),
    vietQrNote: buildVietQRNote(c),
  };
}

export function buildZaloRemindMessage(c: CustomerB2B): string {
  const todayStr = formatDate(new Date());
  const overdueTotal = c.aging.overdue_1_15 + c.aging.overdue_16_30 + c.aging.overdue_gt30;

  const agingLines: string[] = [];
  if (c.aging.current > 0) agingLines.push(`  • Trong hạn: ${formatVND(c.aging.current)}`);
  if (c.aging.overdue_1_15 > 0) agingLines.push(`  • Quá hạn 1–15 ngày: ${formatVND(c.aging.overdue_1_15)}`);
  if (c.aging.overdue_16_30 > 0) agingLines.push(`  • Quá hạn 16–30 ngày: ${formatVND(c.aging.overdue_16_30)}`);
  if (c.aging.overdue_gt30 > 0) agingLines.push(`  • Quá hạn >30 ngày: ${formatVND(c.aging.overdue_gt30)}`);

  const header =
    overdueTotal > 0
      ? `Kính gửi Quý khách ${c.company_name} (${c.code}) — MST ${c.mst}`
      : `Kính gửi Quý khách ${c.company_name} (${c.code}) — MST ${c.mst}`;

  const body =
    overdueTotal > 0
      ? `Sơn Khang kính nhắc đối soát công nợ tính đến ${todayStr}:\n` +
        `— Tổng dư nợ: ${formatVND(c.current_debt)} / Hạn mức: ${formatVND(c.credit_limit)}\n` +
        `— Chi tiết tuổi nợ:\n${agingLines.join("\n")}\n` +
        `— Tổng quá hạn cần thanh toán: ${formatVND(overdueTotal)} (quá hạn ${c.overdue_days} ngày)\n` +
        `— Tuyến giao: ${c.delivery_route}`
      : `Sơn Khang kính gửi bảng đối soát công nợ tính đến ${todayStr}:\n` +
        `— Dư nợ hiện tại: ${formatVND(c.current_debt)} (trong hạn)\n` +
        `— Hạn mức: ${formatVND(c.credit_limit)} | Kỳ hạn: ${c.payment_term} ngày`;

  return (
    `${header}\n\n` +
    `${body}\n\n` +
    `Quý khách vui lòng thanh toán về:\n` +
    `  Techcombank — STK ${TECHCOMBANK_ACCOUNT}\n` +
    `  Chủ TK: ${TECHCOMBANK_NAME}\n` +
    `  Nội dung: ${buildVietQRNote(c)}\n` +
    `  (Quét mã VietQR đính kèm để chuyển khoản nhanh)\n\n` +
    `Mọi thắc mắc xin liên hệ Kế toán ${ACCOUNTANT_NAME} — ${ACCOUNTANT_PHONE}.\n` +
    `Sơn Khang chân thành cảm ơn Quý khách đã đồng hành!\n` +
    `— CT TNHH Thực Phẩm Sơn Khang`
  );
}

// For testing / reset — not required but useful
export function __resetCustomerStore(): void {
  customerStore = [...MOCK_CUSTOMERS];
}
