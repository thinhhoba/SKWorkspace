# GAP ANALYSIS — 4 KHỐI PHÂN HỆ ERP vs SK WORKSPACE 2.0 (CHỈ THỊ 17 — HIỆU CHỈNH CHUẨN XÁC)

**Doanh nghiệp:** CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: 0111252725) — Đại diện: Giám đốc HỒ BÁ THỊNH (CCCD 001094016823)
**Tài khoản:** Techcombank `22226060` (BIN 970407) — VietQR tự động | **Kho duy nhất:** 96 Ngõ 337 Định Công (Kho khô + Kho đông -18~-22°C) | Văn phòng Yên Xuân — KHÔNG LƯU KHO
**Tham chiếu:** Sơ đồ 4 khối ERP (Mua hàng 7 / Kho hàng 7 / Bán hàng 9 / Tài chính-Kế toán 9) | **Ngày thẩm định:** 11/10/2026 | **Cơ sở:** 100% vận hành thực tế Sơn Khang Food
**Build hiện tại:** 66 routes | Prisma 9 models | 16 packages/modules | 22 mini-apps

---

## I. ĐẶC THÙ VẬN HÀNH CỐT LÕI (BẢN CHÍNH THỨC — CHỈ THỊ 17)

| # | Đặc thù | Chi tiết thực tế |
|---|---------|------------------|
| 1 | **Ngành hàng** | Mì Indomie (Đặc biệt/Cay nồng/Sườn/Bò cay…), Nissin Raoh, Tương ớt/cà Sài Gòn Can 2L, sốt Kewpie, dầu Cái Lân 5L, Viên chiên LC Foods, gà Popcorn CP, xúc xích, Tokbokki CJ, bánh gà Nét Việt |
| 2 | **Kho bãi** | **Yên Xuân (Thôn 6) = Văn phòng hành chính — KHÔNG LƯU KHO.** **Định Công (96/337) = Địa điểm duy nhất có lưu kho** — Khu 1 Kho khô (mì & gia vị), Khu 2 Kho đông chế biến sẵn (-18~-22°C) |
| 3 | **Đội xe** | **Xe máy** — hỏa tốc nội thành, ngõ ngách, quán ăn vặt/căng tin. **Xe VAN thùng bảo ôn/giữ nhiệt** — sỉ nhiều thùng, đông lạnh, ra chành Giáp Bát/Nước Ngầm, chạy nội đô 24/7 không cấm giờ |
| 4 | **Tam giác API** | **Sapo** (bán hàng đa kênh + POS K80, Open API) ↔ **SK Workspace** (hub vận hành) ↔ **Misa Amis Online + meInvoice C26TSK** (kế toán & HĐĐT) |

---

## II. TỔNG QUAN ĐỐI SOÁT 4 KHỐI

| Khối | Tổng mục (ảnh) | Đã có & vận hành | Thiếu (Gaps) | Thừa — Không làm | Đánh giá |
|------|:---:|:---:|:---:|:---:|----------|
| **1. Mua hàng** | 7 | 4 (57%) | 3 (43%) | 0 | Đủ dùng chu kỳ mua cơ bản |
| **2. Kho hàng** | 7 | 5 (71%) | 2 (29%) | 0 | Mạnh — quản lý chuẩn tại Kho Định Công |
| **3. Bán hàng** | 9 | 7 (78%) | 2 (22%) | 0 | Hoàn chỉnh B2B + POS |
| **4. Tài chính-Kế toán** | 9 | 3 (33%) | 2 (22%) | **4 (45%)** | **Giữ đúng ranh giới Misa Amis** |

> Quy ước cột **Đánh giá**: `Đã có` = vận hành thực tế | `Thiếu` = cần bổ sung | `Thừa` = over-engineering, không làm trên mini-app, để Misa Amis.

---

## III. MA TRẬN ĐỐI SOÁT CHI TIẾT (Tên tính năng | Hiện trạng | Đánh giá | Ưu tiên | Kết nối API)

### 1) MUA HÀNG — 7 mục

