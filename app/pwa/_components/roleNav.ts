import type { PwaRole } from "@/packages/core/rbac";

export type PwaTabId =
  | "tong-quan"
  | "duyet-lenh"
  | "dong-tien"
  | "cai-dat"
  | "cong-no"
  | "thu-chi"
  | "sapo-misa"
  | "doi-soat"
  | "soan-don"
  | "nhap-hang"
  | "kho-lanh"
  | "quet-ma"
  | "chuyen-giao"
  | "thu-cod"
  | "quet-qr"
  | "lich-su";

export interface PwaNavItem {
  id: PwaTabId;
  label: string;
  icon: string;
}

export const PWA_NAV: Record<PwaRole, PwaNavItem[]> = {
  admin: [
    { id: "tong-quan", label: "Tổng quan", icon: "LayoutGrid" },
    { id: "duyet-lenh", label: "Duyệt lệnh", icon: "CheckCircle2" },
    { id: "dong-tien", label: "Dòng tiền", icon: "Wallet" },
    { id: "cai-dat", label: "Cài đặt", icon: "Settings" },
  ],
  accountant: [
    { id: "cong-no", label: "Công nợ B2B", icon: "Building2" },
    { id: "thu-chi", label: "Thu / Chi", icon: "ArrowLeftRight" },
    { id: "sapo-misa", label: "Sapo ↔ MISA", icon: "RefreshCw" },
    { id: "doi-soat", label: "Đối soát", icon: "ClipboardCheck" },
  ],
  warehouse: [
    { id: "soan-don", label: "Soạn đơn", icon: "ClipboardList" },
    { id: "nhap-hang", label: "Nhập hàng", icon: "PackagePlus" },
    { id: "kho-lanh", label: "Kho lạnh", icon: "Snowflake" },
    { id: "quet-ma", label: "Quét mã", icon: "ScanLine" },
  ],
  delivery: [
    { id: "chuyen-giao", label: "Chuyến giao", icon: "Truck" },
    { id: "thu-cod", label: "Thu COD", icon: "Banknote" },
    { id: "quet-qr", label: "Quét QR", icon: "QrCode" },
    { id: "lich-su", label: "Lịch sử", icon: "History" },
  ],
};

export function firstTabForRole(role: PwaRole): PwaTabId {
  return PWA_NAV[role][0].id;
}
