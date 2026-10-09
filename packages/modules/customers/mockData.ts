import type { CustomerB2B, RiskLevel, DebtSummary, DebtAgingBucket } from "./types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Tính risk_level từ overdue_days — logic chuẩn toàn hệ thống */
export function calcRiskLevel(overdueDays: number): RiskLevel {
  if (overdueDays > 30) return "blocked";
  if (overdueDays >= 16) return "danger";
  if (overdueDays >= 1) return "warning";
  return "safe";
}

/** Nhãn hiển thị risk_level */
export const RISK_LABEL: Record<RiskLevel, string> = {
  safe: "An toàn",
  warning: "Cảnh báo",
  danger: "Nguy hiểm",
  blocked: "Khóa bán",
};

/** Màu badge cho risk_level (Tailwind) */
export const RISK_COLOR: Record<RiskLevel, string> = {
  safe: "bg-emerald-100 text-emerald-700 border-emerald-200",
  warning: "bg-amber-100 text-amber-700 border-amber-200",
  danger: "bg-orange-100 text-orange-700 border-orange-200",
  blocked: "bg-red-100 text-red-700 border-red-200",
};

// ---------------------------------------------------------------------------
// Mock data — 8 khách B2B thực tế Sơn Khang
// Phân bổ rủi ro: 2 safe | 3 warning (1-15) | 2 danger (16-30) | 1 blocked (>30)
// aging tổng = current_debt, bucket nhất quán với overdue_days
// ---------------------------------------------------------------------------

export const MOCK_CUSTOMERS: CustomerB2B[] = [
  // ---- SAFE (trong hạn) ----
  {
    id: "KH-B2B-001",
    code: "KH-B2B-001",
    name: "Nhà hàng Lẩu Bò Q7",
    company_name: "Nhà hàng Lẩu Bò Q7",
    mst: "0312456789",
    contact_name: "Anh Dũng",
    phone: "0908123456",
    address: "15 Nguyễn Thị Thập, P. Tân Hưng, Q.7, TP.HCM",
    credit_limit: 80_000_000,
    payment_term: 15,
    current_debt: 28_500_000,
    overdue_days: 0,
    aging: {
      current: 28_500_000,
      overdue_1_15: 0,
      overdue_16_30: 0,
      overdue_gt30: 0,
    },
    risk_level: "safe",
    last_order_date: "2026-10-07",
  },
  {
    id: "KH-B2B-002",
    code: "KH-B2B-002",
    name: "Siêu thị Mini Q12",
    company_name: "Siêu thị Mini Q12",
    mst: "0312987654",
    contact_name: "Chị Lan",
    phone: "0938765432",
    address: "45 Lê Thị Riêng, P. Thới An, Q.12, TP.HCM",
    credit_limit: 120_000_000,
    payment_term: 30,
    current_debt: 42_000_000,
    overdue_days: 0,
    aging: {
      current: 42_000_000,
      overdue_1_15: 0,
      overdue_16_30: 0,
      overdue_gt30: 0,
    },
    risk_level: "safe",
    last_order_date: "2026-10-08",
  },

  // ---- WARNING (quá hạn 1-15 ngày) ----
  {
    id: "KH-B2B-003",
    code: "KH-B2B-003",
    name: "Bếp ăn KCN Hiệp Phước",
    company_name: "Bếp ăn KCN Hiệp Phước",
    mst: "0313567890",
    contact_name: "Chị Hằng",
    phone: "0909988776",
    address: "Lô C, KCN Hiệp Phước, X. Hiệp Phước, H. Nhà Bè, TP.HCM",
    credit_limit: 350_000_000,
    payment_term: 30,
    current_debt: 198_000_000,
    overdue_days: 7,
    aging: {
      current: 145_000_000,
      overdue_1_15: 53_000_000,
      overdue_16_30: 0,
      overdue_gt30: 0,
    },
    risk_level: "warning",
    last_order_date: "2026-10-05",
  },
  {
    id: "KH-B2B-004",
    code: "KH-B2B-004",
    name: "Chuỗi Cơm Tấm Sài Gòn",
    company_name: "Chuỗi Cơm Tấm Sài Gòn",
    mst: "0314123987",
    contact_name: "Anh Tuấn",
    phone: "0912345678",
    address: "128 Nguyễn Trãi, P. Bến Thành, Q.1, TP.HCM (Trụ sở — 12 chi nhánh Q1-Q12)",
    credit_limit: 500_000_000,
    payment_term: 30,
    current_debt: 385_000_000,
    overdue_days: 12,
    aging: {
      current: 210_000_000,
      overdue_1_15: 175_000_000,
      overdue_16_30: 0,
      overdue_gt30: 0,
    },
    risk_level: "warning",
    last_order_date: "2026-10-06",
  },
  {
    id: "KH-B2B-005",
    code: "KH-B2B-005",
    name: "Nhà hàng Hải Sản Vũng Tàu",
    company_name: "Nhà hàng Hải Sản Vũng Tàu",
    mst: "0356789012",
    contact_name: "Anh Hải",
    phone: "0987654321",
    address: "12 Trần Phú, P.1, TP. Vũng Tàu, Bà Rịa - Vũng Tàu",
    credit_limit: 200_000_000,
    payment_term: 30,
    current_debt: 68_000_000,
    overdue_days: 3,
    aging: {
      current: 52_000_000,
      overdue_1_15: 16_000_000,
      overdue_16_30: 0,
      overdue_gt30: 0,
    },
    risk_level: "warning",
    last_order_date: "2026-10-04",
  },

  // ---- DANGER (quá hạn 16-30 ngày) ----
  {
    id: "KH-B2B-006",
    code: "KH-B2B-006",
    name: "Bếp ăn Trường Quốc tế Q7",
    company_name: "Bếp ăn Trường Quốc tế Q7",
    mst: "0315234890",
    contact_name: "Cô Mai",
    phone: "0399123456",
    address: "Khu Nam Long, 2 Nguyễn Lương Bằng, P. Tân Phú, Q.7, TP.HCM",
    credit_limit: 250_000_000,
    payment_term: 30,
    current_debt: 162_000_000,
    overdue_days: 22,
    aging: {
      current: 68_000_000,
      overdue_1_15: 42_000_000,
      overdue_16_30: 52_000_000,
      overdue_gt30: 0,
    },
    risk_level: "danger",
    last_order_date: "2026-09-18",
  },
  {
    id: "KH-B2B-007",
    code: "KH-B2B-007",
    name: "Đại lý Minh Phát Q8",
    company_name: "Đại lý Minh Phát Q8",
    mst: "0316345901",
    contact_name: "Anh Phát",
    phone: "0903344556",
    address: "88 Tạ Quang Bửu, P.3, Q.8, TP.HCM",
    credit_limit: 50_000_000,
    payment_term: 15,
    current_debt: 38_500_000,
    overdue_days: 28,
    aging: {
      current: 8_500_000,
      overdue_1_15: 12_000_000,
      overdue_16_30: 18_000_000,
      overdue_gt30: 0,
    },
    risk_level: "danger",
    last_order_date: "2026-09-12",
  },

  // ---- BLOCKED (quá hạn >30 ngày) ----
  {
    id: "KH-B2B-008",
    code: "KH-B2B-008",
    name: "Chuỗi Lẩu Nướng 5 Quán",
    company_name: "Chuỗi Lẩu Nướng 5 Quán (Bình Thạnh)",
    mst: "0317456012",
    contact_name: "Anh Khoa",
    phone: "0935123456",
    address: "42 Điện Biên Phủ, P.15, Q. Bình Thạnh, TP.HCM (5 chi nhánh Bình Thạnh — Gò Vấp)",
    credit_limit: 300_000_000,
    payment_term: 30,
    current_debt: 241_000_000,
    overdue_days: 42,
    aging: {
      current: 55_000_000,
      overdue_1_15: 38_000_000,
      overdue_16_30: 62_000_000,
      overdue_gt30: 86_000_000,
    },
    risk_level: "blocked",
    last_order_date: "2026-08-28",
  },
];

