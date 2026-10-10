# CHỈ THỊ LỆNH TỪ COMMANDER & CHỦ TỊCH — SỐ 15
# DỰ ÁN: SK WORKSPACE 2.0 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# MỤC TIÊU CỐT LÕI:
# 1. TỰ ĐỘNG HÓA CHU TRÌNH ĐƠN HÀNG KHÉP KÍN 2 CHIỀU (MULTI-CHANNEL FULFILLMENT)
# 2. VẬN HÀNH TOÀN DIỆN 3 SUBDOMAIN TRÊN PRODUCTION VPS 103.124.93.145 (WORKSPACE, POS, DATHANG)
# 3. GIÁM SÁT CHUỖI CUNG ỨNG LẠNH IOT XE TẢI ISUZU 29C-882.60 & PWA TÀI XẾ NGÔ VĂN TÂN
# 4. KÍCH HOẠT ĐỐI SOÁT TỰ ĐỘNG VIETQR TECHCOMBANK 22226060 & CRON EOD 18:00 MISA AMIS 63 CỘT

---

### I. CĂN CỨ PHÁP LÝ & DỮ LIỆU ĐỊNH DANH DOANH NGHIỆP:
1. **Pháp nhân thực thi:**
   - **Tên công ty:** CÔNG TY TNHH THỰC PHẨM SƠN KHANG (SON KHANG FOODS CO., LTD)
   - **Mã số thuế:** `0111252725` (Sở Tài chính TP. Hà Nội cấp)
   - **Vốn điều lệ:** 2.000.000.000 VNĐ
   - **Người đại diện theo pháp luật:** Giám đốc HỒ BÁ THỊNH (CCCD: 001094016823, Sinh 20/11/1994)
   - **Kho Tổng & Trung tâm Phân phối:** Số 96 Ngõ 337 Phố Định Công, P. Định Công, TP. Hà Nội (thông Ngõ 412 Trịnh Đình Cửu, Q. Hoàng Mai)
   - **Kho Vệ Tinh:** Thôn 6, Yên Bình, Thạch Thất, Hà Nội
   - **Kế toán trưởng:** HOÀNG THỊ NHO
   - **Thủ kho trung tâm:** TRẦN THỊ NGỌC THÚY
   - **Tài xế giao nhận:** NGÔ VĂN TÂN (SĐT: 0942 22 60 60)
   - **Tài khoản thụ hưởng duy nhất:** Techcombank (Mã BIN: 970407) — STK: `22226060` — Chủ TK: CÔNG TY TNHH THỰC PHẨM SƠN KHANG

---

### II. NỘI DUNG MỆNH LỆNH CHỈ THỊ 15:

#### NHIỆM VỤ 1: KHÉP KÍN CHU TRÌNH ĐƠN HÀNG ĐA KÊNH THỜI GIAN THỰC (ZERO MOCK)
1. **Tiếp nhận & Định danh:**
   - Đơn hàng phát sinh từ bất kỳ nguồn nào:
     - Cổng B2B: `https://dathang.sonkhang.vn` (`SK-WEB-*`)
     - Quầy POS Kho Định Công: `https://pos.sonkhang.vn` (`SK-POS-*`)
     - Quán ăn nội thành & Đại lý chành xe Sapo Open API (`SK-QA-*`, `SK-DL-*`)
   - Tự động gán mã định danh duy nhất `{PREFIX}-{YYMMDD}-{SEQUENCE}` và bắn thông báo real-time vào Chat nội bộ `#dieu-kho`.
2. **Kiểm đếm & Soạn kho FEFO 100%:**
   - Thủ kho TRẦN THỊ NGỌC THÚY thực hiện xác nhận soạn hàng tại URL tác vụ: `/sales/[id]/pick`.
   - Bắt buộc kiểm đếm 100% dòng sản phẩm theo nguyên tắc Hạn dùng trước - Xuất trước (FEFO). Có phản hồi âm thanh (audio chime) và rung (haptic feedback).
   - Tự động sinh Phiếu xuất kho `SK-PXK-*` và trừ tồn kho khả dụng tại kho tương ứng (Định Công / Yên Bình).
3. **Điều phối Giao vận & Chuỗi lạnh Isuzu 29C-882.60:**
   - Tạo chuyến giao hàng `SK-DO-*`, phân bổ cho Tài xế NGÔ VĂN TÂN (`0942 22 60 60`).
   - Tài xế thao tác trên PWA 1-chạm `/pwa/giaovan`, hỗ trợ hiển thị tuyến bến xe Giáp Bát / Nước Ngầm.
   - Khi giao thành công, trạng thái đơn tự động đẩy ngược lên Sapo chuyển sang `fulfilled`.

