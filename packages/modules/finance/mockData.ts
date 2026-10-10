import type { FinanceTransaction } from "./types";

export const MOCK_FINANCE_TRANSACTIONS: FinanceTransaction[] = [
  { id: "txn-01", code: "SK-PT-260101", type: "THU", category: "thu_tien_hang_quan_an", amount: 4850000, account: "TECHCOMBANK_22226060", description: "Thu tiền hàng — Tiệm Mì Cay Bách Khoa (CK)", performer: "Hoàng Thị Nho", created_at: "10/10/2026 08:30" },
  { id: "txn-02", code: "SK-PT-260102", type: "THU", category: "thu_dai_ly_chanh_xe", amount: 15800000, account: "TECHCOMBANK_22226060", description: "Đại lý Minh Quân — Chành xe Giáp Bát (Nam Định) CK 100%", performer: "Hoàng Thị Nho", created_at: "10/10/2026 09:15" },
  { id: "txn-03", code: "SK-PT-260103", type: "THU", category: "thu_ho_cod", amount: 2650000, account: "CASH", description: "Thu hộ COD — Tài xế Ngô Văn Tân — Quán Bún Bò Huế Cầu Giấy", performer: "Ngô Văn Tân", created_at: "10/10/2026 10:00" },
  { id: "txn-04", code: "SK-PC-260104", type: "CHI", category: "chi_tien_hang_ncc", amount: 22000000, account: "TECHCOMBANK_22226060", description: "Trả NCC CP — lô thịt heo đông lạnh", performer: "Hoàng Thị Nho", created_at: "10/10/2026 11:00" },
  { id: "txn-05", code: "SK-PC-260105", type: "CHI", category: "chi_cuoc_chanh_xe", amount: 450000, account: "CASH", description: "Cước gửi xe bến Giáp Bát → Nam Định (5 thùng xốp)", performer: "Ngô Văn Tân", created_at: "10/10/2026 11:30" },
  { id: "txn-06", code: "SK-PT-260106", type: "THU", category: "thu_dai_ly_chanh_xe", amount: 12400000, account: "TECHCOMBANK_22226060", description: "Siêu thị mini Hải An — Hải Phòng (Nước Ngầm) CK", performer: "Hoàng Thị Nho", created_at: "09/10/2026 14:00" },
  { id: "txn-07", code: "SK-PC-260107", type: "CHI", category: "chi_tien_hang_ncc", amount: 8500000, account: "TECHCOMBANK_22226060", description: "Trả NCC Indomie — lô mỳ gói", performer: "Hoàng Thị Nho", created_at: "09/10/2026 15:30" },
  { id: "txn-08", code: "SK-PC-260108", type: "CHI", category: "chi_van_hanh_kho", amount: 3200000, account: "CASH", description: "Chi phí vận hành kho — điện lạnh -18°C", performer: "Hoàng Thị Nho", created_at: "09/10/2026 16:00" },
  { id: "txn-09", code: "SK-PT-260109", type: "THU", category: "thu_tien_hang_quan_an", amount: 5200000, account: "CASH", description: "Thu tiền mặt — Quán Lẩu Nướng Hoàn Kiếm", performer: "Ngô Văn Tân", created_at: "08/10/2026 09:00" },
  { id: "txn-10", code: "SK-PC-260110", type: "CHI", category: "chi_cuoc_chanh_xe", amount: 380000, account: "CASH", description: "Cước gửi xe bến Nước Ngầm → Hải Phòng (4 thùng)", performer: "Ngô Văn Tân", created_at: "08/10/2026 10:30" },
  { id: "txn-11", code: "SK-PT-260111", type: "THU", category: "thu_ho_cod", amount: 18900000, account: "TECHCOMBANK_22226060", description: "Thu hộ COD chành xe — Nhà hàng Hạ Long Bay (Mỹ Đình)", performer: "Hoàng Thị Nho", created_at: "08/10/2026 13:00" },
  { id: "txn-12", code: "SK-PC-260112", type: "CHI", category: "chi_tien_hang_ncc", amount: 15600000, account: "TECHCOMBANK_22226060", description: "Trả NCC Kewpie — sốt mayonnaise", performer: "Hoàng Thị Nho", created_at: "07/10/2026 10:00" },
  { id: "txn-13", code: "SK-PT-260113", type: "THU", category: "thu_tien_hang_quan_an", amount: 24500000, account: "TECHCOMBANK_22226060", description: "Thu tiền hàng — Bếp ăn KCN Thăng Long (CK)", performer: "Hoàng Thị Nho", created_at: "07/10/2026 11:00" },
  { id: "txn-14", code: "SK-PC-260114", type: "CHI", category: "chi_van_hanh_kho", amount: 1800000, account: "CASH", description: "Chi phí đóng thùng xốp + đá khô", performer: "Ngô Văn Tân", created_at: "07/10/2026 12:00" },
];
