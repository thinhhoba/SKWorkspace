export interface SapoCustomer {
  id: number;
  code: string;
  name: string;
  phone?: string;
  address?: string;
  tax_number?: string;
}

export interface SapoOrderLineItem {
  id: number;
  product_id: number;
  variant_id: number;
  sku: string;
  product_name: string;
  variant_name?: string;
  quantity: number;
  price: number;
  tax_rate?: number; // e.g. 8 for 8%
  unit?: string;
}

export interface SapoOrder {
  id: number;
  code: string; // e.g. "SP-0841"
  created_on: string; // ISO date or "YYYY-MM-DDTHH:mm:ss"
  customer: SapoCustomer;
  line_items: SapoOrderLineItem[];
  branch_name: string; // e.g. "Kho Q7", "Kho Q12"
  total_price: number;
  note?: string;
  status: "completed" | "pending" | "processing";
}

export interface CentralOrderItem {
  sku: string;
  name: string;
  dvt: string;
  quantity: number;
  price: number;
  tax_rate: string; // "8%", "5%", "10%"
  lot_number?: string;
  expiry_date?: string;
}

export interface CentralOrder {
  id: string; // external_id e.g. "SP-0841"
  order_code: string;
  created_date: string;
  accounting_date: string;
  customer_code: string;
  customer_name: string;
  customer_tax_code: string;
  customer_address: string;
  branch: string;
  items: CentralOrderItem[];
  total_amount: number;
  note?: string;
  source: "Sapo";
  last_synced_at: string;
}
