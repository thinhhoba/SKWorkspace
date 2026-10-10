import { InventoryItem, StockTransfer, StockStatus, StorageTempZone, WarehouseCode } from "./types";

function calcDays(expiry: string): number {
  const [d, m, y] = expiry.split("/").map(Number);
  const exp = new Date(y, m - 1, d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((exp.getTime() - now.getTime()) / 86400000);
}

function statusOf(qty: number, min: number, days: number): { status: StockStatus; status_label: string; is_near_expiry: boolean } {
  const near = days < 30;
  if (near) return { status: "can-han", status_label: "Cận hạn (<30n)", is_near_expiry: true };
  if (qty <= min * 0.3) return { status: "thieu", status_label: "Thiếu hàng", is_near_expiry: false };
  if (qty <= min) return { status: "sap-thieu", status_label: "Sắp thiếu", is_near_expiry: false };
  return { status: "du", status_label: "Đủ tồn", is_near_expiry: false };
}

function mk(p: Omit<InventoryItem, "days_until_expiry" | "is_near_expiry" | "status" | "status_label" | "total_value"> & { expiry_date: string }): InventoryItem {
  const days = calcDays(p.expiry_date);
  const s = statusOf(p.quantity, p.min_stock, days);
  return { ...p, days_until_expiry: days, is_near_expiry: s.is_near_expiry, status: s.status, status_label: s.status_label, total_value: p.quantity * p.unit_price };
}

const DC: WarehouseCode = "KHO_DINH_CONG";
const YB: WarehouseCode = "KHO_YEN_BINH";

export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  // ── KHO ĐÔNG LẠNH -18°C (Định Công) ──
  mk({ id: "INV-DC-01", sku: "LC-VIEN-CHIEN-500", name: "Viên chiên LC Foods 500g (45 viên)", category: "Đông lạnh", dvt: "gói", warehouse: DC, warehouse_name: "Kho Tổng Định Công", quantity: 180, min_stock: 100, max_stock: 400, temperature: "-18°C", temp_zone: "dong_lanh", lot_number: "L2609-12", production_date: "12/09/2026", expiry_date: "12/03/2027", location: "Hầm Đông A1" , unit_price: 47000 }),
  mk({ id: "INV-DC-02", sku: "CP-GA-POP-1KG", name: "Gà viên chiên Popcorn CP 1kg", category: "Đông lạnh", dvt: "túi", warehouse: DC, warehouse_name: "Kho Tổng Định Công", quantity: 45, min_stock: 80, max_stock: 250, temperature: "-18°C", temp_zone: "dong_lanh", lot_number: "L2608-20", production_date: "20/08/2026", expiry_date: "20/02/2027", location: "Hầm Đông A2", unit_price: 117000 }),
  mk({ id: "INV-DC-03", sku: "DM-NEM-RAN-500", name: "Nem chua rán Đức Minh 500g (20 chiếc)", category: "Đông lạnh", dvt: "hộp", warehouse: DC, warehouse_name: "Kho Tổng Định Công", quantity: 95, min_stock: 60, max_stock: 200, temperature: "-18°C", temp_zone: "dong_lanh", lot_number: "L2609-28", production_date: "28/09/2026", expiry_date: "28/03/2027", location: "Hầm Đông A3", unit_price: 62000 }),
  mk({ id: "INV-DC-04", sku: "DOI-SUN-500", name: "Dồi sụn Hà Thành 500g (10 chiếc)", category: "Đông lạnh", dvt: "gói", warehouse: DC, warehouse_name: "Kho Tổng Định Công", quantity: 8, min_stock: 50, max_stock: 180, temperature: "-18°C", temp_zone: "dong_lanh", lot_number: "L2607-15", production_date: "15/07/2026", expiry_date: "15/01/2027", location: "Hầm Đông B1", unit_price: 55000 }),
  mk({ id: "INV-DC-05", sku: "KHOAI-TAY-1KG", name: "Khoai tây chiên cọng Bỉ 1kg", category: "Đông lạnh", dvt: "túi", warehouse: DC, warehouse_name: "Kho Tổng Định Công", quantity: 120, min_stock: 60, max_stock: 220, temperature: "-18°C", temp_zone: "dong_lanh", lot_number: "L2609-10", production_date: "10/09/2026", expiry_date: "10/09/2027", location: "Hầm Đông B2", unit_price: 68000 }),
  mk({ id: "INV-DC-06", sku: "CHA-MUC-XOAN-2KG5", name: "Chả mực xoắn ống Deli 2.5kg (178 viên)", category: "Đông lạnh", dvt: "túi", warehouse: DC, warehouse_name: "Kho Tổng Định Công", quantity: 32, min_stock: 30, max_stock: 100, temperature: "-18°C", temp_zone: "dong_lanh", lot_number: "L2608-05", production_date: "05/08/2026", expiry_date: "05/11/2026", location: "Hầm Đông C1", unit_price: 180000 }),
  // ── KHO MÁT 0~4°C (Định Công) ──
  mk({ id: "INV-DC-07", sku: "TOKBOKKI-500", name: "Bánh gạo Tokbokki 500g (CJ)", category: "Kho mát", dvt: "gói", warehouse: DC, warehouse_name: "Kho Tổng Định Công", quantity: 210, min_stock: 100, max_stock: 350, temperature: "0°C ~ 4°C", temp_zone: "kho_mat", lot_number: "L2610-01", production_date: "01/10/2026", expiry_date: "01/12/2026", location: "Kho Mát M1", unit_price: 38000 }),
  mk({ id: "INV-DC-08", sku: "XUC-XICH-CP-500", name: "Xúc xích CP Cocktail 500g", category: "Kho mát", dvt: "gói", warehouse: DC, warehouse_name: "Kho Tổng Định Công", quantity: 75, min_stock: 80, max_stock: 250, temperature: "0°C ~ 4°C", temp_zone: "kho_mat", lot_number: "L2610-03", production_date: "03/10/2026", expiry_date: "03/11/2026", location: "Kho Mát M2", unit_price: 52000 }),
  mk({ id: "INV-DC-09", sku: "KIMCHI-1KG", name: "Kim chi cải thảo Bibigo 1kg", category: "Kho mát", dvt: "hộp", warehouse: DC, warehouse_name: "Kho Tổng Định Công", quantity: 40, min_stock: 50, max_stock: 150, temperature: "0°C ~ 4°C", temp_zone: "kho_mat", lot_number: "L2609-20", production_date: "20/09/2026", expiry_date: "20/10/2026", location: "Kho Mát M3", unit_price: 65000 }),
  mk({ id: "INV-DC-10", sku: "SOT-MI-TRON-200", name: "Sốt mì trộn Indomie 200ml", category: "Kho mát", dvt: "chai", warehouse: DC, warehouse_name: "Kho Tổng Định Công", quantity: 300, min_stock: 150, max_stock: 500, temperature: "0°C ~ 4°C", temp_zone: "kho_mat", lot_number: "L2609-01", production_date: "01/09/2026", expiry_date: "01/09/2027", location: "Kho Mát M4", unit_price: 18000 }),
  // ── KHO KHÔ THƯỜNG (Định Công) ──
  mk({ id: "INV-DC-11", sku: "MI-INDOMIE-40", name: "Mì trộn Indomie Đặc Biệt 85g (Thùng 40 gói)", category: "Kho khô", dvt: "thùng", warehouse: DC, warehouse_name: "Kho Tổng Định Công", quantity: 320, min_stock: 150, max_stock: 600, temperature: "Thường", temp_zone: "kho_kho", lot_number: "L2609-15", production_date: "15/09/2026", expiry_date: "15/09/2027", location: "Kệ K1-01", unit_price: 165000 }),
  mk({ id: "INV-DC-12", sku: "MI-KORENO-24", name: "Mì Koreno Jjajangmen 115g (Thùng 24 gói)", category: "Kho khô", dvt: "thùng", warehouse: DC, warehouse_name: "Kho Tổng Định Công", quantity: 180, min_stock: 100, max_stock: 400, temperature: "Thường", temp_zone: "kho_kho", lot_number: "L2608-10", production_date: "10/08/2026", expiry_date: "10/08/2027", location: "Kệ K1-02", unit_price: 106000 }),
  // ── YÊN BÌNH ──
  mk({ id: "INV-YB-01", sku: "LC-VIEN-CHIEN-500", name: "Viên chiên LC Foods 500g (45 viên)", category: "Đông lạnh", dvt: "gói", warehouse: YB, warehouse_name: "Kho Vệ Tinh Yên Bình", quantity: 260, min_stock: 80, max_stock: 500, temperature: "-18°C", temp_zone: "dong_lanh", lot_number: "L2609-12", production_date: "12/09/2026", expiry_date: "12/03/2027", location: "Hầm Đông Y1", unit_price: 47000 }),
  mk({ id: "INV-YB-02", sku: "CP-GA-POP-1KG", name: "Gà viên chiên Popcorn CP 1kg", category: "Đông lạnh", dvt: "túi", warehouse: YB, warehouse_name: "Kho Vệ Tinh Yên Bình", quantity: 110, min_stock: 50, max_stock: 300, temperature: "-18°C", temp_zone: "dong_lanh", lot_number: "L2608-20", production_date: "20/08/2026", expiry_date: "20/02/2027", location: "Hầm Đông Y2", unit_price: 117000 }),
  mk({ id: "INV-YB-03", sku: "TOKBOKKI-500", name: "Bánh gạo Tokbokki 500g (CJ)", category: "Kho mát", dvt: "gói", warehouse: YB, warehouse_name: "Kho Vệ Tinh Yên Bình", quantity: 90, min_stock: 60, max_stock: 200, temperature: "0°C ~ 4°C", temp_zone: "kho_mat", lot_number: "L2610-01", production_date: "01/10/2026", expiry_date: "01/12/2026", location: "Kho Mát Y1", unit_price: 38000 }),
  mk({ id: "INV-YB-04", sku: "MI-INDOMIE-40", name: "Mì trộn Indomie Đặc Biệt 85g (Thùng 40 gói)", category: "Kho khô", dvt: "thùng", warehouse: YB, warehouse_name: "Kho Vệ Tinh Yên Bình", quantity: 540, min_stock: 200, max_stock: 800, temperature: "Thường", temp_zone: "kho_kho", lot_number: "L2609-15", production_date: "15/09/2026", expiry_date: "15/03/2027", location: "Kệ Y1-01", unit_price: 165000 }),
  mk({ id: "INV-YB-05", sku: "MI-NISSIN-30", name: "Mì Nissin Raoh 100g (Thùng 30 gói)", category: "Kho khô", dvt: "thùng", warehouse: YB, warehouse_name: "Kho Vệ Tinh Yên Bình", quantity: 85, min_stock: 60, max_stock: 250, temperature: "Thường", temp_zone: "kho_kho", lot_number: "L2609-05", production_date: "05/09/2026", expiry_date: "05/09/2027", location: "Kệ Y1-02", unit_price: 132000 }),
  mk({ id: "INV-YB-06", sku: "TUONG-OT-SG-2L", name: "Tương ớt Sài Gòn Can 2L (Thùng 6 can)", category: "Kho khô", dvt: "thùng", warehouse: YB, warehouse_name: "Kho Vệ Tinh Yên Bình", quantity: 65, min_stock: 40, max_stock: 150, temperature: "Thường", temp_zone: "kho_kho", lot_number: "L2608-18", production_date: "18/08/2026", expiry_date: "18/08/2027", location: "Kệ Y2-01", unit_price: 196000 }),
  mk({ id: "INV-YB-07", sku: "TUONG-CA-SG-2L", name: "Tương cà Sài Gòn Can 2L", category: "Kho khô", dvt: "can", warehouse: YB, warehouse_name: "Kho Vệ Tinh Yên Bình", quantity: 48, min_stock: 30, max_stock: 120, temperature: "Thường", temp_zone: "kho_kho", lot_number: "L2608-18", production_date: "18/08/2026", expiry_date: "18/08/2027", location: "Kệ Y2-02", unit_price: 185000 }),
  mk({ id: "INV-YB-08", sku: "MAYO-KEWPIE-1KG", name: "Mayonnaise Kewpie 1kg", category: "Kho khô", dvt: "chai", warehouse: YB, warehouse_name: "Kho Vệ Tinh Yên Bình", quantity: 110, min_stock: 50, max_stock: 200, temperature: "Thường", temp_zone: "kho_kho", lot_number: "L2609-08", production_date: "08/09/2026", expiry_date: "08/09/2027", location: "Kệ Y3-01", unit_price: 89000 }),
  mk({ id: "INV-YB-09", sku: "DAU-AN-5L", name: "Dầu ăn Cái Lân 5L", category: "Kho khô", dvt: "can", warehouse: YB, warehouse_name: "Kho Vệ Tinh Yên Bình", quantity: 70, min_stock: 40, max_stock: 160, temperature: "Thường", temp_zone: "kho_kho", lot_number: "L2607-20", production_date: "20/07/2026", expiry_date: "20/07/2027", location: "Kệ Y3-02", unit_price: 145000 }),
  mk({ id: "INV-YB-10", sku: "BANH-GA-800", name: "Bánh gà Nét Việt 800g (18 chiếc)", category: "Đông lạnh", dvt: "hộp", warehouse: YB, warehouse_name: "Kho Vệ Tinh Yên Bình", quantity: 95, min_stock: 60, max_stock: 200, temperature: "-18°C", temp_zone: "dong_lanh", lot_number: "L2609-25", production_date: "25/09/2026", expiry_date: "25/12/2026", location: "Hầm Đông Y3", unit_price: 60000 }),
];

export const INITIAL_TRANSFERS: StockTransfer[] = [
  { id: "TRF-001", code: "SK-DC-261009-0001", from_warehouse: YB, to_warehouse: DC, sku: "LC-VIEN-CHIEN-500", item_name: "Viên chiên LC Foods 500g", quantity: 80, dvt: "gói", lot_number: "L2609-12", created_at: "09/10/2026 08:30", created_by: "Trần Thị Ngọc Thúy (Thủ kho)", status: "in_transit", status_label: "Đang vận chuyển", note: "Xe lạnh SK-02 điều chuyển bù tồn Định Công" },
  { id: "TRF-002", code: "SK-DC-261008-0002", from_warehouse: YB, to_warehouse: DC, sku: "MI-INDOMIE-40", item_name: "Mì trộn Indomie Đặc Biệt 85g", quantity: 50, dvt: "thùng", lot_number: "L2609-15", created_at: "08/10/2026 15:00", created_by: "Trần Thị Ngọc Thúy", status: "completed", status_label: "Đã nhập kho Định Công", note: "Đã kiểm đếm đủ 50 thùng" },
];
