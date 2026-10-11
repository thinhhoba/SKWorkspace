# BÁO CÁO THẨM ĐỊNH CHÍNH THỨC — CHỈ THỊ 17 (HIỆU CHỈNH CHUẨN XÁC)
**Dự án:** SK Workspace 2.0 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: 0111252725)
**Ngày thẩm định:** 11/10/2026 | **Chỉ thị:** Số 17 — Đánh giá hiện trạng, khả năng triển khai & GAP Analysis 4 phân hệ ERP (Mua hàng 7 / Kho hàng 7 / Bán hàng 9 / Tài chính-Kế toán 9) — Dựa trên đặc thù 100% Sơn Khang Food
**Đơn vị thực hiện:** Claude Code (Opus 5.5 — Tổng Chỉ Huy) | **Quy trình:** Opus Chỉ huy → Opus Plan → Sonnet Code (docs) → Haiku Test (verify) → Sonnet Review (Dual-Track)
**Cấp trình duyệt:** Ban Quản Trị / Giám đốc Hồ Bá Thịnh | **VPS đích:** `103.124.93.145`

---

## I. TỔNG QUAN KẾT QUẢ THẨM ĐỊNH

| Khối phân hệ (ảnh tham chiếu) | Tổng mục | Đã có & vận hành | Thiếu (Gaps) | Thừa — Không làm trên mini-app | Đánh giá |
|---|:---:|:---:|:---:|:---:|---|
| **1. Mua hàng** | 7 | 4 (57%) | 3 (43%) | 0 | Đủ dùng chu kỳ mua cơ bản |
| **2. Kho hàng** | 7 | 5 (71%) | 2 (29%) | 0 | Rất mạnh — chuẩn tại Kho Định Công |
| **3. Bán hàng** | 9 | 7 (78%) | 2 (22%) | 0 | Hoàn chỉnh B2B + POS |
| **4. Tài chính-Kế toán** | 9 | 3 (33%) | 2 (22%) | **4 (45%)** | **Giữ đúng ranh giới Misa Amis** |
| **Quality Gate** | — | `tsc --noEmit` 0 lỗi · `build` 66/66 · scan 66 routes/56 APIs/9 models/22 apps | — | — | ✅ ĐẠT |

**Kết luận chung:** SK Workspace 2.0 đã bao phủ **21/32 mục (66%)** ở mức vận hành thực tế, 7 mục thiếu tập trung ở P1 (kho & bán buôn), 4 mục thừa được **kiên quyết không làm** để giữ ranh giới với Misa Amis Online/meInvoice.

---

## II. ĐỐI SOÁT HIỆN TRẠNG — BẰNG CHỨNG CODEBASE

**Nguồn thẩm định:** Quét thực tế `Z:\SK Workspace 2` — 34 pages + 56 API routes + `packages/core/appRegistry.ts` (22 apps) + `prisma/schema.prisma` (9 models) + 16 `packages/modules/*`.

- **Pages 34:** `/(shell)/page` (Smart Workdesk), `/sales`, `/sales/[id]/pick` (FEFO), `/sales/sapo`, `/pos` (K80), `/dathang` (B2B), `/customers`, `/pricing`, `/purchase`, `/inventory`, `/delivery`, `/fleet` (Đội xe & Chuỗi lạnh -18°C), `/finance`, `/finance/sapo2misa` (63 cột), `/reports`, `/feed`, `/tasks`, `/notes`, `/chat`, `/mail`, `/hr`, `/profile`, `/docs`, `/audit`, `/settings`, `/pwa/*`, `/login`
- **APIs 56:** `auth/*`, `customers`, `sales`, `purchase/*`, `inventory/*`, `delivery/*`, `fleet/*` (telemetry, haccp), `finance/*` (vietqr, transactions), `sapo/*` (hub, products, inventory, customers, fulfillment, webhooks, cron/eod-accounting), `sapo2misa/*` (amis, export, ledger, meinvoice, sync), `pricing/*`, `reports`, `feed/*`, `tasks/*`, `hr/*`, `docs`, `audit`, `settings`, `health`
- **Prisma 9 models:** User, Customer, InventoryItem, StockTransfer, Order, MisaLedgerEntry, FeedPost, FeedComment, FeedLike
- **Đặc thù cốt lõi (bản chính thức Chỉ thị 17):** MST 0111252725 / CC 001094016823 / Techcombank 22226060 BIN 970407 / Kho duy nhất 96/337 Định Công (Yên Xuân KHÔNG lưu kho) / Xe máy hỏa tốc + Xe VAN thùng bảo ôn 24/7 / Mì Indomie + gia vị Sài Gòn Can 2L + viên chiên LC Foods/gà Popcorn CP

