import type { DeliveryTrip, DeliveryStats, RouteType, TripStatus, StopStatus } from "./types";
import { MOCK_DELIVERY_TRIPS } from "./mockData";
import { DRIVER_NAME, DRIVER_PHONE, WAREHOUSE_ADDRESS, COLLECTION_ACCOUNT } from "./types";
import { buildOrderVietQr } from "@/packages/modules/payment/vietqr";

let deliveryStore: DeliveryTrip[] = MOCK_DELIVERY_TRIPS.map((t) => ({ ...t, stops: t.stops.map((s) => ({ ...s })) }));
let seqCounter = 110;

export function getDeliveryTrips(filters?: { route_type?: string; status?: string; search?: string }): DeliveryTrip[] {
  let list = [...deliveryStore];
  if (filters?.route_type && filters.route_type !== "ALL") list = list.filter((t) => t.route_type === filters.route_type);
  if (filters?.status && filters.status !== "ALL") list = list.filter((t) => t.status === filters.status);
  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter(
      (t) =>
        t.code.toLowerCase().includes(q) ||
        t.driver.toLowerCase().includes(q) ||
        t.license_plate.toLowerCase().includes(q) ||
        t.stops.some((s) => s.customer.toLowerCase().includes(q)),
    );
  }
  return list;
}

export function getDeliveryTripById(id: string): DeliveryTrip | undefined {
  return deliveryStore.find((t) => t.id === id || t.code === id);
}

export function getDeliveryStats(): DeliveryStats {
  const total_trips = deliveryStore.length;
  const dang_giao = deliveryStore.filter((t) => t.status === "dang_giao").length;
  const hoan_tat = deliveryStore.filter((t) => t.status === "hoan_tat").length;
  const noi_thanh_count = deliveryStore.filter((t) => t.route_type === "noi_thanh_hn").length;
  const chanh_xe_count = deliveryStore.filter((t) => t.route_type === "chanh_xe_tinh").length;
  let tong_thung_xop = 0;
  let tong_thu_ho = 0;
  for (const t of deliveryStore) {
    for (const s of t.stops) {
      tong_thung_xop += s.thung_xop;
      tong_thu_ho += s.amount_cod;
    }
  }
  return { total_trips, dang_giao, hoan_tat, noi_thanh_count, chanh_xe_count, tong_thung_xop, tong_thu_ho };
}

export function createDeliveryTrip(input: {
  route_type: RouteType;
  license_plate: string;
  stops: Array<{ customer: string; address: string; phone: string; thung_xop: number; amount_cod: number; note?: string }>;
}): DeliveryTrip {
  if (!input.route_type || !["noi_thanh_hn", "chanh_xe_tinh"].includes(input.route_type)) throw new Error("Loại tuyến không hợp lệ");
  if (!input.license_plate?.trim()) throw new Error("Thiếu biển số xe");
  if (!input.stops?.length) throw new Error("Chuyến phải có ít nhất 1 điểm dừng");
  const id = `do-${String(++seqCounter).padStart(2, "0")}`;
  const code = `SK-DO-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}${String(seqCounter).slice(-2)}`;
  const trip: DeliveryTrip = {
    id,
    code,
    driver: DRIVER_NAME,
    driver_phone: DRIVER_PHONE,
    license_plate: input.license_plate.trim(),
    route_type: input.route_type,
    status: "cho_xep_xe",
    created_at: new Date().toLocaleDateString("vi-VN"),
    cod_account: "Techcombank 22226060",
    stops: input.stops.map((s, idx) => ({
      id: `${id}-s${idx + 1}`,
      seq: idx + 1,
      customer: s.customer,
      address: s.address,
      phone: s.phone,
      thung_xop: s.thung_xop,
      amount_cod: s.amount_cod,
      status: "cho_giao" as StopStatus,
      note: s.note,
    })),
  };
  deliveryStore.unshift(trip);
  return trip;
}

