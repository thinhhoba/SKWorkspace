# CHỈ THỊ LỆNH TỪ COMMANDER & CHỦ TỊCH — SỐ 18
# DỰ ÁN: SK WORKSPACE 2.0 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# CHỦ ĐỀ TRỌNG TÂM:
# TRIỂN KHAI TOÀN DIỆN 5 TÍNH NĂNG GAP P1 (ƯU TIÊN HÀNG ĐẦU)
# PHỤC VỤ THỰC TẾ VẬN HÀNH BÁN BUÔN & CHUỖI CUNG ỨNG SƠN KHANG FOOD

---

### I. CĂN CỨ DOANH NGHIỆP & BỐI CẢNH NGHIỆP VỤ:
- **Doanh nghiệp:** CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: `0111252725`)
- **Người đại diện theo pháp luật:** Giám đốc HỒ BÁ THỊNH (CCCD: `001094016823`, Sinh 20/11/1994)
- **Tài khoản thanh toán:** Techcombank `22226060` (BIN: `970407`) — Tự động đối soát VietQR
- **Ngành hàng:** 
  1. *Thực phẩm khô ăn liền:* Mì trộn Indomie, Mì Nissin Raoh, đồ ăn liền đóng gói.
  2. *Gia vị:* Tương ớt, tương cà Sài Gòn Can 2L, sốt chấm Mayonnaise Kewpie, dầu ăn Cái Lân 5L.
  3. *Thực phẩm đông lạnh chế biến sẵn:* Viên chiên LC Foods, gà Popcorn CP, xúc xích, Tokbokki CJ, bánh gà Nét Việt.
- **Cơ sở hạ tầng & Kho bãi:** 
  * *Trụ sở văn phòng:* Thôn 6, Xã Yên Xuân, Hà Nội *(HÀNH CHÍNH — KHÔNG LƯU KHO)*.
  * *Kho hàng duy nhất:* Số 96 Ngõ 337 Phố Định Công, Phường Định Công, Hà Nội *(KHO KHÔ & KHO ĐÔNG LẠNH -18°C)*.
- **Đội xe:** **Xe máy** (giao nhanh nội thành, ngõ ngách, quán ăn vặt, căng tin) & **Xe tải VAN** (giao sỉ thùng to, hàng đông lạnh chế biến sẵn, gửi chành xe bến Giáp Bát / Nước Ngầm, chạy 24/7 không cấm giờ).
- **Hệ thống phần mềm kết nối API:** Sapo Open API (Bán hàng), MISA AMIS Online (Kế toán), meInvoice (Hóa đơn điện tử).

Căn cứ Biên bản Nghiệm thu Chỉ thị số 17, Ban Quản Trị chính thức ban hành **Chỉ thị số 18** yêu cầu triển khai ngay **5 tính năng Gap P1** nhằm hoàn thiện chuỗi vận hành thực chiến.

---

### II. YÊU CẦU CHI TIẾT 5 TÍNH NĂNG GAP P1:

#### 1. GAP 1: KIỂM KÊ KHO ĐỊNH CÔNG (STOCKTAKE / INVENTORY AUDIT)
- **Mục tiêu:** Cung cấp công cụ định kỳ cho Thủ kho Trần Thị Ngọc Thúy quét kiểm kê hàng thực tế tại Kho Định Công, so sánh với số liệu tồn sổ sách Sapo để ghi nhận chênh lệch và lập phiếu điều chỉnh.
- **Yêu cầu chức năng:**
  * Giao diện tại: `app/(shell)/inventory/count/page.tsx` hoặc tab Kiểm Kê tại `/inventory`.
  * API hỗ trợ: `app/api/inventory/count/route.ts`.
  * Bộ lọc phân khu: *Kho khô (Mì Indomie & Gia vị)* vs *Kho đông lạnh chế biến sẵn (-18°C)*.
  * Cho phép quét mã vạch (Barcode SKU) hoặc chọn nhanh từ danh mục.
  * Hiển thị: Tồn lý thuyết ➔ Ô nhập Tồn thực tế đếm được ➔ Tự động tính Độ lệch (Thừa / Thiếu) và Giá trị chênh lệch (VNĐ).
  * Ghi rõ lý do hao hụt: Hao hụt tự nhiên rã đông/dăm tuyết, rách bao bì, hết hạn hủy bỏ, thất thoát.
  * Nút "Xác nhận & Cân chỉnh tồn kho": Cập nhật lại tồn kho hệ thống và ghi log vào Audit Trail.

