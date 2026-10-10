/**
 * MISA AMIS KẾ TOÁN OPENAPI CLIENT
 * Tài liệu: https://developer.misa.vn/products-openapi/AMISKT?firstApi=1
 * Doanh nghiệp: CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: 0111252725)
 */

import { CentralOrder } from "../sapo/types";
import {
  MisaAmisConfig,
  MisaAmisSaleVoucher,
  MisaAmisSyncResult,
} from "./types";
import { COMPANY_PROFILE } from "@/packages/core/company";
import { generateBusinessCode } from "@/packages/core/aliases";

const DEFAULT_AMIS_CONFIG: MisaAmisConfig = {
  appId: process.env.MISA_AMIS_APP_ID || "sk-amis-open-app",
  accessCode: process.env.MISA_AMIS_ACCESS_CODE || "sk-amis-access-token",
  companyTaxCode: COMPANY_PROFILE.taxCode, // "0111252725"
  apiUrl: process.env.MISA_AMIS_API_URL || "https://api.amis.misa.vn/api/v1",
};

/**
 * Chuyển đổi CentralOrder thành Chứng từ bán hàng MISA AMIS Kế Toán
 */
export function convertCentralOrderToAmisVoucher(order: CentralOrder): MisaAmisSaleVoucher {
  const refNo = generateBusinessCode("MISA_AMIS_VOUCHER", parseInt(order.order_code.replace(/\D/g, "")) || 1);
  const now = new Date().toISOString().split("T")[0];

  let totalVat = 0;
  const items = order.items.map((item) => {
    const vatRate = parseInt(item.tax_rate.replace("%", "")) || 8;
    const amount = item.price * item.quantity;
    const vatAmount = Math.round((amount * vatRate) / 100);
    totalVat += vatAmount;

    return {
      inventoryItemCode: item.sku,
      inventoryItemName: item.name,
      unitName: item.dvt,
      quantity: item.quantity,
      unitPrice: item.price,
      amount,
      vatRate,
      vatAmount,
      debitAccount: "131", // Phải thu khách hàng B2B / Quán ăn
      creditAccount: "5111", // Doanh thu bán hàng hóa thực phẩm
    };
  });

  return {
    refNo,
    refDate: now,
    postedDate: now,
    accountObjectCode: order.customer_code,
    accountObjectName: order.customer_name,
    accountObjectAddress: order.customer_address,
    companyTaxCode: order.customer_tax_code || undefined,
    reason: `Bán buôn thực phẩm Sơn Khang theo đơn #${order.order_code} (${order.alias_code})`,
    totalAmount: order.total_amount,
    totalVatAmount: totalVat,
    items,
  };
}

/**
 * Đẩy chứng từ bán hàng sang MISA AMIS Kế Toán qua OpenAPI
 */
export async function syncOrderToAmis(
  order: CentralOrder,
  customConfig?: Partial<MisaAmisConfig>
): Promise<MisaAmisSyncResult> {
  const cfg = { ...DEFAULT_AMIS_CONFIG, ...customConfig };
  const voucher = convertCentralOrderToAmisVoucher(order);

  try {
    if (process.env.MISA_AMIS_LIVE === "true" && cfg.apiUrl) {
      const res = await fetch(`${cfg.apiUrl}/sa_invoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-MISA-AppID": cfg.appId,
          "X-MISA-AccessCode": cfg.accessCode,
          "X-MISA-TaxCode": cfg.companyTaxCode,
        },
        body: JSON.stringify(voucher),
      });

      if (res.ok) {
        const json = await res.json();
        return {
          success: true,
          voucherId: json.voucher_id || json.id,
          refNo: voucher.refNo,
        };
      } else {
        const errText = await res.text();
        return {
          success: false,
          refNo: voucher.refNo,
          errorCode: `HTTP_${res.status}`,
          errorMessage: errText || "Lỗi hạch toán AMIS Kế Toán",
        };
      }
    }

    // Mô phỏng đồng bộ thành công khi chạy môi trường dev/staging
    return {
      success: true,
      voucherId: `VOUCHER-${voucher.refNo}`,
      refNo: voucher.refNo,
    };
  } catch (err: any) {
    return {
      success: false,
      refNo: voucher.refNo,
      errorCode: "NETWORK_ERROR",
      errorMessage: err?.message || "Không thể kết nối máy chủ MISA AMIS",
    };
  }
}
