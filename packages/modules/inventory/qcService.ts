import type { StorageTempZone } from "./types";

export type { StorageTempZone };
export type QcConclusion = "dat_chuan" | "tu_choi" | "nhap_co_dieu_kien";

export interface QcRecord {
  id: string;
  code: string;
  supplier: string;
  sku: string;
  productName: string;
  zone: StorageTempZone;
  packagingOk: boolean;
  labelViOk: boolean;
  productionDate: string;
  expiryDate: string;
  shelfLifePct: number;
  shelfLifePass: boolean;
  tempC: number | null;
  tempPass: boolean | null;
  tempWarning: string | null;
  photos: string[];
  conclusion: QcConclusion;
  signedBy: string;
  note?: string;
  createdAt: string;
}

let qcStore: QcRecord[] = [];

/**
 * Tính % shelf life còn lại và kiểm tra pass (>= 70%)
 */
export function evaluateShelfLife(prodDate: string, expDate: string): { pct: number; pass: boolean } {
  const prod = new Date(prodDate);
  const exp = new Date(expDate);
  const now = new Date();

  const totalLife = exp.getTime() - prod.getTime();
  const remainingLife = exp.getTime() - now.getTime();

  if (totalLife <= 0) return { pct: 0, pass: false };

  const pct = Math.round((remainingLife / totalLife) * 100);
  const pass = pct >= 70;

  return { pct: Math.max(0, Math.min(100, pct)), pass };
}

/**
 * Đánh giá nhiệt độ theo HACCP
 * - Đông lạnh: pass nếu ≤-15°C, warning đỏ nếu >-12°C
 * - Kho mát/kho khô: pass luôn
 */
export function evaluateTemp(
  tempC: number | null,
  zone: StorageTempZone
): { pass: boolean; warning: string | null } {
  if (tempC === null) {
    return { pass: true, warning: null };
  }

  if (zone === "dong_lanh") {
    if (tempC <= -15) {
      return { pass: true, warning: null };
    }
    if (tempC > -12) {
      return { pass: false, warning: "KHÔNG ĐẠT HACCP — nhiệt độ thùng bảo ôn vượt ngưỡng!" };
    }
    // -15 < tempC <= -12: pass nhưng có warning
    return { pass: true, warning: "Cảnh báo: nhiệt độ cao hơn mức tối ưu (-15°C)" };
  }

  // kho_mat hoặc kho_kho: không kiểm tra nghiêm ngặt
  return { pass: true, warning: null };
}

/**
 * Tạo mã biên bản KCS: KCS-YYMMDD-XXXX
 */
export function genQcCode(): string {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const seq = String(qcStore.length + 1).padStart(4, "0");
  return `KCS-${yy}${mm}${dd}-${seq}`;
}

/**
 * Tạo record KCS mới
 */
export function createQcRecord(input: {
  supplier: string;
  sku: string;
  productName: string;
  zone: StorageTempZone;
  packagingOk: boolean;
  labelViOk: boolean;
  productionDate: string;
  expiryDate: string;
  tempC: number | null;
  photos: string[];
  conclusion: QcConclusion;
  signedBy: string;
  note?: string;
}): QcRecord {
  const { pct, pass: shelfLifePass } = evaluateShelfLife(input.productionDate, input.expiryDate);
  const { pass: tempPass, warning: tempWarning } = evaluateTemp(input.tempC, input.zone);

  const record: QcRecord = {
    id: `QC-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    code: genQcCode(),
    supplier: input.supplier,
    sku: input.sku,
    productName: input.productName,
    zone: input.zone,
    packagingOk: input.packagingOk,
    labelViOk: input.labelViOk,
    productionDate: input.productionDate,
    expiryDate: input.expiryDate,
    shelfLifePct: pct,
    shelfLifePass,
    tempC: input.tempC,
    tempPass,
    tempWarning,
    photos: input.photos,
    conclusion: input.conclusion,
    signedBy: input.signedBy,
    note: input.note,
    createdAt: new Date().toISOString(),
  };

  qcStore.unshift(record);
  return record;
}

export function getQcRecords(): QcRecord[] {
  return [...qcStore];
}

export function getQcById(id: string): QcRecord | undefined {
  return qcStore.find((r) => r.id === id);
}

export function __resetQcStore(): void {
  qcStore = [];
  seedMockQcData();
}

/**
 * Seed 2 mock records
 */
function seedMockQcData(): void {
  // Record 1: Đạt chuẩn
  createQcRecord({
    supplier: "CP Việt Nam",
    sku: "HH053",
    productName: "Gà Viên Chiên Popcorn CP Túi 1kg",
    zone: "dong_lanh",
    packagingOk: true,
    labelViOk: true,
    productionDate: "2026-01-15",
    expiryDate: "2027-01-15",
    tempC: -18,
    photos: [],
    conclusion: "dat_chuan",
    signedBy: "Trần Thị Ngọc Thúy",
    note: "Hàng đạt chuẩn HACCP, nhiệt độ ổn định",
  });

  // Record 2: Nhập có điều kiện (shelf life thấp)
  createQcRecord({
    supplier: "Muwono Food",
    sku: "HH201",
    productName: "Bò viên Muwono 500g (80 viên)",
    zone: "dong_lanh",
    packagingOk: true,
    labelViOk: true,
    productionDate: "2025-10-01",
    expiryDate: "2026-04-15",
    tempC: -16,
    photos: [],
    conclusion: "nhap_co_dieu_kien",
    signedBy: "Trần Thị Ngọc Thúy",
    note: "Hạn sử dụng còn 65%, ưu tiên xuất trước theo FEFO",
  });
}

// Khởi tạo mock data
seedMockQcData();
