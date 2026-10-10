# CHỈ THỊ LỆNH PHÂN CÔNG — WORKER 1 (PRICING SQUAD)
# DỰ ÁN: SK WORKSPACE 2 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# NHIỆM VỤ: PHÂN HỆ BẢNG GIÁ ĐA KÊNH & BÁO GIÁ ZALO CHÀNH XE (/pricing)

---

### PHẠM VI DANH MỤC FILE CHO PHÉP (STRICT BOUNDARY):
> ⚠️ **NGUYÊN TẮC AN TOÀN:** Worker 1 CHỈ ĐƯỢC PHÉP đọc và ghi trong các file sau. TUYỆT ĐỐI KHÔNG chạm vào thư mục `packages/integrations` hay `finance` để tránh xung đột với Worker 2.
- `packages/modules/pricing/pricingService.ts` (Tạo mới)
- `app/api/pricing/route.ts` (Tạo mới)
- `app/api/pricing/[sku]/route.ts` (Tạo mới)
- `app/api/pricing/quote/route.ts` (Tạo mới)
- `app/(shell)/pricing/page.tsx` (Tạo mới)
- Báo cáo kết quả vào: `.claude/reports/worker-1-pricing.md`

---

### DỮ LIỆU ĐỊNH DANH DOANH NGHIỆP:
- **Pháp nhân:** CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: `0111252725`)
- **Kho tổng:** Số 96 Ngõ 337 Phố Định Công, P. Định Công, TP. Hà Nội (thông Ngõ 412 Trịnh Đình Cửu)
- **Tài khoản thanh toán:** Techcombank `22226060` (CONG TY TNHH THUC PHAM SON KHANG)
- **Hotline:** 0942 22 60 60 | Cố định: (024) 22 60 60 60 | Website: `sonkhang.vn`

---

### CHI TIẾT CÁC HẠNG MỤC CẦN LÀM:

#### 1. SERVICE TÍNH TOÁN & BÁO GIÁ (`packages/modules/pricing/pricingService.ts`):
- Đọc 24 SKUs chuẩn từ `packages/modules/pricing/mockData.ts`.
- Hỗ trợ lọc theo 4 nhóm hàng: `hang_kho`, `gia_vi`, `hang_mat`, `hang_dong`.
- Hỗ trợ 6 kênh bán hàng: `quan_an`, `dai_ly`, `bep_an`, `ban_le`, `web_order`, `pos`.
- Cập nhật giá theo kênh, tự động tính lại % biên lợi nhuận và cảnh báo nếu `newPrice < cost_price`.
- Hàm `generateZaloQuote(channel, options)`: Tự động format mẫu báo giá gửi Zalo:
  - Header: CÔNG TY TNHH THỰC PHẨM SƠN KHANG (sonkhang.vn) - Hotline: 0942 22 60 60
  - STK: Techcombank 22226060 - CONG TY TNHH THUC PHAM SON KHANG
  - Chính sách: Tối thiểu 500k; Freeship đơn từ 1tr (<8km HN); Gửi chành xe bến Giáp Bát/Nước Ngầm các tỉnh phía Bắc.
  - Danh sách giá sản phẩm theo kênh đã chọn.

#### 2. API ENDPOINTS:
- `GET /api/pricing`: Trả về danh sách SKUs, thống kê KPI và phân loại nhóm.
- `PATCH /api/pricing/[sku]`: Cập nhật giá bán theo kênh.
- `POST /api/pricing/quote`: Sinh chuỗi báo giá Zalo 1-chạm.

#### 3. GIAO DIỆN 3D CLAYMORPHISM (`app/(shell)/pricing/page.tsx`):
- **4 Thẻ Clay-KPI:**
  - Tổng số SKU niêm yết (Sky tone)
  - Biên lợi nhuận gộp trung bình (~21.4% - Emerald tone)
  - Sản phẩm bảo quản đông & mát (Cyan tone)
  - Kênh sỉ chủ lực: Quán ăn & Chành xe tỉnh (Amber tone)
- **Tabs điều hướng:**
  - Tabs 6 kênh bán: Tất cả kênh | Quán ăn HN | Đại lý chành xe | Bếp ăn căn tin | Web Order | POS Quầy.
  - Tabs 4 nhóm hàng: Tất cả | Hàng khô | Gia vị & Xốt | Hàng mát | Hàng đông.
  - Ô tìm kiếm tức thì theo mã SKU và tên sản phẩm.
- **Bảng giá chi tiết:**
  - Cột: Mã SKU, Tên, ĐVT, Nhiệt độ bảo quản, Giá vốn, Giá Quán ăn, Giá Chành xe, Giá Căn tin, Giá Web Order, Giá POS, % Margin, Thao tác.
- **Modal Cập nhật Giá Nhanh** (Bảo vệ lợi nhuận âm).
- **Modal Xuất Báo Giá Zalo 1-Chạm** kèm nút Copy văn bản và mở Zalo.

---

### YÊU CẦU NGHIỆM THU:
1. Chạy `npx tsc --noEmit` đạt 0 lỗi.
2. TUYỆT ĐỐI KHÔNG chạy lệnh `git commit` hay `git push` (Commander sẽ thực hiện).
3. Ghi báo cáo hoàn thành vào `.claude/reports/worker-1-pricing.md`.
