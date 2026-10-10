// Ledger DB: Map in-memory + file fallback + Prisma ready
import fs from "node:fs";
import path from "node:path";
import { LedgerEntry } from "./types";
import { prisma, checkDatabaseConnection } from "@/packages/core/db";

const DATA_DIR = path.resolve(process.cwd(), ".data");
const LEDGER_FILE = path.join(DATA_DIR, "sapo2misa_ledger.json");

const INITIAL_LEDGER: LedgerEntry[] = [
  {
    external_id: "SP-0841",
    order_code: "SP-0841",
    customer_name: "An Thịnh Mart (Q7)",
    total_amount: 3542400,
    exported_at: "2026-10-07T14:20:00Z",
    file_name: "MISA_20261007_SP0841.xlsx",
    exported_by: "Kế toán Kho Q7",
  },
];

// In-memory Map — nguồn chính khi chạy runtime, đồng bộ 2 chiều với file
const memoryMap = new Map<string, LedgerEntry>();
let mapInitialized = false;

function ensureFile(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    if (!fs.existsSync(LEDGER_FILE)) {
      fs.writeFileSync(LEDGER_FILE, JSON.stringify(INITIAL_LEDGER, null, 2), "utf-8");
    }
  } catch (err) {
    console.warn("[LEDGER DB] Không thể khởi tạo file ledger:", err);
  }
}

function initMapFromSources(): void {
  if (mapInitialized) return;
  mapInitialized = true;
  // Ưu tiên file, fallback INITIAL
  try {
    ensureFile();
    if (fs.existsSync(LEDGER_FILE)) {
      const content = fs.readFileSync(LEDGER_FILE, "utf-8");
      const arr: LedgerEntry[] = JSON.parse(content);
      for (const e of arr) memoryMap.set(e.external_id, e);
      if (arr.length > 0) return;
    }
  } catch (err) {
    console.error("[LEDGER DB] Lỗi đọc file ledger:", err);
  }
  for (const e of INITIAL_LEDGER) memoryMap.set(e.external_id, e);
}

function flushMapToFile(): void {
  try {
    ensureFile();
    const arr = Array.from(memoryMap.values());
    fs.writeFileSync(LEDGER_FILE, JSON.stringify(arr, null, 2), "utf-8");
  } catch (err) {
    console.error("[LEDGER DB] Lỗi ghi file ledger:", err);
  }
}

// ── Sync API (đọc từ Map, fallback file) ──
export function getExportedLedger(): LedgerEntry[] {
  initMapFromSources();
  // Đồng bộ file nếu Map rỗng nhưng file có dữ liệu (trường hợp file được cập nhật ngoài)
  try {
    if (fs.existsSync(LEDGER_FILE)) {
      const content = fs.readFileSync(LEDGER_FILE, "utf-8");
      const arr: LedgerEntry[] = JSON.parse(content);
      for (const e of arr) if (!memoryMap.has(e.external_id)) memoryMap.set(e.external_id, e);
    }
  } catch {}
  return Array.from(memoryMap.values());
}

export function isOrderExported(externalId: string): boolean {
  initMapFromSources();
  if (memoryMap.has(externalId)) return true;
  // Check file as fallback
  try {
    if (fs.existsSync(LEDGER_FILE)) {
      const content = fs.readFileSync(LEDGER_FILE, "utf-8");
      const arr: LedgerEntry[] = JSON.parse(content);
      return arr.some((e) => e.external_id === externalId);
    }
  } catch {}
  return false;
}

export function recordExportedOrders(entries: LedgerEntry[]): void {
  initMapFromSources();
  for (const e of entries) memoryMap.set(e.external_id, e);
  flushMapToFile();
}

export function __resetLedger(): void {
  memoryMap.clear();
  mapInitialized = false;
  try {
    if (fs.existsSync(LEDGER_FILE)) fs.unlinkSync(LEDGER_FILE);
  } catch {}
}

// ── Async Prisma-backed API với fallback Map ──
export async function getLedger(): Promise<LedgerEntry[]> {
  try {
    const s = await checkDatabaseConnection();
    if (s === "connected") {
      return await (
        prisma as unknown as { misaLedgerEntry: { findMany: () => Promise<LedgerEntry[]> } }
      ).misaLedgerEntry.findMany();
    }
  } catch {}
  return getExportedLedger();
}

export async function addLedgerEntry(e: LedgerEntry): Promise<LedgerEntry> {
  try {
    const s = await checkDatabaseConnection();
    if (s === "connected") {
      return await (
        prisma as unknown as { misaLedgerEntry: { create: (arg: { data: LedgerEntry }) => Promise<LedgerEntry> } }
      ).misaLedgerEntry.create({ data: e });
    }
  } catch {}
  recordExportedOrders([e]);
  return e;
}
