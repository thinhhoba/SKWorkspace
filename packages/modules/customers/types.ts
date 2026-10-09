// Module khách hàng B2B — types

/** Kỳ hạn thanh toán (ngày) */
export type PaymentTerm = 15 | 30 | 45;

/** Nhóm tuổi nợ */
export type DebtAgingBucket = "current" | "overdue_1_15" | "overdue_16_30" | "overdue_gt30";

/** Mức độ rủi ro công nợ */
export type RiskLevel = "safe" | "warning" | "danger" | "blocked";

/** Khách hàng B2B */
export interface CustomerB2B {
  id: string;
  code: string; // VD KH-B2B-001
  name: string;
  company_name: string;
  mst: string; // 10 số
  contact_name: string;
  phone: string;
  address: string;
  credit_limit: number; // hạn mức tín dụng
  payment_term: PaymentTerm; // kỳ hạn thanh toán
  current_debt: number; // dư nợ hiện tại
  overdue_days: number; // số ngày quá hạn lớn nhất
  aging: Record<DebtAgingBucket, number>; // phân bổ dư nợ theo nhóm tuổi
  risk_level: RiskLevel; // mức rủi ro
  last_order_date: string | null; // ISO date
}

/** Tổng hợp công nợ */
export interface DebtSummary {
  total_debt: number; // tổng dư nợ
  current: number; // trong hạn
  overdue_1_15: number; // quá hạn 1-15 ngày
  overdue_16_30: number; // quá hạn 16-30 ngày
  overdue_gt30: number; // quá hạn >30 ngày
  overdue_total: number; // tổng quá hạn
  collection_rate_pct: number; // tỷ lệ thu hồi (%)
}
