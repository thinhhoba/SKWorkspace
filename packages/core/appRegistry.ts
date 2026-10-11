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
  Wrench,
} from "lucide-react";

/**
 * Bộ khung Phân hệ Chức năng của Sơn Khang Workspace (Chỉ thị 19 & 20):
 * 1. Mua hàng (Procurement & Vendor Management)
 * 2. Kho hàng (Advanced F&B WMS)
 * 3. Bán hàng & Phân phối (Omnichannel & DMS — gom 2 nhóm con: Bán lẻ vs Đại lý B2B)
 * 4. Đóng gói & Giao hàng (Logistics & Fulfillment)
 * 5. Tài chính - Kế toán (Tích hợp Open API MISA & meInvoice Queue)
 * 6. Nhân sự & Quản trị Công việc (HRM & Task Flow)
 * 7. Công cụ & Tiện ích (Sổ tay, Mail Hub, Văn thư — tách rời để chống Visual Clutter)
 * 8. Quản trị Hệ thống (System Core & Administration)
 */
export type AppGroup =
  | "mua-hang"
  | "kho-hang"
  | "ban-hang"
  | "giao-hang"
  | "tai-chinh"
  | "nhan-su"
  | "tien-ich"
  | "he-thong";

export type AppColor = "primary" | "success" | "warning" | "destructive" | "neutral";

export interface AppDef {
  id: string;
  label: string;
  group: AppGroup;
  subgroup?: string;
  icon: LucideIcon;
  href: string;
  badge?: string;
  color: AppColor;
  desc: string;
}

export const GROUP_LABEL: Record<AppGroup, string> = {
  "mua-hang": "1. Mua hàng & NCC",
  "kho-hang": "2. Kho hàng (WMS)",
  "ban-hang": "3. Bán hàng & DMS",
  "giao-hang": "4. Đóng gói & Giao vận",
  "tai-chinh": "5. Tài chính & Kế toán",
  "nhan-su": "6. Nhân sự & Công việc",
  "tien-ich": "7. Công cụ & Tiện ích",
  "he-thong": "8. Quản trị Hệ thống",
};

export const GROUP_ORDER: AppGroup[] = [
  "mua-hang",
  "kho-hang",
  "ban-hang",
  "giao-hang",
  "tai-chinh",
  "nhan-su",
  "tien-ich",
  "he-thong",
];