export function updateTripStatus(id: string, status: TripStatus): DeliveryTrip {
  const trip = deliveryStore.find((t) => t.id === id || t.code === id);
  if (!trip) throw new Error(`Không tìm thấy chuyến ${id}`);
  const allowed: TripStatus[] = ["cho_xep_xe", "dang_giao", "da_giao", "hoan_tat"];
  if (!allowed.includes(status)) throw new Error(`Trạng thái không hợp lệ: ${status}`);
  trip.status = status;
  if (status === "hoan_tat") trip.completed_at = new Date().toLocaleDateString("vi-VN");
  return { ...trip, stops: trip.stops.map((s) => ({ ...s })) };
}

export function updateStopStatus(tripId: string, stopId: string, status: StopStatus): DeliveryTrip {
  const trip = deliveryStore.find((t) => t.id === tripId || t.code === tripId);
  if (!trip) throw new Error(`Không tìm thấy chuyến ${tripId}`);
  const stop = trip.stops.find((s) => s.id === stopId);
  if (!stop) throw new Error(`Không tìm thấy điểm dừng ${stopId}`);
  const allowed: StopStatus[] = ["cho_giao", "dang_giao", "da_giao", "that_bai"];
  if (!allowed.includes(status)) throw new Error(`Trạng thái điểm dừng không hợp lệ: ${status}`);
  stop.status = status;
  // Auto-sync trip status
  const allDone = trip.stops.every((s) => s.status === "da_giao");
  const anyDoing = trip.stops.some((s) => s.status === "dang_giao" || s.status === "da_giao");
  if (allDone) trip.status = "da_giao";
  else if (anyDoing && trip.status === "cho_xep_xe") trip.status = "dang_giao";
  return { ...trip, stops: trip.stops.map((s) => ({ ...s })) };
}

export function generateChanhXeSlip(tripId: string, stopId?: string): string {
  const trip = deliveryStore.find((t) => t.id === tripId || t.code === tripId);
  if (!trip) throw new Error(`Không tìm thấy chuyến ${tripId}`);
  const stops = stopId ? trip.stops.filter((s) => s.id === stopId) : trip.stops;
  if (!stops.length) throw new Error("Không có điểm dừng phù hợp");
  const lines: string[] = [];
  lines.push(`════════════════════════════════`);
  lines.push(`  PHIẾU GỬI CHÀNH XE — SƠN KHANG FOOD`);
  lines.push(`════════════════════════════════`);
  lines.push(`Mã chuyến: ${trip.code} | ${trip.status.toUpperCase()}`);
  lines.push(`Tài xế: ${trip.driver} — ${trip.driver_phone}`);
  lines.push(`Xe: ${trip.license_plate} | Tuyến: ${trip.route_type === "chanh_xe_tinh" ? "Chành xe tỉnh" : "Nội thành HN"}`);
  lines.push(`Kho xuất: ${WAREHOUSE_ADDRESS}`);
  lines.push(`────────────────────────────────`);
  for (const s of stops) {
    lines.push(`Điểm #${s.seq} — ${s.customer}`);
    lines.push(`  Địa chỉ/Bến: ${s.address}`);
    lines.push(`  LH: ${s.phone} | Thùng xốp: ${s.thung_xop} | Thu hộ: ${s.amount_cod.toLocaleString("vi-VN")} ₫`);
    if (s.note) lines.push(`  Ghi chú: ${s.note}`);
    if (trip.route_type === "chanh_xe_tinh") lines.push(`  ⚠️ CK 100% trước khi xuất kho — Không COD qua xe khách`);
    try {
      const qr = buildOrderVietQr(trip.code, s.amount_cod);
      lines.push(`  VietQR: ${qr}`);
    } catch {
      // ignore
    }
    lines.push(`  STK thu hộ: ${COLLECTION_ACCOUNT}`);
    lines.push(`────────────────────────────────`);
  }
  lines.push(`Hotline: 0942 22 60 60 | sonkhang.vn`);
  lines.push(`════════════════════════════════`);
  return lines.join("\n");
}

export function __resetDeliveryStore(): void {
  deliveryStore = MOCK_DELIVERY_TRIPS.map((t) => ({ ...t, stops: t.stops.map((s) => ({ ...s })) }));
  seqCounter = 110;
}