#### NHIỆM VỤ 2: ĐỐI SOÁT DÒNG TIỀN TỰ ĐỘNG & KẾ TOÁN EOD 18:00
1. **Tự động gạch nợ VietQR:**
   - Khách quét mã VietQR Techcombank `22226060` theo cú pháp `SK-[Mã đơn]` hoặc `TT DH [Mã]`.
   - Webhook `/api/finance/vietqr` nhận biến động số dư, tự động tạo Phiếu thu `SK-PT-*` (Tài khoản 1121/TK Techcombank) và chuyển trạng thái đơn hàng sang `hoan_tat` (Đã thanh toán).
2. **Kế toán EOD MISA AMIS 63 cột:**
   - Cron tự động chạy lúc 18:00 hàng ngày (`/api/sapo/cron/eod-accounting`).
   - Tổng hợp toàn bộ đơn hàng trong ngày, đối soát chống trùng lặp qua Ledger, tự động sinh chứng từ kế toán MISA AMIS (`SK-CTGS-*`) và xuất file Excel chuẩn 63 cột.
   - Sẵn sàng phát hành HĐĐT meInvoice Bot (`C26TSK`) có mã xác thực của Cơ quan Thuế.

#### NHIỆM VỤ 3: GIÁM SÁT CHUỖI LẠNH HACCP & IOT TELEMETRY XE 29C-882.60
1. **Tiếp nhận & Cảnh báo Telemetry:**
   - Cổng API `/api/fleet/telemetry` tiếp nhận dữ liệu thời gian thực từ cảm biến thùng lạnh Isuzu QKR 270.
   - Dải nhiệt độ an toàn: `-18°C ~ -22°C`.
   - **Quy tắc cảnh báo đỏ:** Nếu nhiệt độ tăng vượt `-15°C` hoặc cửa thùng mở quá 10 phút, hệ thống kích hoạt còi cảnh báo, gửi thông báo khẩn vào Chat `#dieu-xe` và hiển thị cảnh báo đỏ trên màn hình PWA tài xế.
2. **Nhật ký hành trình:**
   - Lưu trữ lịch sử nhiệt độ mỗi chuyến hàng để xuất biên bản nghiệm thu chất lượng HACCP bàn giao cho các siêu thị, bếp ăn trường học và chành xe.

#### NHIỆM VỤ 4: PHÂN BỔ 6 WORKER SQUAD TRIỂN KHAI PRODUCTION
Opus chịu trách nhiệm làm Tổng Chỉ Huy điều phối 6 Worker theo ranh giới tệp nghiêm ngặt:
- **Worker 1 (Infrastructure & Edge):** Hoàn thiện SSL Certbot cho `workspace.sonkhang.vn`, `pos.sonkhang.vn`, `dathang.sonkhang.vn` trên VPS `103.124.93.145`.
- **Worker 2 (Sapo Realtime Engine):** Giám sát Webhook HMAC-SHA256, đồng bộ tồn kho 2 kho Định Công & Yên Bình.
- **Worker 3 (Finance & MISA OpenAPI):** Đối soát VietQR Techcombank `22226060`, xuất Excel 63 cột MISA AMIS.
- **Worker 4 (Cold Chain IoT & Fleet PWA):** Tối ưu giao diện PWA giao hàng cho Tài xế Ngô Văn Tân, giám sát cảm biến -18°C.
- **Worker 5 (Commerce Channels):** Tối ưu tốc độ phục vụ quầy POS (<5s/đơn) và tra cứu tiến độ đơn hàng trên `dathang.sonkhang.vn`.
- **Worker 6 (Security & RBAC QA):** Kiểm soát phân quyền nhân sự, chạy kiểm thử tự động toàn diện.

---

### III. TIÊU CHUẨN NGHIỆM THU (QUALITY GATE):
1. **Mã nguồn:** `npx tsc --noEmit` = **0 lỗi** tuyệt đối.
2. **Build hệ thống:** `npm run build` = **Tạo đủ 66+ routes thành công**, không có lỗi hydration hay thiếu dynamic params.
3. **Dữ liệu thực nghiệm:** 100% luồng đơn hàng chạy thông suốt từ Đặt hàng -> Soạn hàng FEFO -> Giao vận -> Thu tiền VietQR -> Hạch toán MISA.
4. **Báo cáo:** Ghi nhận biên bản nghiệm thu vào `.claude/reports/directive-15.md` trước khi bàn giao cho Ban Giám Đốc.

**BAN HÀNH BỞI: COMMANDER & CHỦ TỊCH HỒ BÁ THỊNH**  
*Mệnh lệnh có hiệu lực thi hành ngay lập tức.*
