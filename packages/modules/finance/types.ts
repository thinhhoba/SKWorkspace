export type AccountCode = "CASH" | "TECHCOMBANK_22226060";
export type TxnType = "THU" | "CHI";
export type TxnCategory =
  | "thu_tien_hang_quan_an"
  | "thu_dai_ly_chanh_xe"
  | "thu_ho_cod"
  | "chi_tien_hang_ncc"
  | "chi_cuoc_chanh_xe"
  | "chi_van_hanh_kho";

export const ACCOUNT_LABEL: Record<AccountCode, string> = {
  CASH: "Quỹ tiền mặt Định Công",
  TECHCOMBANK_22226060: "Techcombank 22226060",
};

export const ACCOUNT_SHORT: Record<AccountCode, string> = {
  CASH: "Cash",
  TECHCOMBANK_22226060: "Techcombank",
};

export const TXN_CATEGORY_LABEL: Record<TxnCategory, string> = {
  thu_tien_hang_quan_an: "Thu tiền hàng quán ăn",
  thu_dai_ly_chanh_xe: "Thu đại lý chuyển khoản chành xe",
  thu_ho_cod: "Thu hộ COD (Ngô Văn Tân)",
  chi_tien_hang_ncc: "Chi tiền hàng NCC",
  chi_cuoc_chanh_xe: "Cước gửi xe bến",
  chi_van_hanh_kho: "Chi phí vận hành kho",
};

export const TXN_TYPE_LABEL: Record<TxnType, string> = {
  THU: "Phiếu thu",
  CHI: "Phiếu chi",
};

export interface FinanceTransaction {
  id: string;
  code: string;
  type: TxnType;
  category: TxnCategory;
  amount: number;
  account: AccountCode;
  description: string;
  performer: string;
  created_at: string;
}

export interface FinanceStats {
  balance_techcombank: number;
  balance_cash: number;
  total_thu_month: number;
  total_chi_month: number;
  net_cashflow: number;
}

export const PERFORMER_NAME = "Hoàng Thị Nho";
export const BANK_ACCOUNT = "Techcombank 22226060 — CONG TY TNHH THUC PHAM SON KHANG";
export const CASH_WAREHOUSE = "Quỹ kho Tổng Định Công (Hoàng Mai, Hà Nội)";