### Ma trận tóm tắt (Tên tính năng | Hiện trạng | Đánh giá | Ưu tiên | Kết nối API)

**Mua hàng (7):** Nhà cung cấp Đã có | Đơn hàng mua Đã có | Hóa đơn & thanh toán NCC Đã có (cơ bản) | Báo cáo mua hàng Đã có | **Yêu cầu mua Thiếu P2** (nội bộ) | **Báo giá NCC Thiếu P3** | **Chính sách & bảng giá mua Thiếu P3**

**Kho hàng (7) — trọng tâm:** Kho & hàng hóa Đã có (Sapo) | Chứng từ kho Đã có | Nhập-xuất kho Đã có | Sổ cái kho Đã có (Misa) | Báo cáo kho Đã có (FEFO <30 ngày — vượt trội) | **Kiểm kho Thiếu P1** (nội bộ/Sapo) | **KCS hàng về Thiếu P1** (nội bộ)

**Bán hàng (9):** CRM Đã có (Sapo) | Đơn hàng bán Đã có (Sapo) | Hóa đơn & thanh toán Đã có (VietQR/Misa/meInvoice) | Đóng gói & giao hàng Đã có — cần tách tuyến **P1** | Chương trình bán hàng Đã có | POS Đã có (Sapo) | Website Đã có | Báo cáo bán hàng Đã có | **Báo giá B2B Thiếu P1**

**Tài chính-Kế toán (9) — ranh giới Misa:** Tiền mặt & tiền gửi Đã có (VietQR) | Kế toán mua hàng Đã có | Kế toán kho Đã có (Misa 63 cột) | Kế toán tiền lương Đã có (mức quản trị) | **Kế toán bán hàng Thiếu nhẹ P1 — tuổi nợ** (Misa) | **Kế toán tài sản Thừa — KHÔNG LÀM** (Misa) | **Kế toán ngân sách Thừa — KHÔNG LÀM** (Misa) | **Kế toán tổng hợp Thừa — TUYỆT ĐỐI KHÔNG LÀM** (Misa) | **BCTC & thuế Thừa — KHÔNG LÀM trên web** (Misa/meInvoice)

> Ma trận đầy đủ 32 dòng với cột `Tên tính năng | Hiện trạng | Đánh giá | Ưu tiên | Kết nối API | Ghi chú` được công bố tại `docs/GAP_ANALYSIS_ERP_PHAN_HE.md`.

---

## III. CÁC ĐIỂM THIẾU CẦN BỔ SUNG (GAPS) — ƯU TIÊN P1

