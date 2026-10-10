/**
 * MISA MEINVOICE BOT OPENAPI CLIENT
 * Tài liệu: https://developer.misa.vn/products-openapi/MEINVOICEBOT?firstApi=1
 * Doanh nghiệp phát hành: CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: 0111252725)
 */

import { CentralOrder } from "../sapo/types";
import {
  MeInvoiceBotConfig,
  MeInvoicePublishRequest,
  MeInvoicePublishResult,
  MeInvoiceInwardInvoice,
} from "./types";
import { COMPANY_PROFILE } from "@/packages/core/company";
import { generateBusinessCode } from "@/packages/core/aliases";

const DEFAULT_MEINVOICE_CONFIG: MeInvoiceBotConfig = {
  appId: process.env.MEINVOICE_APP_ID || "sk-meinvoice-bot-app",
  taxCode: COMPANY_PROFILE.taxCode, // "0111252725"
  invoicePattern: "1/001",
  invoiceSerial: "C26TSK", // Ký hiệu năm 2026 Thực phẩm Sơn Khang
  apiUrl: process.env.MEINVOICE_API_URL || "https://api.meinvoice.vn/api/v1",
};

/**
 * Chuyển đổi CentralOrder thành Yêu cầu phát hành HĐĐT meInvoice
 */
export function convertCentralOrderToMeInvoiceRequest(order: CentralOrder): MeInvoicePublishRequest {
  const now = new Date().toISOString().split("T")[0];
  let totalWithoutVat = 0;
  let totalVat = 0;

  const items = (order.items || []).map((item, index) => {
    const vatRateNum = parseInt(String(item.tax_rate || "").replace("%", "")) || 8;
    const vatRateName: "8%" | "10%" | "5%" | "KCT" = vatRateNum === 10 ? "10%" : vatRateNum === 5 ? "5%" : "8%";
    const amount = (item.price || 0) * (item.quantity || 0);
    const vatAmount = Math.round((amount * vatRateNum) / 100);

    totalWithoutVat += amount;
    totalVat += vatAmount;

    return {
      lineNumber: index + 1,
      itemName: item.name,
      unitName: item.dvt,
      quantity: item.quantity,
      unitPrice: item.price,
      amount,
      vatRateName,
      vatAmount,
    };
  });

  return {
    refId: order.alias_code,
    invoiceDate: now,
    buyerLegalName: order.customer_name,
    buyerTaxCode: order.customer_tax_code || undefined,
    buyerAddress: order.customer_address,
    buyerPhone: order.customer_phone,
    paymentMethodName: "TM/CK",
    items,
    totalAmountWithoutVAT: totalWithoutVat,
    totalVATAmount: totalVat,
    totalAmount: totalWithoutVat + totalVat,
  };
}

/**
 * Phát hành hóa đơn điện tử qua MISA meInvoice Bot OpenAPI
 */
export async function publishInvoiceFromOrder(
  order: CentralOrder,
  customConfig?: Partial<MeInvoiceBotConfig>
): Promise<MeInvoicePublishResult> {
  const cfg = { ...DEFAULT_MEINVOICE_CONFIG, ...customConfig };
  const req = convertCentralOrderToMeInvoiceRequest(order);

  try {
    if (process.env.MEINVOICE_LIVE === "true" && cfg.apiUrl) {
      const res = await fetch(`${cfg.apiUrl}/publish_invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-MISA-AppID": cfg.appId,
          "X-MISA-TaxCode": cfg.taxCode,
        },
        body: JSON.stringify(req),
      });

      if (res.ok) {
        const json = await res.json();
        return {
          success: true,
          transactionId: json.transaction_id,
          invoiceNo: json.invoice_no,
          taxAuthorityCode: json.tax_authority_code,
          viewUrl: json.view_url,
        };
      } else {
        const errText = await res.text();
        return {
          success: false,
          errorCode: `HTTP_${res.status}`,
          errorMessage: errText || "Lỗi phát hành HĐĐT meInvoice",
        };
      }
    }

    // Giả lập phát hành thành công có mã Cơ quan thuế
    const randomSeq = Math.floor(1000 + Math.random() * 9000);
    const invoiceNo = `HD-${randomSeq}`;
    const taxAuthorityCode = `001-26-SK-${randomSeq}99`;

    return {
      success: true,
      transactionId: `TX-${order.order_code}-${randomSeq}`,
      invoiceNo,
      taxAuthorityCode,
      viewUrl: `https://meinvoice.vn/tra-cuu?taxCode=${cfg.taxCode}&invNo=${invoiceNo}`,
    };
  } catch (err: any) {
    return {
      success: false,
      errorCode: "NETWORK_ERROR",
      errorMessage: err?.message || "Không thể kết nối meInvoice Bot",
    };
  }
}

/**
 * Tự động tải hóa đơn đầu vào từ Bot meInvoice (HĐ mua vào từ NCC)
 */
export async function fetchInwardInvoicesFromBot(options?: {
  fromDate?: string;
  toDate?: string;
}): Promise<MeInvoiceInwardInvoice[]> {
  // Mock danh mục hóa đơn đầu vào thực tế từ nhà cung cấp Sơn Khang
  return [
    {
      invoiceId: "INW-001",
      invoiceNumber: "0001892",
      sellerTaxCode: "0100109153",
      sellerName: "CÔNG TY CỔ PHẦN CHĂN NUÔI C.P. VIỆT NAM (CHI NHÁNH HN)",
      issueDate: "2026-10-08",
      totalAmount: 18500000,
      status: "verified",
    },
    {
      invoiceId: "INW-002",
      invoiceNumber: "0012401",
      sellerTaxCode: "0300481591",
      sellerName: "CÔNG TY CỔ PHẦN THỰC PHẨM CHOLIMEX",
      issueDate: "2026-10-07",
      totalAmount: 9800000,
      status: "verified",
    },
    {
      invoiceId: "INW-003",
      invoiceNumber: "0005432",
      sellerTaxCode: "0310245678",
      sellerName: "CÔNG TY TNHH KEWPIE VIỆT NAM",
      issueDate: "2026-10-06",
      totalAmount: 14200000,
      status: "verified",
    },
  ];
}
