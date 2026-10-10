# CHỈ THỊ LỆNH TỪ COMMANDER & CHỦ TỊCH — SỐ 14
# DỰ ÁN: SK WORKSPACE 2 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# MỤC TIÊU: 
# 1. PHÂN HỆ BẢNG GIÁ ĐA KÊNH & BÁO GIÁ ZALO CHÀNH XE (/pricing)
# 2. ĐỒNG BỘ ĐƠN HÀNG LIVE SAPO API (WEB ORDER, POS, QUÁN ĂN, ĐẠI LÝ)
# 3. CHUẨN HÓA HỆ THỐNG ALIAS ĐỊNH DANH NGHIỆP VỤ (SK-*)
# 4. TÍCH HỢP MISA OPEN API (AMIS KẾ TOÁN & MEINVOICE BOT)

---

### DỮ LIỆU ĐỊNH DANH DOANH NGHIỆP CHÍNH THỨC (CẬP NHẬT PHÁP LÝ 02/10/2026):
1. **Pháp nhân & Hồ sơ pháp lý:**
   - **Tên doanh nghiệp:** CÔNG TY TNHH THỰC PHẨM SƠN KHANG (SON KHANG FOODS CO., LTD)
   - **Mã số thuế / Mã số doanh nghiệp:** `0111252725` (Sở Tài chính TP. Hà Nội cấp, ĐKKD lần đầu: 16/10/2025)
   - **Vốn điều lệ:** 2.000.000.000 VNĐ (Hai tỷ đồng chẵn)
   - **Người đại diện theo pháp luật:** Giám đốc HỒ BÁ THỊNH (CCCD: 001094016823, Sinh 20/11/1994)
   - **Trụ sở chính:** Thôn 6, Xã Yên Xuân, Thành phố Hà Nội, Việt Nam
   - **Địa điểm kinh doanh số 00001 (Kho tổng & Phân phối):** Số 96 Ngõ 337 Phố Định Công, P. Định Công, TP. Hà Nội (thông Ngõ 412 Trịnh Đình Cửu, Q. Hoàng Mai)
   - **Cơ quan thuế quản lý trực tiếp:** Thuế cơ sở 22 thành phố Hà Nội
   - **Kế toán thuế đăng ký:** TRẦN THỊ LỆ QUYÊN (SĐT: 0988 000 570)
   - **Kế toán trưởng nội bộ:** HOÀNG THỊ NHO
   - **Thủ kho trung tâm:** TRẦN THỊ NGỌC THÚY
   - **Tài xế giao nhận:** NGÔ VĂN TÂN
   - **Hotline / Zalo:** 0942 22 60 60 | CSKH cố định: (024) 22 60 60 60
   - **Email:** thucpham@sonkhang.vn | Email thuế: thucphamsonkhang@gmail.com
   - **Tài khoản thanh toán chính thức:** Techcombank (Mã BIN: 970407) — STK: `22226060` — Chủ TK: CÔNG TY TNHH THỰC PHẨM SƠN KHANG

---

### HỆ THỐNG KÊNH BÁN HÀNG CHUẨN HÓA (CHANNELS):
1. `web_order`: Đơn đặt hàng từ website chính thức `https://sonkhang.vn`
2. `pos`: Bán lẻ và khách quán ăn bốc hàng trực tiếp tại quầy kho Định Công / Yên Bình
3. `quan_an`: Quán ăn vặt, xiên bẩn, mì trộn Indomie nội thành Hà Nội (Cầu Giấy, Đống Đa, Hai Bà Trưng, Bách - Kinh - Xây...)
4. `dai_ly`: Khách sỉ, đại lý tỉnh gửi chành xe phía Bắc (Bến Giáp Bát, Nước Ngầm, Mỹ Đình đi Nam Định, Hải Phòng, Quảng Ninh, Bắc Ninh...)
5. `bep_an`: Căn tin trường học, bếp ăn doanh nghiệp/khu công nghiệp
6. `ban_le`: Khách mua lẻ theo niêm yết

---

