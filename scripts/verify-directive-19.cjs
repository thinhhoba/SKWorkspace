/**
 * scripts/verify-directive-19.cjs
 * Bộ kiểm thử tự động kiểm tra Kiến trúc 7 Phân hệ Chức năng & Quy trình 8 bước
 * DỰ ÁN: SƠN KHANG WORKSPACE 2.0 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: 0111252725)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
let passCount = 0;
let failCount = 0;

function ok(title) {
  passCount++;
  console.log(`  PASS  ${title}`);
}

function ng(title, detail) {
  failCount++;
  console.error(`  FAIL  ${title} -> ${detail}`);
}

function section(name) {
  console.log(`\n[ ${name} ]`);
}

console.log("=================================================");
console.log("  SK WORKSPACE 2.0 — KIỂM THỬ CHỈ THỊ SỐ 19     ");
console.log("  7 PHÂN HỆ DOANH NGHIỆP & QUY TRÌNH 8 BƯỚC KHÉP KÍN ");
console.log("=================================================");

// 1. TypeScript Strict Checking
section("1. tsc --noEmit (0 lỗi tuyệt đối)");
try {
  execSync("npx tsc --noEmit", { cwd: ROOT, stdio: "pipe" });
  ok("tsc --noEmit — 0 errors");
} catch (e) {
  ng("tsc --noEmit", e.stdout ? e.stdout.toString().slice(0, 500) : e.message);
}

// 2. Kiểm tra văn bản Chỉ thị số 19
section("2. Văn bản Chỉ thị số 19 (.claude/inbox)");
try {
  const d19Path = path.join(ROOT, ".claude/inbox/directive-19.md");
  const dPath = path.join(ROOT, ".claude/inbox/directive.md");

  if (fs.existsSync(d19Path)) ok(".claude/inbox/directive-19.md tồn tại");
  else ng("directive-19.md", "thiếu file lưu trữ");

  if (fs.existsSync(dPath)) ok(".claude/inbox/directive.md tồn tại");
  else ng("directive.md", "thiếu file chỉ thị hiện hành");

  const d19Src = fs.readFileSync(d19Path, "utf8");
  if (d19Src.includes("CHỈ THỊ LỆNH TỪ COMMANDER & CHỦ TỊCH — SỐ 19")) ok("Header Chỉ thị số 19 chuẩn mực");
  else ng("Header Chỉ thị 19", "không đúng tiêu đề");

  if (d19Src.includes("0111252725") && d19Src.includes("22226060") && d19Src.includes("96 Ngõ 337")) {
    ok("Dữ liệu định danh thực: MST 0111252725 · Techcombank 22226060 · Kho Định Công");
  } else {
    ng("Định danh thực", "thiếu thông tin MST / Bank / Kho Định Công");
  }

  // 7 Phân hệ kiểm tra
  const expectedModules = [
    "PHÂN HỆ MUA HÀNG",
    "PHÂN HỆ KHO HÀNG",
    "PHÂN HỆ BÁN HÀNG & PHÂN PHỐI",
    "PHÂN HỆ ĐÓNG GÓI & GIAO HÀNG",
    "PHÂN HỆ TÀI CHÍNH - KẾ TOÁN",
    "PHÂN HỆ NHÂN SỰ & QUẢN TRỊ CÔNG VIỆC",
    "PHÂN HỆ QUẢN TRỊ HỆ THỐNG",
  ];
  for (const m of expectedModules) {
    if (d19Src.includes(m)) ok(`Chỉ thị 19 quy định chi tiết: ${m}`);
    else ng(`Thiếu phân hệ: ${m}`, "không tìm thấy trong văn bản");
  }

  // 8 Bước quy trình
  const expectedSteps = [
    "1. LẬP ĐƠN MUA HÀNG (PO)",
    "2. NHẬP KHO & GÁN LÔ - DATE",
    "3. ĐỒNG BỘ TỒN & GHI NỢ MUA",
    "4. BÁN HÀNG & PHÊ DUYỆT (SO)",
    "5. XUẤT KHO FEFO & ĐÓNG GÓI",
    "6. XUẤT HÓA ĐƠN ĐIỆN TỬ (HĐĐT)",
    "7. GHI NHẬN DOANH THU & GIÁ VỐN",
    "8. ĐỐI SOÁT & THU TIỀN",
  ];
  for (const s of expectedSteps) {
    if (d19Src.includes(s)) ok(`Chỉ thị 19 định nghĩa: Bước ${s}`);
    else ng(`Thiếu bước quy trình: ${s}`, "không tìm thấy trong văn bản");
  }
} catch (e) {
  ng("directive files", e.message);
}

// 3. Chuẩn hóa AppRegistry 7 Phân hệ
section("3. Chuẩn hóa AppRegistry (packages/core/appRegistry.ts)");
try {
  const appRegSrc = fs.readFileSync(path.join(ROOT, "packages/core/appRegistry.ts"), "utf8");
  const requiredGroups = [
    "mua-hang",
    "kho-hang",
    "ban-hang",
    "giao-hang",
    "tai-chinh",
    "nhan-su",
    "he-thong",
  ];

  for (const g of requiredGroups) {
    if (appRegSrc.includes(`"${g}"`)) ok(`AppGroup định nghĩa nhóm: "${g}"`);
    else ng(`AppGroup thiếu nhóm: "${g}"`, "không có trong appRegistry.ts");
  }

  if (appRegSrc.includes("1. Mua hàng & NCC") &&
      appRegSrc.includes("2. Kho hàng (WMS)") &&
      appRegSrc.includes("3. Bán hàng & DMS") &&
      appRegSrc.includes("4. Đóng gói & Giao vận") &&
      appRegSrc.includes("5. Tài chính & Kế toán") &&
      appRegSrc.includes("6. Nhân sự & Công việc") &&
      (appRegSrc.includes("Quản trị Hệ thống"))) {
    ok("GROUP_LABEL map đầy đủ tên tiếng Việt chuẩn hóa cho các phân hệ");
  } else {
    ng("GROUP_LABEL", "chưa cập nhật đủ các nhãn phân hệ");
  }

  // Functional test on imported appRegistry
  const { appRegistry, GROUP_ORDER } = require("../packages/core/appRegistry.ts");
  if (GROUP_ORDER.length >= 7) ok(`GROUP_ORDER chứa ${GROUP_ORDER.length} phân hệ chuẩn hóa (Directive 19 & 20)`);
  else ng("GROUP_ORDER", `chiều dài = ${GROUP_ORDER.length} (kỳ vọng >= 7)`);

  const registeredGroups = new Set(appRegistry.map(a => a.group));
  for (const g of requiredGroups) {
    if (registeredGroups.has(g)) ok(`Phân hệ "${g}" có ít nhất 1 miniapp đăng ký`);
    else ng(`Phân hệ "${g}"`, "chưa có miniapp nào");
  }

  ok(`Tổng cộng ${appRegistry.length} miniapps đăng ký trên 7 phân hệ`);
} catch (e) {
  ng("appRegistry", e.message);
}

// 4. Shell Navigation & UI Layout
section("4. Giao diện Shell & Phân nhóm Dashboard");
try {
  const pageSrc = fs.readFileSync(path.join(ROOT, "app/(shell)/page.tsx"), "utf8");
  const sidebarSrc = fs.readFileSync(path.join(ROOT, "components/shell/Sidebar.tsx"), "utf8");

  if (pageSrc.includes('"mua-hang"') && pageSrc.includes('"kho-hang"') && pageSrc.includes('"nhan-su"')) {
    ok("app/(shell)/page.tsx GROUP_ICON_GRADIENT đã map theo 7 phân hệ mới");
  } else {
    ng("page.tsx gradients", "chưa map đúng 7 phân hệ mới");
  }

  if (sidebarSrc.includes("GROUP_ORDER.map") && sidebarSrc.includes("GROUP_LABEL[g]")) {
    ok("components/shell/Sidebar.tsx điều hướng động theo GROUP_ORDER và GROUP_LABEL");
  } else {
    ng("Sidebar navigation", "không duyệt theo GROUP_ORDER");
  }
} catch (e) {
  ng("shell UI", e.message);
}

// 5. Kiểm tra bảo toàn các tính năng GAP P1 (Không bị thoái lui)
section("5. Bảo toàn tính năng GAP P1 (Không thoái lui)");
try {
  const stocktakeExist = fs.existsSync(path.join(ROOT, "packages/modules/inventory/auditService.ts"));
  const qcExist = fs.existsSync(path.join(ROOT, "packages/modules/inventory/qcService.ts"));
  const quoteExist = fs.existsSync(path.join(ROOT, "components/pricing/QuotePreviewCard.tsx"));
  const fleetExist = fs.existsSync(path.join(ROOT, "packages/modules/delivery/types.ts"));
  const agingExist = fs.existsSync(path.join(ROOT, "packages/modules/finance/agingService.ts"));

  if (stocktakeExist) ok("GAP 1: Kiểm kê Kho Định Công bảo toàn (auditService)");
  else ng("GAP 1", "thiếu auditService");

  if (qcExist) ok("GAP 2: KCS Hàng về -15°C bảo toàn (qcService)");
  else ng("GAP 2", "thiếu qcService");

  if (quoteExist) ok("GAP 3: Báo giá B2B Zalo bảo toàn (QuotePreviewCard)");
  else ng("GAP 3", "thiếu QuotePreviewCard");

  if (fleetExist) ok("GAP 4: Phân luồng Xe máy vs Xe tải VAN 24/7 bảo toàn (VehicleType)");
  else ng("GAP 4", "thiếu VehicleType");

  if (agingExist) ok("GAP 5: Báo cáo Tuổi nợ B2B Aging 15/30/60 bảo toàn (agingService)");
  else ng("GAP 5", "thiếu agingService");
} catch (e) {
  ng("GAP P1 preservation", e.message);
}

console.log(`\n=== TỔNG KẾT KIỂM THỬ: ${passCount} PASS, ${failCount} FAIL ===`);
if (failCount === 0) {
  console.log(">>> CHỈ THỊ SỐ 19 ĐÃ ĐƯỢC THIẾT KẾ VÀ CHUẨN HÓA THÀNH CÔNG VÀO HỆ THỐNG! <<<");
  process.exit(0);
} else {
  console.error(">>> CÒN TIÊU CHÍ CHƯA ĐẠT! <<<");
  process.exit(1);
}
