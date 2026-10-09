export type WarehouseCode = "Q7" | "Q12";

export type StockStatus = "du" | "sap-thieu" | "thieu" | "can-han";

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: "Thịt tươi" | "Thịt đông lạnh" | "Thực phẩm chế biến" | "Gia vị & Phụ liệu";
  dvt: string; // khay, gói, cây, kg, thùng
  warehouse: WarehouseCode;
  warehouse_name: string; // "Kho Lạnh Q7" | "Kho Tổng Q12"
  quantity: number; // Tồn hiện tại
  min_stock: number; // Tồn tối thiểu
  max_stock: number; // Dung tích tối đa
  temperature: string; // "-18°C" hoặc "-2°C ~ 4°C"
  lot_number: string; // Số lô (vd: L2610-01)
  production_date: string; // DD/MM/YYYY
  expiry_date: string; // DD/MM/YYYY
  days_until_expiry: number;
  location: string; // Vị trí ngăn kệ (vd: Kệ A1-N2)
  unit_price: number;
  total_value: number;
  status: StockStatus;
  status_label: string;
}

export interface StockTransfer {
  id: string;
  code: string; // vd: DC-2610-001
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

export interface WarehouseMetrics {
  total_skus: number;
  total_quantity: number;
  total_value: number;
  q7_capacity_pct: number;
  q12_capacity_pct: number;
  out_of_stock_count: number;
  low_stock_count: number;
  near_expiry_count: number;
}
