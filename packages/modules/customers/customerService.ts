// Fallback mock: sẽ thay bằng Prisma khi DATABASE_URL khả dụng — xem packages/core/db.ts
import type { CustomerB2B, DebtSummary, DebtAgingBucket, RiskLevel } from "./types";
import { MOCK_CUSTOMERS } from "./mockData";

let customerStore: CustomerB2B[] = [...MOCK_CUSTOMERS];

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

function addDays(date: Date, days: number): Date {
  const r = new Date(date);
  r.setDate(r.getDate() + days);
  return r;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export function getCustomers(opts?: {
  search?: string;
  aging?: DebtAgingBucket | "ALL";
  risk?: RiskLevel | "ALL";
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
        c.phone.toLowerCase().includes(q)
    );
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

export function buildZaloRemindMessage(c: CustomerB2B): string {
  const today = new Date();
  const todayStr = formatDate(today);
  const dueDate = addDays(today, c.payment_term);
  const dueDateStr = formatDate(dueDate);
  const overdueTotal =
    c.aging.overdue_1_15 + c.aging.overdue_16_30 + c.aging.overdue_gt30;

  return (
    `Kính gửi ${c.company_name} (${c.code}) — MST ${c.mst}. ` +
    `Sơn Khang kính nhắc đối soát công nợ tính đến ${todayStr}: ` +
    `Tổng dư nợ ${formatVND(c.current_debt)}, ` +
    `trong hạn ${formatVND(c.aging.current)}, ` +
    `quá hạn ${formatVND(overdueTotal)} (${c.overdue_days} ngày). ` +
    `Hạn mức ${formatVND(c.credit_limit)}. ` +
    `Vui lòng thanh toán trước ${dueDateStr}. ` +
    `Chi tiết liên hệ 0909.xxx.xxx. Cảm ơn Quý khách!`
  );
}

// For testing / reset — not required but useful
export function __resetCustomerStore(): void {
  customerStore = [...MOCK_CUSTOMERS];
}