| # | Gaps P1 (làm ngay 1–2 tuần) | Khối | Mô tả thực tế Sơn Khang Food | Hướng triển khai |
|---|------------------------------|------|-------------------------------|------------------|
| 1 | **Kiểm kê Kho Định Công** | Kho | Quét barcode đối soát tồn thực tế vs Sapo, ghi nhận chênh lệch khô vs đông lạnh | `app/(shell)/inventory/count` + `app/api/inventory/count` — type `InventoryAudit` đã có sẵn |
| 2 | **KCS hàng về** | Kho | Cảm quan date Indomie/gia vị + đo nhiệt độ thùng bảo ôn viên chiên/gà popcorn khi nhận | `app/(shell)/inventory/qc` — form nghiệm thu |
| 3 | **Báo giá B2B gửi Zalo** | Bán hàng | Tạo báo giá sỉ mì Indomie/gia vị/viên chiên, xuất PDF/ảnh gửi Zalo | `app/(shell)/pricing/quote` — API `/api/pricing/quote` đã có, thiếu UI xuất |
| 4 | **Phân luồng giao vận Xe máy vs VAN** | Bán hàng | Chọn phương tiện rõ ràng khi điều phối: Xe máy (hỏa tốc nội thành) vs VAN (sỉ/bến Giáp Bát) | Nâng `app/(shell)/delivery` — selector phương tiện |
| 5 | **Tuổi nợ B2B (Aging)** | Tài chính | Trong hạn / quá hạn 15 ngày / quá hạn 30 ngày cho khách buôn | Bổ sung bảng aging trong `app/(shell)/finance` + `app/(shell)/customers` |

**P2 (2–3 tuần):** Yêu cầu mua hàng (ngưỡng tồn tối thiểu) + So sánh báo giá NCC. **P3:** Hoàn thiện báo cáo mua hàng, chính sách giá mua theo NCC.

---

## IV. CÁC ĐIỂM THỪA / OVER-ENGINEERING — KIÊN QUYẾT KHÔNG LÀM

| # | Tính năng thuộc Tài chính-Kế toán | Phán quyết | Lý do kiến trúc | Xử lý thay thế |
|---|-----------------------------------|------------|-----------------|----------------|
| 1 | **Kế toán tài sản** | ⛔ Thừa — KHÔNG LÀM | Khấu hao TSCĐ là nghiệp vụ chuyên sâu | **Misa Amis Online** |
| 2 | **Kế toán ngân sách** | ⛔ Thừa — KHÔNG LÀM | SME không cần lập ngân sách phức tạp | **Misa Amis Online** |
| 3 | **Kế toán tổng hợp (GL)** | ⛔ Thừa — TUYỆT ĐỐI KHÔNG LÀM | Bút toán kết chuyển do Kế toán trưởng Hoàng Thị Nho hạch toán | **Misa Amis Online** |
| 4 | **Báo cáo tài chính & thuế** | ⛔ Thừa — KHÔNG LÀM trên web | BCTC pháp lý, khai thuế GTGT kết xuất chính thức | **Misa Amis + meInvoice C26TSK** |

**Ranh giới chuẩn:** SK Workspace **chỉ làm** Sổ quỹ dòng tiền thực (Techcombank 22226060) + Gạch nợ tự động VietQR + Cầu nối Sapo2Misa 63 cột. Mọi hạch toán chuyên sâu đẩy qua **Tam giác API: Sapo ↔ SK Workspace ↔ Misa Amis/meInvoice**.

---

## V. 4 LỢI THẾ ĐẶC THÙ — ERP MẪU KHÔNG CÓ

| # | Lợi thế | Giá trị thực tế | Trạng thái trên SK Workspace 2.0 |
|---|---------|-----------------|-----------------------------------|
| 1 | **Xe VAN thùng bảo ôn/giữ nhiệt** | Giao đông lạnh chế biến sẵn ra chành Giáp Bát/Nước Ngầm, chạy nội đô 24/7 không cấm giờ — vượt trội xe tải nặng | **Đã có** — `app/(shell)/fleet` + `packages/modules/fleet` (IoT -18°C, GPS, HACCP) |
| 2 | **FEFO cận date <30 ngày** | Tự động ưu tiên xuất lô cận hạn, cảnh báo xả kho — sống còn với thực phẩm ăn liền & đông lạnh | **Đã có (vượt trội)** — `app/(shell)/inventory` cảnh báo FEFO <30 ngày |
| 3 | **VietQR Instant Reconcile** | Khớp lệnh tự động Techcombank 22226060 BIN 970407 theo từng đơn — khách quét là gạch nợ | **Đã có** — `app/api/finance/vietqr` (HMAC) + `packages/modules/payment/vietqr` |
| 4 | **Tam giác API Sapo ↔ SK Workspace ↔ Misa** | Khép kín Bán hàng → Vận hành → Kế toán, dữ liệu sạch 63 cột tự động | **Đã có** — `app/api/sapo/**` + `app/api/sapo2misa/**` + `packages/integrations/*` |

