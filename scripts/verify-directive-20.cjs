/**
 * Kịch bản kiểm thử nghiệm thu toàn diện CHỈ THỊ SỐ 20 (Directive 20)
 * Kiểm tra 8/8 hạng mục: 4 Bất cập UI/UX + 4 Nâng cấp Luồng dữ liệu (Logic Gaps)
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName, details = '') {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  \x1b[32m✔ PASS\x1b[0m [${testName}] ${details}`);
  } else {
    console.error(`  \x1b[31m✘ FAIL\x1b[0m [${testName}] ${details}`);
  }
}

console.log('\n================================================================');
console.log('  KIỂM THỬ NGHIỆM THU CHỈ THỊ SỐ 20 — SƠN KHANG WORKSPACE 2.0');
console.log('================================================================\n');

// 1. UI/UX: Loại bỏ Launchpad trùng lặp khỏi LeftColumn
console.log('--- 1. UI/UX: Tinh gọn bàn làm việc & loại bỏ Launchpad 1-Click lặp lại ---');
const leftColumnPath = path.join(ROOT, 'components/workdesk/LeftColumn.tsx');
const leftColumnContent = fs.readFileSync(leftColumnPath, 'utf8');
assert(!leftColumnContent.includes('<Launchpad'), 'LeftColumn.tsx', 'Không còn chứa <Launchpad />, ưu tiên TasksWidget & Radar');
assert(!leftColumnContent.includes('import Launchpad'), 'LeftColumn.tsx', 'Đã loại bỏ import Launchpad');

// 2. UI/UX: Khung sự kiện vận hành phong phú (không rỗng)
console.log('\n--- 2. UI/UX: Dòng sự kiện vận hành realtime phong phú (Activity Stream) ---');
const mockDataPath = path.join(ROOT, 'packages/modules/feed/mockData.ts');
const mockDataContent = fs.readFileSync(mockDataPath, 'utf8');
assert(mockDataContent.includes('SEED_POSTS') && mockDataContent.includes('29C-882.60'), 'mockData.ts (Posts)', 'Chứa thông báo xe lạnh VAN 29C-882.60');
assert(mockDataContent.includes('SEED_ACTIVITIES') && mockDataContent.includes('13571'), 'mockData.ts (Activities)', 'Chứa hoạt động đơn Zalo #13571 & VietQR Techcombank 22226060');

const feedTypesPath = path.join(ROOT, 'packages/modules/feed/types.ts');
const feedTypesContent = fs.readFileSync(feedTypesPath, 'utf8');
assert(feedTypesContent.includes('qc_done') && feedTypesContent.includes('fefo_alert'), 'feed/types.ts', 'Mở rộng ActivityType với qc_done & fefo_alert');

// 3. UI/UX: Gom nhóm menu Bán hàng & DMS thành Bán lẻ đa kênh & Kênh đại lý B2B
console.log('\n--- 3. UI/UX: Tái cấu trúc menu Bán hàng & DMS ---');
const appRegistryPath = path.join(ROOT, 'packages/core/appRegistry.ts');
const appRegistryContent = fs.readFileSync(appRegistryPath, 'utf8');
assert(appRegistryContent.includes('subgroup: "Bán lẻ đa kênh"') && appRegistryContent.includes('subgroup: "Kênh đại lý B2B"'), 'appRegistry.ts', 'Phân hệ ban-hang đã gom subgroup Bán lẻ vs Đại lý B2B');

const sidebarPath = path.join(ROOT, 'components/shell/Sidebar.tsx');
const sidebarContent = fs.readFileSync(sidebarPath, 'utf8');
assert(sidebarContent.includes('subgroup') || sidebarContent.includes('Bán lẻ đa kênh'), 'Sidebar.tsx', 'Sidebar hỗ trợ hiển thị phân nhóm con');

// 4. UI/UX: Tách nhóm "Công cụ & Tiện ích" khỏi "Quản trị hệ thống"
console.log('\n--- 4. UI/UX: Tách nhóm Công cụ & Tiện ích ---');
assert(appRegistryContent.includes('"tien-ich"') && appRegistryContent.includes('group: "tien-ich"'), 'appRegistry.ts', 'Đã định nghĩa AppGroup tien-ich và gán các app tiện ích');
const homePath = path.join(ROOT, 'app/(shell)/page.tsx');
const homeContent = fs.readFileSync(homePath, 'utf8');
assert(homeContent.includes('"tien-ich"'), 'app/(shell)/page.tsx', 'GROUP_ICON_GRADIENT đã bao gồm tien-ich');

// 5. Logic Gap 1: Cổng Kế toán MISA & meInvoice (Sync Queue Engine)
console.log('\n--- 5. Logic Gap: Chuyển hóa Sapo2Misa thành Cổng MISA & meInvoice Queue ---');
const sapo2MisaPagePath = path.join(ROOT, 'app/(shell)/finance/sapo2misa/page.tsx');
const sapo2MisaPageContent = fs.readFileSync(sapo2MisaPagePath, 'utf8');
assert(sapo2MisaPageContent.includes('Cổng Kế Toán MISA') && sapo2MisaPageContent.includes('meInvoice'), 'sapo2misa/page.tsx (Header)', 'Tiêu đề đổi thành Cổng Kế Toán MISA & meInvoice');
assert(sapo2MisaPageContent.includes('Sync Queue Engine'), 'sapo2misa/page.tsx (Badge)', 'Có badge Sync Queue Engine');
assert(sapo2MisaPageContent.includes('handleRetryFailed'), 'sapo2misa/page.tsx (Retry)', 'Có chức năng Retry khi đơn gặp lỗi mạng');
assert(sapo2MisaPageContent.includes('cqtCode') || sapo2MisaPageContent.includes('meinvoiceStatus'), 'sapo2misa/page.tsx (Status)', 'Theo dõi trạng thái cấp mã CQT meInvoice');

// 6. Logic Gap 2: Xuất lệnh soạn hàng gộp FEFO (Batch Picklist)
console.log('\n--- 6. Logic Gap: Xuất lệnh soạn hàng gộp FEFO cho 9 đơn chờ ---');
const pipelineWidgetPath = path.join(ROOT, 'components/workdesk/OrderPipelineWidget.tsx');
const pipelineWidgetContent = fs.readFileSync(pipelineWidgetPath, 'utf8');
assert(pipelineWidgetContent.includes('Xuất lệnh soạn hàng gộp'), 'OrderPipelineWidget.tsx (Button)', 'Có nút Xuất lệnh soạn hàng gộp');
assert(pipelineWidgetContent.includes('BATCH_PICKLIST_ITEMS') || pipelineWidgetContent.includes('Lệnh Soạn Hàng Gộp FEFO'), 'OrderPipelineWidget.tsx (Dialog)', 'Có Dialog Batch Picklist tổng hợp SKU, Lô, HSD và kệ kho');
assert(pipelineWidgetContent.includes('Kho Định Công') && pipelineWidgetContent.includes('Kho Yên Bái'), 'OrderPipelineWidget.tsx (Branches)', 'Chỉ định kho Định Công & Yên Bái');

// 7. Logic Gap 3: Tự động phân loại HĐĐT cho khách sỉ có MST
console.log('\n--- 7. Logic Gap: Tự động thẩm định MST & gắn cờ HĐĐT meInvoice ---');
const sapoClientPath = path.join(ROOT, 'packages/integrations/sapo/sapoClient.ts');
const sapoClientContent = fs.readFileSync(sapoClientPath, 'utf8');
assert(sapoClientContent.includes('auto_invoice_ready') && sapoClientContent.includes('isValidMst'), 'sapoClient.ts', 'Tự động kiểm tra MST và bật auto_invoice_ready');

const sapoTypesPath = path.join(ROOT, 'packages/integrations/sapo/types.ts');
const sapoTypesContent = fs.readFileSync(sapoTypesPath, 'utf8');
assert(sapoTypesContent.includes('auto_invoice_ready?: boolean;'), 'sapo/types.ts', 'CentralOrder chứa auto_invoice_ready');

// 8. Logic Gap 4: Autonomous Auto-Reconcile khi Kế toán trưởng vắng mặt
console.log('\n--- 8. Logic Gap: Đối soát tự động khi Kế toán trưởng vắng mặt ---');
const staffWidgetPath = path.join(ROOT, 'components/workdesk/OnlineStaffWidget.tsx');
const staffWidgetContent = fs.readFileSync(staffWidgetPath, 'utf8');
assert(staffWidgetContent.includes('isChiefAccountantAway'), 'OnlineStaffWidget.tsx', 'Nhận diện trạng thái Vắng mặt của Kế toán trưởng');
assert(staffWidgetContent.includes('Đối Soát Tự Động Đang Bật') && staffWidgetContent.includes('22226060'), 'OnlineStaffWidget.tsx', 'Kích hoạt Autonomous Auto-Reconcile VietQR Techcombank 22226060 sang MISA AMIS');
assert(staffWidgetContent.includes('Telegram') && staffWidgetContent.includes('Nợ 1121 / Có 131'), 'OnlineStaffWidget.tsx', 'Tự động sinh chứng từ Nợ 1121 / Có 131 và thông báo Telegram');

console.log('\n================================================================');
console.log(`  KẾT QUẢ NGHIỆM THU: ${passedTests}/${totalTests} TIÊU CHÍ ĐẠT (${Math.round((passedTests/totalTests)*100)}%)`);
console.log('================================================================\n');

if (passedTests === totalTests) {
  process.exit(0);
} else {
  process.exit(1);
}
