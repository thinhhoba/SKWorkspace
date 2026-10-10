// Fallback mock: sẽ thay bằng Prisma khi DATABASE_URL khả dụng — xem packages/core/db.ts
import type { SalesOrder, SalesOrderItem, OrderStatus } from "./types";
import { MOCK_SALES_ORDERS } from "./mockData";
import { fetchSapoOrders, createSapoOrder, updateSapoOrder, cancelSapoOrder } from "@/packages/integrations/sapo/sapoClient";
import type { SapoOrder } from "@/packages/integrations/sapo/types";

let salesStore: SalesOrder[] = [];
let isInitialSyncDone = false;

// Chuyển đổi đơn hàng thực tế từ Sapo Open API sang SalesOrder
export function convertSapoOrderToSalesOrder(so: SapoOrder): SalesOrder {
  const code = String(so.order_number || so.code || so.name || so.id);
  const sapoId = String(so.id);
  const items: SalesOrderItem[] = (so.line_items || []).map((li, idx) => ({
    id: `SO-SAPO-${code}-I${idx + 1}`,
    sku: li.sku || `SKU-${li.id}`,
    name: li.product_name || li.name || "Sản phẩm Sơn Khang",
    category: "Thực phẩm đông lạnh",
    dvt: li.unit || "Gói",
    quantity: li.quantity || 1,
    unit_price: li.price || 0,
    total_price: (li.quantity || 1) * (li.price || 0),
    lot_number: `L${code}`,
    picked: false,
  }));

  const total_amount = so.total_price || items.reduce((s, it) => s + it.total_price, 0);
  const isPaid = so.financial_status === "paid";

  let status: OrderStatus = "cho_soan";
  if (so.fulfillment_status === "fulfilled") status = "hoan_tat";
  else if (so.status === "cancelled") status = "huy";

  return {
    id: `SO-SAPO-${code}`,
    code: `#${code}`,
    sapo_order_id: sapoId,
    customer_id: String(so.customer?.id ? `KH-SAPO-${so.customer.id}` : "KH-LE-SAPO"),
    customer_name: so.customer?.name || `${so.customer?.first_name || ""} ${so.customer?.last_name || ""}`.trim() || "Khách mua Sapo",
    customer_phone: so.customer?.phone || so.customer?.default_address?.phone,
    delivery_address: so.customer?.address || so.customer?.default_address?.address1 || "Hà Nội",
    warehouse: "Q7",
    items,
    total_amount,
    paid_amount: isPaid ? total_amount : 0,
    payment_method: "COD_VIETQR",
    status,
    created_at: so.created_on || so.created_at ? new Date(so.created_on || so.created_at!).toLocaleDateString("vi-VN") : new Date().toLocaleDateString("vi-VN"),
    notes: so.note || `Đơn hàng Sapo live #${code}`,
  };
}

export function upsertSapoOrder(so: SapoOrder): SalesOrder {
  const converted = convertSapoOrderToSalesOrder(so);
  const idx = salesStore.findIndex((o) => o.sapo_order_id === converted.sapo_order_id || o.id === converted.id);
  if (idx >= 0) {
    salesStore[idx] = { ...salesStore[idx], ...converted };
  } else {
    salesStore.unshift(converted);
  }
  return converted;
}

// Đồng bộ đơn hàng thực tế từ Sapo Open API
export async function syncSalesOrdersFromSapo(): Promise<number> {
  try {
    const sapoOrders = await fetchSapoOrders({ limit: 50 });
    if (Array.isArray(sapoOrders) && sapoOrders.length > 0) {
      const liveOrders = sapoOrders.map(convertSapoOrderToSalesOrder);
      const localOnly = salesStore.filter(o => !o.sapo_order_id && !liveOrders.some(lo => lo.id === o.id));
      salesStore = [...liveOrders, ...localOnly];
      return liveOrders.length;
    }
    return 0;
  } catch (err) {
    console.warn("Failed to sync sales orders from Sapo:", err);
    return 0;
  }
}

export async function ensureSalesSynced(force = false): Promise<void> {
  if (force || !isInitialSyncDone || salesStore.length === 0) {
    await syncSalesOrdersFromSapo();
    isInitialSyncDone = true;
  }
}

// Tự động khởi chạy sync đơn thực từ Sapo khi module load
if (typeof process !== "undefined") {
  ensureSalesSynced().catch(() => {});
}

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

  // Đẩy 2 chiều lên Sapo API nếu không phải đơn từ Sapo đổ về
  if (!newOrder.sapo_order_id) {
    createSapoOrder({
      line_items: items.map(it => ({
        sku: it.sku,
        name: it.name,
        quantity: it.quantity,
        price: it.unit_price,
      })),
      customer: {
        name: newOrder.customer_name,
        phone: newOrder.customer_phone,
        address: newOrder.delivery_address,
      },
      note: newOrder.notes || `Đơn hàng tạo từ SK Workspace [${code}]`,
    }).then(res => {
      if (res.success && res.order) {
        newOrder.sapo_order_id = String(res.order.id);
      }
    }).catch(err => {
      console.warn("Không thể đồng bộ đơn mới lên Sapo:", err);
    });
  }

  return newOrder;
}

export function updateSalesOrder(orderId: string, updates: Partial<SalesOrder>): SalesOrder {
  const order = salesStore.find((o) => o.id === orderId);
  if (!order) throw new Error(`Không tìm thấy đơn hàng ${orderId}`);

  Object.assign(order, updates);
  if (updates.items) {
    order.total_amount = order.items.reduce((acc, it) => acc + (it.total_price || it.quantity * it.unit_price), 0);
  }

  // Nếu có liên kết Sapo, cập nhật 2 chiều
  if (order.sapo_order_id) {
    updateSapoOrder(Number(order.sapo_order_id), {
      note: order.notes,
    }).catch(() => {});
  }

  return order;
}

export function deleteSalesOrder(orderId: string): boolean {
  const idx = salesStore.findIndex((o) => o.id === orderId);
  if (idx < 0) return false;
  const removed = salesStore[idx];
  salesStore.splice(idx, 1);

  // Hủy 2 chiều trên Sapo
  if (removed.sapo_order_id) {
    cancelSapoOrder(Number(removed.sapo_order_id), "customer").catch(() => {});
  }
  return true;
}

export function markOrderPaid(orderCodeOrId: string): SalesOrder | null {
  const clean = orderCodeOrId.replace(/^#/, "").trim().toLowerCase();
  const order = salesStore.find((o) =>
    o.id.toLowerCase() === clean ||
    o.code.toLowerCase() === clean ||
    (o.sapo_order_id && o.sapo_order_id.toLowerCase() === clean) ||
    o.code.toLowerCase().includes(clean)
  );
  if (!order) return null;
  order.status = "hoan_tat";
  order.notes = (order.notes ? order.notes + " | " : "") + `Đã khớp VietQR Techcombank 22226060 lúc ${new Date().toLocaleTimeString("vi-VN")}`;
  return order;
}

// For testing / reset — not required but useful
export function __resetSalesStore(): void {
  salesStore = MOCK_SALES_ORDERS.map((o) => ({
    ...o,
    items: o.items.map((it) => ({ ...it })),
  }));
}
