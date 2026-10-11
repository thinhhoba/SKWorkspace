import type { FeedPost, ActivityEvent } from "./types";

export const SEED_POSTS: FeedPost[] = [
  {
    id: "post-001",
    author: "Hồ Bá Thịnh",
    authorRole: "Giám đốc",
    avatar: "👑",
    content: "📢 THÔNG BÁO CA LÀM VIỆC: Đội kho Tổng Định Công tập trung xuất ưu tiên 9 đơn hàng sỉ đông lạnh cho khách chuỗi trước 11h30. Xe tải VAN 29C-882.60 đã bật lốc lạnh đạt -18.4°C sẵn sàng nhận hàng!",
    tag: "thong-bao",
    pinned: true,
    likes: 6,
    likedByMe: true,
    comments: [
      {
        id: "cmt-001",
        postId: "post-001",
        parentId: null,
        author: "Trần Thị Ngọc Thúy",
        content: "Kho đã chuẩn bị xong lệnh soạn hàng gộp FEFO cho 9 đơn, hàng viên chiên và ba chỉ bò sẵn sàng giao xe tải anh nhé!",
        createdAt: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
];

export const SEED_ACTIVITIES: ActivityEvent[] = [
  {
    id: "act-001",
    type: "order_new",
    title: "Đơn hàng B2B #13571 vừa xác nhận qua Zalo",
    description: "Khách sỉ: Đại lý Lẩu Phan Quán — 15 thùng Mì Indomie, 8 can Sốt Mayonnaise Kewpie. Chờ xuất kho Định Công.",
    amount: 14250000,
    aliasCode: "SK-ORD-13571",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
  {
    id: "act-002",
    type: "fleet_move",
    title: "Tài xế Ngô Văn Tân bắt đầu ca giao xe tải VAN 29C-882.60",
    description: "Khởi hành từ Kho Tổng Định Công đi tuyến chành xe Giáp Bát & Nước Ngầm. Lốc lạnh thùng xe duy trì đạt chuẩn HACCP.",
    temperature: -18.4,
    aliasCode: "VAN-29C-882.60",
    createdAt: new Date(Date.now() - 18 * 60 * 1000).toISOString(),
  },
  {
    id: "act-003",
    type: "vietqr",
    title: "VietQR Techcombank 22226060: Gạch nợ tự động thành công",
    description: "Nhận thanh toán tiền hàng từ Đại lý Phân phối Minh Tâm qua mã QR động. Kế toán tự động sinh chứng từ Nợ 1121 Có 131.",
    amount: 125000000,
    aliasCode: "TCB-22226060",
    createdAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
  },
  {
    id: "act-004",
    type: "qc_done",
    title: "KCS Hàng về: Nhập kho Lô Viên chiên LC Foods đạt chuẩn",
    description: "Thủ kho Trần Thị Ngọc Thúy đã ký nhận biên bản KCS-261011: Hạn dùng 86%, nhiệt độ tâm hàng -18.2°C, bao bì nguyên vẹn.",
    aliasCode: "KCS-261011-001",
    createdAt: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
  },
  {
    id: "act-005",
    type: "fefo_alert",
    title: "Cảnh báo FEFO: Lô Mì Indomie Goreng cận Date 28 ngày",
    description: "Lô INDO-2026-B1 (Kho khô Định Công) còn 28 ngày hết hạn — Thuật toán FEFO đã tự động chỉ định ưu tiên xuất trước cho đơn kế tiếp.",
    aliasCode: "FEFO-ALERT",
    createdAt: new Date(Date.now() - 55 * 60 * 1000).toISOString(),
  },
];
