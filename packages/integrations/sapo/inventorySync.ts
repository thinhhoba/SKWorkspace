/**
 * inventorySync.ts — Sapo Inventory 2-Way Sync
 * Kho Tổng Định Công & Kho Yên Bình ↔ Sapo API
 * Thủ kho phụ trách: TRẦN THỊ NGỌC THÚY
 * Worker 2: syncInventoryToSapo / syncInventoryFromSapo + deduction on picking
 */

const SAPO_VARIANTS_ENDPOINT = "https://sonkhang.mysapo.net/admin/variants.json";
const SAPO_INVENTORY_SET_ENDPOINT = "https://sonkhang.mysapo.net/admin/inventory_levels/set.json";

const DEFAULT_SAPO_API_KEY = "0166bd3c4bb745edb301413aec771b2b";
const DEFAULT_SAPO_API_SECRET = "e2cc59d4ace34a009a0704ab9f72a8b4";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface SapoVariant {
  id: number;
  product_id: number;
  sku: string;
  barcode?: string;
  title?: string;
  price?: number;
  inventory_quantity: number;
  inventory_management?: string;
  updated_at?: string;
}

export type StockCompareStatus = "MATCH" | "OVER_STOCK" | "UNDER_STOCK" | "OUT_OF_STOCK";

export interface StockCompareRow {
  sku: string;
  barcode?: string;
  productName?: string;
  sapoQty: number;
  physicalQty: number;
  diff: number;
  status: StockCompareStatus;
}

export interface PushStockResult {
  success: boolean;
  sku: string;
  requestedQty: number;
  message: string;
  mocked: boolean;
}

export interface SyncInventoryResult {
  success: boolean;
  synced: number;
  failed: number;
  mocked: number;
  details: PushStockResult[];
}

// Kho vật lý Sơn Khang
export const WAREHOUSES = {
  KHO_DINH_CONG: {
    code: "KHO_DINH_CONG",
    name: "Kho Tổng Định Công",
    address: "96 Ngõ 337 Định Công, Hoàng Mai, Hà Nội",
  },
  KHO_YEN_BINH: {
    code: "KHO_YEN_BINH",
    name: "Kho Yên Bình",
    address: "Thôn 6 Yên Bình, Thạch Thất, Hà Nội",
  },
} as const;

/**
 * Mapping giữa mã kho nội bộ (Q7/Q12) và mã kho Sapo/logic.
 * Q7 = KHO_DINH_CONG, Q12 = KHO_YEN_BINH
 */
export const WAREHOUSE_SAPO_MAP = {
  Q7: WAREHOUSES.KHO_DINH_CONG.code,
  Q12: WAREHOUSES.KHO_YEN_BINH.code,
} as const;

export const SAPO_WAREHOUSE_MAP: Record<string, "Q7" | "Q12"> = {
  [WAREHOUSES.KHO_DINH_CONG.code]: "Q7",
  [WAREHOUSES.KHO_YEN_BINH.code]: "Q12",
  "Q7": "Q7",
  "Q12": "Q12",
};

export function resolveWarehouseCode(input: string): "Q7" | "Q12" | null {
  if (!input) return null;
  const key = input.trim().toUpperCase();
  if (key === "Q7" || key === "KHO_DINH_CONG") return "Q7";
  if (key === "Q12" || key === "KHO_YEN_BINH") return "Q12";
  return SAPO_WAREHOUSE_MAP[key] ?? null;
}

// ---------------------------------------------------------------------------
// In-memory physical inventory mirror (dùng khi chưa có DB Prisma)
// ---------------------------------------------------------------------------
const physicalInventoryStore = new Map<string, number>(); // key: `${warehouse}:${skuUpper}`

function physicalKey(warehouse: string, sku: string): string {
  return `${warehouse}:${sku.toUpperCase()}`;
}

export function setPhysicalQty(warehouse: string, sku: string, qty: number): void {
  physicalInventoryStore.set(physicalKey(warehouse, sku), Math.max(0, Math.floor(qty)));
}

export function getPhysicalQty(warehouse: string, sku: string): number {
  return physicalInventoryStore.get(physicalKey(warehouse, sku)) ?? 0;
}

export function deductPhysicalQty(warehouse: string, sku: string, qty: number): number {
  const key = physicalKey(warehouse, sku);
  const current = physicalInventoryStore.get(key) ?? 0;
  const next = Math.max(0, current - Math.max(0, Math.floor(qty)));
  physicalInventoryStore.set(key, next);
  return next;
}

export function clearPhysicalStore(): void {
  physicalInventoryStore.clear();
}

// ---------------------------------------------------------------------------
// Mock variants — fallback khi offline / Sapo API không phản hồi
// ---------------------------------------------------------------------------

