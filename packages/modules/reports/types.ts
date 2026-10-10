export type ReportPeriod = "today" | "7d" | "month" | "quarter";

export type ChannelCode = "quan_an" | "dai_ly" | "can_tin" | "web" | "pos" | "ban_le";
export interface ChannelRevenue {
  channel: ChannelCode;
  label: string;
  revenue: number;
  orders: number;
  share: number;
}

export type ProductGroupCode = "hang_kho" | "gia_vi" | "hang_mat" | "hang_dong";
export interface ProductGroupProfit {
  group: ProductGroupCode;
  label: string;
  revenue: number;
  cost: number;
  grossProfit: number;
  margin: number;
}

export interface WarehouseShare {
  warehouse: "KHO_DINH_CONG" | "KHO_YEN_BINH";
  label: string;
  qty: number;
  share: number;
}

export interface DriverPerformance {
  driver: string;
  phone: string;
  totalTrips: number;
  successRate: number;
  chanhXeCount: number;
  totalCod: number;
}

export interface TopProduct {
  rank: number;
  sku: string;
  name: string;
  qty: number;
  revenue: number;
}

export interface KpiSummary {
  revenueMonth: number;
  grossProfit: number;
  grossMargin: number;
  noodleCartons: number;
  debtRecoveryRate: number;
}

export interface ReportData {
  period: ReportPeriod;
  kpi: KpiSummary;
  channels: ChannelRevenue[];
  productGroups: ProductGroupProfit[];
  warehouseShare: WarehouseShare[];
  driver: DriverPerformance;
  topProducts: TopProduct[];
}
