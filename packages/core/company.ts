/**
 * THÔNG TIN PHÁP LÝ & ĐỊNH DANH DOANH NGHIỆP CHÍNH THỨC
 * CÔNG TY TNHH THỰC PHẨM SƠN KHANG (SON KHANG FOODS CO., LTD)
 * 
 * Nguồn: Giấy chứng nhận ĐKKD cấp bởi Sở Tài chính TP. Hà Nội
 * Cập nhật mới nhất: 02/10/2026
 */

export const COMPANY_PROFILE = {
  // 1. Tên doanh nghiệp
  name: "CÔNG TY TNHH THỰC PHẨM SƠN KHANG",
  nameEn: "SON KHANG FOODS COMPANY LIMITED",
  shortName: "SON KHANG FOODS CO., LTD",
  brandName: "Sơn Khang Foods",
  tagline: "KHO SỈ MÌ TRỘN INDOMIE — Giao siêu tốc, Giá siêu tốt tại thị trường miền Bắc",

  // 2. Mã số doanh nghiệp & Đăng ký kinh doanh
  taxCode: "0111252725", // Mã số thuế / Mã số doanh nghiệp
  firstRegistrationDate: "2025-10-16",
  registeredAt: "Sở Tài chính Thành phố Hà Nội",
  charterCapital: 2000000000, // 2 tỷ đồng
  charterCapitalWords: "Hai tỷ đồng chẵn",
  companyType: "Công ty trách nhiệm hữu hạn một thành viên",

  // 3. Ngành hàng kinh doanh cốt lõi
  productCategories: [
    "Thực phẩm khô ăn liền (Mì trộn Indomie, mì Nissin, đồ ăn liền đóng gói)",
    "Gia vị (Tương ớt, tương cà Sài Gòn, sốt chấm Kewpie, dầu ăn Cái Lân, gia vị chế biến)",
    "Thực phẩm đông lạnh chế biến sẵn (Viên chiên LC Foods, gà Popcorn CP, xúc xích, bánh gạo Tokbokki, bánh gà Nét Việt)"
  ],

  // 4. Trụ sở chính & Địa điểm kinh doanh (Phân định rõ lưu kho)
  headquarters: {
    address: "Thôn 6, Xã Yên Xuân, Thành phố Hà Nội, Việt Nam",
    hasWarehouse: false, // Trụ sở văn phòng hành chính — KHÔNG LƯU KHO
    type: "VĂN PHÒNG HÀNH CHÍNH"
  },
  warehouseLocation: {
    address: "Số 96 Ngõ 337 Phố Định Công, Phường Định Công, Thành phố Hà Nội, Việt Nam",
    alternateAddress: "Số 96 Ngõ 412 Trịnh Đình Cửu, Phường Định Công, Quận Hoàng Mai, Thành phố Hà Nội",
    hasWarehouse: true, // Điểm tập kết & xuất nhập kho thực tế — CÓ LƯU KHO
    businessLocationCode: "00001",
    businessLocationName: "ĐỊA ĐIỂM KINH DOANH - CÔNG TY TNHH THỰC PHẨM SƠN KHANG",
    zones: ["Kho khô thường (Mì & Gia vị)", "Kho đông lạnh chế biến sẵn (-18°C ~ -22°C)"]
  },
  headquartersAddress: "Thôn 6, Xã Yên Xuân, Thành phố Hà Nội, Việt Nam",
  mainWarehouseAddress: "Số 96 Ngõ 337 Phố Định Công, Phường Định Công, Thành phố Hà Nội, Việt Nam",

  // 5. Đội ngũ phương tiện vận tải
  fleet: {
    motorbikes: {
      type: "Xe máy",
      purpose: "Giao hỏa tốc nội thành, đơn nhỏ lẻ ngõ ngách, quán ăn vặt, căng tin trường học",
      driver: "Nhân viên giao vận xe máy"
    },
    vanTrucks: {
      type: "Xe tải VAN (Thùng bảo ôn / Giữ nhiệt)",
      purpose: "Giao sỉ số lượng lớn, thùng to cho đại lý, chuỗi quán ăn, chành xe bến Giáp Bát & Nước Ngầm (Chạy phố 24/7 không cấm giờ)",
      driver: "Ngô Văn Tân (0942 22 60 60)"
    }
  },

  // 6. Hệ sinh thái phần mềm kết nối API chính thức
  softwareIntegrations: {
    sales: "Sapo POS / Omni (Kết nối Open API 2 chiều)",
    accounting: "MISA AMIS Online (Kết nối Open API 63 cột nghiệp vụ)",
    eInvoice: "MISA meInvoice (Kết nối API ký số và phát hành HĐĐT C26TSK)"
  },

  // 4. Người đại diện theo pháp luật
  legalRepresentative: {
    fullName: "HỒ BÁ THỊNH",
    title: "Giám đốc",
    birthDate: "1994-11-20",
    idCardNumber: "001094016823",
    nationality: "Việt Nam",
    contactAddress: "Thôn 6, Xã Yên Xuân, Thành phố Hà Nội, Việt Nam",
  },

  // 5. Cơ quan thuế & Kế toán thuế
  taxAuthority: "Thuế cơ sở 22 thành phố Hà Nội",
  taxAccountant: {
    fullName: "TRẦN THỊ LỆ QUYÊN",
    phone: "0988 000 570",
  },
  chiefAccountant: {
    fullName: "HOÀNG THỊ NHO",
    phone: "0942 22 60 60",
  },

  // 6. Kênh liên hệ chính thức
  contact: {
    landline: "024 22 60 60 60",
    hotline: "0942 22 60 60",
    email: "thucpham@sonkhang.vn",
    taxEmail: "thucphamsonkhang@gmail.com",
    website: "https://sonkhang.vn",
  },

  // 7. Thông tin tài khoản ngân hàng chính thức
  banking: {
    bankName: "Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank)",
    bankCode: "TCB",
    bin: "970407",
    accountNumber: "22226060",
    accountName: "CONG TY TNHH THUC PHAM SON KHANG",
  },

  // 8. Chính sách bán hàng & vận chuyển
  salesPolicy: {
    minWholesaleOrderAmount: 500000, // 500k
    smallOrderSurchargePercent: 10,  // +10% nếu đơn < 500k
    freeshipRadiusKmTier1: 8,
    freeshipMinAmountTier1: 1000000, // 1tr freeship < 8km
    freeshipRadiusKmTier2: 12,
    freeshipMinAmountTier2: 3000000, // 3tr freeship < 12km
    warehousePickupDiscountPerCarton: 1000, // -1k/thùng tại kho Định Công
    northernProvinceFreightPolicy: "Gửi xe khách/chành xe các tỉnh phía Bắc - Chuyển khoản 100% trước khi xuất bến (Không COD tỉnh)",
  },
} as const;