#### 2. GAP 2: BIÊN BẢN KIỂM TRA CHẤT LƯỢNG KCS HÀNG VỀ (QUALITY CONTROL)
- **Mục tiêu:** Chuẩn hóa quy trình tiếp nhận hàng hóa từ xe nhà máy/nhà phân phối giao đến Kho Định Công, đặc biệt kiểm soát nghiêm ngặt chất lượng hàng đông lạnh chế biến sẵn và hạn sử dụng hàng khô.
- **Yêu cầu chức năng:**
  * Giao diện tại: `app/(shell)/inventory/qc/page.tsx` hoặc modal KCS tại `/inventory` & `/purchase`.
  * API hỗ trợ: `app/api/inventory/qc/route.ts`.
  * Các tiêu chí kiểm tra bắt buộc:
    1. *Cảm quan bao bì:* Nguyên đai nguyên kiện, không móp méo, tem nhãn phụ tiếng Việt đầy đủ.
    2. *Hạn sử dụng (Shelf-life):* Date sản xuất và Hạn dùng còn tối thiểu ≥ 70% thời hạn quy định.
    3. *Đo nhiệt độ tiếp nhận:* Hàng đông lạnh chế biến sẵn (viên chiên, gà popcorn) bắt buộc nhiệt độ thùng bảo ôn/tâm hàng phải đạt **≤ -15°C**. Nếu > -12°C ➔ Cảnh báo đỏ không đạt chuẩn HACCP!
  * Cho phép đính kèm ảnh chụp biên bản hoặc thùng hàng.
  * Kết luận KCS: `Đạt chuẩn nhập kho` / `Từ chối nhận hàng` / `Nhập có điều kiện`.
  * Ký duyệt điện tử: Xác nhận của Thủ kho tiếp nhận.

#### 3. GAP 3: BÁO GIÁ B2B XUẤT ẢNH / PDF GỬI ZALO (B2B QUOTATION GENERATOR)
- **Mục tiêu:** Hỗ trợ nhân viên kinh doanh tạo nhanh bảng báo giá sỉ các mặt hàng mì Indomie, gia vị Sài Gòn, viên chiên LC Foods gửi cho đại lý chành xe và các quán ăn qua Zalo trong 30 giây.
- **Yêu cầu chức năng:**
  * Giao diện tại: `app/(shell)/pricing/quote/page.tsx` hoặc tab Báo Giá tại `/pricing`.
  * API hỗ trợ: `app/api/pricing/quote/route.ts`.
  * Nhập thông tin khách hàng: Tên quán ăn/đại lý, số điện thoại, địa chỉ (hoặc chọn từ CRM `/customers`).
  * Chọn các dòng sản phẩm, tự động gợi ý giá sỉ theo các mức sản lượng (thùng/tháng) và áp dụng chiết khấu đại lý.
  * Trình tạo bản xem trước (Live Preview Card) chuẩn nhận diện thương hiệu Sơn Khang Food:
    * Logo Sơn Khang Food, MST `0111252725`, Hotline `0942 22 60 60`, Kho Tổng: `96 Ngõ 337 Định Công, Hoàng Mai, HN`.
    * Bảng chi tiết: STT, Tên hàng, Quy cách (Thùng 40 gói, Can 2L, Gói 500g), Đơn giá sỉ, Thành tiền.
    * Chính sách giao hàng: Freeship nội thành theo mức tiền, gửi chành xe Giáp Bát / Nước Ngầm.
  * Nút tác vụ nhanh: `Sao chép ảnh báo giá` (Copy image to clipboard) hoặc `Tải ảnh / PDF` để gửi ngay qua Zalo.

#### 4. GAP 4: PHÂN LUỒNG GIAO VẬN — TUYẾN XE MÁY VS XE TẢI VAN
- **Mục tiêu:** Phân tách rõ ràng phương thức giao vận trên hệ thống điều phối đơn hàng và PWA tài xế, tối ưu hóa năng suất giao nhận nội đô Hà Nội.
- **Yêu cầu chức năng:**
  * Giao diện tại: `app/(shell)/delivery/page.tsx`, `packages/modules/delivery/**` và `app/pwa/giaovan/page.tsx`.
  * Thêm bộ chọn phân luồng phương tiện khi tạo/điều phối chuyến giao hàng:
    * **Tuyến Xe máy (Giao hỏa tốc):** Dành cho đơn nhỏ lẻ dưới 30kg, quán ăn vặt ngõ ngách, đơn gấp nội thành. Người nhận hàng nhận trong 1-2h.
    * **Tuyến Xe tải VAN (Thùng bảo ôn giữ nhiệt):** Dành cho đơn sỉ số lượng lớn, thùng carton, hàng đông lạnh chế biến sẵn, giao đại lý chuỗi hoặc giao ra chành xe bến Giáp Bát / Nước Ngầm. *Chạy phố 24/7 không cấm giờ!*
  * Hiển thị Tag nhận diện rõ ràng trên danh sách đơn hàng và phiếu giao hàng: `[🛵 Xe Máy]` màu cam vs `[🚐 Xe Tải VAN]` màu xanh dương.
  * Tích hợp điều phối tài xế: Phân công đơn xe máy cho Shipper xe máy, đơn xe tải VAN cho Tài xế Ngô Văn Tân (`0942 22 60 60`).

