# CHỈ THỊ LỆNH TỪ COMMANDER & CHỦ TỊCH — SỐ 20
# DỰ ÁN: SƠN KHANG WORKSPACE 2.0 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: 0111252725)
# CHỦ ĐỀ TRỌNG TÂM:
# KHẮC PHỤC TRIỆT ĐỂ 4 BẤT CẬP GIAO DIỆN (UI/UX) VÀ TRIỂN KHAI 4 NÂNG CẤP LUỒNG DỮ LIỆU TỰ ĐỘNG HÓA VẬN HÀNH (LOGIC GAPS)
# DỰA TRÊN BẢN ĐÁNH GIÁ TOÀN DIỆN TRANG QUẢN TRỊ WORKSPACE.SONKHANG.VN

---

### I. CĂN CỨ DOANH NGHIỆP & BỐI CẢNH ĐÁNH GIÁ:
- **Doanh nghiệp:** CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: `0111252725`)
- **Người đại diện pháp luật:** Giám đốc HỒ BÁ THỊNH (CCCD: `001094016823`)
- **Tài khoản thanh toán:** Techcombank `22226060` (BIN `970407`) — Tự động đối soát VietQR
- **Kho vận hành thực tế:** Số 96 Ngõ 337 Phố Định Công, Phường Định Công, Hà Nội (Kho khô mì Indomie/Gia vị & Kho đông lạnh -18°C)
- **Đội xe:** Xe máy 🛵 (hỏa tốc nội đô <30kg) & Xe tải VAN 🚐 29C-882.60 (chạy 24/7 nội thành không cấm giờ, thùng bảo ôn -18°C)
- **Hệ thống kết nối:** Sapo Open API, MISA AMIS Online, MISA meInvoice.

