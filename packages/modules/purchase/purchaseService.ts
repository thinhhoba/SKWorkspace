import type { PurchaseOrder, PurchaseOrderItem, PurchaseStatus, Supplier } from "./types";
import { MOCK_PURCHASE_ORDERS, MOCK_SUPPLIERS } from "./mockData";

let purchaseStore: PurchaseOrder[] = MOCK_PURCHASE_ORDERS.map((o) => ({
  ...o,
  items: o.items.map((it) => ({ ...it })),
}));

let supplierStore: Supplier[] = [...MOCK_SUPPLIERS];

export function getPurchaseOrders(filters?: {
  status?: PurchaseStatus | "ALL";
  warehouse?: "Q7" | "Q12" | "ALL";
  search?: string;
}): PurchaseOrder[] {
  let list = [...purchaseStore];

  if (filters?.status && filters.status !== "ALL") {
    list = list.filter((o) => o.status === filters.status);
  }

  if (filters?.warehouse && filters.warehouse !== "ALL") {
    list = list.filter((o) => o.warehouse === filters.warehouse);
  }

  if (filters?.search && filters.search.trim()) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter(
      (o) =>
        o.code.toLowerCase().includes(q) ||
        o.supplier_name.toLowerCase().includes(q) ||
        o.supplier_id.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q),
    );
  }

  return list;
}

export function getPurchaseStats(): {
  totalMonth: number;
  pendingReceipt: number;
  payable331: number;
  supplierCount: number;
  byStatus: Record<PurchaseStatus, number>;
} {
  const active = purchaseStore.filter((o) => o.status !== "cancelled");
  const totalMonth = active.reduce((acc, o) => acc + o.total_amount, 0);
  const pendingReceipt = purchaseStore.filter((o) => o.status === "ordered").length;
  const payable331 = active.reduce((acc, o) => acc + (o.total_amount - o.paid_amount), 0);
  const supplierCount = supplierStore.length;

  const byStatus: Record<PurchaseStatus, number> = {
    draft: 0,
    ordered: 0,
    received: 0,
    cancelled: 0,
  };

  for (const o of purchaseStore) {
    byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
  }

  return { totalMonth, pendingReceipt, payable331, supplierCount, byStatus };
}

export function getSuppliers(): Supplier[] {
  return [...supplierStore];
}

export function getPurchaseOrderById(id: string): PurchaseOrder | undefined {
  return purchaseStore.find((o) => o.id === id);
}

export function createPurchaseOrder(
  data: Omit<PurchaseOrder, "id" | "code" | "total_amount" | "status"> & {
    items: Omit<PurchaseOrderItem, "id" | "total_price">[];
  },
): PurchaseOrder {
  const nextIndex = purchaseStore.length + 1;
  const id = `PO-${String(nextIndex).padStart(3, "0")}`;
  const code = `PO-2026-${String(nextIndex).padStart(3, "0")}`;

  const items: PurchaseOrderItem[] = data.items.map((it, idx) => ({
    ...it,
    id: `${id}-I${String(idx + 1).padStart(2, "0")}`,
    total_price: it.quantity * it.unit_price,
  }));

  const total_amount = items.reduce((acc, it) => acc + it.total_price, 0);

  const newOrder: PurchaseOrder = {
    ...data,
    id,
    code,
    items,
    total_amount,
    status: "draft",
  };

  purchaseStore.push(newOrder);
  return newOrder;
}

export function receivePurchaseOrder(
  poId: string,
  itemsData: Array<{
    itemId: string;
    received_quantity: number;
    lot_number: string;
    expiry_date: string;
    location: string;
  }>,
): PurchaseOrder {
  const order = purchaseStore.find((o) => o.id === poId);
  if (!order) throw new Error(`Không tìm thấy đơn mua hàng ${poId}`);
  if (order.status !== "ordered") throw new Error(`Chỉ nhận hàng khi đơn ở trạng thái Đã đặt hàng (ordered)`);

  for (const d of itemsData) {
    const item = order.items.find((it) => it.id === d.itemId);
    if (!item) throw new Error(`Không tìm thấy dòng hàng ${d.itemId} trong đơn ${poId}`);
    item.received_quantity = d.received_quantity;
    item.lot_number = d.lot_number;
    item.expiry_date = d.expiry_date;
    item.location = d.location;
  }

  order.status = "received";
  order.received_date = new Date().toLocaleDateString("vi-VN");

  return order;
}

export function updatePurchaseStatus(id: string, status: PurchaseStatus): PurchaseOrder {
  const order = purchaseStore.find((o) => o.id === id);
  if (!order) throw new Error(`Không tìm thấy đơn mua hàng ${id}`);
  order.status = status;
  return order;
}

export function __resetPurchaseStore(): void {
  purchaseStore = MOCK_PURCHASE_ORDERS.map((o) => ({
    ...o,
    items: o.items.map((it) => ({ ...it })),
  }));
  supplierStore = [...MOCK_SUPPLIERS];
}
