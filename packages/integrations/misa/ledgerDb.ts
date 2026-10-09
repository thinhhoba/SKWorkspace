// Fallback mock: sẽ thay bằng Prisma khi DATABASE_URL khả dụng — xem packages/core/db.ts
import fs from "node:fs";
import path from "node:path";
import { LedgerEntry } from "./types";
import { prisma, checkDatabaseConnection } from "@/packages/core/db";

// Memory fallback khi DB/file chưa khả dụng
let memoryLedger: LedgerEntry[] = [];

const DATA_DIR = path.resolve(process.cwd(), ".data");
const LEDGER_FILE = path.join(DATA_DIR, "sapo2misa_ledger.json");

// Dữ liệu mẫu ban đầu để kiểm tra tính năng phát hiện trùng lặp
const INITIAL_LEDGER: LedgerEntry[] = [
  {
    external_id: "SP-0841",
    order_code: "SP-0841",
    customer_name: "An Thịnh Mart (Q7)",
    total_amount: 3542400,
    exported_at: "2026-10-07T14:20:00Z",
    file_name: "MISA_20261007_SP0841.xlsx",
    exported_by: "Kế toán Kho Q7"
  }
];

function ensureFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (!fs.existsSync(LEDGER_FILE)) {
      fs.writeFileSync(LEDGER_FILE, JSON.stringify(INITIAL_LEDGER, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("[LEDGER DB] Không thể khởi tạo file ledger:", err);
  }
}

export function getExportedLedger(): LedgerEntry[] {
  ensureFile();
  try {
    if (fs.existsSync(LEDGER_FILE)) {
      const content = fs.readFileSync(LEDGER_FILE, "utf-8");
      return JSON.parse(content);
    }
  } catch (err) {
    console.error("[LEDGER DB] Lỗi đọc file ledger:", err);
  }
  return INITIAL_LEDGER;
}

export function isOrderExported(externalId: string): boolean {
  const ledger = getExportedLedger();
  return ledger.some((entry) => entry.external_id === externalId);
}

export function recordExportedOrders(entries: LedgerEntry[]): void {
  ensureFile();
  const current = getExportedLedger();
  const currentMap = new Map<string, LedgerEntry>();
  for (const item of current) {
    currentMap.set(item.external_id, item);
  }
  for (const item of entries) {
    currentMap.set(item.external_id, item);
  }

  const updated = Array.from(currentMap.values());
  try {
    fs.writeFileSync(LEDGER_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err) {
    console.error("[LEDGER DB] Lỗi ghi file ledger:", err);
  }
  // đồng bộ memory fallback
  for (const e of entries) {
    const idx = memoryLedger.findIndex((m) => m.external_id === e.external_id);
    if (idx >= 0) memoryLedger[idx] = e;
    else memoryLedger.push(e);
  }
}

// --- Prisma-backed API với fallback memory (khi DATABASE_URL chưa khả dụng) ---
export async function getLedger(): Promise<LedgerEntry[]> {
  try {
    const s = await checkDatabaseConnection();
    if (s === "connected") {
      return await (prisma as unknown as { misaLedgerEntry: { findMany: () => Promise<LedgerEntry[]> } }).misaLedgerEntry.findMany();
    }
  } catch {}
  // fallback: ưu tiên file, rồi memory
  try {
    const fileData = getExportedLedger();
    if (fileData.length > 0) return fileData;
  } catch {}
  return memoryLedger.length > 0 ? [...memoryLedger] : [...INITIAL_LEDGER];
}

export async function addLedgerEntry(e: LedgerEntry): Promise<LedgerEntry> {
  try {
    const s = await checkDatabaseConnection();
    if (s === "connected") {
      return await (prisma as unknown as { misaLedgerEntry: { create: (arg: { data: LedgerEntry }) => Promise<LedgerEntry> } }).misaLedgerEntry.create({ data: e });
    }
  } catch {}
  memoryLedger.push(e);
  try {
    recordExportedOrders([e]);
  } catch {}
  return e;
}
