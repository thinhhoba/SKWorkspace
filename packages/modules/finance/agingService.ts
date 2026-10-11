// Service Báo cáo Tuổi nợ B2B — 4 mốc theo Chỉ thị 18 GAP P1-5
// Sơn Khang: phân tích công nợ khách hàng theo 4 mốc thời gian

import type { CustomerB2B } from "../customers/types";
import { buildVietQrUrl } from "../payment/vietqr";

// ---------------------------------------------------------------------------
// Types & Constants
// ---------------------------------------------------------------------------

/** 4 mốc tuổi nợ theo Chỉ thị 18 */
export type AgingBucket4 = "trong_han_15" | "chom_qua_han_15_30" | "qua_han_30_60" | "qua_han_60";

/** Nhóm khách hàng để filter */
export type CustomerGroup = "all" | "dai_ly" | "quan_an" | "chanh_xe";

/** Màu sắc & nhãn cho mỗi bucket */
export interface AgingBucketColor {
  bg: string;
  text: string;
  label: string;
}

/** Ngưỡng phân loại (ngày) */
export const AGING_THRESHOLDS = [15, 30, 60] as const;

/** Nhãn hiển thị cho 4 mốc */
export const AGING_LABEL: Record<AgingBucket4, string> = {
  trong_han_15: "Trong hạn <15 ngày",
  chom_qua_han_15_30: "Chớm quá hạn 15-30 ngày",
  qua_han_30_60: "Quá hạn 30-60 ngày",
  qua_han_60: "Quá hạn >60 ngày",
};

/** Màu sắc cho 4 mốc (xanh lá → vàng → cam → đỏ) */
export const AGING_COLOR: Record<AgingBucket4, AgingBucketColor> = {
  trong_han_15: {
    bg: "#22c55e",
    text: "#15803d",
    label: "Trong hạn",
  },
  chom_qua_han_15_30: {
    bg: "#eab308",
    text: "#a16207",
    label: "Chớm quá hạn",
  },
  qua_han_30_60: {
    bg: "#f97316",
    text: "#c2410c",
    label: "Quá hạn 30-60",
  },
  qua_han_60: {
    bg: "#ef4444",
    text: "#b91c1c",
    label: "Quá hạn >60",
  },
};

// ---------------------------------------------------------------------------
// Core Functions
// ---------------------------------------------------------------------------

/**
 * Tính bucket tuổi nợ từ due_date (hạn thanh toán) đến hôm nay.
 * @param dueDate ISO date string (YYYY-MM-DD)
 * @param today Ngày hiện tại (mặc định = hôm nay)
 * @returns AgingBucket4
 */
export function calculateAgingBucket(dueDate: string, today?: Date): AgingBucket4 {
  const due = new Date(dueDate);
  const now = today || new Date();
  const diffMs = now.getTime() - due.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 15) return "trong_han_15";
  if (diffDays < 30) return "chom_qua_han_15_30";
  if (diffDays < 60) return "qua_han_30_60";
  return "qua_han_60";
}

/**
 * Tính phân bổ công nợ của 1 khách hàng theo 4 mốc.
 * Map từ aging hiện có (current, overdue_1_15, overdue_16_30, overdue_gt30) sang 4 buckets mới.
 * @param customer Khách hàng B2B
 * @param orders (optional) Danh sách đơn hàng — chưa implement, dùng customer.aging
 * @returns Record<AgingBucket4, number>
 */
export function calculateCustomerAging(
  customer: CustomerB2B,
  orders?: unknown
): Record<AgingBucket4, number> {
  // Khởi tạo 4 buckets
  const aging: Record<AgingBucket4, number> = {
    trong_han_15: customer.aging.current,
    chom_qua_han_15_30: customer.aging.overdue_1_15 + customer.aging.overdue_16_30,
    qua_han_30_60: 0,
    qua_han_60: 0,
  };

  // Phân bổ overdue_gt30 (>30 ngày) dựa trên overdue_days
  if (customer.overdue_days >= 60) {
    aging.qua_han_60 = customer.aging.overdue_gt30;
  } else if (customer.overdue_days > 30) {
    aging.qua_han_30_60 = customer.aging.overdue_gt30;
  } else {
    // overdue_days <= 30 nhưng có overdue_gt30 (không nhất quán) → gộp vào chom_qua_han_15_30
    aging.chom_qua_han_15_30 += customer.aging.overdue_gt30;
  }

  return aging;
}

/**
 * Tổng hợp công nợ toàn bộ danh sách khách hàng theo 4 mốc.
 * @param customers Danh sách khách hàng B2B
 * @returns Record<AgingBucket4, number>
 */
export function getAgingSummary(customers: CustomerB2B[]): Record<AgingBucket4, number> {
  const summary: Record<AgingBucket4, number> = {
    trong_han_15: 0,
    chom_qua_han_15_30: 0,
    qua_han_30_60: 0,
    qua_han_60: 0,
  };

  for (const c of customers) {
    const aging = calculateCustomerAging(c);
    summary.trong_han_15 += aging.trong_han_15;
    summary.chom_qua_han_15_30 += aging.chom_qua_han_15_30;
    summary.qua_han_30_60 += aging.qua_han_30_60;
    summary.qua_han_60 += aging.qua_han_60;
  }

  return summary;
}