| # | Tính năng (ảnh) | Hiện trạng trên SK Workspace 2.0 | Đánh giá | Ưu tiên | Kết nối API | Ghi chú thực tế |
|---|-----------------|-----------------------------------|----------|---------|-------------|-----------------|
| 1.1 | Yêu cầu mua | Chưa có UI riêng — mới có logic ngưỡng tồn trong inventory | **Thiếu** | **P2** | Nội bộ (ngưỡng tồn) | Form đề xuất đặt mì Indomie/đồ đông lạnh khi chạm ngưỡng tối thiểu tại Kho Định Công |
| 1.2 | Nhà cung cấp | **Đã có** — `app/(shell)/purchase/page.tsx` + `app/api/purchase/suppliers/route.ts` | **Đã có** | — | — | CP, Indofood, LC Foods, CJ, Tân Việt… kèm MST/liên hệ |
| 1.3 | Báo giá NCC | Chưa có module so sánh giá NCC | **Thiếu** | **P3** | — | Lưu & so sánh giá sỉ giữa các đại lý cấp 1 |
| 1.4 | Đơn hàng mua | **Đã có** — `app/(shell)/purchase/page.tsx` + `app/api/purchase/**` | **Đã có** | — | — | Tạo PO → duyệt → nhập thẳng Kho Định Công |
| 1.5 | Hóa đơn & thanh toán NCC | **Đã có (cơ bản)** — `app/(shell)/finance` + `app/(shell)/purchase` | **Đã có** | — | Misa Amis (đẩy chứng từ) | Ghi nhận công nợ NCC, lệnh chi Techcombank |
| 1.6 | Chính sách & bảng giá mua | Chưa tách — mới có bảng giá bán (`/pricing`) | **Thiếu** | **P3** | — | Nên gắn vào NCC: chiết khấu nhập theo NCC |
| 1.7 | Báo cáo mua hàng | **Đã có** — `app/(shell)/reports` + `app/api/reports` | **Đã có** | — | — | Sản lượng nhập, giá vốn theo NCC |

### 2) KHO HÀNG — 7 mục (tập trung tại Kho Định Công)

| # | Tính năng (ảnh) | Hiện trạng trên SK Workspace 2.0 | Đánh giá | Ưu tiên | Kết nối API | Ghi chú thực tế |
|---|-----------------|-----------------------------------|----------|---------|-------------|-----------------|
| 2.1 | Kho & hàng hóa (SKU, vị trí) | **Đã có** — `app/(shell)/inventory/page.tsx` + `app/api/inventory/**` + `packages/modules/inventory` | **Đã có** | — | Sapo (đồng bộ tồn) | Quản lý tập trung **Kho Định Công** — 2 vùng: Kho khô (mì & gia vị) + Kho đông chế biến sẵn (-18~-22°C) |
| 2.2 | Chứng từ kho | **Đã có** — `app/(shell)/sales/[id]/pick` + `app/(shell)/inventory` | **Đã có** | — | — | Phiếu nhập/xuất bán sỉ & lẻ điện tử |
| 2.3 | Nhập - xuất kho | **Đã có** — luồng PO → nhập + xuất bán | **Đã có** | — | — | Tích hợp xuất bán & nhập từ PO |
| 2.4 | Kiểm kho (Stocktake) | API có, **thiếu UI kiểm kê** | **Thiếu** | **P1** | Nội bộ (đối soát Sapo) | Màn **Kiểm kê Kho Định Công**: quét barcode, đối soát tồn thực tế vs Sapo, ghi nhận hao hụt/lệch tồn khô vs đông lạnh |
| 2.5 | Chất lượng (KCS hàng về) | **Chưa có form KCS** | **Thiếu** | **P1** | Nội bộ | Nghiệm thu hàng về: cảm quan date Indomie/gia vị, đo nhiệt độ thùng bảo ôn viên chiên/gà popcorn khi nhận từ NCC |
| 2.6 | Sổ cái kho | **Đã có** — `app/(shell)/inventory` (thẻ kho) | **Đã có** | — | Misa Amis (đẩy giá vốn) | Lịch sử biến động tồn theo thời gian |
| 2.7 | Báo cáo kho | **Đã có (vượt trội)** — FEFO + cảnh báo tồn | **Đã có** | — | — | **FEFO cận date <30 ngày**, cảnh báo tồn dưới ngưỡng — lợi thế đặc thù |

### 3) BÁN HÀNG — 9 mục

