import { InventoryItem, StockTransfer, WarehouseMetrics, WarehouseCode, StorageTempZone, StockStatus } from "./types";
import { INITIAL_INVENTORY_ITEMS, INITIAL_TRANSFERS } from "./mockData";

let inventoryStore: InventoryItem[] = [...INITIAL_INVENTORY_ITEMS];
let transferStore: StockTransfer[] = [...INITIAL_TRANSFERS];

export function getInventoryList(options?: {
  warehouse?: WarehouseCode | "ALL";
  tempZone?: StorageTempZone | "ALL";
  status?: StockStatus | "ALL";
  search?: string;
}): InventoryItem[] {
  let list = [...inventoryStore];
  if (options?.warehouse && options.warehouse !== "ALL") list = list.filter((i) => i.warehouse === options.warehouse);
  if (options?.tempZone && options.tempZone !== "ALL") list = list.filter((i) => i.temp_zone === options.tempZone);
  if (options?.status && options.status !== "ALL") list = list.filter((i) => i.status === options.status);
  if (options?.search?.trim()) {
    const q = options.search.trim().toLowerCase();
    list = list.filter((i) => i.sku.toLowerCase().includes(q) || i.name.toLowerCase().includes(q) || i.lot_number.toLowerCase().includes(q) || i.location.toLowerCase().includes(q));
  }
  return list;
}

export function getFefoWarnings(thresholdDays = 30): InventoryItem[] {
  return inventoryStore.filter((i) => i.is_near_expiry || i.days_until_expiry < thresholdDays).sort((a, b) => a.days_until_expiry - b.days_until_expiry);
}

export function getWarehouseMetrics(): WarehouseMetrics {
  const totalSkus = new Set(inventoryStore.map((i) => i.sku)).size;
  const totalQuantity = inventoryStore.reduce((a, i) => a + i.quantity, 0);
  const totalValue = inventoryStore.reduce((a, i) => a + i.total_value, 0);
  const dcItems = inventoryStore.filter((i) => i.warehouse === "KHO_DINH_CONG");
  const ybItems = inventoryStore.filter((i) => i.warehouse === "KHO_YEN_BINH");
  const dcQty = dcItems.reduce((a, i) => a + i.quantity, 0);
  const dcMax = dcItems.reduce((a, i) => a + i.max_stock, 0);
  const ybQty = ybItems.reduce((a, i) => a + i.quantity, 0);
  const ybMax = ybItems.reduce((a, i) => a + i.max_stock, 0);
  return {
    total_skus: totalSkus,
    total_quantity: totalQuantity,
    total_value: totalValue,
    dinh_cong_capacity_pct: dcMax > 0 ? Math.round((dcQty / dcMax) * 100) : 0,
    yen_binh_capacity_pct: ybMax > 0 ? Math.round((ybQty / ybMax) * 100) : 0,
    out_of_stock_count: inventoryStore.filter((i) => i.status === "thieu").length,
    low_stock_count: inventoryStore.filter((i) => i.status === "sap-thieu").length,
    near_expiry_count: inventoryStore.filter((i) => i.is_near_expiry).length,
    dong_lanh_qty: inventoryStore.filter((i) => i.temp_zone === "dong_lanh").reduce((a, i) => a + i.quantity, 0),
    kho_mat_qty: inventoryStore.filter((i) => i.temp_zone === "kho_mat").reduce((a, i) => a + i.quantity, 0),
  };
}

export function getStockTransfers(): StockTransfer[] {
  return [...transferStore];
}

export function createStockTransfer(payload: {
  sku: string;
  quantity: number;
  from: WarehouseCode;
  to: WarehouseCode;
  note?: string;
  createdBy?: string;
}): StockTransfer {
  if (payload.from === payload.to) throw new Error("Kho xuất và kho nhận phải khác nhau");
  const sourceItem = inventoryStore.find((i) => i.sku === payload.sku && i.warehouse === payload.from);
  if (!sourceItem) throw new Error(`Không tìm thấy ${payload.sku} tại ${payload.from}`);
  if (sourceItem.quantity < payload.quantity) throw new Error(`Tồn tại ${payload.from} không đủ (còn ${sourceItem.quantity} ${sourceItem.dvt})`);
  sourceItem.quantity -= payload.quantity;
  sourceItem.total_value = sourceItem.quantity * sourceItem.unit_price;
  const targetItem = inventoryStore.find((i) => i.sku === payload.sku && i.warehouse === payload.to);
  if (targetItem) { targetItem.quantity += payload.quantity; targetItem.total_value = targetItem.quantity * targetItem.unit_price; }
  const now = new Date();
  const code = `SK-DC-${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(transferStore.length + 1).padStart(4, "0")}`;
  const dateStr = `${now.toLocaleDateString("vi-VN")} ${now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
  const tr: StockTransfer = {
    id: `TRF-${Date.now()}`,
    code,
    from_warehouse: payload.from,
    to_warehouse: payload.to,
    sku: payload.sku,
    item_name: sourceItem.name,
    quantity: payload.quantity,
    dvt: sourceItem.dvt,
    lot_number: sourceItem.lot_number,
    created_at: dateStr,
    created_by: payload.createdBy || "Trần Thị Ngọc Thúy (Thủ kho)",
    status: "in_transit",
    status_label: "Đang vận chuyển",
    note: payload.note || "Điều chuyển kho nội bộ",
  };
  transferStore.unshift(tr);
  return tr;
}

export function createInventoryAudit(payload: { warehouse: WarehouseCode; items: { sku: string; counted: number }[]; note?: string; createdBy?: string }) {
  const now = new Date();
  const code = `SK-KK-${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(Date.now()).slice(-4)}`;
  const dateStr = `${now.toLocaleDateString("vi-VN")} ${now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;
  const items = payload.items.map((it) => {
    const sys = inventoryStore.find((s) => s.sku === it.sku && s.warehouse === payload.warehouse)?.quantity ?? 0;
    return { sku: it.sku, counted: it.counted, system_qty: sys, diff: it.counted - sys };
  });
  return { id: `AUD-${Date.now()}`, code, warehouse: payload.warehouse, created_at: dateStr, created_by: payload.createdBy || "Trần Thị Ngọc Thúy", items, note: payload.note };
}
