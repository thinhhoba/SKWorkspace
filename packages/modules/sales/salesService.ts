// Fallback mock: sẽ thay bằng Prisma khi DATABASE_URL khả dụng — xem packages/core/db.ts
import type { SalesOrder, SalesOrderItem, OrderStatus } from "./types";
import { MOCK_SALES_ORDERS } from "./mockData";

let salesStore: SalesOrder[] = MOCK_SALES_ORDERS.map((o) => ({
  ...o,
  items: o.items.map((it) => ({ ...it })),
}));

export function getSalesOrders(filters?: {
  status?: OrderStatus | "ALL";
  warehouse?: "Q7" | "Q12" | "ALL";
  search?: string;
}): SalesOrder[] {
  let list = [...salesStore];

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
        o.customer_name.toLowerCase().includes(q) ||
        o.customer_id.toLowerCase().includes(q) ||
        o.id.toLowerCase().includes(q),
    );
  }

  return list;
}

export function getSalesStats(): {
  totalToday: number;
  choSoan: number;
  dangGiao: number;
  revenueToday: number;
  byStatus: Record<OrderStatus, number>;
} {
  const active = salesStore.filter((s) => s.status !== "huy");
  const totalToday = active.length;
  const revenueToday = active.reduce((acc, s) => acc + s.total_amount, 0);

  const byStatus = {
    cho_duyet: 0,
    cho_soan: 0,
    dang_soan: 0,
    da_soan: 0,
    dang_giao: 0,
    hoan_tat: 0,
    huy: 0,
  } as Record<OrderStatus, number>;

  for (const o of salesStore) {
    byStatus[o.status] = (byStatus[o.status] ?? 0) + 1;
  }

  const choSoan = (byStatus["cho_soan"] ?? 0) + (byStatus["dang_soan"] ?? 0);
  const dangGiao = (byStatus["dang_giao"] ?? 0) + (byStatus["da_soan"] ?? 0);

  return { totalToday, choSoan, dangGiao, revenueToday, byStatus };
}

export function getSalesOrderById(id: string): SalesOrder | undefined {
  return salesStore.find((o) => o.id === id);
}

export function updateOrderStatus(orderId: string, newStatus: OrderStatus): SalesOrder {
  const order = salesStore.find((o) => o.id === orderId);
  if (!order) throw new Error(`Không tìm thấy đơn hàng ${orderId}`);
  order.status = newStatus;
  return order;
}

export function toggleItemPicked(orderId: string, itemId: string, picked: boolean): SalesOrder {
  const order = salesStore.find((o) => o.id === orderId);
  if (!order) throw new Error(`Không tìm thấy đơn hàng ${orderId}`);
  const item = order.items.find((it) => it.id === itemId);
  if (!item) throw new Error(`Không tìm thấy dòng hàng ${itemId} trong đơn ${orderId}`);
  item.picked = picked;
  return order;
}

export function completeOrderPicking(orderId: string): SalesOrder {
  const order = salesStore.find((o) => o.id === orderId);
  if (!order) throw new Error(`Không tìm thấy đơn hàng ${orderId}`);
  const allPicked = order.items.length > 0 && order.items.every((it) => it.picked === true);
  if (!allPicked) throw new Error("Chưa soạn đủ 100%");
  order.status = "da_soan";
  return order;
}

export function createSalesOrder(
  data: Omit<SalesOrder, "id" | "items"> & {
    items: Omit<SalesOrderItem, "id" | "total_price" | "picked">[];
  },
): SalesOrder {
  const nextIndex = salesStore.length + 1;
  const id = `SO-2026-${String(nextIndex).padStart(3, "0")}`;
  const code = `DH-2026-${String(nextIndex).padStart(3, "0")}`;

  const items: SalesOrderItem[] = data.items.map((it, idx) => ({
    ...it,
    id: `${id}-I${String(idx + 1).padStart(2, "0")}`,
    total_price: it.quantity * it.unit_price,
  }));

  const total_amount = items.reduce((acc, it) => acc + it.total_price, 0);

  const newOrder: SalesOrder = {
    ...data,
    id,
    code,
    items,
    total_amount,
  };

  salesStore.push(newOrder);
  return newOrder;
}

// For testing / reset — not required but useful
export function __resetSalesStore(): void {
  salesStore = MOCK_SALES_ORDERS.map((o) => ({
    ...o,
    items: o.items.map((it) => ({ ...it })),
  }));
}