#### 5. GAP 5: BÁO CÁO TUỔI NỢ B2B KHÁCH HÀNG (ACCOUNTS RECEIVABLE AGING)
- **Mục tiêu:** Giúp Giám đốc và Kế toán theo dõi chặt chẽ dòng tiền công nợ gối đầu của các đại lý và chành xe, cảnh báo nợ quá hạn và hỗ trợ thu hồi nợ 1-chạm.
- **Yêu cầu chức năng:**
  * Giao diện tại: `app/(shell)/finance/aging/page.tsx` hoặc widget Tuổi Nợ trong `/finance` và `/customers`.
  * Phân loại công nợ theo 4 cột mốc chuẩn mực kế toán:
    1. *Trong hạn (Dưới 15 ngày):* Màu xanh lá — An toàn.
    2. *Chớm quá hạn (15 – 30 ngày):* Màu vàng — Cần lưu ý khi nhận đơn mới.
    3. *Quá hạn cảnh báo (30 – 60 ngày):* Màu cam — Tạm dừng duyệt đơn mới nếu chưa thanh toán.
    4. *Quá hạn nghiêm trọng (> 60 ngày):* Màu đỏ — Nợ xấu, chuyển hồ sơ đôn đốc đặc biệt.
  * Bộ lọc theo nhóm khách hàng: Đại lý cấp 1, Quán ăn / Chuỗi F&B, Chành xe gửi tỉnh.
  * Nút "Nhắc nợ 1-Chạm qua Zalo / SMS": Tự động tạo tin nhắn nhắc nợ kèm link thanh toán mã **VietQR Techcombank 22226060** đã điền sẵn số tiền nợ chính xác và mã đơn hàng.

---

### III. MA TRẬN 6 WORKER SQUAD THỰC THI CHỈ THI 18:

| Worker Squad | Trách Nhiệm Phân Hệ Cụ Thể | Danh Mục Tệp Trọng Tâm |
| :--- | :--- | :--- |
| **Worker 1 (Kho Vận - Kiểm Kê)** | Xây dựng UI & API Kiểm kê Kho Định Công (Stocktake), tính lệch tồn khô vs đông lạnh, lập phiếu điều chỉnh. | `app/(shell)/inventory/count/page.tsx`<br>`app/api/inventory/count/route.ts`<br>`packages/modules/inventory/auditService.ts` |
| **Worker 2 (Kho Vận - KCS Hàng Về)** | Xây dựng Form & API Biên bản KCS tiếp nhận hàng đông lạnh (-15°C) & hàng khô, ký duyệt thủ kho. | `app/(shell)/inventory/qc/page.tsx`<br>`app/api/inventory/qc/route.ts`<br>`packages/modules/inventory/qcService.ts` |
| **Worker 3 (Bán Hàng - Báo Giá B2B)** | Xây dựng giao diện Tạo Báo giá B2B xuất ảnh/PDF Zalo có logo Sơn Khang, chiết khấu theo sản lượng. | `app/(shell)/pricing/quote/page.tsx`<br>`app/api/pricing/quote/route.ts`<br>`components/pricing/QuotePreviewCard.tsx` |
| **Worker 4 (Giao Vận - Xe máy & VAN)** | Nâng cấp phân luồng điều phối giao vận: Selector Xe máy vs Xe tải VAN (chạy 24/7), tag nhận diện. | `app/(shell)/delivery/page.tsx`<br>`packages/modules/delivery/**`<br>`app/pwa/giaovan/page.tsx` |
| **Worker 5 (Tài Chính - Tuổi Nợ Aging)** | Xây dựng Bảng phân tích Tuổi nợ B2B 15-30-60 ngày và nút nhắc nợ 1-chạm VietQR Techcombank. | `app/(shell)/finance/aging/page.tsx`<br>`packages/modules/finance/agingService.ts`<br>`components/finance/AgingTableWidget.tsx` |
| **Worker 6 (QA & Quality Gate)** | Viết kịch bản kiểm thử tự động `scripts/verify-directive-18.cjs`, đảm bảo build 66+ routes thành công, tsc 0 lỗi. | `scripts/verify-directive-18.cjs`<br>Pre-flight Quality Check |

---

### IV. TIÊU CHUẨN NGHIỆM THU (QUALITY GATE):
1. **TypeScript & Build:** `npx tsc --noEmit` đạt **0 lỗi tuyệt đối**; `npm run build` thành công **100% routes**.
2. **Kịch bản kiểm thử tự động:** `node scripts/verify-directive-18.cjs` vượt qua **100% assertions**.
3. **Báo cáo nghiệm thu:** Xuất bản kết quả thực hiện đầy đủ vào `.claude/reports/directive-18.md` và đồng bộ sang `.claude/reports/latest.md`.

**BAN HÀNH BỞI: COMMANDER & CHỦ TỊCH HỒ BÁ THỊNH**  
*Chỉ thị số 18 có hiệu lực thi hành ngay lập tức.*