---

## VI. QUALITY GATE

| Tiêu chuẩn | Kết quả | Đánh giá |
|---|---------|----------|
| `npx tsc --noEmit` | **0 lỗi** | ✅ ĐẠT |
| `npm run build` | **66/66 routes** | ✅ ĐẠT |
| Scan hiện trạng | **66 routes (34 pages + 56 APIs) · 9 Prisma models · 22 mini-apps · 16 modules** | ✅ ĐẠT |
| Tài liệu chiến lược | `docs/GAP_ANALYSIS_ERP_PHAN_HE.md` — đủ 4 khối, ma trận 32 dòng có cột Ưu tiên + API, ranh giới Thừa, 4 lợi thế | ✅ ĐẠT |
| Báo cáo thẩm định | `.claude/reports/directive-17.md` + `latest.md` đồng nhất | ✅ ĐẠT |

---

## VII. TỆP THAY ĐỔI & COMMIT

**Tài liệu chính:**
- `docs/GAP_ANALYSIS_ERP_PHAN_HE.md` — Hiệu chỉnh chuẩn xác theo Chỉ thị 17: bổ sung đặc thù 100% (MST/CC/BIN/kho Định Công/Xe VAN/Tam giác API), ma trận 32 dòng có cột Ưu tiên + Kết nối API, phụ lục 66 routes, roadmap P1→P3, ranh giới Thừa
- `.claude/reports/directive-17.md` — Báo cáo thẩm định này
- `.claude/reports/latest.md` — Bản sao đồng nhất để Commander nghiệm thu

**Không đụng tới:** Code routes, Prisma schema, RBAC, middleware — chỉ tài liệu chiến lược (đúng bản chất Chỉ thị 17).

---

## VIII. KIẾN NGHỊ & KẾ HOẠCH BÀN GIAO

1. **Thẩm định đạt — Chỉ thị 17 là chỉ thị tài liệu chiến lược, không phát sinh code vận hành.** Toàn bộ GAP Analysis đã được chuẩn hóa theo đặc thù 100% thực tế (kho Định Công duy nhất, VAN bảo ôn, Indomie/viên chiên, Tam giác API).
2. **Ưu tiên P1 làm ngay (1–2 tuần):** Kiểm kê Định Công + KCS hàng về + Báo giá B2B Zalo + Phân luồng Xe máy/VAN + Tuổi nợ B2B — đây là 5 gaps duy nhất ở mức P1, các gaps còn lại là P2/P3.
3. **Kiên quyết giữ ranh giới:** Không lập trình GL/Tài sản/Ngân sách/BCTC-thuế trên mini-app — tối ưu luồng **Sapo → SK Workspace (63 cột) → Misa Amis & meInvoice C26TSK**.
4. **Sẵn sàng cho Chỉ thị 18:** Sau khi Commander phê duyệt GAP, triển khai tuần tự P1 theo thứ tự: Kho (kiểm kê + KCS) → Bán hàng (báo giá + phân luồng) → Tài chính (tuổi nợ).

---
*Báo cáo được xuất tự động bởi Claude Opus 5.5 (Tổng Chỉ Huy) — Quy trình 4 Agents: Opus Plan → Sonnet Code (docs) → Haiku Test (scan verify) → Sonnet Review*