### CHUẨN ALIAS ĐỊNH DANH NGHIỆP VỤ (`packages/core/aliases.ts`):
Format chuẩn: `{PREFIX}-{YYMMDD}-{SEQUENCE}` (Ví dụ: `SK-WEB-261010-0001`, `SK-POS-261010-0002`):
- `SK-SO-`: Đơn bán buôn chung (Sales Order)
- `SK-WEB-`: Đơn hàng Web order
- `SK-POS-`: Đơn bán quầy POS
- `SK-QA-`: Đơn quán ăn / xiên bẩn Hà Nội
- `SK-DL-`: Đơn đại lý chành xe tỉnh
- `SK-BA-`: Đơn căn tin / bếp ăn
- `SK-PO-`: Đơn đặt hàng nhà cung cấp (CP, Kewpie, Cholimex...)
- `SK-PXK-` / `SK-PNK-`: Phiếu xuất kho / Nhập kho
- `SK-DO-`: Vận đơn điều phối giao hàng / chành xe
- `SK-BG-`: Bản báo giá Zalo / Báo giá kênh
- `SK-INV-`: Hóa đơn điện tử MISA meInvoice
- `SK-CTGS-`: Chứng từ ghi sổ MISA AMIS

---

### TÍCH HỢP HỆ THỐNG (INTEGRATIONS):
1. **Sapo Live API:**
   - Endpoint: `https://0166bd3c4bb745edb301413aec771b2b:e2cc59d4ace34a009a0704ab9f72a8b4@sonkhang.mysapo.net/admin/orders.json`
   - Đã tích hợp Basic Auth vào `packages/integrations/sapo/sapoClient.ts`.
   - Tự động nhận diện nguồn đơn (admin, zalo, web, pos) và sinh mã alias chuẩn tương ứng.

2. **MISA AMIS Kế Toán OpenAPI (`packages/integrations/misa/amisOpenApiClient.ts`):**
   - Tài liệu: `https://developer.misa.vn/products-openapi/AMISKT?firstApi=1`
   - Chức năng: Đẩy chứng từ bán hàng (TK 131/5111/3331) từ đơn hàng đã hoàn tất vào sổ kế toán MISA AMIS.

3. **MISA meInvoice Bot OpenAPI (`packages/integrations/misa/meInvoiceBotClient.ts`):**
   - Tài liệu: `https://developer.misa.vn/products-openapi/MEINVOICEBOT?firstApi=1`
   - Chức năng: 
     - Phát hành HĐĐT tự động (eInvoice) từ đơn hàng hoàn tất, lấy mã Cơ quan thuế cấp.
     - Bot tự động cào và kiểm tra hóa đơn đầu vào từ nhà cung cấp (CP, Cholimex, Kewpie...).

---

### NHIỆM VỤ THỰC THI CHO CLAUDE CODE (`/next`):

#### TASK 1: HOÀN THIỆN PHÂN HỆ /pricing
- File service: `packages/modules/pricing/pricingService.ts` (lọc 4 nhóm hàng, 6 kênh bán gồm cả `web_order` và `pos`, tính biên lợi nhuận, hàm `generateZaloQuote` theo format chuẩn Sơn Khang).
- API routes: `app/api/pricing/route.ts`, `app/api/pricing/[sku]/route.ts`, `app/api/pricing/quote/route.ts`.
- Giao diện: `app/(shell)/pricing/page.tsx` (3D Claymorphism, 4 KPI cards, tabs 6 kênh bán hàng, modal cập nhật giá nhanh, modal xuất báo giá Zalo 1-chạm).

#### TASK 2: NÂNG CẤP TRANG SAPO2MISA (`app/(shell)/finance/sapo2misa/page.tsx`)
- Hiển thị đầy đủ cột **Mã Nghiệp Vụ (Alias Code)** và **Kênh Bán (Channel)** trên bảng dữ liệu đơn hàng.
- Bổ sung 2 nút hành động trực tiếp:
  - **"Đẩy AMIS Kế Toán (OpenAPI)"**: Gọi API hạch toán chứng từ sang MISA AMIS.
  - **"Phát Hành HĐĐT meInvoice Bot"**: Phát hành HĐĐT và hiển thị mã CQT.
- Tạo API endpoints tương ứng:
  - `POST /api/sapo2misa/amis`: Gọi `syncOrderToAmis()`.
  - `POST /api/sapo2misa/meinvoice`: Gọi `publishInvoiceFromOrder()`.

---

### TIÊU CHUẨN NGHIỆM THU (QUALITY GATE):
1. `npx tsc --noEmit` đạt 0 lỗi.
2. `npm run build` thành công 100%.
3. Ghi báo cáo nghiệm thu vào `.claude/reports/latest.md`.
