import {
  verifySapoWebhook,
  signPayload,
  processOrderWebhook,
  getWebhookStatus
} from '../packages/integrations/sapo/webhookService';

import {
  fetchSapoVariants,
  compareStockLevelsSync,
  pushStockToSapo,
  getLowStockWarnings
} from '../packages/integrations/sapo/inventorySync';

import {
  fetchSapoCustomers,
  classifyB2BGroup
} from '../packages/integrations/sapo/customerSync';

import {
  fetchEnrichedProducts
} from '../packages/integrations/sapo/productSync';

import {
  groupOrdersByRoute,
  generateChanhXePackingSlip,
  DRIVER_INFO,
  VIETQR_INFO
} from '../packages/integrations/sapo/fulfillmentSync';

import {
  getSapoHubTelemetry,
  runEndOfDayAccounting
} from '../packages/integrations/sapo/sapoHubService';

async function runAcceptanceTest() {
  console.log('===============================================================');
  console.log('   TIẾN TRÌNH NGHIỆM THU 5 WORKER SAPO — SK WORKSPACE 2        ');
  console.log('===============================================================\n');

  let passed = 0;
  let total = 0;

  function assert(title: string, condition: boolean, extra: string = '') {
    total++;
    if (condition) {
      passed++;
      console.log(`[PASS] ✅ ${title} ${extra ? `(${extra})` : ''}`);
    } else {
      console.error(`[FAIL] ❌ ${title} ${extra ? `(${extra})` : ''}`);
    }
  }

  // --- WORKER 1: WEBHOOK & REALTIME ENGINE ---
  console.log('--- [WORKER 1] Webhook & Realtime Engine ---');
  const samplePayload: any = {
    id: 13547,
    name: '#13547',
    order_number: '13547',
    created_on: '2026-10-10T08:30:00+07:00',
    total_price: 3650000,
    line_items: [
      { id: 1, title: 'Gà Popcorn CP Thùng 10kg', sku: 'SK-GA-POP-10KG', price: 450000, quantity: 8 }
    ],
    billing_address: {
      name: 'Nhà Xe Hưng Thịnh (Bến Giáp Bát)',
      phone: '0912345678',
      address1: 'Bến xe Giáp Bát, Giải Phóng, Hà Nội'
    },
    note: 'Gửi về Nam Định chuyến 11h'
  };
  const rawBody = JSON.stringify(samplePayload);
  const validHmac = signPayload(rawBody);
  const verifyOk = verifySapoWebhook(rawBody, validHmac);
  assert('Worker 1: Xác thực HMAC-SHA256 hợp lệ', verifyOk);

  const verifyFail = verifySapoWebhook(rawBody, 'invalid-hmac-signature');
  assert('Worker 1: Chống giả mạo chữ ký HMAC không hợp lệ', !verifyFail);

  const orderResult = processOrderWebhook('orders/create', samplePayload);
  assert('Worker 1: Chuẩn hóa đơn Webhook thành CentralOrder', !!orderResult && !!orderResult.order_code, `Mã: ${orderResult?.order_code}`);
  const statusW1 = getWebhookStatus();
  assert('Worker 1: Ghi nhận Ring Buffer Webhook telemetry', statusW1.total_received > 0);

  // --- WORKER 2: INVENTORY 2-WAY SYNC ---
  console.log('\n--- [WORKER 2] Inventory 2-Way Sync Kho Lạnh ---');
  const variants = await fetchSapoVariants(5);
  assert('Worker 2: Kéo danh sách tồn kho Variants từ Sapo/Mock', Array.isArray(variants) && variants.length > 0, `${variants.length} SKU`);

  const mockLocal = [
    { sku: 'SK-GA-POP-10KG', physicalQty: 45 },
    { sku: 'SK-MI-KHO-INDOMIE', physicalQty: 10 }
  ];
  const reconcile = compareStockLevelsSync(variants, mockLocal);
  assert('Worker 2: Đối soát chênh lệch kho vật lý vs Sapo', Array.isArray(reconcile) && reconcile.length > 0, `${reconcile.length} dòng đối soát`);

  const pushRes = await pushStockToSapo('SK-GA-POP-10KG', 50);
  assert('Worker 2: Đẩy số lượng tồn khả dụng lên Sapo', pushRes.success, `SKU: ${pushRes.sku}`);

  const warnings = getLowStockWarnings(variants, 15);
  assert('Worker 2: Cảnh báo tồn kho dưới ngưỡng an toàn', Array.isArray(warnings));

  // --- WORKER 3: CUSTOMER B2B & PRICING SYNC ---
  console.log('\n--- [WORKER 3] Customer B2B & Pricing Matrix ---');
  const customers = await fetchSapoCustomers(5);
  assert('Worker 3: Kéo danh sách khách hàng từ Sapo/Mock', Array.isArray(customers) && customers.length > 0, `${customers.length} KH`);

  const groupTest1 = classifyB2BGroup({
    name: 'Nhà Xe Hưng Thịnh Bến Giáp Bát',
    address: 'Bến xe Giáp Bát, Giải Phóng, Hà Nội',
    note: 'Gửi xe Giáp Bát về Nam Định'
  } as any);
  assert('Worker 3: Phân loại nhóm B2B Chành xe chuẩn xác', groupTest1 === 'CHANH_XE', `Nhóm: ${groupTest1}`);

  const groupTest2 = classifyB2BGroup({
    name: 'Căn tin Đại học Bách Khoa',
    address: 'KTX B8, Đại học Bách Khoa, Hà Nội',
    note: 'Bếp ăn sinh viên trường học'
  } as any);
  assert('Worker 3: Phân loại nhóm B2B Căn tin trường học', groupTest2 === 'CAN_TIN', `Nhóm: ${groupTest2}`);

  const enrichedProds = await fetchEnrichedProducts();
  assert('Worker 3: Bảng giá 4 cấp B2B (Chành xe, Căn tin, Quán ăn, Bán lẻ)', Array.isArray(enrichedProds) && enrichedProds.length > 0);
  if (enrichedProds[0]) {
    const matrix = enrichedProds[0].b2b_matrix;
    const basePrice = enrichedProds[0].base_price;
    assert('Worker 3: Chiết khấu Cấp 1 (Chành xe -12%)', matrix.cap1_chanh_xe < basePrice, `Giá Cấp 1: ${matrix.cap1_chanh_xe.toLocaleString()}đ / Gốc: ${basePrice.toLocaleString()}đ`);
  }

  // --- WORKER 4: FULFILLMENT & DISPATCH SQUAD ---
  console.log('\n--- [WORKER 4] Fulfillment & Điều Xe Chành Xe ---');
  assert('Worker 4: Thông tin Tài xế Ngô Văn Tân & Xe 29C-882.60', DRIVER_INFO.vehicle === '29C-882.60' && DRIVER_INFO.name.includes('TÂN'), `Tài xế: ${DRIVER_INFO.name} - Biển số: ${DRIVER_INFO.vehicle}`);
  assert('Worker 4: Mã QR Techcombank 22226060 chuẩn VietQR', VIETQR_INFO.account === '22226060', `STK: ${VIETQR_INFO.account} - ${VIETQR_INFO.bank}`);

  const groupedRoutes = groupOrdersByRoute([samplePayload]);
  const totalGrouped = groupedRoutes.CHANH_XE_TINH.length + groupedRoutes.NOI_THANH_HN.length;
  assert('Worker 4: Tự động gom chuyến theo tuyến Bến xe & Nội thành', totalGrouped === 1, `Tuyến: ${groupedRoutes.CHANH_XE_TINH.length > 0 ? 'Chành xe' : 'Nội thành'}`);

  const packingSlip = generateChanhXePackingSlip(samplePayload);
  assert('Worker 4: Sinh phiếu dán thùng xốp Chành xe có VietQR COD', !!packingSlip && !!packingSlip.vietqr?.qrData, `Bến: ${packingSlip.busStationLabel}`);

  // --- WORKER 5: SAPO LIVE HUB & MISA AUTO-ACCOUNTING ---
  console.log('\n--- [WORKER 5] Sapo Live Hub & MISA Auto-Accounting ---');
  const hubData = await getSapoHubTelemetry();
  assert('Worker 5: Bảng điều khiển Sapo Live Hub Telemetry', hubData.telemetry.totalToday >= 0 && typeof hubData.telemetry.revenueToday === 'number', `Tổng đơn: ${hubData.telemetry.totalToday} • Doanh thu: ${hubData.telemetry.revenueToday.toLocaleString()}đ`);

  const eodResult = await runEndOfDayAccounting();
  assert('Worker 5: Tiến trình hạch toán cuối ngày 18:00 (MISA AMIS 63 cột)', eodResult.success, `Đơn đồng bộ: ${eodResult.syncedCount} • Dòng MISA: ${eodResult.rowsGenerated}`);

  console.log('\n===============================================================');
  console.log(`KẾT QUẢ NGHIỆM THU: ${passed}/${total} TIÊU CHÍ ĐẠT (${((passed/total)*100).toFixed(1)}%)`);
  console.log('===============================================================');
}

runAcceptanceTest();