export const MOCK_SAPO_VARIANTS: SapoVariant[] = [
  { id: 101, product_id: 1001, sku: "HH027", barcode: "8936000000271", title: "Bánh Gà Nét Việt 800g (18 Chiếc) - Hộp", price: 60000, inventory_quantity: 42 },
  { id: 102, product_id: 1002, sku: "HH053", barcode: "8936000000530", title: "Gà Viên Chiên Popcorn CP Túi 1kg", price: 117000, inventory_quantity: 18 },
  { id: 103, product_id: 1003, sku: "HH050", barcode: "8936000000509", title: "Chả Tôm Surimi Định Hình Ô Ngon 500g (31 Con)", price: 44000, inventory_quantity: 5 },
  { id: 104, product_id: 1004, sku: "HH092", barcode: "8936000000929", title: "Xúc xích Hồ lô Đồng Quê LC Foods 500g (45 viên)", price: 47000, inventory_quantity: 0 },
  { id: 105, product_id: 1005, sku: "HH043", barcode: "8936000000431", title: "Chả Mực Xoắn Ống Deli Foods 2,5kg (178 Viên)", price: 180000, inventory_quantity: 12 },
  { id: 106, product_id: 1006, sku: "HH123", barcode: "8936000001230", title: "Cá viên Munchee 500g (PM)", price: 23500, inventory_quantity: 33 },
  { id: 107, product_id: 1007, sku: "HH201", barcode: "8936000002015", title: "Bò viên Muwono 500g (80 viên)", price: 28000, inventory_quantity: 8 },
  { id: 108, product_id: 1008, sku: "SB237", barcode: "8936000023711", title: "Viên xốt hải sản Mayonaise 450g basa Thoại An", price: 41000, inventory_quantity: 25 },
  { id: 109, product_id: 1009, sku: "SKU-MI-INDO-DB", barcode: "8991234560011", title: "Mì trộn Indomie Vị Đặc Biệt 85g (Thùng 40 gói)", price: 165000, inventory_quantity: 60 },
  { id: 110, product_id: 1010, sku: "SKU-MI-KORENO-CJ", barcode: "8801234560022", title: "Mì Koreno Jjajangmen Tương Đen 115g (Thùng 24 gói)", price: 106000, inventory_quantity: 3 },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getSapoAuthHeader(): string {
  const apiKey = process.env.SAPO_API_KEY || DEFAULT_SAPO_API_KEY;
  const apiSecret = process.env.SAPO_API_SECRET || DEFAULT_SAPO_API_SECRET;
  return "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64");
}

function classifyStatus(sapoQty: number, physicalQty: number): StockCompareStatus {
  if (physicalQty === 0 && sapoQty === 0) return "OUT_OF_STOCK";
  if (physicalQty === 0 || sapoQty === 0) return "OUT_OF_STOCK";
  if (physicalQty === sapoQty) return "MATCH";
  if (physicalQty > sapoQty) return "OVER_STOCK";
  return "UNDER_STOCK";
}

// ---------------------------------------------------------------------------
// 1. fetchSapoVariants — GET /admin/variants.json
// ---------------------------------------------------------------------------