| # | Tính năng (ảnh) | Hiện trạng trên SK Workspace 2.0 | Đánh giá | Ưu tiên | Kết nối API | Ghi chú thực tế |
|---|-----------------|-----------------------------------|----------|---------|-------------|-----------------|
| 3.1 | CRM (Hồ sơ, lịch sử KH) | **Đã có** — `app/(shell)/customers` + `app/api/customers/**` + `packages/modules/customers` | **Đã có** | — | Sapo (đồng bộ KH) | Đại lý, quán ăn, nhà hàng, căng tin, khách chành xe, hạn mức nợ gối đầu |
| 3.2 | Báo giá B2B | Chưa có module báo giá riêng | **Thiếu** | **P1** | — | Tạo báo giá sỉ mì Indomie/gia vị/viên chiên nhanh gửi Zalo cho quán & đại lý |
| 3.3 | Đơn hàng bán | **Đã có** — `app/(shell)/sales/**` + `app/api/sales/**` + `packages/modules/sales` | **Đã có** | — | Sapo (2 chiều) | Luồng 4 bước: Chờ duyệt → Soạn kho FEFO → Đang giao → Hoàn tất |
| 3.4 | Hóa đơn & thanh toán | **Đã có** — `app/api/finance/vietqr` (VietQR) + `app/(shell)/finance/sapo2misa` (63 cột) + `app/api/sapo2misa/meinvoice` | **Đã có** | — | **VietQR Techcombank 22226060** + **Misa Amis** + **meInvoice C26TSK** | Gạch nợ tự động VietQR + xuất HĐĐT |
| 3.5 | Đóng gói & giao hàng | **Đã có** — `app/(shell)/delivery` + `app/pwa/giaovan` + `packages/modules/delivery` | **Đã có** (cần tách tuyến rõ hơn) | **P1** | — | Phân luồng: **Tuyến Xe máy** (nội thành, đơn lẻ hỏa tốc) vs **Tuyến Xe tải VAN** (sỉ nhiều thùng, đông lạnh, chành Giáp Bát/Nước Ngầm) |
| 3.6 | Chương trình bán hàng | **Đã có** — `app/(shell)/pricing` + `packages/modules/pricing` | **Đã có** | — | — | Chính sách giá sỉ theo sản lượng, chiết khấu đại lý |
| 3.7 | Bán hàng POS | **Đã có** — `app/pos/page.tsx` | **Đã có** | — | Sapo (POS) | POS tại quầy Kho Định Công, in bill K80, VietQR động |
| 3.8 | Bán hàng Website | **Đã có** — `app/dathang/page.tsx` | **Đã có** | — | — | Cổng Web Order B2B cho khách buôn tự đặt |
| 3.9 | Báo cáo bán hàng | **Đã có** — `app/(shell)/reports` + Dashboard `/` (Smart Workdesk) | **Đã có** | — | Sapo (doanh thu realtime) | Phân loại kênh sỉ vs lẻ |

### 4) TÀI CHÍNH - KẾ TOÁN — 9 mục (RANH GIỚI VỚI MISA AMIS ONLINE)

| # | Tính năng (ảnh) | Hiện trạng trên SK Workspace 2.0 | Đánh giá | Ưu tiên | Kết nối API | Ghi chú thực tế |
|---|-----------------|-----------------------------------|----------|---------|-------------|-----------------|
| 4.1 | Tiền mặt & tiền gửi | **Đã có** — `app/(shell)/finance` + `app/api/finance/**` + `packages/modules/finance` | **Đã có** | — | **VietQR Techcombank 22226060** | Sổ quỹ tiền mặt + tiền gửi, đối soát VietQR tự động |
| 4.2 | Kế toán bán hàng | **Đã có (thiếu tuổi nợ)** — công nợ có, chưa có aging | **Thiếu (nhẹ)** | **P1** | Misa Amis (đẩy 63 cột) | Cần bổ sung **bảng tuổi nợ** (trong hạn / quá hạn 15 ngày / quá hạn 30 ngày) cho khách buôn |
| 4.3 | Kế toán mua hàng | **Đã có (cơ bản)** — `app/(shell)/purchase` + `app/(shell)/finance` | **Đã có** | — | Misa Amis | Theo dõi công nợ gối đầu NCC |
| 4.4 | Kế toán kho hàng | **Đã có (cầu nối)** — `app/(shell)/finance/sapo2misa` + `app/api/sapo2misa/**` | **Đã có** | — | **Misa Amis (63 cột)** | Đẩy dữ liệu xuất kho & giá vốn 63 cột sang Misa Amis tự động |
| 4.5 | Kế toán tài sản | Không có | **Thừa — KHÔNG LÀM** | — | **Misa Amis** | Khấu hao, quản lý TSCĐ thuộc Misa Amis |
| 4.6 | Kế toán ngân sách | Không có | **Thừa — KHÔNG LÀM** | — | **Misa Amis** | Quy mô SME không cần lập ngân sách phức tạp |
| 4.7 | Kế toán tổng hợp (GL) | Không có | **Thừa — TUYỆT ĐỐI KHÔNG LÀM** | — | **Misa Amis** | Bút toán kết chuyển, GL do Kế toán trưởng Hoàng Thị Nho hạch toán trên Misa Amis |
| 4.8 | Kế toán tiền lương | **Đã có (mức quản trị)** — `app/(shell)/hr` + `packages/modules/hr` | **Đã có** | — | Misa Amis (đẩy lương) | Chấm công, tính lương & phụ cấp cơ bản |
| 4.9 | Báo cáo tài chính & thuế | Xuất qua Misa/meInvoice — không làm BCTC trên web | **Thừa — KHÔNG LÀM trên web** | — | **Misa Amis + meInvoice C26TSK** | Khai thuế, BCTC pháp lý kết xuất chính thức từ Misa Amis |

