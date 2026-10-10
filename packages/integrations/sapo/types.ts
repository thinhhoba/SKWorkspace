import { BusinessScope } from "@/packages/core/aliases";

export type SapoOrderChannel = "web_order" | "pos" | "quan_an" | "dai_ly" | "bep_an" | "ban_le";

export interface SapoCustomer {
  id: number;
  code?: string;
  name: string;
  phone?: string;
  address?: string;
  tax_number?: string;
  first_name?: string;
  last_name?: string;
  default_address?: {
    address1?: string;
    address2?: string;
    city?: string;
    province?: string;
    phone?: string;
  };
}

export interface SapoOrderLineItem {
  id: number;
  product_id?: number;
  variant_id?: number;
  sku: string;
  name?: string;
  product_name?: string;
  variant_name?: string;
  quantity: number;
  price: number;
  tax_rate?: number; // e.g. 8 for 8%
  unit?: string;
}

export interface SapoOrder {
  id: number;
  code?: string; // e.g. "13537" or "SP-13537"
  order_number?: number;
  name?: string;
  created_on?: string;
  created_at?: string;
  customer?: SapoCustomer;
  line_items: SapoOrderLineItem[];
  branch_name?: string;
  total_price: number;
  note?: string;
  status?: string;
  financial_status?: string;
  fulfillment_status?: string;
  source_name?: string; // "admin", "zalo", "web", "pos"
  channel?: string;
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
  id: string; // external_id e.g. "SAPO-13537"
  order_code: string;
  alias_code: string; // Mã nghiệp vụ chuẩn: SK-SO-..., SK-WEB-..., SK-POS-...
  business_scope: BusinessScope;
  channel: SapoOrderChannel;
  created_date: string;
  accounting_date: string;
  customer_code: string;
  customer_name: string;
  customer_tax_code: string;
  customer_address: string;
  customer_phone?: string;
  branch: string; // "Kho Định Công (HN)" | "Kho Thạch Thất"
  items: CentralOrderItem[];
  total_amount: number;
  note?: string;
  source: "Sapo" | "Web" | "POS" | "Manual";
  sync_status: "pending" | "synced_amis" | "synced_einvoice" | "error";
  last_synced_at: string;
}

// ---------------------------------------------------------------------------
// Sapo Webhook types — Worker 1
// ---------------------------------------------------------------------------
export type SapoWebhookTopic =
  | "orders/create"
  | "orders/updated"
  | "orders/paid"
  | "orders/cancelled"
  | "orders/fulfilled";

export interface SapoWebhookPayload {
  id?: number;
  order?: SapoOrder;
  topic?: string;
  shop_domain?: string;
  [key: string]: unknown;
}

export interface SapoWebhookLog {
  id: string;
  topic: SapoWebhookTopic;
  order_id: number;
  order_code: string;
  alias_code: string;
  channel: SapoOrderChannel;
  received_at: string;
  central_order?: CentralOrder;
  raw_payload?: Record<string, unknown>;
}

export interface SapoWebhookStatus {
  active: boolean;
  shop_domain: string;
  secret_configured: boolean;
  topics: SapoWebhookTopic[];
  total_received: number;
  last_event_at: string | null;
}