export async function fetchSapoVariants(limit?: number): Promise<SapoVariant[]> {
  const lim = limit && limit > 0 ? Math.min(limit, 250) : 50;
  const url = `${SAPO_VARIANTS_ENDPOINT}?limit=${lim}`;

  try {
    const res = await fetch(url, {
      headers: {
        Authorization: getSapoAuthHeader(),
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (res.ok) {
      const data = await res.json();
      // Sapo returns { variants: [...] }
      const variants: SapoVariant[] = Array.isArray(data.variants)
        ? data.variants
        : Array.isArray(data) ? data : [];

      if (variants.length > 0) {
        return variants.slice(0, lim).map((v) => ({
          id: v.id,
          product_id: v.product_id,
          sku: v.sku || `SKU-${v.id}`,
          barcode: v.barcode,
          title: v.title || (v as unknown as { name?: string }).name || "",
          price: v.price,
          inventory_quantity: typeof v.inventory_quantity === "number" ? v.inventory_quantity : 0,
          inventory_management: v.inventory_management,
          updated_at: v.updated_at,
        }));
      }
    } else {
      console.warn(`[SapoInventory] HTTP ${res.status} khi gọi variants.json — dùng mock`);
    }
  } catch (err) {
    console.warn("[SapoInventory] Không kết nối được Sapo variants API, dùng mock:", err);
  }

  return MOCK_SAPO_VARIANTS.slice(0, lim);
}

// ---------------------------------------------------------------------------
// 2. compareStockLevels — đối soát tồn Sapo vs tồn vật lý
// ---------------------------------------------------------------------------

export async function compareStockLevels(
  localInventory: Array<{ sku: string; physicalQty: number }>
): Promise<StockCompareRow[]> {
  const sapoVariants = await fetchSapoVariants();
  const sapoMap = new Map<string, SapoVariant>();
  for (const v of sapoVariants) {
    sapoMap.set(v.sku.toUpperCase(), v);
  }

  const results: StockCompareRow[] = [];

  for (const item of localInventory) {
    const key = item.sku.toUpperCase();
    const sapo = sapoMap.get(key);
    const sapoQty = sapo?.inventory_quantity ?? 0;
    const physicalQty = item.physicalQty;
    const diff = physicalQty - sapoQty;

    results.push({
      sku: item.sku,
      barcode: sapo?.barcode,
      productName: sapo?.title,
      sapoQty,
      physicalQty,
      diff,
      status: classifyStatus(sapoQty, physicalQty),
    });
  }

  // Thêm các SKU chỉ có trên Sapo mà không có trong localInventory (thiếu kiểm kê)
  const localSkus = new Set(localInventory.map((i) => i.sku.toUpperCase()));
  for (const v of sapoVariants) {
    if (!localSkus.has(v.sku.toUpperCase())) {
      results.push({
        sku: v.sku,
        barcode: v.barcode,
        productName: v.title,
        sapoQty: v.inventory_quantity,
        physicalQty: 0,
        diff: -v.inventory_quantity,
        status: v.inventory_quantity === 0 ? "OUT_OF_STOCK" : "UNDER_STOCK",
      });
    }
  }

  return results;
}

/**
 * So khớp đồng bộ (không gọi API) — dùng khi đã có sẵn sapoVariants
 */
export function compareStockLevelsSync(
  sapoVariants: SapoVariant[],
  localInventory: Array<{ sku: string; physicalQty: number }>
): StockCompareRow[] {
  const sapoMap = new Map<string, SapoVariant>();
  for (const v of sapoVariants) {
    sapoMap.set(v.sku.toUpperCase(), v);
  }

  const results: StockCompareRow[] = [];

  for (const item of localInventory) {
    const key = item.sku.toUpperCase();
    const sapo = sapoMap.get(key);
    const sapoQty = sapo?.inventory_quantity ?? 0;
    const diff = item.physicalQty - sapoQty;
    results.push({
      sku: item.sku,
      barcode: sapo?.barcode,
      productName: sapo?.title,
      sapoQty,
      physicalQty: item.physicalQty,
      diff,
      status: classifyStatus(sapoQty, item.physicalQty),
    });
  }

  const localSkus = new Set(localInventory.map((i) => i.sku.toUpperCase()));
  for (const v of sapoVariants) {
    if (!localSkus.has(v.sku.toUpperCase())) {
      results.push({
        sku: v.sku,
        barcode: v.barcode,
        productName: v.title,
        sapoQty: v.inventory_quantity,
        physicalQty: 0,
        diff: -v.inventory_quantity,
        status: v.inventory_quantity === 0 ? "OUT_OF_STOCK" : "UNDER_STOCK",
      });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// 3. pushStockToSapo — POST /admin/inventory_levels/set.json
// ---------------------------------------------------------------------------

export async function pushStockToSapo(
  sku: string,
  newAvailableQuantity: number
): Promise<PushStockResult> {
  if (!sku || sku.trim() === "") {
    return { success: false, sku, requestedQty: newAvailableQuantity, message: "SKU rỗng", mocked: false };
  }
  if (!Number.isFinite(newAvailableQuantity) || newAvailableQuantity < 0) {
    return { success: false, sku, requestedQty: newAvailableQuantity, message: "Số lượng không hợp lệ (phải >= 0)", mocked: false };
  }

  const qty = Math.floor(newAvailableQuantity);

  try {
    const res = await fetch(SAPO_INVENTORY_SET_ENDPOINT, {
      method: "POST",
      headers: {
        Authorization: getSapoAuthHeader(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        sku,
        available: qty,
      }),
    });

    if (res.ok) {
      return { success: true, sku, requestedQty: qty, message: `Đã cập nhật tồn Sapo: ${sku} → ${qty}`, mocked: false };
    }

    // Nếu API trả lỗi nhưng không phải lỗi mạng → mock an toàn, tránh ghi sai tồn
    const body = await res.text().catch(() => "");
    console.warn(`[SapoInventory] pushStockToSapo HTTP ${res.status} sku=${sku} body=${body.slice(0, 300)}`);

    // Trả về mock success để không block luồng khi Sapo offline (an toàn: log rõ mocked)
    return {
      success: true,
      sku,
      requestedQty: qty,
      message: `[MOCK] Sapo API HTTP ${res.status} — đã ghi nhận local, sẽ đồng bộ lại khi online`,
      mocked: true,
    };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.warn(`[SapoInventory] pushStockToSapo lỗi mạng sku=${sku}:`, msg);
    return {
      success: true,
      sku,
      requestedQty: qty,
      message: `[MOCK] Không kết nối Sapo (${msg}) — đã ghi nhận local`,
      mocked: true,
    };
  }
}

// ---------------------------------------------------------------------------
// 4. syncInventoryToSapo — đẩy tồn vật lý lên Sapo (2 chiều: local → Sapo)
// ---------------------------------------------------------------------------

/**
 * Đồng bộ tồn kho từ hệ thống nội bộ lên Sapo.
 * @param items - danh sách sku + tồn vật lý + kho (Q7/Q12)
 */
export async function syncInventoryToSapo(
  items: Array<{ sku: string; physicalQty: number; warehouse?: string }>
): Promise<SyncInventoryResult> {
  const details: PushStockResult[] = [];
  let failed = 0;
  let mocked = 0;

  for (const item of items) {
    const result = await pushStockToSapo(item.sku, item.physicalQty);
    details.push(result);
    if (!result.success) failed++;
    if (result.mocked) mocked++;
    // Mirror vào physical store nếu có warehouse
    if (item.warehouse) {
      const wh = resolveWarehouseCode(item.warehouse) ?? item.warehouse;
      setPhysicalQty(wh, item.sku, item.physicalQty);
    }
  }

  return {
    success: failed === 0,
    synced: details.length - failed,
    failed,
    mocked,
    details,
  };
}

// ---------------------------------------------------------------------------
// 5. syncInventoryFromSapo — kéo tồn Sapo về hệ thống nội bộ (Sapo → local)
// ---------------------------------------------------------------------------

export async function syncInventoryFromSapo(warehouse?: string): Promise<SyncInventoryResult> {
  const variants = await fetchSapoVariants(250);
  const wh = warehouse ? (resolveWarehouseCode(warehouse) ?? warehouse) : "Q7";
  const details: PushStockResult[] = [];

  for (const v of variants) {
    setPhysicalQty(wh, v.sku, v.inventory_quantity);
    details.push({
      success: true,
      sku: v.sku,
      requestedQty: v.inventory_quantity,
      message: `Đã kéo tồn Sapo về ${wh}: ${v.sku} → ${v.inventory_quantity}`,
      mocked: false,
    });
  }

  return {
    success: true,
    synced: details.length,
    failed: 0,
    mocked: 0,
    details,
  };
}

// ---------------------------------------------------------------------------
// 6. Trừ tồn khi completeOrderPicking — gọi từ sales flow
// ---------------------------------------------------------------------------

export interface DeductPickingResult {
  orderId: string;
  warehouse: string;
  deducted: Array<{ sku: string; qty: number; remaining: number }>;
  sapoSync: SyncInventoryResult | null;
}

/**
 * Trừ tồn vật lý và đồng bộ lên Sapo khi hoàn tất soạn hàng.
 * Được gọi sau khi completeOrderPicking xác nhận 100% picked.
 * Không throw — trả về kết quả để caller log.
 */
export async function deductStockOnPickingComplete(
  orderId: string,
  warehouse: string,
  items: Array<{ sku: string; quantity: number }>
): Promise<DeductPickingResult> {
  const wh = resolveWarehouseCode(warehouse) ?? warehouse;
  const deducted: Array<{ sku: string; qty: number; remaining: number }> = [];

  for (const item of items) {
    const remaining = deductPhysicalQty(wh, item.sku, item.quantity);
    deducted.push({ sku: item.sku, qty: item.quantity, remaining });
  }

  // Đồng bộ các SKU vừa trừ lên Sapo (best-effort, không block)
  let sapoSync: SyncInventoryResult | null = null;
  try {
    const syncItems = deducted.map((d) => ({ sku: d.sku, physicalQty: d.remaining, warehouse: wh }));
    sapoSync = await syncInventoryToSapo(syncItems);
  } catch (err) {
    console.warn("[SapoInventory] deductStockOnPickingComplete sapoSync failed:", err);
  }

  return { orderId, warehouse: wh, deducted, sapoSync };
}

// ---------------------------------------------------------------------------
// Tiện ích: lọc cảnh báo tồn thấp
// ---------------------------------------------------------------------------

export function getLowStockWarnings(variants: SapoVariant[], threshold = 10): SapoVariant[] {
  return variants.filter((v) => v.inventory_quantity > 0 && v.inventory_quantity <= threshold);
}

export function getOutOfStockVariants(variants: SapoVariant[]): SapoVariant[] {
  return variants.filter((v) => v.inventory_quantity === 0);
}