---

## IV. TAM GIÁC TÍCH HỢP API — KIẾN TRÚC CHUẨN SƠN KHANG FOOD

```
                         ┌────────────────────────────────────────┐
                         │         SAPO OPEN API (BÁN HÀNG)        │
                         │  • Đa kênh + POS K80 + tồn kho store   │
                         │  • Webhook orders/create|update         │
                         └──────────────────┬─────────────────────┘
                                            │ 2 chiều (pull/push/webhook)
                                            ▼
                   ┌──────────────────────────────────────────────────┐
                   │          SK WORKSPACE 2.0 — HUB ĐIỀU HÀNH         │
                   │  • Kho Định Công: khô + đông -18~-22°C            │
                   │  • Đội xe: Xe máy (hỏa tốc) & VAN bảo ôn (sỉ/bến) │
                   │  • FEFO cận date <30 ngày                         │
                   │  • VietQR Techcombank 22226060 (BIN 970407)       │
                   │  • Trạm 63 cột Sapo2Misa (làm sạch & đối chiếu)   │
                   └────────────────────────┬─────────────────────────┘
                                            │ API đẩy chứng từ & HĐĐT
                                            ▼
        ┌────────────────────────────────────────────────────────────────┐
        │              HỆ SINH THÁI MISA API (KẾ TOÁN & PHÁP LÝ)         │
        │  • MISA AMIS Online: Sổ cái, giá vốn, công nợ, BCTC, thuế GTGT │
        │  • MISA meInvoice: Ký số & phát hành HĐĐT (C26TSK)              │
        └────────────────────────────────────────────────────────────────┘
```

**Nguyên tắc ranh giới:** SK Workspace **chỉ làm** Sổ quỹ dòng tiền thực + VietQR gạch nợ + Cầu nối 63 cột. **Không làm** GL / Tài sản / Ngân sách / BCTC-thuế trên mini-app — để Misa Amis.

---

## V. 4 LỢI THẾ ĐẶC THÙ — ERP MẪU KHÔNG CÓ

| # | Lợi thế | Mô tả vận hành | Trạng thái trên SK Workspace |
|---|---------|----------------|------------------------------|
| 1 | **Xe VAN thùng bảo ôn/giữ nhiệt** | Giao đông lạnh chế biến sẵn (viên chiên LC Foods, gà Popcorn CP) cho quán ăn & ra chành Giáp Bát/Nước Ngầm; chạy nội đô 24/7 không cấm giờ — vượt trội so với xe tải thùng nặng | **Đã có** — `app/(shell)/fleet` + `packages/modules/fleet` (IoT -18°C, GPS, HACCP) |
| 2 | **Cảnh báo cận date FEFO** | Thực phẩm ăn liền & đông lạnh có date ngắn; hệ thống tự động ưu tiên xuất lô cận hạn (<30 ngày) và cảnh báo xả kho, tránh tồn hết date | **Đã có (vượt trội)** — `app/(shell)/inventory` FEFO <30 ngày + cảnh báo tồn |
| 3 | **VietQR Instant Reconcile** | Khớp lệnh tự động số dư Techcombank 22226060 (BIN 970407) theo từng đơn hàng — khách quét mã VietQR là gạch nợ ngay | **Đã có** — `app/api/finance/vietqr` (HMAC) + `packages/modules/finance` + `packages/modules/payment/vietqr` |
| 4 | **Tam giác API Sapo ↔ SK Workspace ↔ Misa** | Bán hàng (Sapo) → Vận hành (SK Workspace) → Kế toán (Misa Amis/meInvoice) khép kín, dữ liệu sạch 63 cột, tự động | **Đã có** — `app/api/sapo/**` + `app/api/sapo2misa/**` + `packages/integrations/*` |

