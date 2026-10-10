# CHỈ THỊ LỆNH TỪ COMMANDER & CHỦ TỊCH — SỐ 16
# DỰ ÁN: SK WORKSPACE 2.0 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# CHỦ ĐỀ TRỌNG TÂM:
# THIẾT KẾ BÀN LÀM VIỆC ĐIỀU HÀNH THÔNG MINH (SMART WORKDESK)
# PHONG CÁCH HYBRID NEWSFEED KẾT HỢP OPERATIONAL DASHBOARD C-SUITE

---

### I. CĂN CỨ DOANH NGHIỆP & BỐI CẢNH NGHIỆP VỤ:
- **Pháp nhân:** CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: `0111252725`)
- **Người đại diện theo pháp luật:** Giám đốc HỒ BÁ THỊNH (CCCD: 001094016823, Sinh 20/11/1994)
- **Cơ sở hạ tầng:** Kho Tổng Định Công (96 Ngõ 337 Định Công, Hoàng Mai) & Kho Yên Bình (Thạch Thất)
- **Đội xe tải đông lạnh:** Isuzu QKR 270 `29C-882.60` (-18°C) — Tài xế NGÔ VĂN TÂN (`0942 22 60 60`)
- **Tài khoản thanh toán:** Techcombank `22226060` — Chủ TK: CÔNG TY TNHH THỰC PHẨM SƠN KHANG

Sau khi hoàn thành xuất sắc chu trình khép kín tại Chỉ thị 15, Ban Quản Trị yêu cầu nâng cấp toàn diện giao diện trang chủ điều hành (`/`) thành **Bàn Làm Việc Đa Năng (Hybrid Workdesk)**, kết hợp giữa sức mạnh số liệu của **Operational Dashboard** và tính tương tác sống động, gắn kết của **Newsfeed Doanh Nghiệp**.

---

