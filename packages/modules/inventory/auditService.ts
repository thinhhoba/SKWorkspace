import { getInventoryList } from "./inventoryService";

// ────────────────────────────────────────────────────────────────────────────────
// TYPES
// ────────────────────────────────────────────────────────────────────────────────

export type StocktakeZone = "kho_kho" | "kho_dong" | "all";
export type StocktakeStatus = "draft" | "confirmed";
export type VarianceReason = "hao_hut_tu_nhien" | "rach_bao_bi" | "het_han" | "that_thoat" | "khac";

export const REASON_LABELS: Record<VarianceReason, string> = {
  hao_hut_tu_nhien: "Hao hụt tự nhiên",
  rach_bao_bi: "Rách bao bì",
  het_han: "Hết hạn sử dụng",
  that_thoat: "Thất thoát/Mất mát",
  khac: "Lý do khác",
};

export interface StocktakeLine {
  id: string;
  sku: string;
  productName: string;
  zone: "kho_kho" | "kho_dong";
  theoreticalQty: number;
  countedQty: number;
  varianceQty: number;
  varianceValue: number;
  unitPrice: number;
  reason: VarianceReason | null;
  note?: string;
}

export interface StocktakeSession {
  id: string;
  code: string;
  zone: StocktakeZone;
  status: StocktakeStatus;
  lines: StocktakeLine[];
  createdAt: string;
  confirmedAt?: string;
  createdBy: string;
}

// ────────────────────────────────────────────────────────────────────────────────
// STORE
// ────────────────────────────────────────────────────────────────────────────────

let sessionStore: StocktakeSession[] = [];

// ────────────────────────────────────────────────────────────────────────────────
// FUNCTIONS
// ────────────────────────────────────────────────────────────────────────────────

