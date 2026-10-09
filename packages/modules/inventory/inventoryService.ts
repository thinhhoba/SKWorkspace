import { InventoryItem, StockTransfer, WarehouseMetrics, WarehouseCode, StockStatus } from "./types";
import { INITIAL_INVENTORY_ITEMS, INITIAL_TRANSFERS } from "./mockData";

let inventoryStore: InventoryItem[] = [...INITIAL_INVENTORY_ITEMS];
let transferStore: StockTransfer[] = [...INITIAL_TRANSFERS];

export function getInventoryList(options?: {
  warehouse?: WarehouseCode | "ALL";
  status?: StockStatus | "ALL";
  search?: string;
}): InventoryItem[] {
  let list = [...inventoryStore];

  if (options?.warehouse && options.warehouse !== "ALL") {
    list = list.filter((i) => i.warehouse === options.warehouse);
  }

  if (options?.status && options.status !== "ALL") {
    list = list.filter((i) => i.status === options.status);
  }

  if (options?.search && options.search.trim()) {
    const q = options.search.trim().toLowerCase();
    list = list.filter(
      (i) =>
        i.sku.toLowerCase().includes(q) ||
        i.name.toLowerCase().includes(q) ||
        i.lot_number.toLowerCase().includes(q) ||
        i.location.toLowerCase().includes(q)
    );
  }

  return list;
}

export function getWarehouseMetrics(): WarehouseMetrics {
  const totalSkus = new Set(inventoryStore.map((i) => i.sku)).size;
  const totalQuantity = inventoryStore.reduce((acc, i) => acc + i.quantity, 0);
  const totalValue = inventoryStore.reduce((acc, i) => acc + i.total_value, 0);

  const q7Items = inventoryStore.filter((i) => i.warehouse === "Q7");
  const q7Qty = q7Items.reduce((acc, i) => acc + i.quantity, 0);
  const q7Max = q7Items.reduce((acc, i) => acc + i.max_stock, 0);
  const q7CapacityPct = q7Max > 0 ? Math.round((q7Qty / q7Max) * 100) : 68;

  const q12Items = inventoryStore.filter((i) => i.warehouse === "Q12");
  const q12Qty = q12Items.reduce((acc, i) => acc + i.quantity, 0);
  const q12Max = q12Items.reduce((acc, i) => acc + i.max_stock, 0);
  const q12CapacityPct = q12Max > 0 ? Math.round((q12Qty / q12Max) * 100) : 42;

  const outOfStockCount = inventoryStore.filter((i) => i.status === "thieu").length;
  const lowStockCount = inventoryStore.filter((i) => i.status === "sap-thieu").length;
  const nearExpiryCount = inventoryStore.filter((i) => i.status === "can-han").length;

  return {
    total_skus: totalSkus,
    total_quantity: totalQuantity,
    total_value: totalValue,
    q7_capacity_pct: q7CapacityPct,
    q12_capacity_pct: q12CapacityPct,
    out_of_stock_count: outOfStockCount,
    low_stock_count: lowStockCount,
    near_expiry_count: nearExpiryCount
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
  const sourceItem = inventoryStore.find((i) => i.sku === payload.sku && i.warehouse === payload.from);
  if (!sourceItem) {
    throw new Error(`Không tìm thấy sản phẩm ${payload.sku} tại kho xuất ${payload.from}`);
  }
  if (sourceItem.quantity < payload.quantity) {
    throw new Error(`Số lượng tồn tại kho ${payload.from} không đủ (còn ${sourceItem.quantity} ${sourceItem.dvt})`);
  }

  // Trừ tồn kho xuất
  sourceItem.quantity -= payload.quantity;
  sourceItem.total_value = sourceItem.quantity * sourceItem.unit_price;

  // Cộng hoặc tạo mới tồn kho nhận
  let targetItem = inventoryStore.find((i) => i.sku === payload.sku && i.warehouse === payload.to);
  if (targetItem) {
    targetItem.quantity += payload.quantity;
    targetItem.total_value = targetItem.quantity * targetItem.unit_price;
  }

  const code = `DC-2610-${String(transferStore.length + 1).padStart(3, "0")}`;
  const now = new Date();
  const dateStr = `${now.toLocaleDateString("vi-VN")} ${now.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}`;

  const newTransfer: StockTransfer = {
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
    created_by: payload.createdBy || "Thủ kho Sơn Khang",
    status: "in_transit",
    status_label: "Đang vận chuyển",
    note: payload.note || "Điều chuyển kho nội bộ"
  };

  transferStore.unshift(newTransfer);
  return newTransfer;
}
