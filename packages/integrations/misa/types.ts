import { MisaColumn } from "@/constants/misaColumns";

export interface LedgerEntry {
  external_id: string; // Mã đơn Sapo (vd: SP-0841)
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