export function genId(): string {
  return `STK-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function createSession(zone: StocktakeZone, createdBy: string = "Trần Thị Ngọc Thúy"): StocktakeSession {
  const now = new Date();
  const code = `SK-KK-${String(now.getFullYear()).slice(-2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${String(sessionStore.length + 1).padStart(4, "0")}`;
  const dateStr = now.toISOString();

  const session: StocktakeSession = {
    id: genId(),
    code,
    zone,
    status: "draft",
    lines: [],
    createdAt: dateStr,
    createdBy,
  };

  sessionStore.unshift(session);
  return session;
}

export function addLine(
  sessionId: string,
  sku: string,
  countedQty: number,
  reason: VarianceReason | null = null,
  note?: string
): StocktakeLine {
  const session = sessionStore.find((s) => s.id === sessionId);
  if (!session) throw new Error("Phiên kiểm kê không tồn tại");
  if (session.status === "confirmed") throw new Error("Không thể sửa phiên đã xác nhận");

  // Get inventory item from Kho Định Công
  const allItems = getInventoryList({ warehouse: "KHO_DINH_CONG" });
  const item = allItems.find((i) => i.sku === sku);
  if (!item) throw new Error(`Không tìm thấy SKU ${sku} tại Kho Định Công`);

  // Determine zone: kho_dong includes both dong_lanh (-18°C) and kho_mat (0-4°C)
  const lineZone: "kho_kho" | "kho_dong" =
    item.temp_zone === "dong_lanh" || item.temp_zone === "kho_mat" ? "kho_dong" : "kho_kho";

  // Check if zone matches session filter
  if (session.zone !== "all" && session.zone !== lineZone) {
    const zoneLabel = lineZone === "kho_dong" ? "Kho đông/mát" : "Kho khô";
    throw new Error(`SKU ${sku} thuộc ${zoneLabel}, không khớp với phiên kiểm kê ${session.zone}`);
  }

  // Check if SKU already exists in this session
  const existingLine = session.lines.find((l) => l.sku === sku);
  if (existingLine) {
    // Update existing line
    existingLine.countedQty = countedQty;
    existingLine.reason = reason;
    existingLine.note = note;
    const variance = calculateVariance(existingLine);
    existingLine.varianceQty = variance.varianceQty;
    existingLine.varianceValue = variance.varianceValue;
    return existingLine;
  }

  // Create new line
  const line: StocktakeLine = {
    id: genId(),
    sku,
    productName: item.name,
    zone: lineZone,
    theoreticalQty: item.quantity,
    countedQty,
    varianceQty: countedQty - item.quantity,
    varianceValue: (countedQty - item.quantity) * item.unit_price,
    unitPrice: item.unit_price,
    reason,
    note,
  };

  session.lines.push(line);
  return line;
}

export function calculateVariance(line: StocktakeLine): { varianceQty: number; varianceValue: number } {
  const varianceQty = line.countedQty - line.theoreticalQty;
  const varianceValue = varianceQty * line.unitPrice;
  return { varianceQty, varianceValue };
}

export function confirmAndAdjust(sessionId: string): StocktakeSession {
  const session = sessionStore.find((s) => s.id === sessionId);
  if (!session) throw new Error("Phiên kiểm kê không tồn tại");
  if (session.status === "confirmed") throw new Error("Phiên đã được xác nhận");
  if (session.lines.length === 0) throw new Error("Chưa có dòng kiểm kê nào");

  // Update inventory quantities (getInventoryList returns shallow copy, objects are references)
  const allItems = getInventoryList({ warehouse: "KHO_DINH_CONG" });

  session.lines.forEach((line) => {
    const item = allItems.find((i) => i.sku === line.sku);
    if (item) {
      item.quantity = line.countedQty;
      item.total_value = item.quantity * item.unit_price;

      // Recalculate status
      const isNearExpiry = item.days_until_expiry < 30;
      if (isNearExpiry) {
        item.status = "can-han";
        item.status_label = "Cận hạn (<30n)";
      } else if (item.quantity <= item.min_stock * 0.3) {
        item.status = "thieu";
        item.status_label = "Thiếu hàng";
      } else if (item.quantity <= item.min_stock) {
        item.status = "sap-thieu";
        item.status_label = "Sắp thiếu";
      } else {
        item.status = "du";
        item.status_label = "Đủ tồn";
      }
    }
  });

  // Mark session as confirmed
  session.status = "confirmed";
  session.confirmedAt = new Date().toISOString();

  return session;
}

export function getSessions(): StocktakeSession[] {
  return [...sessionStore].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getSessionById(id: string): StocktakeSession | null {
  return sessionStore.find((s) => s.id === id) || null;
}

export function __resetAuditStore(): void {
  sessionStore = [];
  // Re-seed mock
  seedMockSession();
}

// ────────────────────────────────────────────────────────────────────────────────
// MOCK SEED
// ────────────────────────────────────────────────────────────────────────────────

function seedMockSession(): void {
  const mockSession: StocktakeSession = {
    id: "STK-MOCK-001",
    code: "SK-KK-261015-0001",
    zone: "kho_dong",
    status: "confirmed",
    lines: [
      {
        id: "LINE-MOCK-001",
        sku: "LC-VIEN-CHIEN-500",
        productName: "Viên chiên LC Foods 500g (45 viên)",
        zone: "kho_dong",
        theoreticalQty: 185,
        countedQty: 180,
        varianceQty: -5,
        varianceValue: -235000,
        unitPrice: 47000,
        reason: "hao_hut_tu_nhien",
        note: "Hao hụt tự nhiên trong quá trình bảo quản hầm đông",
      },
      {
        id: "LINE-MOCK-002",
        sku: "CP-GA-POP-1KG",
        productName: "Gà viên chiên Popcorn CP 1kg",
        zone: "kho_dong",
        theoreticalQty: 45,
        countedQty: 45,
        varianceQty: 0,
        varianceValue: 0,
        unitPrice: 117000,
        reason: null,
      },
    ],
    createdAt: "2026-10-15T08:30:00.000Z",
    confirmedAt: "2026-10-15T09:15:00.000Z",
    createdBy: "Trần Thị Ngọc Thúy",
  };

  sessionStore.push(mockSession);
}

// Initialize mock data
seedMockSession();
