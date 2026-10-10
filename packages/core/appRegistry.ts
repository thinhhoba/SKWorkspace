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
  Rss,
  CheckSquare,
  StickyNote,
  MessageSquare,
  Mail,
  UserCircle,
  Store,
  Globe,
} from "lucide-react";

export type AppGroup = "tong-quan" | "ban-hang" | "van-hanh" | "tai-chinh" | "tien-ich" | "he-thong";
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
  "tien-ich": "Tiện ích & Miniapp",
  "he-thong": "Hệ thống",
};

export const GROUP_ORDER: AppGroup[] = ["tong-quan", "ban-hang", "van-hanh", "tai-chinh", "tien-ich", "he-thong"];

export const appRegistry: AppDef[] = [
  { id: "dashboard", label: "Bản làm việc", group: "tong-quan", icon: LayoutDashboard, href: "/", color: "primary", desc: "Bento dashboard — KPI & cảnh báo" },
  { id: "sales", label: "Bán hàng", group: "ban-hang", icon: ShoppingCart, href: "/sales", color: "primary", desc: "Đơn hàng Sapo — soạn & giao" },
  { id: "pos", label: "POS Bán hàng", group: "ban-hang", icon: Store, href: "/pos", color: "primary", badge: "K80", desc: "Bán lẻ & in bill tại quầy" },
  { id: "dathang", label: "Web Order B2B", group: "ban-hang", icon: Globe, href: "/dathang", color: "success", badge: "B2B", desc: "Căn tin & quán ăn đặt nhanh" },
  { id: "customers", label: "Khách hàng B2B", group: "ban-hang", icon: Building2, href: "/customers", color: "neutral", desc: "Công nợ & lịch sử mua" },
  { id: "pricing", label: "Bảng giá", group: "ban-hang", icon: Tag, href: "/pricing", color: "neutral", desc: "SKU & giá theo kênh" },
  { id: "purchase", label: "Mua hàng", group: "van-hanh", icon: ShoppingBag, href: "/purchase", color: "warning", desc: "Đặt NCC & nhập kho" },
  { id: "inventory", label: "Kho lạnh", group: "van-hanh", icon: Warehouse, href: "/inventory", color: "success", desc: "Tồn Q7 / Q12 & cảnh báo" },
  { id: "delivery", label: "Giao vận", group: "van-hanh", icon: Truck, href: "/delivery", color: "success", desc: "Tuyến giao & tài xế" },
  { id: "fleet", label: "Xe lạnh 29C-882.60", group: "van-hanh", icon: Truck, href: "/fleet", color: "success", badge: "-18°C", desc: "IoT nhiệt độ & tài xế Tân" },
  { id: "finance", label: "Dòng tiền", group: "tai-chinh", icon: Wallet, href: "/finance", color: "primary", desc: "Thu chi & đối soát" },
  { id: "sapo2misa", label: "Sapo2Misa", group: "tai-chinh", icon: ArrowLeftRight, href: "/finance/sapo2misa", color: "primary", badge: "63 cột", desc: "Đồng bộ Sapo → MISA" },
  { id: "reports", label: "Báo cáo", group: "tai-chinh", icon: BarChart3, href: "/reports", color: "neutral", desc: "Doanh thu & tồn & công nợ" },
  { id: "feed", label: "Bảng tin nội bộ", group: "tien-ich", icon: Rss, href: "/feed", color: "primary", desc: "Thông báo & khen thưởng" },
  { id: "tasks", label: "Quản lý công việc", group: "tien-ich", icon: CheckSquare, href: "/tasks", color: "warning", desc: "Kanban & tiến độ công việc" },
  { id: "notes", label: "Sổ tay ghi chú", group: "tien-ich", icon: StickyNote, href: "/notes", color: "neutral", desc: "Chành xe & biên bản ca" },
  { id: "chat", label: "Chat nội bộ", group: "tien-ich", icon: MessageSquare, href: "/chat", color: "primary", badge: "Live", desc: "Trao đổi kho & điều xe" },
  { id: "mail", label: "Hộp thư Mail Hub", group: "tien-ich", icon: Mail, href: "/mail", color: "neutral", badge: "Gmail", desc: "Gmail & Microsoft 365" },
  { id: "hr", label: "Nhân sự", group: "he-thong", icon: Users, href: "/hr", color: "neutral", desc: "Chấm công & phân quyền" },
  { id: "profile", label: "Trang cá nhân", group: "he-thong", icon: UserCircle, href: "/profile", color: "neutral", desc: "Ca trực, mật khẩu & chữ ký số" },
  { id: "docs", label: "Văn thư", group: "he-thong", icon: FileText, href: "/docs", color: "neutral", desc: "HĐĐT & lưu trữ" },
  { id: "audit", label: "Nhật ký", group: "he-thong", icon: ClipboardList, href: "/audit", color: "neutral", desc: "integration_logs & lịch sử" },
  { id: "settings", label: "Cấu hình", group: "he-thong", icon: Settings, href: "/settings", color: "neutral", desc: "Tích hợp & hệ thống" },
];