---

## VI. LỘ TRÌNH TRIỂN KHAI BỔ SUNG (ROADMAP P1 → P3)

### Giai đoạn 1 — P1 (1–2 tuần) — Kho Định Công & Bán buôn
1. **Kiểm kê Kho Định Công** — form kiểm kê định kỳ, barcode, đối soát Sapo, ghi nhận chênh lệch khô vs đông lạnh.
2. **KCS tiếp nhận hàng** — form nghiệm thu: date Indomie/gia vị + nhiệt độ thùng bảo ôn viên chiên/gà popcorn.
3. **Báo giá B2B** — tạo & xuất PDF/ảnh gửi Zalo cho đại lý chành xe & quán ăn.
4. **Phân luồng giao vận** — UI điều phối chọn phương tiện rõ ràng: **Xe máy** vs **Xe tải VAN** (sỉ/bến).
5. **Tuổi nợ B2B** — bảng aging (trong hạn / quá hạn 15d / quá hạn 30d) trong `/finance`.

### Giai đoạn 2 — P2 (2–3 tuần) — Mua hàng
1. **Yêu cầu mua hàng** — form đề xuất khi chạm ngưỡng tồn tối thiểu.
2. **So sánh báo giá NCC** — bảng so giá giữa các đại lý cấp 1.

### Giai đoạn 3 — P3 & Ranh giới
- **P3:** Hoàn thiện báo cáo mua hàng, chính sách giá mua theo NCC.
- **Kiên quyết KHÔNG làm:** Kế toán tài sản, ngân sách, GL, BCTC-thuế trên web — tối ưu API **Sapo → SK Workspace (63 cột) → Misa Amis & meInvoice**.

---

## VII. PHỤ LỤC — ĐỐI CHIẾU ROUTES HIỆN TẠI (66 routes build)

**Pages (33):** `/(shell)/page` (Smart Workdesk), `/sales`, `/sales/[id]`, `/sales/[id]/pick`, `/sales/new`, `/sales/sapo`, `/pos`, `/dathang`, `/customers`, `/pricing`, `/purchase`, `/inventory`, `/delivery`, `/fleet` (Đội xe & Chuỗi lạnh -18°C), `/finance`, `/finance/sapo2misa`, `/reports`, `/feed`, `/tasks`, `/notes`, `/chat`, `/mail`, `/hr`, `/profile`, `/docs`, `/audit`, `/settings`, `/pwa/*` (giaovan/kho/toi), `/login`

**APIs (56 route.ts):** `auth/*`, `customers`, `sales`, `purchase/*`, `inventory/*`, `delivery/*`, `fleet/*` (telemetry, haccp), `finance/*` (vietqr, transactions), `sapo/*` (products, inventory, customers, fulfillment, hub, webhooks), `sapo2misa/*` (amis, export, ledger, meinvoice, sync), `pricing/*`, `reports`, `feed/*`, `tasks/*`, `hr/*`, `docs`, `audit`, `settings`, `health`

**Prisma 9 models:** User, Customer, InventoryItem, StockTransfer, Order, MisaLedgerEntry, FeedPost, FeedComment, FeedLike

**Đối chiếu nhanh:** Mua hàng 4/7 đã có, Kho 5/7 đã có (+FEFO vượt trội), Bán hàng 7/9 đã có, Tài chính 3/9 làm trên web + 4/9 để Misa (đúng ranh giới).

---

*Hiệu chỉnh theo Chỉ thị 17 — 11/10/2026 — Claude Opus 5.5 (Tổng Chỉ Huy) — Quy trình 4 Agents*
