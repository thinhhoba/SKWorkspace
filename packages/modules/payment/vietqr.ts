export interface VietQrConfig {
  bankId: string;
  accountNo: string;
  accountName: string;
}

export const SK_VIETQR_CONFIG: VietQrConfig = {
  bankId: "970407", // Techcombank (TCB)
  accountNo: "22226060",
  accountName: "CONG TY TNHH THUC PHAM SON KHANG",
};

export function buildVietQrUrl(opts: {
  amount: number;
  addInfo: string;
  bankId?: string;
  accountNo?: string;
  accountName?: string;
  template?: "compact" | "compact2" | "qr_only";
}): string {
  if (opts.amount <= 0) {
    throw new Error("amount must be > 0");
  }
  const bankId = opts.bankId ?? SK_VIETQR_CONFIG.bankId;
  const accountNo = opts.accountNo ?? SK_VIETQR_CONFIG.accountNo;
  const accountName = opts.accountName ?? SK_VIETQR_CONFIG.accountName;
  const template = opts.template ?? "compact2";
  const base = `https://img.vietqr.io/image/${bankId}-${accountNo}-${template}.png`;
  const params = `amount=${opts.amount}&addInfo=${encodeURIComponent(opts.addInfo)}&accountName=${encodeURIComponent(accountName)}`;
  return `${base}?${params}`;
}

export function buildOrderVietQr(
  orderCode: string,
  amount: number,
  cfg?: VietQrConfig,
): string {
  return buildVietQrUrl({
    amount,
    addInfo: orderCode,
    bankId: cfg?.bankId,
    accountNo: cfg?.accountNo,
    accountName: cfg?.accountName,
  });
}
