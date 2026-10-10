// Prisma 7 cần driver adapter — chỉ khởi tạo khi có DATABASE_URL
// Mock data — require relative, fallback inline nếu không resolve

let MOCK_CUSTOMERS: any[] = [];
let INITIAL_INVENTORY_ITEMS: any[] = [];

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m = require("../packages/modules/customers/mockData");
  MOCK_CUSTOMERS = m.MOCK_CUSTOMERS ?? [];
} catch {
  MOCK_CUSTOMERS = [
    { code: "KH-B2B-001", name: "Nhà hàng Lẩu Bò Q7", company_name: "Nhà hàng Lẩu Bò Q7", mst: "0312456789", phone: "0908123456", address: "15 Nguyễn Thị Thập, Q.7, TP.HCM", credit_limit: 80_000_000, payment_term: 15, risk_level: "safe" },
    { code: "KH-B2B-002", name: "Siêu thị Mini Q12", company_name: "Siêu thị Mini Q12", mst: "0312987654", phone: "0938765432", address: "45 Lê Thị Riêng, Q.12, TP.HCM", credit_limit: 120_000_000, payment_term: 30, risk_level: "safe" },
    { code: "KH-B2B-003", name: "Bếp ăn KCN Hiệp Phước", company_name: "Bếp ăn KCN Hiệp Phước", mst: "0313567890", phone: "0909988776", address: "Lô C, KCN Hiệp Phước, Nhà Bè, TP.HCM", credit_limit: 350_000_000, payment_term: 30, risk_level: "warning" },
    { code: "KH-B2B-004", name: "Chuỗi Cơm Tấm Sài Gòn", company_name: "Chuỗi Cơm Tấm Sài Gòn", mst: "0314123987", phone: "0912345678", address: "128 Nguyễn Trãi, Q.1, TP.HCM", credit_limit: 500_000_000, payment_term: 30, risk_level: "warning" },
    { code: "KH-B2B-006", name: "Bếp ăn Trường Quốc tế Q7", company_name: "Bếp ăn Trường Quốc tế Q7", mst: "0315234890", phone: "0399123456", address: "Khu Nam Long, Q.7, TP.HCM", credit_limit: 250_000_000, payment_term: 30, risk_level: "danger" },
    { code: "KH-B2B-008", name: "Chuỗi Lẩu Nướng 5 Quán", company_name: "Chuỗi Lẩu Nướng 5 Quán", mst: "0317456012", phone: "0935123456", address: "42 Điện Biên Phủ, Bình Thạnh, TP.HCM", credit_limit: 300_000_000, payment_term: 30, risk_level: "blocked" },
  ];
}

try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const m2 = require("../packages/modules/inventory/mockData");
  INITIAL_INVENTORY_ITEMS = m2.INITIAL_INVENTORY_ITEMS ?? [];
} catch {
  INITIAL_INVENTORY_ITEMS = [
    { sku: "HEO-XAY-500", name: "Thịt heo xay tươi 500g", category: "Thịt tươi", dvt: "khay", warehouse: "Q7", quantity: 12, min_stock: 50, max_stock: 120, temperature: "-2°C ~ 2°C", lot_number: "L2610-08", production_date: "08/10/2026", expiry_date: "15/10/2026", location: "Kệ A1-02", unit_price: 82000, status: "can-han" },
    { sku: "BO-VIEN-1K", name: "Bò viên gân đặc biệt 1kg", category: "Thực phẩm chế biến", dvt: "gói", warehouse: "Q7", quantity: 60, min_stock: 80, max_stock: 200, temperature: "-18°C", lot_number: "L2609-15", production_date: "15/09/2026", expiry_date: "15/03/2027", location: "Kệ B2-01", unit_price: 185000, status: "sap-thieu" },
    { sku: "HEO-XAY-500", name: "Thịt heo xay tươi 500g", category: "Thịt tươi", dvt: "khay", warehouse: "Q12", quantity: 280, min_stock: 100, max_stock: 500, temperature: "-2°C ~ 2°C", lot_number: "L2610-08", production_date: "08/10/2026", expiry_date: "15/10/2026", location: "Dãy P1-Khay", unit_price: 82000, status: "can-han" },
    { sku: "SUON-NON-HEO", name: "Sườn non heo đông lạnh nhập khẩu", category: "Thịt đông lạnh", dvt: "kg", warehouse: "Q12", quantity: 620, min_stock: 200, max_stock: 1000, temperature: "-18°C", lot_number: "L2608-25", production_date: "25/08/2026", expiry_date: "25/08/2027", location: "Hầm Đông H2", unit_price: 155000, status: "du" },
  ];
}

