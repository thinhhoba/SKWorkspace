import { CentralOrder } from "../sapo/types";
import { isOrderExported } from "./ledgerDb";
import { ValidationSummary, ValidationError } from "./types";

export type MisaRowData = Record<string, string | number> & {
  external_id: string;
};

export function transformToMisaRows(orders: CentralOrder[]): {
  rows: MisaRowData[];
  validation: ValidationSummary;
} {
  const rows: MisaRowData[] = [];
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const duplicateExternalIds: string[] = [];

  let rowIndex = 0;

  for (const order of orders) {
    const isExported = isOrderExported(order.id);
    if (isExported) {
      duplicateExternalIds.push(order.id);
      warnings.push({
        row_index: rowIndex,
        external_id: order.id,
        column_key: "external_id",
        severity: "warning",
        message: `Đơn hàng ${order.id} đã từng được xuất vào MISA trước đây. Có thể bị trùng lặp chứng từ.`
      });
    }

    if (!order.customer_tax_code || order.customer_tax_code.trim() === "") {
      warnings.push({
        row_index: rowIndex,
        external_id: order.id,
        column_key: "mst",
        severity: "warning",
        message: `Khách hàng "${order.customer_name}" thiếu Mã số thuế (MST). Cần bổ sung trước khi phát hành HĐĐT.`
      });
    }

    // Duyệt qua từng dòng sản phẩm của đơn hàng
    for (const item of order.items) {
      if (item.sku === "UNKNOWN-SKU" || !item.sku) {
        errors.push({
          row_index: rowIndex,
          external_id: order.id,
          column_key: "ma_hang",
          severity: "error",
          message: `Sản phẩm "${item.name}" chưa được map SKU với danh mục vật tư MISA.`
        });
      }

      if (item.quantity <= 0) {
        errors.push({
          row_index: rowIndex,
          external_id: order.id,
          column_key: "so_luong",
          severity: "error",
          message: `Số lượng sản phẩm ${item.sku} phải lớn hơn 0.`
        });
      }

      const sl = item.quantity;
      const dg = item.price;
      const tt = sl * dg;
      const taxRateNum = parseInt(item.tax_rate.replace("%", ""), 10) || 8;
      const tienThue = Math.round((tt * taxRateNum) / 100);
      const tongTt = tt + tienThue;

      const row: MisaRowData = {
        ngay_ht: order.accounting_date,
        ngay_ct: order.created_date,
        so_ct: order.order_code,
        mst: order.customer_tax_code,
        ten_kh: order.customer_name,
        dia_chi: order.customer_address,
        dien_giai: order.note || `Bán buôn thực phẩm Sơn Khang cho ${order.customer_name}`,
        ma_kh: order.customer_code,
        nhom_kh: "B2B Thực Phẩm",
        chi_nhanh: order.branch,

        // Chi tiết
        ma_hang: item.sku,
        ten_hang: item.name,
        dvt: item.dvt,
        so_luong: sl,
        don_gia: dg,
        thanh_tien: tt,
        thue_suat: item.tax_rate,
        tien_thue: tienThue,
        tk_no: "131",
        tk_co: "5111",
        kho: order.branch,
        so_lo: item.lot_number || "L01",
        han_sd: item.expiry_date || "08/04/2027",
        ck_ty_le: "0%",
        ck_tien: 0,
        ngoai_te: "VND",
        ty_gia: 1,
        thanh_tien_qd: tt,
        tien_thue_qd: tienThue,
        tk_no_qd: "131",
        tk_co_qd: "5111",
        ghi_chu_dong: "",
        ma_ct_lq: "",
        cp_dong: 0,
        phi_khac: 0,

        // Tổng hợp
        tong_hang: tt,
        tong_thue: tienThue,
        tong_tt: tongTt,
        tong_ck: 0,
        tong_cp: 0,
        hinh_thuc: "Chuyển khoản",
        han_tt: "30 ngày",
        ck_hd_ty_le: "0%",
        ck_hd_tien: 0,
        con_phai_thu: tongTt,

        // Mở rộng
        chiet_khau: 0,
        cp_vc: 0,
        lo_han: `${item.lot_number || "L01"}·${item.expiry_date || "08/04/2027"}`,
        ghi_chu: order.note || "",
        nv_ban: "NV Kinh doanh Sơn Khang",
        kenh: "Sapo B2B",
        ma_nv: "NV-SK01",
        bo_phan: "Phòng Bán Hàng Sỉ",
        du_an: "",
        hop_dong: "",
        ngay_giao: order.created_date,
        dia_giao: order.customer_address,
        ghi_chu_giao: order.note || "",
        trang_thai: errors.length > 0 ? "Cần chuẩn hóa" : "Sẵn sàng",
        nguon: "Sapo",
        external_id: order.id,
        last_synced: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
        tich_hop: "Sapo→MISA"
      };

      rows.push(row);
      rowIndex++;
    }
  }

  const validation: ValidationSummary = {
    total_rows: rows.length,
    total_orders: orders.length,
    errors,
    warnings,
    duplicate_external_ids: duplicateExternalIds,
    is_exportable: errors.length === 0
  };

  return { rows, validation };
}
