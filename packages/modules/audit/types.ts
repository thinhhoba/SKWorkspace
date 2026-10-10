export type AuditActor = "admin" | "ketoan" | "thukho" | "taixe" | "SYSTEM";
export type AuditModule = "PRICING" | "SALES" | "INVENTORY" | "DELIVERY" | "FINANCE_MISA";
export type AuditAction =
  | "SYNC_SAPO"
  | "POST_AMIS"
  | "PUBLISH_INVOICE"
  | "UPDATE_PRICE"
  | "DISPATCH_TRIP"
  | "LOGIN"
  | "SYNC_MISA"
  | "EXPORT_QR";
export type AuditLevel = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export const AUDIT_ACTOR_LABEL: Record<AuditActor, string> = {
  admin: "Quản trị",
  ketoan: "Kế toán",
  thukho: "Thủ kho",
  taixe: "Tài xế",
  SYSTEM: "Hệ thống",
};

export const AUDIT_MODULE_LABEL: Record<AuditModule, string> = {
  PRICING: "Bảng giá",
  SALES: "Bán hàng/Sapo",
  INVENTORY: "Kho lạnh",
  DELIVERY: "Giao vận",
  FINANCE_MISA: "Tài chính MISA",
};

export const AUDIT_ACTION_LABEL: Record<AuditAction, string> = {
  SYNC_SAPO: "Đồng bộ Sapo",
  POST_AMIS: "Hạch toán AMIS",
  PUBLISH_INVOICE: "Phát hành HĐĐT",
  UPDATE_PRICE: "Đổi giá bán",
  DISPATCH_TRIP: "Điều xe chành",
  LOGIN: "Đăng nhập",
  SYNC_MISA: "Đồng bộ MISA",
  EXPORT_QR: "Xuất VietQR",
};

export const AUDIT_LEVEL_LABEL: Record<AuditLevel, string> = {
  INFO: "Thông tin",
  SUCCESS: "Thành công",
  WARNING: "Cảnh báo",
  ERROR: "Lỗi",
};

export const AUDIT_LEVEL_COLOR: Record<AuditLevel, string> = {
  INFO: "bg-sky-50 text-sky-700 border-sky-200",
  SUCCESS: "bg-emerald-50 text-emerald-700 border-emerald-200",
  WARNING: "bg-amber-50 text-amber-700 border-amber-200",
  ERROR: "bg-rose-50 text-rose-700 border-rose-200",
};

export interface AuditLog {
  id: string;
  timestamp: string; // ISO
  actor: AuditActor;
  actor_name: string;
  module: AuditModule;
  action: AuditAction;
  level: AuditLevel;
  message: string;
  ip: string;
  client: string;
  payload: Record<string, unknown> | null;
}

export interface AuditStats {
  total_today: number;
  sync_success: number;
  warning_count: number;
  error_count: number;
}
