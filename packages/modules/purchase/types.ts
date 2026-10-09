export interface Supplier {
  id: string;
  code: string;
  name: string;
  tax_code: string;
  phone: string;
  email: string;
  address: string;
  category: string;
  payment_terms_days: number;
  total_payable: number;
}

export type PurchaseStatus = "draft" | "ordered" | "received" | "cancelled";

export const PURCHASE_STATUS_LABEL: Record<PurchaseStatus, string> = {
  draft: "Dự thảo",
  ordered: "Đã đặt hàng",
  received: "Đã nhập kho",
  cancelled: "Đã hủy",
};

export const PURCHASE_STATUS_COLOR: Record<PurchaseStatus, string> = {
  draft: "bg-slate-100 text-slate-700 border-slate-200",
  ordered: "bg-amber-100 text-amber-700 border-amber-200",
  received: "bg-emerald-100 text-emerald-700 border-emerald-200",
  cancelled: "bg-rose-100 text-rose-700 border-rose-200",
};

export interface PurchaseOrderItem {
  id: string;
  sku: string;
  name: string;
  dvt: string;
  quantity: number;
  received_quantity?: number;
  unit_price: number;
  total_price: number;
  lot_number?: string;
  expiry_date?: string;
  location?: string;
}

export interface PurchaseOrder {
  id: string;
  code: string;
  supplier_id: string;
  supplier_name: string;
  warehouse: "Q7" | "Q12";
  items: PurchaseOrderItem[];
  total_amount: number;
  paid_amount: number;
  status: PurchaseStatus;
  order_date: string;
  received_date?: string;
  invoice_no?: string;
  notes?: string;
}