### II. QUY CÁCH THIẾT KẾ BÀN LÀM VIỆC HYBRID (TRI-COLUMN COCKPIT):

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        TOP BAR: BRANDING, SEARCH, NOTIFICATION & PROFILE               │
├──────────────────────────┬───────────────────────────────┬─────────────────────────────┤
│   CỘT TRÁI (25% - LEFT)  │     CỘT GIỮA (50% - CENTER)   │    CỘT PHẢI (25% - RIGHT)   │
│   EXECUTIVE DASHBOARD    │    OPERATIONAL NEWSFEED STREAM│    LOGISTICS RADAR & CHAT   │
├──────────────────────────┼───────────────────────────────┼─────────────────────────────┤
│ • 4 Thẻ KPI Real-time    │ • Composer Đăng Bài Nhanh     │ • Radar Xe Lạnh Isuzu 29C   │
│   (Doanh thu, FEFO, IoT, │   (Thông báo, Khen thưởng,    │   (-18°C, Lốc lạnh, GPS)    │
│   Techcombank 22226060)  │   Kho vận, Chỉ đạo khẩn)      │ • Kênh Chat Mini Nội Bộ     │
│ • Launchpad Tác Vụ Nhanh │ • Dòng Sự Kiện Tự Động:       │   (#tong-cong-ty, #dieu-kho)│
│   (POS, B2B Order, FEFO) │   - Đơn mới Web/Sapo đổ về    │ • Quick Scratchpad Ghi Chú  │
│ • Widget "Việc Của Tôi"  │   - Tiền VietQR về ngân hàng  │ • Nhân Sự Đang Trực Ca      │
│   (Danh sách task cá nhân│   - Xe lạnh lăn bánh bến xe   │   (Thúy, Tân, Nho, Thịnh)   │
│   cần xử lý trong ngày)  │ • Bình Luận & Tương Tác Thread│                             │
└──────────────────────────┴───────────────────────────────┴─────────────────────────────┘
```

#### 1. Cột Trái (Left Column — 25%): Executive Dashboard & Quick Launcher
- **4 Thẻ KPI Claymorphism thời gian thực:**
  1. *Doanh thu hôm nay (Live Sapo API)*: Tổng doanh thu bán buôn & bán lẻ kèm so sánh tăng trưởng.
  2. *Đơn cần soạn kho (FEFO)*: Số lượng đơn hàng đang chờ Thủ kho Trần Thị Ngọc Thúy kiểm đếm.
  3. *Giám sát xe lạnh Isuzu 29C-882.60*: Trạng thái nhiệt độ hiện tại (-18.4°C) kèm đèn báo HACCP an toàn.
  4. *Số dư ngân hàng Techcombank 22226060*: Dòng tiền thu trong ngày đã khớp VietQR tự động.
- **Launchpad Tác Vụ Nhanh (1-Click Actions):**
  - Mở cổng Web Order B2B (`dathang.sonkhang.vn`).
  - Mở quầy bán lẻ POS Kho (`pos.sonkhang.vn`).
  - Mở màn hình Soạn hàng FEFO 100% (`/sales/[id]/pick`).
  - Tra cứu biến động số dư VietQR (`/finance`).
- **Widget "Nhiệm vụ của tôi" (My Daily Tasks):** Tích hợp từ phân hệ `/tasks`, cho phép tích chọn hoàn thành trực tiếp ngay trên bàn làm việc.

#### 2. Cột Giữa (Center Column — 50%): Operational Newsfeed Stream
- **Khung soạn thảo bài viết nội bộ (Social Composer):**
  - Cho phép Giám đốc và các trưởng bộ phận đăng bài kèm gắn thẻ phân loại: `#thong-bao`, `#khen-thuong`, `#kho-van`, `#kinh-doanh`, `#khan-cap`.
  - Hỗ trợ ghim bài thông báo quan trọng lên đầu feed.
- **Dòng sự kiện hoạt động tự động (Auto-Generated Activity Feed):**
  Hệ thống tự động lắng nghe và đẩy các sự kiện quan trọng vào dòng tin:
  - 📦 *Đơn hàng mới*: "Khách hàng Chành xe Nam Định vừa đặt đơn `#SK-WEB-261010-0045` trị giá 24.500.000₫."
  - ❄️ *Hành trình xe lạnh*: "Xe Isuzu `29C-882.60` (Tài xế Ngô Văn Tân) đang di chuyển đến Bến xe Giáp Bát — Nhiệt độ thùng: `-18.5°C`."
  - 💰 *Gạch nợ VietQR*: "Khách hàng Nhà hàng Phố Cổ vừa chuyển khoản 8.200.000₫ vào Techcombank `22226060` qua mã VietQR."
  - 📋 *Kiểm đếm kho*: "Thủ kho Trần Thị Ngọc Thúy đã hoàn tất soạn hàng FEFO 100% cho đơn `#13542`."
- **Tương tác xã hội doanh nghiệp:**
  - Nút Thả tim (Like/Celebrate).
  - Khung Bình luận theo luồng (Threaded Comments) để các bộ phận trao đổi, đôn đốc tiến độ ngay trên mỗi bài viết hoặc sự kiện.

#### 3. Cột Phải (Right Column — 25%): Logistics Radar, Internal Chat & Mini-Widgets
- **Radar Giám Sát Chuỗi Lạnh Xe `29C-882.60`:**
  - Biểu đồ mini hiển thị biến động nhiệt độ trong ngày.
  - Trạng thái lốc lạnh (`Đang chạy`), cửa thùng (`Đóng kín`), điện áp bình ắc quy (`24.2V`).
  - Nút xuất nhanh biên bản kiểm định nhiệt độ HACCP cho chuyến hàng.
- **Trò chuyện nội bộ mini (Mini Chat Box):**
  - Cửa sổ chat nhỏ kết nối phân hệ `/chat`, hiển thị 2 kênh chính: `#tong-cong-ty` và `#dieu-kho`.
  - Cho phép nhắn tin nhanh không cần rời khỏi bàn làm việc.
- **Quick Scratchpad:** Sổ ghi chú nhanh cá nhân, tự động lưu trữ trên trình duyệt.
- **Bảng trực ban & Nhân sự Online:** Hiển thị danh sách nhân sự đang trực ca (Thủ kho Thúy, Tài xế Tân, Kế toán Nho, Giám đốc Thịnh).

---

### III. MA TRẬN PHÂN BỔ 6 WORKER SQUAD THỰC THI CHỈ THỊ 16

| Worker Squad | Trách Nhiệm Phân Hệ Cụ Thể | Danh Mục Tệp Trọng Tâm |
| :--- | :--- | :--- |
| **Worker 1** *(Shell & Layout)* | Xây dựng kiến trúc 3 cột Responsive cho trang chủ Bàn làm việc `/`, đảm bảo co giãn mượt mà từ 4K đến Mobile. | `app/(shell)/page.tsx`<br>`components/workdesk/**`<br>`app/(shell)/layout.tsx` |
| **Worker 2** *(Activity Stream Engine)* | Xây dựng API và cơ chế tổng hợp luồng sự kiện tự động (Aggregation Stream) kết hợp bài đăng nội bộ và sự kiện Sapo/Kho. | `app/api/feed/stream/route.ts`<br>`packages/modules/feed/**` |
| **Worker 3** *(Finance & Task Widgets)* | Tích hợp Widget KPI doanh thu thực tế, số dư Techcombank `22226060` và Widget công việc cá nhân (My Tasks). | `components/workdesk/FinanceWidget.tsx`<br>`components/workdesk/TasksWidget.tsx` |
| **Worker 4** *(Cold Chain Radar)* | Thiết kế Radar mini giám sát xe Isuzu `29C-882.60`, hiển thị biểu đồ nhiệt độ -18°C và trạng thái máy lạnh. | `components/workdesk/FleetRadarWidget.tsx`<br>`app/api/fleet/telemetry/route.ts` |
| **Worker 5** *(Social Interactions)* | Hoàn thiện tính năng tương tác Newsfeed: Soạn thảo bài đăng có gắn tag, Like, Thảo luận luồng và ghim bài viết. | `components/workdesk/NewsfeedComposer.tsx`<br>`components/workdesk/FeedCard.tsx` |
| **Worker 6** *(QA & Quality Gate)* | Kiểm tra toàn bộ mã nguồn TypeScript, đảm bảo không có lỗi type, hiệu năng tải trang `< 1.2s`, build 66+ routes thành công. | `scripts/verify-directive-16.cjs`<br>Pre-flight Quality Check |

---

### IV. TIÊU CHUẨN NGHIỆM THU (QUALITY GATE):
1. **Thiết kế chuẩn thẩm mỹ:** Đạt chuẩn phong cách Modern SaaS / Claymorphism cao cấp, typography Inter, màu sắc semantic dịu mắt, không dùng màu sắc chói lóa.
2. **TypeScript & Build:** `npx tsc --noEmit` đạt **0 lỗi tuyệt đối**; `npm run build` thành công **100% routes**.
3. **Hiệu năng:** Tải trang nhanh, mượt mà, các widget dữ liệu tự động cập nhật ngầm mà không gây giật lag.
4. **Báo cáo nghiệm thu:** Kết quả thực hiện được ghi nhận đầy đủ vào `.claude/reports/directive-16.md` và `.claude/reports/latest.md`.

**BAN HÀNH BỞI: COMMANDER & CHỦ TỊCH HỒ BÁ THỊNH**  
*Chỉ thị số 16 có hiệu lực thi hành ngay lập tức.*
