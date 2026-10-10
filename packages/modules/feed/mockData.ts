import type { FeedPost, ActivityEvent } from "./types";

export const SEED_POSTS: FeedPost[] = [
  {
    id: "post-1",
    author: "Ban Giam Doc Son Khang",
    authorRole: "Giam doc",
    avatar: "📌",
    content:
      "Thong bao chinh sach chiet khau chanh xe & can tin truong hoc Quy 4/2026 — Cap 1 chiet khau 12%, Cap 2 chiet khau 7%. Don tren 5 thung ho tro da gel mien phi.",
    tag: "thong-bao",
    pinned: true,
    likes: 18,
    likedByMe: false,
    comments: [
      {
        id: "c-1",
        postId: "post-1",
        parentId: null,
        author: "Ngo Van Tan",
        content: "Da nam thong tin chinh sach dong thung da gel, sang nay em vua giao du 30 thung cho ben xe Giap Bat a.",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      },
    ],
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-2",
    author: "Bo Phan Dieu Van & Doi Xe",
    authorRole: "He thong",
    avatar: "🏆",
    content:
      "Bieu duong tai xe Ngo Van Tan - Xe tai lanh 29C-882.60 hoan thanh 100% chuyen giao, duy tri -18.5°C lien tuc, 85 don si dung gio.",
    tag: "khen-thuong",
    pinned: false,
    likes: 24,
    likedByMe: true,
    comments: [],
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-3",
    author: "Ban An Toan Kho Lanh",
    authorRole: "Thu kho",
    avatar: "❄️",
    content:
      "Nhac nho quy trinh FEFO va kiem soat ra dong dinh ky tai Kho Q7 & Q12. Lo nhap truoc xuat truoc, quet ma SKU 100% truoc khi xuat.",
    tag: "kho-van",
    pinned: false,
    likes: 12,
    likedByMe: false,
    comments: [],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "post-4",
    author: "He thong Canh bao",
    authorRole: "He thong",
    avatar: "🚨",
    content:
      "CANH BAO KHAN CAP: Nhiet do thung lanh xe 29C-882.60 vuot nguong -15°C luc 14:32. Tai xe da kich hoat che do lam lanh tang cuong.",
    tag: "khan-cap",
    pinned: false,
    likes: 5,
    likedByMe: false,
    comments: [],
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
  },
];

export const SEED_ACTIVITIES: ActivityEvent[] = [
  {
    id: "act-1",
    type: "order_new",
    title: "Don hang moi SK-WEB-2026-0842",
    description: "Khach sanh xe Giap Bat — 30 thung ca vien, tong 18.500.000d",
    amount: 18500000,
    aliasCode: "SK-WEB-2026-0842",
    createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
  },
  {
    id: "act-2",
    type: "vietqr",
    title: "VietQR thanh toan thanh cong",
    description: "Don SK-WEB-2026-0839 — 12.300.000d da doi soat MISA",
    amount: 12300000,
    aliasCode: "SK-WEB-2026-0839",
    createdAt: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
  },
  {
    id: "act-3",
    type: "fleet_move",
    title: "Xe lanh 29C-882.60 dang van chuyen",
    description: "Nhiet do -18.4°C — Vi tri: Gan Ben xe Giap Bat",
    temperature: -18.4,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  },
  {
    id: "act-4",
    type: "fefo_done",
    title: "FEFO hoan tat — Kho Q7",
    description: "Lo L2409-XC01 da xuat 50 thung theo nguyen tac FEFO",
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "act-5",
    type: "order_new",
    title: "Don hang moi SK-WEB-2026-0843",
    description: "Can tin DH Cong Nghiep — 15 thung xuc xich, tong 9.800.000d",
    amount: 9800000,
    aliasCode: "SK-WEB-2026-0843",
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
  },
];
