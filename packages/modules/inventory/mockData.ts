import { InventoryItem, StockTransfer, StockStatus } from "./types";

function calculateStatus(quantity: number, minStock: number, daysUntilExpiry: number): { status: StockStatus; status_label: string } {
  if (daysUntilExpiry <= 30) {
    return { status: "can-han", status_label: "Cận hạn (<30n)" };
  }
  if (quantity <= minStock * 0.3) {
    return { status: "thieu", status_label: "Thiếu hàng" };
  }
  if (quantity <= minStock) {
    return { status: "sap-thieu", status_label: "Sắp thiếu" };
  }
  return { status: "du", status_label: "Đủ tồn" };
}

export const INITIAL_INVENTORY_ITEMS: InventoryItem[] = [
  // Kho Q7 (Kho bán lẻ & sỉ trung tâm)
  {
    id: "INV-Q7-001",
    sku: "HEO-XAY-500",
    name: "Thịt heo xay tươi 500g (Sơn Khang)",
    category: "Thịt tươi",
    dvt: "khay",
    warehouse: "Q7",
    warehouse_name: "Kho Lạnh Q7",
    quantity: 12, // Thiếu tồn
    min_stock: 50,
    max_stock: 120,
    temperature: "-2°C ~ 2°C",
    lot_number: "L2610-08",
    production_date: "08/10/2026",
    expiry_date: "15/10/2026",
    days_until_expiry: 6,
    location: "Kệ A1-02",
    unit_price: 82000,
    total_value: 984000,
    ...calculateStatus(12, 50, 6)
  },
  {
    id: "INV-Q7-002",
    sku: "BO-VIEN-1K",
    name: "Bò viên gân đặc biệt 1kg",
    category: "Thực phẩm chế biến",
    dvt: "gói",
    warehouse: "Q7",
    warehouse_name: "Kho Lạnh Q7",
    quantity: 60, // Sắp thiếu
    min_stock: 80,
    max_stock: 200,
    temperature: "-18°C",
    lot_number: "L2609-15",
    production_date: "15/09/2026",
    expiry_date: "15/03/2027",
    days_until_expiry: 157,
    location: "Kệ B2-01",
    unit_price: 185000,
    total_value: 11100000,
    ...calculateStatus(60, 80, 157)
  },
  {
    id: "INV-Q7-003",
    sku: "CHA-LUA-500",
    name: "Chả lụa truyền thống 500g",
    category: "Thực phẩm chế biến",
    dvt: "cây",
    warehouse: "Q7",
    warehouse_name: "Kho Lạnh Q7",
    quantity: 200, // Đủ
    min_stock: 100,
    max_stock: 300,
    temperature: "0°C ~ 4°C",
    lot_number: "L2610-05",
    production_date: "05/10/2026",
    expiry_date: "05/11/2026",
    days_until_expiry: 27, // Cận hạn
    location: "Kệ C1-04",
    unit_price: 95000,
    total_value: 19000000,
    ...calculateStatus(200, 100, 27)
  },
  {
    id: "INV-Q7-004",
    sku: "BAROI-RUT-SUON",
    name: "Ba rọi heo rút sườn đông lạnh",
    category: "Thịt đông lạnh",
    dvt: "kg",
    warehouse: "Q7",
    warehouse_name: "Kho Lạnh Q7",
    quantity: 140, // Đủ
    min_stock: 80,
    max_stock: 250,
    temperature: "-18°C",
    lot_number: "L2609-20",
    production_date: "20/09/2026",
    expiry_date: "20/09/2027",
    days_until_expiry: 345,
    location: "Kệ A3-01",
    unit_price: 140000,
    total_value: 19600000,
    ...calculateStatus(140, 80, 345)
  },
  {
    id: "INV-Q7-005",
    sku: "GIO-THU-500",
    name: "Giò thủ truyền thống 500g",
    category: "Thực phẩm chế biến",
    dvt: "cây",
    warehouse: "Q7",
    warehouse_name: "Kho Lạnh Q7",
    quantity: 35, // Sắp thiếu
    min_stock: 50,
    max_stock: 150,
    temperature: "0°C ~ 4°C",
    lot_number: "L2610-02",
    production_date: "02/10/2026",
    expiry_date: "02/11/2026",
    days_until_expiry: 24, // Cận hạn
    location: "Kệ C2-03",
    unit_price: 110000,
    total_value: 3850000,
    ...calculateStatus(35, 50, 24)
  },

  // Kho Q12 (Kho tổng pha lóc & sơ chế)
  {
    id: "INV-Q12-001",
    sku: "HEO-XAY-500",
    name: "Thịt heo xay tươi 500g (Sơn Khang)",
    category: "Thịt tươi",
    dvt: "khay",
    warehouse: "Q12",
    warehouse_name: "Kho Tổng Q12",
    quantity: 280, // Đủ tồn, sẵn sàng chuyển về Q7
    min_stock: 100,
    max_stock: 500,
    temperature: "-2°C ~ 2°C",
    lot_number: "L2610-08",
    production_date: "08/10/2026",
    expiry_date: "15/10/2026",
    days_until_expiry: 6,
    location: "Dãy P1-Khay",
    unit_price: 82000,
    total_value: 22960000,
    ...calculateStatus(280, 100, 6)
  },
  {
    id: "INV-Q12-002",
    sku: "BO-VIEN-1K",
    name: "Bò viên gân đặc biệt 1kg",
    category: "Thực phẩm chế biến",
    dvt: "gói",
    warehouse: "Q12",
    warehouse_name: "Kho Tổng Q12",
    quantity: 450, // Đủ tồn
    min_stock: 150,
    max_stock: 800,
    temperature: "-18°C",
    lot_number: "L2609-15",
    production_date: "15/09/2026",
    expiry_date: "15/03/2027",
    days_until_expiry: 157,
    location: "Hầm Đông H1",
    unit_price: 185000,
    total_value: 83250000,
    ...calculateStatus(450, 150, 157)
  },
  {
    id: "INV-Q12-003",
    sku: "SUON-NON-HEO",
    name: "Sườn non heo đông lạnh nhập khẩu",
    category: "Thịt đông lạnh",
    dvt: "kg",
    warehouse: "Q12",
    warehouse_name: "Kho Tổng Q12",
    quantity: 620, // Đủ tồn
    min_stock: 200,
    max_stock: 1000,
    temperature: "-18°C",
    lot_number: "L2608-25",
    production_date: "25/08/2026",
    expiry_date: "25/08/2027",
    days_until_expiry: 319,
    location: "Hầm Đông H2",
    unit_price: 155000,
    total_value: 96100000,
    ...calculateStatus(620, 200, 319)
  },
  {
    id: "INV-Q12-004",
    sku: "XUONG-ONG-HEO",
    name: "Xương ống heo tươi hầm nước dùng",
    category: "Thịt tươi",
    dvt: "kg",
    warehouse: "Q12",
    warehouse_name: "Kho Tổng Q12",
    quantity: 25, // Thiếu tồn
    min_stock: 100,
    max_stock: 350,
    temperature: "0°C ~ 4°C",
    lot_number: "L2610-09",
    production_date: "09/10/2026",
    expiry_date: "12/10/2026",
    days_until_expiry: 3,
    location: "Bàn Sơ Chế S1",
    unit_price: 45000,
    total_value: 1125000,
    ...calculateStatus(25, 100, 3)
  }
];

export const INITIAL_TRANSFERS: StockTransfer[] = [
  {
    id: "TRF-001",
    code: "DC-2610-001",
    from_warehouse: "Q12",
    to_warehouse: "Q7",
    sku: "HEO-XAY-500",
    item_name: "Thịt heo xay tươi 500g",
    quantity: 80,
    dvt: "khay",
    lot_number: "L2610-08",
    created_at: "09/10/2026 08:30",
    created_by: "Nguyễn Văn Hùng (Thủ kho Q12)",
    status: "in_transit",
    status_label: "Đang vận chuyển",
    note: "Xe lạnh SK-02 điều chuyển bù tồn Q7"
  },
  {
    id: "TRF-002",
    code: "DC-2610-002",
    from_warehouse: "Q12",
    to_warehouse: "Q7",
    sku: "BO-VIEN-1K",
    item_name: "Bò viên gân đặc biệt 1kg",
    quantity: 50,
    dvt: "gói",
    lot_number: "L2609-15",
    created_at: "08/10/2026 15:00",
    created_by: "Trần Minh Tâm (Điều phối)",
    status: "completed",
    status_label: "Đã nhập kho Q7",
    note: "Đã kiểm đếm đủ 50 gói"
  }
];
