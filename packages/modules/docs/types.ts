export type DocCategory = "legal" | "cert" | "contract_template";

export const DOC_CATEGORY_LABEL: Record<DocCategory, string> = {
  legal: "Pháp lý doanh nghiệp",
  cert: "Chứng nhận ATTP & Kiểm dịch",
  contract_template: "Hợp đồng B2B & Biểu mẫu",
};

export const DOC_CATEGORY_COLOR: Record<DocCategory, string> = {
  legal: "bg-sky-100 text-sky-700 border-sky-200",
  cert: "bg-emerald-100 text-emerald-700 border-emerald-200",
  contract_template: "bg-amber-100 text-amber-700 border-amber-200",
};

export const DOC_CATEGORY_TAB: { value: DocCategory | "ALL"; label: string }[] = [
  { value: "ALL", label: "Tất cả" },
  { value: "legal", label: "Pháp lý doanh nghiệp" },
  { value: "cert", label: "Chứng nhận ATTP & Kiểm dịch" },
  { value: "contract_template", label: "Hợp đồng B2B & Biểu mẫu" },
];

export type DocFileType = "pdf" | "docx" | "xlsx";

export const DOC_FILE_TYPE_LABEL: Record<DocFileType, string> = {
  pdf: "PDF",
  docx: "DOCX",
  xlsx: "XLSX",
};

export interface DocRecord {
  id: string;
  code: string;
  title: string;
  category: DocCategory;
  issuer: string;
  issue_date: string;
  file_name: string;
  file_type: DocFileType;
  file_size_kb: number;
  storage_path: string;
  description?: string;
  tags?: string[];
}

export interface CompanyLegalProfile {
  ten_doanh_nghiep: string;
  ten_tieng_anh: string;
  ten_viet_tat: string;
  mst: string;
  ngay_cap_lan_dau: string;
  loai_hinh: string;
  von_dieu_le: string;
  dia_chi_tru_so: string;
  dia_chi_kinh_doanh: string;
  ma_dia_diem_kd: string;
  nguoi_dai_dien: string;
  chuc_danh: string;
  cccd: string;
  co_quan_thue: string;
  ke_toan_thue: string;
  sdt_ke_toan: string;
  ngan_hang: string;
  so_tai_khoan: string;
  email: string;
  website: string;
  dien_thoai: string;
}

export interface DocStats {
  legalCount: number;
  certCount: number;
  contractCount: number;
  totalCount: number;
  totalSizeKb: number;
  byCategory: Record<DocCategory, number>;
}
