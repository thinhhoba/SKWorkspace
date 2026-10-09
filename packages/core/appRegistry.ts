import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ShoppingCart,
  ShoppingBag,
  Warehouse,
  Wallet,
  ArrowLeftRight,
  Users,
  FileText,
  Truck,
  Tag,
  BarChart3,
  Building2,
  Settings,
  ClipboardList,
} from "lucide-react";

export type AppGroup = "tong-quan" | "ban-hang" | "van-hanh" | "tai-chinh" | "he-thong";
export type AppColor = "primary" | "success" | "warning" | "destructive" | "neutral";

export interface AppDef {
  id: string;
  label: string;
  group: AppGroup;
  icon: LucideIcon;
  href: string;
  badge?: string;
  color: AppColor;
  desc: string;
}

export const GROUP_LABEL: Record<AppGroup, string> = {
  "tong-quan": "Tổng quan",
  "ban-hang": "Bán hàng",
  "van-hanh": "Vận hành",
  "tai-chinh": "Tài chính",
  "he-thong": "Hệ thống",
};

export const GROUP_ORDER: AppGroup[] = ["tong-quan", "ban-hang", "van-hanh", "tai-chinh", "he-thong"];

export const appRegistry: AppDef[] = [
  { id: "dashboard", label: "Bản làm việc", group: "tong-quan", icon: LayoutDashboard, href: "/", color: "primary", desc: "Bento dashboard — KPI & cảnh báo" },
  { id: "sales", label: "Bán hàng", group: "ban-hang", icon: ShoppingCart, href: "/sales", color: "primary", desc: "Đơn hàng Sapo — soạn & giao" }, // badge: số đơn cho_soan (lấy từ salesService)
  { id: "customers", label: "Khách hàng B2B", group: "ban-hang", icon: Building2, href: "/customers", color: "neutral", desc: "Công nợ & lịch sử mua" },
  { id: "pricing", label: "Bảng giá", group: "ban-hang", icon: Tag, href: "/pricing", color: "neutral", desc: "SKU & giá theo kênh" },
  { id: "purchase", label: "Mua hàng", group: "van-hanh", icon: ShoppingBag, href: "/purchase", color: "warning", desc: "Đặt NCC & nhập kho" }, // badge: số đơn ordered (lấy từ purchaseService)
  { id: "inventory", label: "Kho lạnh", group: "van-hanh", icon: Warehouse, href: "/inventory", color: "success", desc: "Tồn Q7 / Q12 & cảnh báo" },
  { id: "delivery", label: "Giao vận", group: "van-hanh", icon: Truck, href: "/delivery", color: "success", desc: "Tuyến giao & tài xế" },
  { id: "finance", label: "Dòng tiền", group: "tai-chinh", icon: Wallet, href: "/finance", color: "primary", desc: "Thu chi & đối soát" },
  { id: "sapo2misa", label: "Sapo2Misa", group: "tai-chinh", icon: ArrowLeftRight, href: "/finance/sapo2misa", color: "primary", badge: "63 cột", desc: "Đồng bộ Sapo → MISA" },
  { id: "reports", label: "Báo cáo", group: "tai-chinh", icon: BarChart3, href: "/reports", color: "neutral", desc: "Doanh thu & tồn & công nợ" },
  { id: "hr", label: "Nhân sự", group: "he-thong", icon: Users, href: "/hr", color: "neutral", desc: "Chấm công & phân quyền" },
  { id: "docs", label: "Văn thư", group: "he-thong", icon: FileText, href: "/docs", color: "neutral", desc: "HĐĐT & lưu trữ" },
  { id: "audit", label: "Nhật ký", group: "he-thong", icon: ClipboardList, href: "/audit", color: "neutral", desc: "integration_logs & lịch sử" },
  { id: "settings", label: "Cấu hình", group: "he-thong", icon: Settings, href: "/settings", color: "neutral", desc: "Tích hợp & hệ thống" },
];
