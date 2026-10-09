import * as XLSX from "xlsx";
import { MISA_COLS } from "@/constants/misaColumns";
import { MisaRowData } from "./misaTransformer";
import { recordExportedOrders } from "./ledgerDb";

export function generateMisaExcelBuffer(rows: MisaRowData[], fileName?: string): Uint8Array {
  // Chuẩn bị dữ liệu mảng 2 chiều với dòng đầu là label của 63 cột
  const headers = MISA_COLS.map((col) => col.label);
  const data: (string | number)[][] = [headers];

  for (const row of rows) {
    const rowValues = MISA_COLS.map((col) => {
      const val = row[col.key];
      if (val === undefined || val === null) return "";
      return val;
    });
    data.push(rowValues);
  }

  // Tạo Worksheet và Workbook SheetJS
  const ws = XLSX.utils.aoa_to_sheet(data);

  // Đặt độ rộng cột mặc định phù hợp
  const colWidths = MISA_COLS.map((col) => {
    if (col.key === "ten_kh" || col.key === "dia_chi" || col.key === "ten_hang") {
      return { wch: 30 };
    }
    if (col.key === "so_ct" || col.key === "mst" || col.key === "ma_hang") {
      return { wch: 18 };
    }
    return { wch: 15 };
  });
  ws["!cols"] = colWidths;

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "ChungTuBanHang");

  // Ghi nhận vào Ledger DB để chống trùng lặp trong tương lai
  const uniqueOrders = new Map<string, MisaRowData>();
  for (const r of rows) {
    if (!uniqueOrders.has(r.external_id)) {
      uniqueOrders.set(r.external_id, r);
    }
  }

  const ledgerEntries = Array.from(uniqueOrders.values()).map((r) => ({
    external_id: r.external_id,
    order_code: String(r.so_ct || r.external_id),
    customer_name: String(r.ten_kh || ""),
    total_amount: Number(r.tong_tt || 0),
    exported_at: new Date().toISOString(),
    file_name: fileName || `MISA_63COT_${Date.now()}.xlsx`,
    exported_by: "Kế toán SK Workspace"
  }));

  recordExportedOrders(ledgerEntries);

  // Xuất ra buffer binary xlsx
  const buffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return buffer;
}