/**
 * Lọc khách hàng có nợ trong bucket cụ thể.
 * @param customers Danh sách khách hàng
 * @param bucket AgingBucket4
 * @returns CustomerB2B[]
 */
export function filterByAgingBucket(
  customers: CustomerB2B[],
  bucket: AgingBucket4
): CustomerB2B[] {
  return customers.filter((c) => {
    const aging = calculateCustomerAging(c);
    return aging[bucket] > 0;
  });
}

/**
 * Lọc khách hàng theo nhóm (đại lý / quán ăn / chành xe).
 * @param customers Danh sách khách hàng
 * @param group Nhóm: 'dai_ly' | 'quan_an' | 'chanh_xe' | 'all'
 * @returns CustomerB2B[]
 */
export function filterByCustomerGroup(
  customers: CustomerB2B[],
  group: "dai_ly" | "quan_an" | "chanh_xe" | "all"
): CustomerB2B[] {
  if (group === "all") return customers;

  return customers.filter((c) => {
    if (group === "dai_ly") return c.customer_type === "dai_ly_tinh";
    if (group === "quan_an") return c.customer_type === "quan_an_hn";
    if (group === "chanh_xe")
      return c.delivery_route.toLowerCase().includes("chành xe");
    return false;
  });
}

/**
 * Sinh tin nhắn nhắc nợ Zalo với phân tích 4 mốc + VietQR Techcombank 22226060.
 * @param customer Khách hàng B2B
 * @returns { message, zaloUrl, vietQrUrl }
 */
export function generateAgingRemindMessage(customer: CustomerB2B): {
  message: string;
  zaloUrl: string;
  vietQrUrl: string;
} {
  const aging = calculateCustomerAging(customer);
  const overdueTotal =
    aging.chom_qua_han_15_30 + aging.qua_han_30_60 + aging.qua_han_60;

  const vnd = (n: number) => n.toLocaleString("vi-VN") + " VNĐ";
  const todayStr = new Date().toLocaleDateString("vi-VN");

  const agingLines: string[] = [];
  if (aging.trong_han_15 > 0)
    agingLines.push(`  • Trong hạn <15 ngày: ${vnd(aging.trong_han_15)}`);
  if (aging.chom_qua_han_15_30 > 0)
    agingLines.push(
      `  • Chớm quá hạn 15-30 ngày: ${vnd(aging.chom_qua_han_15_30)}`
    );
  if (aging.qua_han_30_60 > 0)
    agingLines.push(`  • Quá hạn 30-60 ngày: ${vnd(aging.qua_han_30_60)}`);
  if (aging.qua_han_60 > 0)
    agingLines.push(`  • Quá hạn >60 ngày: ${vnd(aging.qua_han_60)}`);

  const header = `Kính gửi Quý khách ${customer.company_name} (${customer.code}) — MST ${customer.mst}`;

  const body =
    overdueTotal > 0
      ? `Sơn Khang kính nhắc đối soát công nợ tính đến ${todayStr}:\n` +
        `— Tổng dư nợ: ${vnd(customer.current_debt)} / Hạn mức: ${vnd(customer.credit_limit)}\n` +
        `— Chi tiết tuổi nợ 4 mốc:\n${agingLines.join("\n")}\n` +
        `— Tổng quá hạn cần thanh toán: ${vnd(overdueTotal)} (quá hạn ${customer.overdue_days} ngày)\n` +
        `— Tuyến giao: ${customer.delivery_route}`
      : `Sơn Khang kính gửi bảng đối soát công nợ tính đến ${todayStr}:\n` +
        `— Dư nợ hiện tại: ${vnd(customer.current_debt)} (trong hạn)\n` +
        `— Hạn mức: ${vnd(customer.credit_limit)} | Kỳ hạn: ${customer.payment_term} ngày`;

  const vietQrNote = `Thanh toan cong no ${customer.code} - ${customer.company_name} - MST ${customer.mst}`;

  const message =
    `${header}\n\n` +
    `${body}\n\n` +
    `Quý khách vui lòng thanh toán về:\n` +
    `  Techcombank — STK 22226060\n` +
    `  Chủ TK: CONG TY TNHH THUC PHAM SON KHANG\n` +
    `  Nội dung: ${vietQrNote}\n` +
    `  (Quét mã VietQR đính kèm để chuyển khoản nhanh)\n\n` +
    `Mọi thắc mắc xin liên hệ Kế toán Hoàng Thị Nho — 0942 22 60 60.\n` +
    `Sơn Khang chân thành cảm ơn Quý khách đã đồng hành!\n` +
    `— CT TNHH Thực Phẩm Sơn Khang`;

  return {
    message,
    zaloUrl: `https://zalo.me/${customer.phone}`,
    vietQrUrl: buildVietQrUrl({
      amount: overdueTotal || customer.current_debt,
      addInfo: vietQrNote,
      bankId: "970407",
      accountNo: "22226060",
      accountName: "CONG TY TNHH THUC PHAM SON KHANG",
    }),
  };
}