async function main() {
  if (!process.env.DATABASE_URL) {
    console.log("[seed] DATABASE_URL thiếu — bỏ qua seed DB, dùng mock data. (fallback)");
    console.log(`[seed] MOCK_CUSTOMERS: ${MOCK_CUSTOMERS.length} items, INVENTORY: ${INITIAL_INVENTORY_ITEMS.length} items — OK (không cần DB)`);
    return;
  }

  // Lazy import PrismaClient + adapter chỉ khi có DATABASE_URL (Prisma 7 yêu cầu adapter)
  let prisma: any;
  try {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaClient } = require("@prisma/client");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PrismaPg } = require("@prisma/adapter-pg");
    const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
    prisma = new PrismaClient({ adapter });
  } catch (e) {
    console.log("[seed] PrismaClient/adapter chưa sẵn sàng — fallback mock:", (e as Error).message);
    return;
  }

  try {
    await prisma.$queryRaw`SELECT 1`;
  } catch (e) {
    console.log("[seed] Không kết nối được DB — fallback mock:", (e as Error).message);
    try { await prisma.$disconnect(); } catch {}
    return;
  }

  console.log("[seed] Bắt đầu seed...");

  // 1) Upsert 4 users — password_hash = "hashed_" + username (demo)
  const users = [
    { username: "admin",  password_hash: "hashed_admin",  role: "ADMIN",     name: "Hồ Bá Thịnh (Admin/GĐ)" },
    { username: "ketoan", password_hash: "hashed_ketoan", role: "ACCOUNTANT", name: "Hoàng Thị Nho (Kế toán)" },
    { username: "thukho", password_hash: "hashed_thukho", role: "WAREHOUSE", name: "Trần Thị Ngọc Thúy (Thủ kho)" },
    { username: "taixe",  password_hash: "hashed_taixe",  role: "DRIVER",    name: "Ngô Văn Tân (Tài xế)" },
  ];

  for (const u of users) {
    try {
      await prisma.user.upsert({
        where: { username: u.username },
        update: { password_hash: u.password_hash, role: u.role, name: u.name },
        create: { username: u.username, password_hash: u.password_hash, role: u.role, name: u.name },
      });
      console.log(`[seed] upsert user ${u.username} OK`);
    } catch (e) {
      console.warn(`[seed] upsert user ${u.username} skipped:`, (e as Error).message);
    }
  }

  // 2) Upsert customers từ MOCK_CUSTOMERS (map mst→tax_code, payment_term→payment_term_days)
  for (const c of MOCK_CUSTOMERS) {
    const data = {
      code: c.code,
      name: c.name,
      company_name: c.company_name ?? c.name,
      tax_code: (c as any).mst ?? c.tax_code ?? "",
      phone: c.phone ?? "",
      address: c.address ?? "",
      delivery_address: c.address ?? "",
      credit_limit: c.credit_limit ?? 0,
      payment_term_days: (c as any).payment_term ?? c.payment_term_days ?? 30,
      risk_level: c.risk_level ?? "safe",
    };
    try {
      await prisma.customer.upsert({
        where: { code: data.code },
        update: data,
        create: data,
      });
    } catch (e) {
      console.warn(`[seed] upsert customer ${data.code} skipped:`, (e as Error).message);
    }
  }
  console.log(`[seed] customers: ${MOCK_CUSTOMERS.length} upserted (hoặc skipped nếu schema chưa có)`);

  // 3) Upsert inventory items — where sku+warehouse (composite unique sku_warehouse)
  for (const it of INITIAL_INVENTORY_ITEMS) {
    const data = {
      sku: it.sku,
      name: it.name,
      category: it.category ?? "",
      dvt: it.dvt ?? it.unit ?? "cái",
      warehouse: it.warehouse,
      quantity: it.quantity ?? 0,
      min_stock: it.min_stock ?? 0,
      max_stock: it.max_stock ?? 0,
      temperature: it.temperature ?? "",
      lot_number: it.lot_number ?? "",
      production_date: it.production_date ?? "",
      expiry_date: it.expiry_date ?? "",
      location: it.location ?? "",
      unit_price: it.unit_price ?? 0,
      status: it.status ?? "du",
    };
    try {
      await prisma.inventoryItem.upsert({
        where: { sku_warehouse: { sku: data.sku, warehouse: data.warehouse } },
        update: data,
        create: data,
      });
    } catch {
      try {
        await prisma.inventoryItem.upsert({
          where: { sku: data.sku },
          update: data,
          create: data,
        });
      } catch (e2) {
        console.warn(`[seed] upsert inventory ${data.sku}/${data.warehouse} skipped:`, (e2 as Error).message);
      }
    }
  }
  console.log(`[seed] inventory: ${INITIAL_INVENTORY_ITEMS.length} upserted (hoặc skipped nếu schema chưa có)`);
  console.log("[seed] Hoàn tất.");
  try { await prisma.$disconnect(); } catch {}
}

main().catch((e) => {
  const msg = (e as Error).message ?? "";
  if (!process.env.DATABASE_URL || msg.includes("DATABASE_URL") || msg.includes("Can't reach") || msg.includes("P1001") || msg.includes("P1000") || msg.includes(".prisma/client") || msg.includes("driver adapter")) {
    console.log("[seed] fallback (không có DB):", msg);
    process.exit(0);
  }
  console.error("[seed] lỗi:", e);
  process.exit(1);
});
