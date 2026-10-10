// Module settings — 5 nhóm cấu hình hệ thống SK Workspace
export interface CompanyInfo {
  legal_name: string; // Tên pháp nhân
  short_name: string;
  mst: string; // Mã số thuế
  address: string; // Trụ sở
  warehouse_address: string; // Tổng kho
  hotline: string;
  tel: string;
  email: string;
  website: string;
  representative: string; // Đại diện pháp luật
  logo_url?: string;
}

export interface VietQRConfig {
  bank_name: string; // Techcombank
  bank_code: string; // TCB
  account_no: string; // 22226060
  account_name: string; // CONG TY TNHH THUC PHAM SON KHANG
  template: string; // compact2 / print
  transfer_content_prefix: string; // Cú pháp nạp/thanh toán
  enabled: boolean;
}

export interface SapoConfig {
  store_url: string; // sonkhang.mysapo.net
  api_key_masked: string; // 0166bd3c... (masked)
  api_key?: string; // chỉ dùng server-side, không trả về client nếu không cần
  status: "connected" | "disconnected" | "error";
  last_synced_at?: string;
  note?: string;
}

export interface MisaConfig {
  amis_app_id: string;
  amis_status: "connected" | "disconnected" | "error";
  meinvoice_serial: string; // C26TSK
  meinvoice_template: string; // 1/001
  meinvoice_status: "connected" | "disconnected" | "error";
  last_synced_at?: string;
  note?: string;
}

export interface PolicyConfig {
  min_order_value: number; // 500000
  freeship_threshold_8km: number; // 1000000
  freeship_threshold_12km: number; // 3000000
  freeship_distance_1_km: number; // 8
  freeship_distance_2_km: number; // 12
  pickup_discount_per_box: number; // 1000
  ageing_days: number; // số ngày quá hạn công nợ cảnh báo
  chanh_xe_note: string;
}

export interface SystemMeta {
  version: string; // SK Workspace v2.1
  db_status: "online" | "offline" | "degraded";
  integrations_active: number;
  integrations_total: number;
  rbac_status: "active" | "inactive";
  updated_at: string;
}

export interface SystemSettings {
  company: CompanyInfo;
  vietqr: VietQRConfig;
  sapo: SapoConfig;
  misa: MisaConfig;
  policy: PolicyConfig;
  meta: SystemMeta;
}

export type SettingsTabId = "company" | "vietqr" | "sapo" | "misa" | "policy";

export const SETTINGS_TABS: { id: SettingsTabId; label: string; desc: string }[] = [
  { id: "company", label: "Doanh nghiệp & Kho bãi", desc: "Pháp nhân, MST, trụ sở, tổng kho" },
  { id: "vietqr", label: "Thanh toán VietQR", desc: "Techcombank & cú pháp chuyển khoản" },
  { id: "sapo", label: "Tích hợp Sapo API", desc: "sonkhang.mysapo.net" },
  { id: "misa", label: "MISA AMIS & meInvoice", desc: "Kế toán & hóa đơn điện tử" },
  { id: "policy", label: "Chính sách bán hàng & Chành xe", desc: "Giá trị đơn tối thiểu, freeship, chiết khấu" },
];