Căn cứ Bản đánh giá toàn diện trang quản trị thực tế [SK Workspace 2.0](https://workspace.sonkhang.vn/) đạt 8.5/10 điểm, Ban Quản Trị chính thức ban hành **Chỉ thị số 20** yêu cầu giải quyết dứt điểm các điểm thừa UI/UX và hoàn thiện cơ chế tự động hóa vận hành ngầm.

---

### II. NỘI DUNG 4 KHẮC PHỤC GIAO DIỆN (UI/UX GAPS):

#### 1. UI/UX 1: LOẠI BỎ THANH TÁC VỤ 1-CLICK TRÙNG LẶP (`Launchpad.tsx`)
- **Vấn đề:** Cụm 4 nút `[Quầy POS Bán Lẻ] [Web Order B2B] [Soạn Kho FEFO] [Sapo2MISA (63 Cột)]` tại `components/workdesk/Launchpad.tsx` bị trùng lặp với menu Sidebar trái và thanh tìm kiếm nhanh ⌘K, làm đẩy danh sách việc cần làm (`TasksWidget`) và Radar chuỗi lạnh xuống sâu.
- **Yêu cầu xử lý:**
  * Loại bỏ `Launchpad.tsx` khỏi `LeftColumn.tsx`.
  * Đưa trực tiếp `TasksWidget` và các chỉ số vận hành quan trọng lên vị trí ưu tiên trực quan.
  * Giữ màn hình thoáng đãng, chống phân mảnh thị giác (anti visual clutter).

#### 2. UI/UX 2: BIẾN Ô DÒNG SỰ KIỆN RỖNG THÀNH REALTIME OPERATIONAL ACTIVITY STREAM
- **Vấn đề:** Khung "DÒNG SỰ KIỆN VẬN HÀNH & TIN TỨC" chiếm diện tích trung tâm lớn nhưng lại rỗng: hiển thị *"Chưa có sự kiện nào trong ca làm việc này"* do `SEED_ACTIVITIES` và `SEED_POSTS` trống.
- **Yêu cầu xử lý:**
  * Cập nhật `packages/modules/feed/mockData.ts` và `feedService.ts` nạp sẵn dòng sự kiện vận hành tự động (Realtime Operational Activity Stream) bám sát nhịp độ làm việc thực tế của Sơn Khang:
    1. `Đơn hàng #13571 (Khách sỉ: Đại lý Lẩu Phan Quán) vừa xác nhận qua Zalo — Chờ xuất kho Định Công.`
    2. `Tài xế Ngô Văn Tân bắt đầu ca giao hàng trên xe tải VAN 29C-882.60 (Nhiệt độ thùng: -18.4°C — Đạt chuẩn HACCP).`
    3. `Giao dịch VietQR Techcombank 22226060: Tự động gạch nợ thành công +125.000.000 ₫ cho Đơn sỉ Mì Indomie #13568.`
    4. `Thủ kho Trần Thị Ngọc Thúy hoàn tất biên bản KCS Lô Viên chiên LC Foods (-18°C, Date 86% — Đạt chuẩn nhập kho).`
    5. `Cảnh báo FEFO: Lô Mì Indomie Goreng (40 gói/thùng) còn 28 ngày hết hạn tại Kho Định Công — Cần ưu tiên xuất trước!`
  * Tích hợp tự động đẩy sự kiện mới vào stream khi có hành động phát sinh từ hệ thống.

#### 3. UI/UX 3: TÁI CẤU TRÚC GOM NHÓM MENU BÁN HÀNG & DMS TRÁNH PHÂN MẢNH
- **Vấn đề:** Phân hệ Bán hàng đang có 6 mục rời rạc nằm ngang hàng trên menu.
- **Yêu cầu xử lý:** Gom nhóm mạch lạc theo 2 luồng kinh doanh thực tế trong `packages/core/appRegistry.ts`:
  * **Kênh Bán lẻ đa kênh (Omnichannel & POS):** Đơn bán lẻ Sapo (`/sales`), Quầy POS K80 (`/pos`), Web Order B2B đặt nhanh (`/dathang`).
  * **Kênh Phân phối & Đại lý B2B (DMS & Pricing):** Khách hàng DMS & Tuyến Sales SFA GPS (`/customers`), Bảng giá sỉ Thùng/Pallet (`/pricing`), Trình tạo Báo giá B2B Zalo/PDF (`/pricing/quote`).

#### 4. UI/UX 4: TÁCH RIÊNG NHÓM "CÔNG CỤ & TIỆN ÍCH" KHỎI HỆ THỐNG
- **Vấn đề:** Nhóm Quản trị Hệ thống đang chứa các tiện ích rời làm dài thanh cuộn (Sổ tay vận hành, Hộp thư Mail Hub, Văn thư & HĐĐT).
- **Yêu cầu xử lý:**
  * Tách các miniapp văn phòng/tiện ích: `notes` (Sổ tay chành xe), `mail` (Mail Hub Gmail), `docs` (Văn thư & HĐĐT) sang nhóm phụ/tiện ích rõ ràng hoặc phân cấp hiển thị ngăn nắp, giữ nhóm Hệ thống chỉ tập trung vào `settings`, `audit`, `profile`, `dashboard`.

---

### III. NỘI DUNG 4 NÂNG CẤP LUỒNG DỮ LIỆU TỰ ĐỘNG HÓA (LOGIC GAPS):

#### 1. LOGIC GAP 1: CHUYỂN HÓA "SAPO2MISA 63 CỘT" THÀNH CỔNG ĐỒNG BỘ QUEUE TỰ ĐỘNG
- **Bối cảnh:** Tên gọi "63 cột" phản ánh luồng xuất Excel thủ công thời kỳ đầu.
- **Yêu cầu nâng cấp:**
  * Đổi tên hiển thị chính thức thành: **Cổng Kế toán MISA & meInvoice (Sync Queue Engine)**.
  * Xây dựng giao diện Hàng đợi đồng bộ (Sync Queue Monitor) tại `/finance/sapo2misa`:
    * *Số đơn trong queue* (Đang chờ / Đang xử lý / Thành công / Thất bại).
    * *Trạng thái đồng bộ MISA AMIS* (`/api/v1/sa/voucher/save` — Đã sinh chứng từ Nợ 131 Có 5111, Có 3331).
    * *Trạng thái phát hành meInvoice* (`/api/v1/invoice/publish` — Đã cấp mã CQT chưa).
    * *Nút Retry 1-chạm*: Tự động gửi lại đơn khi gặp sự cố gián đoạn mạng mà không bị treo hệ thống.

#### 2. LOGIC GAP 2: XUẤT LỆNH SOẠN HÀNG GỘP FEFO (BATCH PICKLIST) CHO 9 ĐƠN CHỜ
- **Bối cảnh:** Bàn làm việc đang ghi nhận 9 đơn chờ soạn kho tại Định Công & YB. Hiện thủ kho phải mở từng đơn lẻ tẻ, mất nhiều thời gian.
- **Yêu cầu nâng cấp:**
  * Bổ sung nút hành động **"Xuất Lệnh Soạn Hàng Gộp (Batch Picklist)"** tại widget luồng đơn hàng và `/sales`.
  * Tự động tổng hợp ma trận hàng cần soạn:
    * Gom tổng số lượng theo từng mặt hàng (ví dụ: Tổng 15 thùng Mì Indomie, 8 Can Tương ớt Sài Gòn 2L, 20 gói Chả mực HL, 12 khay Viên chiên LC Foods...).
    * Chỉ định chính xác vị trí lấy hàng, **Số Lô (Batch No)** và **Hạn dùng (Expiry Date)** theo thuật toán xuất kho FEFO lô cận Date trước.

#### 3. LOGIC GAP 3: TỰ ĐỘNG GẮN CỜ HÓA ĐƠN CHO KHÁCH SỈ CÓ MST (AUTO B2B TAX INVOICE)
- **Bối cảnh:** Hiện tại nhân viên phải bấm "Yêu cầu hóa đơn" thủ công từng đơn khách sỉ.
- **Yêu cầu nâng cấp:**
  * Xây dựng rule tự động kiểm tra MST khách hàng: Khi đơn hàng đổ về từ khách sỉ quen thuộc (Zalo/Web/DMS) có thông tin Mã số thuế hợp lệ trong cơ sở dữ liệu CRM (`/customers`):
    * Hệ thống tự động bật cờ `auto_tax_invoice: true`.
    * Tự động điền thông tin xuất hóa đơn VAT (Tên công ty, Địa chỉ theo ĐKKD, MST).
    * Đưa thẳng vào luồng ký số HSM và phát hành meInvoice ngay khi đơn hàng hoàn tất mà không cần kế toán thao tác tay.

#### 4. LOGIC GAP 4: ĐỐI SOÁT TỰ ĐỘNG KHI KẾ TOÁN TRƯỞNG VẮNG MẶT (AUTONOMOUS RECONCILE)
- **Bối cảnh:** Bàn trực ban ghi nhận Kế toán trưởng Hoàng Thị Nho đang Vắng mặt. Luồng tiền về tài khoản không được gián đoạn.
- **Yêu cầu nâng cấp:**
  * Kích hoạt cơ chế **Autonomous Auto-Reconcile** khi phát hiện trạng thái Kế toán vắng mặt:
    * Khi có biến động số dư VietQR Techcombank `22226060`, hệ thống tự động đối chiếu mã đơn hàng trong nội dung chuyển khoản.
    * Tự động sinh chứng từ ghi sổ vào MISA AMIS theo kịch bản định sẵn (`Nợ 1121 - Có 131/1388`).
    * Tự động gửi thông báo biến động số dư tức thời kèm trạng thái đối soát qua Telegram Bot / Zalo ZNS cho Giám đốc Hồ Bá Thịnh.

---

### IV. MA TRẬN 4 WORKER SQUAD THỰC THI CHỈ THI 20:

| Worker Squad | Trách Nhiệm Trọng Tâm | Danh Mục Tệp Trọng Tâm |
| :--- | :--- | :--- |
| **Worker 1 (UI/UX Cockpit)** | Gỡ bỏ `Launchpad.tsx`, đưa Tasks lên cao, nạp Realtime Activity Stream vào `mockData.ts` & `feedService.ts`. | `components/workdesk/LeftColumn.tsx`<br>`components/workdesk/CenterColumn.tsx`<br>`packages/modules/feed/**` |
| **Worker 2 (Navigation & Grouping)** | Tái cấu trúc menu Bán hàng (Bán lẻ vs DMS B2B) và tách riêng nhóm Công cụ & Tiện ích trong appRegistry. | `packages/core/appRegistry.ts`<br>`app/(shell)/page.tsx`<br>`components/shell/Sidebar.tsx` |
| **Worker 3 (MISA Queue & Batch Pick)** | Đổi tên 63 cột thành Cổng MISA Sync Queue (AMIS + CQT meInvoice + Retry); tạo tính năng Batch Picklist cho 9 đơn FEFO. | `app/(shell)/finance/sapo2misa/**`<br>`packages/modules/sales/**`<br>`components/workdesk/OrderPipelineWidget.tsx` |
| **Worker 4 (Auto Tax & Reconcile)** | Tự động gắn cờ HĐĐT meInvoice cho khách sỉ có MST; kích hoạt luồng đối soát tự động khi Kế toán vắng mặt. | `packages/modules/finance/financeService.ts`<br>`packages/modules/customers/**`<br>`components/workdesk/OnlineStaffWidget.tsx` |

---

### V. TIÊU CHÍ NGHIỆM THU NGHIÊM NGẶT (ACCEPTANCE CRITERIA):

1. `components/workdesk/LeftColumn.tsx` không còn cụm nút 1-Click lặp lại; `TasksWidget` hiển thị rõ ràng, thanh thoát.
2. Khung Dòng Sự Kiện trung tâm hiển thị tối thiểu 5 log hoạt động thực tế của Sơn Khang Food (đơn Zalo, xe VAN 29C-882.60, VietQR Techcombank 22226060, KCS -18°C, cảnh báo FEFO).
3. Đã có tính năng/nút "Xuất Lệnh Soạn Hàng Gộp (Batch Picklist)" cho 9 đơn chờ soạn kho Định Công.
4. Cổng MISA hiển thị hàng đợi Queue đồng bộ và cơ chế retry mạng.
5. Quy tắc Auto Tax cho khách sỉ và Auto-Reconcile khi kế toán vắng mặt được thiết lập.
6. `npx tsc --noEmit` đạt **0 lỗi tuyệt đối**.
7. Kịch bản `scripts/verify-directive-20.cjs` đạt **100% PASS**.
