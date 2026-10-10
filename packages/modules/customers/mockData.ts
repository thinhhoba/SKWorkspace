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
// Mock data — 14 khách B2B thực tế Sơn Khang
// Địa bàn: Hà Nội (quán ăn, căn tin) + các tỉnh phía Bắc (đại lý chành xe)
// Tài khoản thụ hưởng: Techcombank 22226060
// Phân bổ rủi ro: 3 safe | 5 warning (1-15) | 4 danger (16-30) | 2 blocked (>30)
// aging tổng = current_debt, bucket nhất quán với overdue_days
// ---------------------------------------------------------------------------

export const MOCK_CUSTOMERS: CustomerB2B[] = [
  // ---- Nhóm 1: Quán ăn vặt / Mì trộn Hà Nội ----
  {
    id: "KH0009",
    code: "KH0009",
    name: "Túy Foods",
    company_name: "Túy Foods",
    mst: "0111252725",
    customer_type: "quan_an_hn",
    contact_name: "Chị Túy",
    phone: "0988123456",
    address: "Số 5 Ngõ 27 Đại Cồ Việt, Hai Bà Trưng, Hà Nội",
    delivery_route: "Kho Sơn Khang → Đại Cồ Việt (nội thành HN)",
    credit_limit: 60_000_000,
    payment_term: 15,
    current_debt: 38_500_000,
    overdue_days: 8,
    aging: { current: 22_000_000, overdue_1_15: 16_500_000, overdue_16_30: 0, overdue_gt30: 0 },
    risk_level: "warning",
    last_order_date: "2026-10-05",
  },
  {
    id: "KH-B2B-002",
    code: "KH-B2B-002",
    name: "Quán Mì Trộn Cay Phố Chùa Láng",
    company_name: "Quán Mì Trộn Cay Phố Chùa Láng",
    mst: "0109876543",
    customer_type: "quan_an_hn",
    contact_name: "Anh Hùng",
    phone: "0904123456",
    address: "Số 87 Chùa Láng, Đống Đa, Hà Nội",
    delivery_route: "Kho Sơn Khang → Chùa Láng (nội thành HN)",
    credit_limit: 40_000_000,
    payment_term: 15,
    current_debt: 18_200_000,
    overdue_days: 0,
    aging: { current: 18_200_000, overdue_1_15: 0, overdue_16_30: 0, overdue_gt30: 0 },
    risk_level: "safe",
    last_order_date: "2026-10-08",
  },
  {
    id: "KH-B2B-003",
    code: "KH-B2B-003",
    name: "Quán Ăn Vặt & Xiên Que Tạ Hiện",
    company_name: "Quán Ăn Vặt & Xiên Que Tạ Hiện",
    mst: "0108765432",
    customer_type: "quan_an_hn",
    contact_name: "Chị Linh",
    phone: "0936123456",
    address: "Số 12 Tạ Hiện, Hoàn Kiếm, Hà Nội",
    delivery_route: "Kho Sơn Khang → Tạ Hiện (nội thành HN)",
    credit_limit: 35_000_000,
    payment_term: 15,
    current_debt: 26_800_000,
    overdue_days: 19,
    aging: { current: 10_000_000, overdue_1_15: 8_800_000, overdue_16_30: 8_000_000, overdue_gt30: 0 },
    risk_level: "danger",
    last_order_date: "2026-09-20",
  },
  {
    id: "KH-B2B-004",
    code: "KH-B2B-004",
    name: "Quán Ốc & Lẩu Thái Phố Huế",
    company_name: "Quán Ốc & Lẩu Thái Phố Huế",
    mst: "0107654321",
    customer_type: "quan_an_hn",
    contact_name: "Anh Nam",
    phone: "0912123456",
    address: "Số 34 Phố Huế, Hai Bà Trưng, Hà Nội",
    delivery_route: "Kho Sơn Khang → Phố Huế (nội thành HN)",
    credit_limit: 50_000_000,
    payment_term: 15,
    current_debt: 32_000_000,
    overdue_days: 4,
    aging: { current: 24_000_000, overdue_1_15: 8_000_000, overdue_16_30: 0, overdue_gt30: 0 },
    risk_level: "warning",
    last_order_date: "2026-10-04",
  },
  {
    id: "KH-B2B-005",
    code: "KH-B2B-005",
    name: "Quán Bún Đậu Mắm Tôm Giảng Võ",
    company_name: "Quán Bún Đậu Mắm Tôm Giảng Võ",
    mst: "0106543210",
    customer_type: "quan_an_hn",
    contact_name: "Chị Hương",
    phone: "0978123456",
    address: "Số 112 Giảng Võ, Ba Đình, Hà Nội",
    delivery_route: "Kho Sơn Khang → Giảng Võ (nội thành HN)",
    credit_limit: 30_000_000,
    payment_term: 15,
    current_debt: 14_500_000,
    overdue_days: 0,
    aging: { current: 14_500_000, overdue_1_15: 0, overdue_16_30: 0, overdue_gt30: 0 },
    risk_level: "safe",
    last_order_date: "2026-10-07",
  },

  // ---- Nhóm 2: Bếp ăn / Căn tin ----
  {
    id: "KH-B2B-006",
    code: "KH-B2B-006",
    name: "Căn Tin Trường ĐH Bách Khoa Hà Nội",
    company_name: "Căn Tin Trường ĐH Bách Khoa Hà Nội",
    mst: "0105432109",
    customer_type: "bep_an_cantin",
    contact_name: "Cô Mai",
    phone: "0942123456",
    address: "Số 1 Đại Cồ Việt, Hai Bà Trưng, Hà Nội (Khuôn viên ĐHBK)",
    delivery_route: "Kho Sơn Khang → ĐHBK (nội thành HN)",
    credit_limit: 120_000_000,
    payment_term: 30,
    current_debt: 85_000_000,
    overdue_days: 12,
    aging: { current: 52_000_000, overdue_1_15: 33_000_000, overdue_16_30: 0, overdue_gt30: 0 },
    risk_level: "warning",
    last_order_date: "2026-10-02",
  },
  {
    id: "KH-B2B-007",
    code: "KH-B2B-007",
    name: "Bếp Ăn KCN Thăng Long",
    company_name: "Bếp Ăn KCN Thăng Long",
    mst: "0104321098",
    customer_type: "bep_an_cantin",
    contact_name: "Anh Tuấn",
    phone: "0989123456",
    address: "KCN Thăng Long, Đông Anh, Hà Nội",
    delivery_route: "Kho Sơn Khang → KCN Thăng Long (Đông Anh)",
    credit_limit: 300_000_000,
    payment_term: 30,
    current_debt: 195_000_000,
    overdue_days: 26,
    aging: { current: 80_000_000, overdue_1_15: 55_000_000, overdue_16_30: 60_000_000, overdue_gt30: 0 },
    risk_level: "danger",
    last_order_date: "2026-09-15",
  },
  {
    id: "KH-B2B-008",
    code: "KH-B2B-008",
    name: "Căn Tin Bệnh Viện Bạch Mai",
    company_name: "Căn Tin Bệnh Viện Bạch Mai",
    mst: "0103210987",
    customer_type: "bep_an_cantin",
    contact_name: "Chị Hằng",
    phone: "0968123456",
    address: "Số 78 Giải Phóng, Đống Đa, Hà Nội (BV Bạch Mai)",
    delivery_route: "Kho Sơn Khang → Giải Phóng (nội thành HN)",
    credit_limit: 80_000_000,
    payment_term: 30,
    current_debt: 42_000_000,
    overdue_days: 6,
    aging: { current: 28_000_000, overdue_1_15: 14_000_000, overdue_16_30: 0, overdue_gt30: 0 },
    risk_level: "warning",
    last_order_date: "2026-10-03",
  },

  // ---- Nhóm 3: Đại lý chành xe các tỉnh phía Bắc ----
  {
    id: "KH-B2B-009",
    code: "KH-B2B-009",
    name: "Đại Lý Thực Phẩm Đông Lạnh Hải Hậu",
    company_name: "Đại Lý Thực Phẩm Đông Lạnh Hải Hậu",
    mst: "0601234567",
    customer_type: "dai_ly_tinh",
    contact_name: "Anh Cường",
    phone: "0918123456",
    address: "Thị trấn Yên Định, Hải Hậu, Nam Định",
    delivery_route: "Bến Giáp Bát → Hải Hậu (Nam Định) — xe khách",
    credit_limit: 250_000_000,
    payment_term: 30,
    current_debt: 168_000_000,
    overdue_days: 22,
    aging: { current: 72_000_000, overdue_1_15: 48_000_000, overdue_16_30: 48_000_000, overdue_gt30: 0 },
    risk_level: "danger",
    last_order_date: "2026-09-18",
  },
  {
    id: "KH-B2B-010",
    code: "KH-B2B-010",
    name: "Đại Lý Thực Phẩm Sỉ Bãi Cháy",
    company_name: "Đại Lý Thực Phẩm Sỉ Bãi Cháy",
    mst: "5701234567",
    customer_type: "dai_ly_tinh",
    contact_name: "Chị Thảo",
    phone: "0935123456",
    address: "Khu 7, Phường Bãi Cháy, TP. Hạ Long, Quảng Ninh",
    delivery_route: "Bến Giáp Bát / Nước Ngầm → Bãi Cháy (Quảng Ninh) — xe tải đông lạnh",
    credit_limit: 400_000_000,
    payment_term: 30,
    current_debt: 312_000_000,
    overdue_days: 45,
    aging: { current: 90_000_000, overdue_1_15: 62_000_000, overdue_16_30: 70_000_000, overdue_gt30: 90_000_000 },
    risk_level: "blocked",
    last_order_date: "2026-08-25",
  },
  {
    id: "KH-B2B-011",
    code: "KH-B2B-011",
    name: "NPP Thực Phẩm Miền Duyên Hải",
    company_name: "NPP Thực Phẩm Miền Duyên Hải",
    mst: "0201234567",
    customer_type: "dai_ly_tinh",
    contact_name: "Anh Hải",
    phone: "0985123456",
    address: "Số 156 Lê Lợi, Ngô Quyền, Hải Phòng",
    delivery_route: "Bến Gia Lâm → Hải Phòng — xe tải đông lạnh",
    credit_limit: 350_000_000,
    payment_term: 30,
    current_debt: 245_000_000,
    overdue_days: 18,
    aging: { current: 110_000_000, overdue_1_15: 65_000_000, overdue_16_30: 70_000_000, overdue_gt30: 0 },
    risk_level: "danger",
    last_order_date: "2026-09-22",
  },
  {
    id: "KH-B2B-012",
    code: "KH-B2B-012",
    name: "Đại Lý Tiên Du",
    company_name: "Đại Lý Tiên Du",
    mst: "2301234567",
    customer_type: "dai_ly_tinh",
    contact_name: "Anh Bắc",
    phone: "0973123456",
    address: "Thị trấn Lim, Tiên Du, Bắc Ninh",
    delivery_route: "Bến xe Mỹ Đình / Gia Lâm → Tiên Du (Bắc Ninh) — xe khách",
    credit_limit: 150_000_000,
    payment_term: 30,
    current_debt: 98_000_000,
    overdue_days: 9,
    aging: { current: 62_000_000, overdue_1_15: 36_000_000, overdue_16_30: 0, overdue_gt30: 0 },
    risk_level: "warning",
    last_order_date: "2026-10-01",
  },
  {
    id: "KH-B2B-013",
    code: "KH-B2B-013",
    name: "Đại Lý Thực Phẩm Sỉ Ninh Bình",
    company_name: "Đại Lý Thực Phẩm Sỉ Ninh Bình",
    mst: "2701234567",
    customer_type: "dai_ly_tinh",
    contact_name: "Chị Vân",
    phone: "0965123456",
    address: "Số 45 Trần Hưng Đạo, TP. Ninh Bình, Ninh Bình",
    delivery_route: "Bến Giáp Bát → Ninh Bình — xe tải đông lạnh",
    credit_limit: 180_000_000,
    payment_term: 30,
    current_debt: 112_000_000,
    overdue_days: 35,
    aging: { current: 40_000_000, overdue_1_15: 22_000_000, overdue_16_30: 18_000_000, overdue_gt30: 32_000_000 },
    risk_level: "blocked",
    last_order_date: "2026-08-30",
  },
  {
    id: "KH-B2B-014",
    code: "KH-B2B-014",
    name: "Cửa Hàng Thực Phẩm Sạch Long Biên",
    company_name: "Cửa Hàng Thực Phẩm Sạch Long Biên",
    mst: "0102109876",
    customer_type: "khach_le",
    contact_name: "Chị Dung",
    phone: "0955123456",
    address: "Số 88 Nguyễn Văn Cừ, Long Biên, Hà Nội",
    delivery_route: "Kho Sơn Khang → Long Biên (nội thành HN)",
    credit_limit: 20_000_000,
    payment_term: 15,
    current_debt: 8_500_000,
    overdue_days: 0,
    aging: { current: 8_500_000, overdue_1_15: 0, overdue_16_30: 0, overdue_gt30: 0 },
    risk_level: "safe",
    last_order_date: "2026-10-09",
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
