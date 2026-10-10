// Module khách hàng B2B — types
// Sơn Khang: quán ăn Hà Nội + đại lý chành xe phía Bắc

/** Phân loại khách hàng B2B theo địa bàn Sơn Khang */
export type CustomerType = "quan_an_hn" | "dai_ly_tinh" | "bep_an_cantin" | "khach_le";

/** Kỳ hạn thanh toán (ngày) */
export type PaymentTerm = 15 | 30 | 45;

/** Nhóm tuổi nợ */
export type DebtAgingBucket = "current" | "overdue_1_15" | "overdue_16_30" | "overdue_gt30";

/** Mức độ rủi ro công nợ */
export type RiskLevel = "safe" | "warning" | "danger" | "blocked";

/** Nhãn CustomerType */
export const CUSTOMER_TYPE_LABEL: Record<CustomerType, string> = {
  quan_an_hn: "Quán Ăn HN",
  dai_ly_tinh: "Đại Lý Tỉnh",
  bep_an_cantin: "Bếp Ăn / Căn Tin",
  khach_le: "Khách Lẻ",
};

/** Khách hàng B2B */
export interface CustomerB2B {
  id: string;
  code: string; // VD KH0009, KH-B2B-001
  name: string;
  company_name: string;
  mst: string; // 10 số
  customer_type: CustomerType;
  contact_name: string;
  phone: string;
  address: string;
  delivery_route: string; // tuyến giao: vd "Bến Giáp Bát → Nam Định"
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

/** Kết quả sinh tin nhắn nhắc nợ Zalo */
export interface ZaloDebtReminder {
  customer: CustomerB2B;
  message: string;
  zaloUrl: string;
  vietQrNote: string;
}
