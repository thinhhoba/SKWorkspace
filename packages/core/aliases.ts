/**
 * ĐỊNH DANH ALIAS NGHIỆP VỤ HỆ THỐNG — SK WORKSPACE 2
 * CÔNG TY TNHH THỰC PHẨM SƠN KHANG
 * 
 * Chuẩn hóa toàn bộ tiền tố mã nghiệp vụ (Business Code Prefix),
 * hỗ trợ sinh mã tự động, phân loại luồng và nhận diện kênh bán hàng.
 */

export type BusinessScope =
  // 1. Kênh bán hàng (Sales Channels)
  | "SALES_GENERAL"     // Đơn bán sỉ chung
  | "SALES_WEB"         // Web Order (sonkhang.vn)
  | "SALES_POS"         // Bán lẻ tại quầy POS kho Định Công / Yên Bình
  | "SALES_QUAN_AN"     // Quán ăn vặt, xiên bẩn, mì trộn Hà Nội
  | "SALES_DAI_LY"      // Đại lý chành xe các tỉnh phía Bắc
  | "SALES_BEP_AN"      // Căn tin trường học, bếp ăn công nghiệp
  // 2. Thu mua & Nhà cung cấp
  | "PURCHASE_ORDER"    // Đơn đặt hàng NCC (PO)
  | "PURCHASE_RECEIPT"  // Biên bản nhận hàng NCC
  // 3. Kho vận & Giao nhận
  | "INVENTORY_EXPORT"  // Phiếu xuất kho (PXK)
  | "INVENTORY_IMPORT"  // Phiếu nhập kho (PNK)
  | "INVENTORY_AUDIT"   // Biên bản kiểm kê kho (KK)
  | "DELIVERY_ORDER"    // Vận đơn điều phối giao xe / chành xe (DO)
  // 4. Báo giá & Đối tác
  | "PRICE_QUOTE"       // Báo giá Zalo / Báo giá kênh (BG)
  | "CUSTOMER_CODE"     // Mã khách hàng B2B (KH)
  | "SUPPLIER_CODE"     // Mã nhà cung cấp (NCC)
  // 5. Tài chính & Kế toán MISA
  | "PAYMENT_RECEIPT"   // Phiếu thu (PT)
  | "PAYMENT_VOUCHER"   // Phiếu chi (PC)
  | "MISA_INVOICE"      // Hóa đơn điện tử MISA meInvoice (INV)
  | "MISA_AMIS_VOUCHER"; // Chứng từ ghi sổ MISA AMIS (CTGS)

export interface AliasDefinition {
  scope: BusinessScope;
  prefix: string;
  name: string;
  description: string;
  department: "Kinh Doanh" | "Kho Vận" | "Thu Mua" | "Kế Toán" | "Ban Giám Đốc";
}

