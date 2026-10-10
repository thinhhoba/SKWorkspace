import type { ReportData, ReportPeriod } from "./types";

const MULTIPLIER: Record<ReportPeriod, number> = { today: 0.06, "7d": 0.28, month: 1, quarter: 3.2 };

function build(period: ReportPeriod): ReportData {
  const m = MULTIPLIER[period];
  const baseRevenue = Math.round(1850000000 * m);
  const baseGross = Math.round(baseRevenue * 0.214);
  return {
    period,
    kpi: {
      revenueMonth: baseRevenue,
      grossProfit: baseGross,
      grossMargin: 21.4,
      noodleCartons: Math.round(4200 * m),
      debtRecoveryRate: 87.5,
    },
    channels: [
      { channel: "quan_an", label: "Quán ăn vặt / mì trộn HN", revenue: Math.round(baseRevenue * 0.32), orders: Math.round(180 * m), share: 32 },
      { channel: "dai_ly", label: "Đại lý chành xe tỉnh", revenue: Math.round(baseRevenue * 0.26), orders: Math.round(95 * m), share: 26 },
      { channel: "can_tin", label: "Căn tin", revenue: Math.round(baseRevenue * 0.14), orders: Math.round(40 * m), share: 14 },
      { channel: "web", label: "Web Order", revenue: Math.round(baseRevenue * 0.12), orders: Math.round(60 * m), share: 12 },
      { channel: "pos", label: "POS", revenue: Math.round(baseRevenue * 0.09), orders: Math.round(55 * m), share: 9 },
      { channel: "ban_le", label: "Bán lẻ", revenue: Math.round(baseRevenue * 0.07), orders: Math.round(70 * m), share: 7 },
    ],
    productGroups: [
      { group: "hang_kho", label: "Hàng khô (Indomie/Koreno)", revenue: Math.round(baseRevenue * 0.38), cost: Math.round(baseRevenue * 0.38 * 0.76), grossProfit: Math.round(baseRevenue * 0.38 * 0.24), margin: 24 },
      { group: "hang_dong", label: "Hàng đông lạnh", revenue: Math.round(baseRevenue * 0.28), cost: Math.round(baseRevenue * 0.28 * 0.80), grossProfit: Math.round(baseRevenue * 0.28 * 0.20), margin: 20 },
      { group: "gia_vi", label: "Gia vị & Xốt", revenue: Math.round(baseRevenue * 0.20), cost: Math.round(baseRevenue * 0.20 * 0.78), grossProfit: Math.round(baseRevenue * 0.20 * 0.22), margin: 22 },
      { group: "hang_mat", label: "Hàng mát", revenue: Math.round(baseRevenue * 0.14), cost: Math.round(baseRevenue * 0.14 * 0.82), grossProfit: Math.round(baseRevenue * 0.14 * 0.18), margin: 18 },
    ],
    warehouseShare: [
      { warehouse: "KHO_DINH_CONG", label: "Kho Định Công", qty: Math.round(5200 * m), share: 62 },
      { warehouse: "KHO_YEN_BINH", label: "Kho Yên Bình", qty: Math.round(3180 * m), share: 38 },
    ],
    driver: {
      driver: "Ngô Văn Tân",
      phone: "0942 22 60 60",
      totalTrips: Math.round(48 * m),
      successRate: 96.2,
      chanhXeCount: Math.round(22 * m),
      totalCod: Math.round(980000000 * m),
    },
    topProducts: [
      { rank: 1, sku: "MI-INDOMIE-40", name: "Mì trộn Indomie Đặc Biệt 85g (Thùng 40)", qty: Math.round(1850 * m), revenue: Math.round(305000000 * m) },
      { rank: 2, sku: "CP-GA-POP-1KG", name: "Gà viên Popcorn CP 1kg", qty: Math.round(920 * m), revenue: Math.round(107000000 * m) },
      { rank: 3, sku: "DM-NEM-RAN-500", name: "Nem chua rán Đức Minh 500g", qty: Math.round(1100 * m), revenue: Math.round(68200000 * m) },
      { rank: 4, sku: "TOKBOKKI-500", name: "Tokbokki bánh gạo 500g", qty: Math.round(1050 * m), revenue: Math.round(39900000 * m) },
      { rank: 5, sku: "MAYO-KEWPIE-1KG", name: "Mayonnaise Kewpie 1kg", qty: Math.round(780 * m), revenue: Math.round(69400000 * m) },
    ],
  };
}

export const MOCK_REPORTS: Record<ReportPeriod, ReportData> = {
  today: build("today"),
  "7d": build("7d"),
  month: build("month"),
  quarter: build("quarter"),
};
