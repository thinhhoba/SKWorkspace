import { MisaColumn } from "@/constants/misaColumns";

export interface LedgerEntry {
  external_id: string; // Mã đơn Sapo (vd: SP-0841 hoặc 13537)
  order_code: string;
  customer_name: string;
  total_amount: number;
  exported_at: string;
  file_name?: string;
  exported_by?: string;
}

export interface ValidationError {
  row_index: number;
  external_id: string;
  column_key: string;
  severity: "error" | "warning";
  message: string;
}

export interface ValidationSummary {
  total_rows: number;
  total_orders: number;
  errors: ValidationError[];
  warnings: ValidationError[];
  duplicate_external_ids: string[];
  is_exportable: boolean;
}

/**
 * 1. MISA AMIS Kế Toán OpenAPI Types
 * https://developer.misa.vn/products-openapi/AMISKT?firstApi=1
 */
export interface MisaAmisConfig {
  appId: string;
  accessCode: string;
  companyTaxCode: string; // "0111252725"
  apiUrl?: string;
}

export interface MisaAmisVoucherItem {
  inventoryItemCode: string; // Mã vật tư (SKU)
  inventoryItemName: string; // Tên hàng
  unitName: string;          // ĐVT
  quantity: number;
  unitPrice: number;
  amount: number;            // Thành tiền
  vatRate: number;           // 8, 10, 5
  vatAmount: number;
  debitAccount: string;      // 131 (Phải thu KH) hoặc 1111/1121
  creditAccount: string;     // 5111 (Doanh thu bán hàng)
}

export interface MisaAmisSaleVoucher {
  refNo: string;             // Số chứng từ (SK-CTGS-...)
  refDate: string;           // Ngày hạch toán YYYY-MM-DD
  postedDate: string;
  accountObjectCode: string; // Mã KH
  accountObjectName: string; // Tên KH
  accountObjectAddress?: string;
  companyTaxCode?: string;
  reason: string;            // Diễn giải
  totalAmount: number;
  totalVatAmount: number;
  items: MisaAmisVoucherItem[];
}

export interface MisaAmisSyncResult {
  success: boolean;
  voucherId?: string;
  refNo?: string;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * 2. MISA meInvoice Bot OpenAPI Types
 * https://developer.misa.vn/products-openapi/MEINVOICEBOT?firstApi=1
 */
export interface MeInvoiceBotConfig {
  appId: string;
  taxCode: string;           // "0111252725"
  invoicePattern: string;    // Ký hiệu mẫu số (1/001)
  invoiceSerial: string;     // Ký hiệu hóa đơn (C26TSK)
  apiUrl?: string;
}

export interface MeInvoicePublishRequest {
  refId: string;             // Mã đơn hàng / Alias (SK-SO-... hoặc SAPO-...)
  invoiceDate: string;       // YYYY-MM-DD
  buyerLegalName: string;    // Tên đơn vị mua hàng
  buyerTaxCode?: string;     // MST khách
  buyerAddress?: string;
  buyerPhone?: string;
  buyerEmail?: string;
  paymentMethodName: "TM" | "CK" | "TM/CK";
  items: {
    lineNumber: number;
    itemName: string;
    unitName: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    vatRateName: "8%" | "10%" | "5%" | "KCT";
    vatAmount: number;
  }[];
  totalAmountWithoutVAT: number;
  totalVATAmount: number;
  totalAmount: number;
}

export interface MeInvoicePublishResult {
  success: boolean;
  transactionId?: string;
  invoiceNo?: string;        // Số hóa đơn meInvoice cấp
  taxAuthorityCode?: string; // Mã của Cơ quan thuế
  viewUrl?: string;          // Link tra cứu HĐĐT
  errorCode?: string;
  errorMessage?: string;
}

export interface MeInvoiceInwardInvoice {
  invoiceId: string;
  invoiceNumber: string;
  sellerTaxCode: string;
  sellerName: string;        // Nhà cung cấp: CP, Kewpie, Cholimex...
  issueDate: string;
  totalAmount: number;
  status: "verified" | "pending_check" | "invalid";
}