export const BUSINESS_ALIASES: Record<BusinessScope, AliasDefinition> = {
  SALES_GENERAL: {
    scope: "SALES_GENERAL",
    prefix: "SK-SO",
    name: "Đơn Bán Hàng Sỉ",
    description: "Đơn bán buôn thực phẩm chung",
    department: "Kinh Doanh",
  },
  SALES_WEB: {
    scope: "SALES_WEB",
    prefix: "SK-WEB",
    name: "Đơn Web Order",
    description: "Đơn đặt online từ website sonkhang.vn",
    department: "Kinh Doanh",
  },
  SALES_POS: {
    scope: "SALES_POS",
    prefix: "SK-POS",
    name: "Đơn Bán Quầy POS",
    description: "Khách lẻ & quán mua trực tiếp tại kho",
    department: "Kinh Doanh",
  },
  SALES_QUAN_AN: {
    scope: "SALES_QUAN_AN",
    prefix: "SK-QA",
    name: "Đơn Quán Ăn / Xiên Bẩn",
    description: "Quán ăn vặt, mì trộn Indomie nội thành Hà Nội",
    department: "Kinh Doanh",
  },
  SALES_DAI_LY: {
    scope: "SALES_DAI_LY",
    prefix: "SK-DL",
    name: "Đơn Đại Lý Chành Xe",
    description: "Đại lý tỉnh đóng thùng xốp gửi chành xe phía Bắc",
    department: "Kinh Doanh",
  },
  SALES_BEP_AN: {
    scope: "SALES_BEP_AN",
    prefix: "SK-BA",
    name: "Đơn Bếp Ăn Căn Tin",
    description: "Trường học, căn tin, bếp ăn công ty",
    department: "Kinh Doanh",
  },
  PURCHASE_ORDER: {
    scope: "PURCHASE_ORDER",
    prefix: "SK-PO",
    name: "Đơn Đặt Hàng NCC",
    description: "Đơn nhập nguyên liệu từ CP, Indomie, Kewpie...",
    department: "Thu Mua",
  },
  PURCHASE_RECEIPT: {
    scope: "PURCHASE_RECEIPT",
    prefix: "SK-REC",
    name: "Biên Bản Nhận Hàng NCC",
    description: "Biên bản nghiệm thu hàng thực nhận từ NCC",
    department: "Kho Vận",
  },
  INVENTORY_EXPORT: {
    scope: "INVENTORY_EXPORT",
    prefix: "SK-PXK",
    name: "Phiếu Xuất Kho",
    description: "Xuất kho giao khách hoặc luân chuyển",
    department: "Kho Vận",
  },
  INVENTORY_IMPORT: {
    scope: "INVENTORY_IMPORT",
    prefix: "SK-PNK",
    name: "Phiếu Nhập Kho",
    description: "Nhập hàng lưu kho lạnh Định Công / Yên Bình",
    department: "Kho Vận",
  },
  INVENTORY_AUDIT: {
    scope: "INVENTORY_AUDIT",
    prefix: "SK-KK",
    name: "Biên Bản Kiểm Kê",
    description: "Kiểm kê định kỳ tồn kho và hạn sử dụng",
    department: "Kho Vận",
  },
  DELIVERY_ORDER: {
    scope: "DELIVERY_ORDER",
    prefix: "SK-DO",
    name: "Vận Đơn Giao Nhận",
    description: "Lệnh giao hàng cho tài xế hoặc chành xe bến bãi",
    department: "Kho Vận",
  },
  PRICE_QUOTE: {
    scope: "PRICE_QUOTE",
    prefix: "SK-BG",
    name: "Báo Giá Zalo / Kênh",
    description: "Bản báo giá xuất theo kênh cho khách sỉ",
    department: "Kinh Doanh",
  },
  CUSTOMER_CODE: {
    scope: "CUSTOMER_CODE",
    prefix: "SK-KH",
    name: "Mã Khách Hàng B2B",
    description: "Định danh khách hàng và quán đối tác",
    department: "Kinh Doanh",
  },
  SUPPLIER_CODE: {
    scope: "SUPPLIER_CODE",
    prefix: "SK-NCC",
    name: "Mã Nhà Cung Cấp",
    description: "Định danh hãng sản xuất và đơn vị cung ứng",
    department: "Thu Mua",
  },
  PAYMENT_RECEIPT: {
    scope: "PAYMENT_RECEIPT",
    prefix: "SK-PT",
    name: "Phiếu Thu",
    description: "Thu tiền mặt hoặc báo có Techcombank",
    department: "Kế Toán",
  },
  PAYMENT_VOUCHER: {
    scope: "PAYMENT_VOUCHER",
    prefix: "SK-PC",
    name: "Phiếu Chi",
    description: "Chi trả tiền hàng NCC, phí chành xe, vận hành",
    department: "Kế Toán",
  },
  MISA_INVOICE: {
    scope: "MISA_INVOICE",
    prefix: "SK-INV",
    name: "Hóa Đơn MISA meInvoice",
    description: "Hóa đơn điện tử có mã hoặc không mã của CQT",
    department: "Kế Toán",
  },
  MISA_AMIS_VOUCHER: {
    scope: "MISA_AMIS_VOUCHER",
    prefix: "SK-CTGS",
    name: "Chứng Từ MISA AMIS",
    description: "Chứng từ kế toán hạch toán vào sổ sách AMIS",
    department: "Kế Toán",
  },
};

/**
 * Hàm sinh mã định danh nghiệp vụ chuẩn:
 * Format: {PREFIX}-{YYMMDD}-{SEQUENCE} (vd: SK-WEB-261010-0012)
 */
export function generateBusinessCode(scope: BusinessScope, sequence: number, date: Date = new Date()): string {
  const def = BUSINESS_ALIASES[scope];
  const yy = String(date.getFullYear()).slice(-2);
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  const seq = String(sequence).padStart(4, "0");
  return `${def.prefix}-${yy}${mm}${dd}-${seq}`;
}

/**
 * Nhận diện loại nghiệp vụ từ chuỗi mã
 */
export function identifyBusinessScope(code: string): BusinessScope | null {
  for (const [scope, def] of Object.entries(BUSINESS_ALIASES)) {
    if (code.startsWith(def.prefix)) {
      return scope as BusinessScope;
    }
  }
  return null;
}
