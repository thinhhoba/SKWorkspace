export type OrderStatus =
  | "cho_duyet"
  | "cho_soan"
  | "dang_soan"
  | "da_soan"
  | "dang_giao"
  | "hoan_tat"
  | "huy";

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  cho_duyet: "Chờ duyệt",
  cho_soan: "Chờ soạn",
  dang_soan: "Đang soạn",
  da_soan: "Đã soạn",
  dang_giao: "Đang giao",
  hoan_tat: "Hoàn tất",
  huy: "Đã hủy",
};

export const ORDER_STATUS_COLOR: Record<OrderStatus, string> = {
  cho_duyet: "bg-slate-100 text-slate-700 border-slate-200",
  cho_soan: "bg-amber-100 text-amber-700 border-amber-200",
  dang_soan: "bg-sky-100 text-sky-700 border-sky-200",
  da_soan: "bg-emerald-100 text-emerald-700 border-emerald-200",
  dang_giao: "bg-primary/10 text-primary border-primary/20",
  hoan_tat: "bg-emerald-100 text-emerald-700 border-emerald-200",
  huy: "bg-rose-100 text-rose-700 border-rose-200",
};

export type PaymentMethod = "COD_VIETQR" | "DEBT_B2B" | "TRANSFER";

export interface SalesOrderItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  dvt: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  lot_number?: string;
  picked?: boolean;
}

export interface SalesOrder {
  id: string;
  code: string;
  sapo_order_id?: string;
  customer_id: string;
  customer_name: string;
  customer_phone?: string;
  delivery_address?: string;
  warehouse: "Q7" | "Q12";
  items: SalesOrderItem[];
  total_amount: number;
  paid_amount: number;
  payment_method: PaymentMethod;
  status: OrderStatus;
  created_at: string;
  delivery_date?: string;
  notes?: string;
}
