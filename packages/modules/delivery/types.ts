export type RouteType = "noi_thanh_hn" | "chanh_xe_tinh";
export type TripStatus = "cho_xep_xe" | "dang_giao" | "da_giao" | "hoan_tat";
export type StopStatus = "cho_giao" | "dang_giao" | "da_giao" | "that_bai";

export const ROUTE_TYPE_LABEL: Record<RouteType, string> = {
  noi_thanh_hn: "Nội thành HN",
  chanh_xe_tinh: "Chành xe tỉnh",
};

export const ROUTE_TYPE_COLOR: Record<RouteType, string> = {
  noi_thanh_hn: "bg-sky-50 text-sky-700 border-sky-200",
  chanh_xe_tinh: "bg-amber-50 text-amber-700 border-amber-200",
};

export const TRIP_STATUS_LABEL: Record<TripStatus, string> = {
  cho_xep_xe: "Chờ xếp xe",
  dang_giao: "Đang giao",
  da_giao: "Đã giao",
  hoan_tat: "Hoàn tất",
};

export const TRIP_STATUS_COLOR: Record<TripStatus, string> = {
  cho_xep_xe: "bg-slate-100 text-slate-700 border-slate-200",
  dang_giao: "bg-sky-100 text-sky-700 border-sky-200",
  da_giao: "bg-violet-100 text-violet-700 border-violet-200",
  hoan_tat: "bg-emerald-100 text-emerald-700 border-emerald-200",
};

export const STOP_STATUS_LABEL: Record<StopStatus, string> = {
  cho_giao: "Chờ giao",
  dang_giao: "Đang giao",
  da_giao: "Đã giao",
  that_bai: "Thất bại",
};

export interface DeliveryStop {
  id: string;
  seq: number;
  customer: string;
  address: string;
  phone: string;
  thung_xop: number;
  amount_cod: number;
  status: StopStatus;
  note?: string;
}

export interface DeliveryTrip {
  id: string;
  code: string;
  driver: string;
  driver_phone: string;
  license_plate: string;
  route_type: RouteType;
  status: TripStatus;
  stops: DeliveryStop[];
  created_at: string;
  completed_at?: string;
  cod_account?: string;
}

export interface DeliveryStats {
  total_trips: number;
  dang_giao: number;
  hoan_tat: number;
  noi_thanh_count: number;
  chanh_xe_count: number;
  tong_thung_xop: number;
  tong_thu_ho: number;
}

export const DRIVER_NAME = "Ngô Văn Tân";
export const DRIVER_PHONE = "0942 22 60 60";
export const WAREHOUSE_ADDRESS = "Kho Tổng Định Công — Số 96 Ngõ 337 Phố Định Công, P. Định Công, Hoàng Mai, Hà Nội";
export const COLLECTION_ACCOUNT = "Techcombank 22226060 — CONG TY TNHH THUC PHAM SON KHANG";
export const BEN_XE_LABELS = ["Bến xe Giáp Bát", "Bến xe Nước Ngầm", "Bến xe Mỹ Đình", "Bến xe Gia Lâm"] as const;