// ---------------------------------------------------------------------------
// Helpers bổ sung
// ---------------------------------------------------------------------------

/** Tìm khách hàng theo id */
export function getCustomerById(id: string): CustomerB2B | undefined {
  return MOCK_CUSTOMERS.find((c) => c.id === id);
}

/** Lọc khách hàng theo risk_level */
export function getCustomersByRisk(level: RiskLevel): CustomerB2B[] {
  return MOCK_CUSTOMERS.filter((c) => c.risk_level === level);
}

/** Tổng hợp công nợ toàn bộ khách hàng */
export function getDebtSummary(customers: CustomerB2B[] = MOCK_CUSTOMERS): DebtSummary {
  let current = 0;
  let overdue_1_15 = 0;
  let overdue_16_30 = 0;
  let overdue_gt30 = 0;

  for (const c of customers) {
    current += c.aging.current;
    overdue_1_15 += c.aging.overdue_1_15;
    overdue_16_30 += c.aging.overdue_16_30;
    overdue_gt30 += c.aging.overdue_gt30;
  }

  const total_debt = current + overdue_1_15 + overdue_16_30 + overdue_gt30;
  const overdue_total = overdue_1_15 + overdue_16_30 + overdue_gt30;
  const collection_rate_pct =
    total_debt > 0 ? Math.round(((total_debt - overdue_total) / total_debt) * 100) : 100;

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

/** Tỷ lệ sử dụng hạn mức (%) */
export function getCreditUsagePct(c: CustomerB2B): number {
  if (c.credit_limit <= 0) return 0;
  return Math.round((c.current_debt / c.credit_limit) * 100);
}

/** Kiểm tra nhất quán aging = current_debt */
export function isAgingConsistent(c: CustomerB2B): boolean {
  const sum =
    c.aging.current + c.aging.overdue_1_15 + c.aging.overdue_16_30 + c.aging.overdue_gt30;
  return sum === c.current_debt;
}