export const appRegistry: AppDef[] = [
  // 1. Phân hệ Mua hàng (Procurement & Vendor Management)
  {
    id: "purchase",
    label: "Mua hàng & PO",
    group: "mua-hang",
    icon: ShoppingBag,
    href: "/purchase",
    color: "warning",
    badge: "PO/NCC",
    desc: "Đơn mua NCC, duyệt đa cấp & đối soát 3 chiều PO-Kho-VAT",
  },

  // 2. Phân hệ Kho hàng (Advanced F&B WMS)
  {
    id: "inventory",
    label: "Kho hàng WMS",
    group: "kho-hang",
    icon: Warehouse,
    href: "/inventory",
    color: "success",
    desc: "Kho Tổng Định Công — Lô/Date & cơ chế xuất FEFO",
  },
  {
    id: "inventory-count",
    label: "Kiểm kê kho",
    group: "kho-hang",
    icon: ClipboardList,
    href: "/inventory/count",
    color: "neutral",
    badge: "Barcode",
    desc: "Kiểm kê mã vạch, cân chỉnh lệch tồn khô & đông lạnh",
  },
  {
    id: "inventory-qc",
    label: "KCS Hàng về",
    group: "kho-hang",
    icon: FileText,
    href: "/inventory/qc",
    color: "primary",
    badge: "-15°C",
    desc: "Biên bản kiểm tra chất lượng, cảm quan & chuẩn HACCP",
  },

  // 3. Phân hệ Bán hàng & Phân phối (Omnichannel & DMS)
  // 3A. Nhóm con: Bán lẻ đa kênh
  {
    id: "pos",
    label: "POS Bán lẻ quầy",
    group: "ban-hang",
    subgroup: "Bán lẻ đa kênh",
    icon: Store,
    href: "/pos",
    color: "primary",
    badge: "K80",
    desc: "Bán lẻ & in hóa đơn tức thì tại quầy kho",
  },
  {
    id: "dathang",
    label: "Web Order B2B",
    group: "ban-hang",
    subgroup: "Bán lẻ đa kênh",
    icon: Globe,
    href: "/dathang",
    color: "success",
    badge: "B2B",
    desc: "Căn tin & quán ăn đặt hàng trực tuyến nhanh chóng",
  },
  {
    id: "sales",
    label: "Bán hàng Omnichannel",
    group: "ban-hang",
    subgroup: "Bán lẻ đa kênh",
    icon: ShoppingCart,
    href: "/sales",
    color: "primary",
    desc: "Đơn hàng Sapo — POS, Web, Social & TMĐT",
  },
  // 3B. Nhóm con: Kênh phân phối B2B & DMS
  {
    id: "customers",
    label: "Khách hàng & DMS",
    group: "ban-hang",
    subgroup: "Kênh đại lý B2B",
    icon: Building2,
    href: "/customers",
    color: "neutral",
    desc: "Danh bạ đại lý, hạn mức nợ (Credit Limit) & tuyến Sales SFA",
  },
  {
    id: "pricing",
    label: "Bảng giá sỉ",
    group: "ban-hang",
    subgroup: "Kênh đại lý B2B",
    icon: Tag,
    href: "/pricing",
    color: "neutral",
    desc: "SKU, mức giá sỉ theo Thùng/Pallet & chiết khấu",
  },
  {
    id: "pricing-quote",
    label: "Báo giá B2B Zalo",
    group: "ban-hang",
    subgroup: "Kênh đại lý B2B",
    icon: FileText,
    href: "/pricing/quote",
    color: "success",
    badge: "Zalo/PDF",
    desc: "Tạo ảnh báo giá thương hiệu Sơn Khang gửi Zalo 30s",
  },

  // 4. Phân hệ Đóng gói & Giao hàng (Logistics & Fulfillment)
  {
    id: "delivery",
    label: "Đóng gói & Giao vận",
    group: "giao-hang",
    icon: Truck,
    href: "/delivery",
    color: "success",
    desc: "Lệnh Pick & Pack, phân luồng xe nội bộ & Sapo Express 3PL",
  },
  {
    id: "fleet",
    label: "Đội xe & Chuỗi lạnh",
    group: "giao-hang",
    icon: Truck,
    href: "/fleet",
    color: "success",
    badge: "VAN 24/7",
    desc: "Xe máy giao ngõ hỏa tốc & Xe tải VAN bảo ôn -18°C",
  },

  // 5. Phân hệ Tài chính - Kế toán (Tích hợp Open API MISA)
  {
    id: "finance",
    label: "Dòng tiền & Sổ quỹ",
    group: "tai-chinh",
    icon: Wallet,
    href: "/finance",
    color: "primary",
    badge: "VietQR",
    desc: "Quỹ Định Công, Techcombank 22226060 & đối soát COD",
  },
  {
    id: "sapo2misa",
    label: "Cổng MISA & meInvoice",
    group: "tai-chinh",
    icon: ArrowLeftRight,
    href: "/finance/sapo2misa",
    color: "primary",
    badge: "Sync Queue",
    desc: "Hàng đợi đồng bộ AMIS & meInvoice CQT tự động kèm retry",
  },
  {
    id: "finance-aging",
    label: "Tuổi nợ B2B",
    group: "tai-chinh",
    icon: BarChart3,
    href: "/finance/aging",
    color: "destructive",
    badge: "15-60d",
    desc: "Phân tích tuổi nợ 4 mốc kế toán & nhắc nợ 1-chạm VietQR",
  },
  {
    id: "reports",
    label: "Báo cáo Quản trị",
    group: "tai-chinh",
    icon: BarChart3,
    href: "/reports",
    color: "neutral",
    desc: "Doanh thu, giá vốn, lãi gộp & tồn kho tổng hợp",
  },

  // 6. Phân hệ Nhân sự & Quản trị Công việc (HRM & Task Flow)
  {
    id: "hr",
    label: "Nhân sự & Bảng lương",
    group: "nhan-su",
    icon: Users,
    href: "/hr",
    color: "neutral",
    desc: "Hồ sơ 4 phòng ban, chấm công GPS & tính lương KPI sản lượng",
  },
  {
    id: "tasks",
    label: "Quản trị Công việc",
    group: "nhan-su",
    icon: CheckSquare,
    href: "/tasks",
    color: "warning",
    desc: "Kanban, workflow phê duyệt chứng từ & tiến độ SLA",
  },
  {
    id: "feed",
    label: "Bảng tin nội bộ",
    group: "nhan-su",
    icon: Rss,
    href: "/feed",
    color: "primary",
    desc: "Thông báo điều hành, tin tức & khen thưởng doanh số",
  },
  {
    id: "chat",
    label: "Chat Điều phối",
    group: "nhan-su",
    icon: MessageSquare,
    href: "/chat",
    color: "primary",
    badge: "Live",
    desc: "Trao đổi tức thời giữa Kho, Xe và Kinh doanh",
  },

  // 7. Nhóm Công cụ & Tiện ích (tách riêng khỏi Hệ thống để chống làm dài thanh cuộn)
  {
    id: "docs",
    label: "Văn thư & HĐĐT",
    group: "tien-ich",
    icon: FileText,
    href: "/docs",
    color: "neutral",
    desc: "Lưu trữ HĐĐT meInvoice C26TSK & tài liệu pháp lý",
  },
  {
    id: "notes",
    label: "Sổ tay Vận hành",
    group: "tien-ich",
    icon: StickyNote,
    href: "/notes",
    color: "neutral",
    desc: "Quy chuẩn bảo quản, cẩm nang chành xe & ca trực",
  },
  {
    id: "mail",
    label: "Hộp thư Mail Hub",
    group: "tien-ich",
    icon: Mail,
    href: "/mail",
    color: "neutral",
    badge: "Gmail",
    desc: "Hộp thư điện tử liên kết đối tác & nhà máy",
  },

  // 8. Phân hệ Quản trị Hệ thống (System Core & Administration)
  {
    id: "dashboard",
    label: "Bàn làm việc Hub",
    group: "he-thong",
    icon: LayoutDashboard,
    href: "/",
    color: "primary",
    desc: "Bento cockpit — Tổng quan điều hành hệ sinh thái",
  },
  {
    id: "profile",
    label: "Trang cá nhân",
    group: "he-thong",
    icon: UserCircle,
    href: "/profile",
    color: "neutral",
    desc: "Ca trực, mật khẩu, chữ ký số & phiếu lương cá nhân",
  },
  {
    id: "audit",
    label: "Nhật ký Hệ thống",
    group: "he-thong",
    icon: ClipboardList,
    href: "/audit",
    color: "neutral",
    desc: "Audit trail chi tiết & lưu vết Request/Response MISA",
  },
  {
    id: "settings",
    label: "Cấu hình & Tích hợp",
    group: "he-thong",
    icon: Settings,
    href: "/settings",
    color: "neutral",
    desc: "Master settings, UoM quy đổi & Gateway API Sapo/MISA",
  },
];
