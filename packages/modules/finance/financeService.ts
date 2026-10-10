import type { FinanceTransaction, FinanceStats, TxnType, TxnCategory, AccountCode } from "./types";
import { MOCK_FINANCE_TRANSACTIONS } from "./mockData";

let financeStore: FinanceTransaction[] = MOCK_FINANCE_TRANSACTIONS.map((t) => ({ ...t }));
let ptSeq = 115;
let pcSeq = 115;

// Idempotency: transactionId đã xử lý (VietQR webhook)
const processedVietQrIds = new Set<string>();
const txIdToTxnMap = new Map<string, FinanceTransaction>();

export function isVietQrTxProcessed(transactionId: string): boolean {
  if (!transactionId) return false;
  return processedVietQrIds.has(transactionId);
}

export function getTxnByVietQrId(transactionId: string): FinanceTransaction | undefined {
  return txIdToTxnMap.get(transactionId);
}

export function getFinanceTransactions(filters?: { type?: string; category?: string; search?: string }): FinanceTransaction[] {
  let list = [...financeStore];
  if (filters?.type && filters.type !== "ALL") list = list.filter((t) => t.type === filters.type);
  if (filters?.category && filters.category !== "ALL") list = list.filter((t) => t.category === filters.category);
  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter((t) => t.code.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
  }
  return list;
}

export function getFinanceStats(): FinanceStats {
  const OPENING_TECHCOMBANK = 125000000;
  const OPENING_CASH = 28000000;
  let thu = 0;
  let chi = 0;
  let thuTech = 0;
  let chiTech = 0;
  let thuCash = 0;
  let chiCash = 0;
  for (const t of financeStore) {
    if (t.type === "THU") {
      thu += t.amount;
      if (t.account === "TECHCOMBANK_22226060") thuTech += t.amount;
      else thuCash += t.amount;
    } else {
      chi += t.amount;
      if (t.account === "TECHCOMBANK_22226060") chiTech += t.amount;
      else chiCash += t.amount;
    }
  }
  return {
    balance_techcombank: OPENING_TECHCOMBANK + thuTech - chiTech,
    balance_cash: OPENING_CASH + thuCash - chiCash,
    total_thu_month: thu,
    total_chi_month: chi,
    net_cashflow: thu - chi,
  };
}

export function createFinanceTransaction(input: {
  type: TxnType;
  category: TxnCategory;
  amount: number;
  account: AccountCode;
  description: string;
  performer?: string;
}): FinanceTransaction {
  if (!["THU", "CHI"].includes(input.type)) throw new Error("Loại phiếu không hợp lệ (THU/CHI)");
  if (!input.amount || input.amount <= 0) throw new Error("Số tiền phải > 0");
  if (!input.account || !["CASH", "TECHCOMBANK_22226060"].includes(input.account)) throw new Error("Tài khoản không hợp lệ");
  if (!input.description?.trim()) throw new Error("Thiếu diễn giải");
  const prefix = input.type === "THU" ? "SK-PT-" : "SK-PC-";
  const seq = input.type === "THU" ? ++ptSeq : ++pcSeq;
  const code = `${prefix}${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${String(seq).slice(-2)}`;
  const txn: FinanceTransaction = {
    id: `txn-${seq}`,
    code,
    type: input.type,
    category: input.category,
    amount: input.amount,
    account: input.account,
    description: input.description.trim(),
    performer: input.performer?.trim() || "Hoàng Thị Nho",
    created_at: new Date().toLocaleString("vi-VN"),
  };
  financeStore.unshift(txn);
  return txn;
}

export function autoReconcileVietQr(
  orderCode: string,
  amount: number,
  senderText: string,
  transactionId?: string
): FinanceTransaction {
  // Idempotency: nếu transactionId đã xử lý thì trả về txn cũ
  if (transactionId && processedVietQrIds.has(transactionId)) {
    const existing = txIdToTxnMap.get(transactionId);
    if (existing) return existing;
  }
  const code = orderCode.replace(/^#/, "");
  const txn = createFinanceTransaction({
    type: "THU",
    category: "BAN_HANG",
    amount,
    account: "TECHCOMBANK_22226060",
    description: `Khớp tự động VietQR Techcombank: Đơn #${code} - ${senderText}`,
    performer: "Hệ thống VietQR Auto-Reconcile",
  });
  if (transactionId) {
    processedVietQrIds.add(transactionId);
    txIdToTxnMap.set(transactionId, txn);
  }
  return txn;
}

export function __resetFinanceStore(): void {
  financeStore = MOCK_FINANCE_TRANSACTIONS.map((t) => ({ ...t }));
  ptSeq = 115;
  pcSeq = 115;
  processedVietQrIds.clear();
  txIdToTxnMap.clear();
}
