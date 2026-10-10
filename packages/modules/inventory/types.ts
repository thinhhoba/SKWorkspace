export type WarehouseCode = "KHO_DINH_CONG" | "KHO_YEN_BINH";

export type StorageTempZone = "dong_lanh" | "kho_mat" | "kho_kho";

export type StockStatus = "du" | "sap-thieu" | "thieu" | "can-han";

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  dvt: string;
  warehouse: WarehouseCode;
  warehouse_name: string;
  quantity: number;
  min_stock: number;
  max_stock: number;
  temperature: string;
  temp_zone: StorageTempZone;
  lot_number: string;
  production_date: string;
  expiry_date: string;
  days_until_expiry: number;
  is_near_expiry: boolean;
  location: string;
  unit_price: number;
  total_value: number;
  status: StockStatus;
  status_label: string;
}

export interface StockTransfer {
  id: string;
  code: string;
  from_warehouse: WarehouseCode;
  to_warehouse: WarehouseCode;
  sku: string;
  item_name: string;
  quantity: number;
  dvt: string;
  lot_number: string;
  created_at: string;
  created_by: string;
  status: "pending" | "in_transit" | "completed";
  status_label: string;
  note?: string;
}

export interface InventoryAudit {
  id: string;
  code: string;
  warehouse: WarehouseCode;
  created_at: string;
  created_by: string;
  items: { sku: string; counted: number; system_qty: number; diff: number }[];
  note?: string;
}

export interface WarehouseMetrics {
  total_skus: number;
  total_quantity: number;
  total_value: number;
  dinh_cong_capacity_pct: number;
  yen_binh_capacity_pct: number;
  out_of_stock_count: number;
  low_stock_count: number;
  near_expiry_count: number;
  dong_lanh_qty: number;
  kho_mat_qty: number;
}
