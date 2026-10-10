# CHỈ THỊ LỆNH PHÂN CÔNG — WORKER 3 (SAPO CUSTOMER B2B & PRICING SYNC SQUAD)
# DỰ ÁN: SK WORKSPACE 2 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# NHIỆM VỤ: ĐỒNG BỘ KHÁCH HÀNG B2B, CÔNG NỢ & BẢNG GIÁ 4 CẤP TỪ SAPO API

---

### PHẠM VI DANH MỤC FILE CHO PHÉP (STRICT BOUNDARY):
> ⚠️ **NGUYÊN TẮC AN TOÀN:** Worker 3 CHỈ ĐƯỢC PHÉP tạo và sửa trong các file sau. TUYỆT ĐỐI KHÔNG chạm vào thư mục của các worker khác.
- `packages/integrations/sapo/customerSync.ts` (Tạo mới)
- `packages/integrations/sapo/productSync.ts` (Tạo mới)
- `app/api/sapo/customers/route.ts` (Tạo mới — Lấy danh sách KH từ Sapo)
- `app/api/sapo/customers/sync/route.ts` (Tạo mới — Kéo KH Sapo về hồ sơ B2B)
- `app/api/sapo/products/route.ts` (Tạo mới — Danh mục sản phẩm & giá B2B)
- Báo cáo kết quả vào: `.claude/reports/sapo-worker-3.md`

---

### DỮ LIỆU ĐỊNH DANH KHÁCH HÀNG & BẢNG GIÁ SƠN KHANG:
- **Khách hàng B2B tiêu biểu:**
  - `KH0009` (Túy Foods — MST 0111252725, 27 Đại Cồ Việt, Hai Bà Trưng, HN).
  - Khách chành xe: Bến Giáp Bát (Nam Định, Ninh Bình), Bến Nước Ngầm (Thái Bình, Thanh Hóa).
  - Khách căn tin: ĐH Bách Khoa, KCN Thăng Long.
- **Kế toán phụ trách công nợ:** HOÀNG THỊ NHO (`0942 22 60 60`).
- **4 Cấp bảng giá B2B:**
  - Cấp 1 (Đại lý chành xe thùng lớn): Chiết khấu sâu nhất.
  - Cấp 2 (Bếp ăn / Căn tin trường học): Ổn định theo hợp đồng.
  - Cấp 3 (Quán ăn vặt / Mì trộn nội thành): Theo đơn tối thiểu 500k.
  - Cấp 4 (Khách bán lẻ / Mua tại kho): Giảm 1.000đ/thùng bốc kho Định Công.

---

### CHI TIẾT CÁC HẠNG MỤC CẦN LÀM:
1. **Module Đồng Bộ Khách Hàng (`packages/integrations/sapo/customerSync.ts`):**
   - Hàm `fetchSapoCustomers(limit?: number)`: Gọi Sapo API `GET /admin/customers.json` lấy danh sách khách hàng, SĐT, địa chỉ, tổng chi tiêu (`total_spent`), số đơn hàng (`orders_count`).
   - Hàm `enrichCustomerB2B(sapoCustomer: SapoCustomer)`:
     - Tự động bóc tách MST từ ghi chú hoặc địa chỉ.
     - Phân nhóm khách hàng: `QUAN_AN` | `CHANH_XE` | `CAN_TIN` | `BAN_LE`.
     - Tính toán công nợ tích lũy và cập nhật tuổi nợ (1-15 ngày, 16-30 ngày, >30 ngày).
2. **Module Đồng Bộ Sản Phẩm & Bảng Giá (`packages/integrations/sapo/productSync.ts`):**
   - Hàm `fetchSapoProducts(limit?: number)`: Gọi Sapo API `GET /admin/products.json` lấy danh mục mặt hàng, phân loại theo nhóm (Mì khô, Gà chiên Popcorn CP, Viên thả lẩu, Tương ớt xốt).
   - Hàm `mapB2BPriceMatrix(productId: number, basePrice: number)`: Tính toán tự động 4 mức giá B2B theo chính sách Sơn Khang.
3. **API Endpoints:**
   - `GET /api/sapo/customers`: Lấy danh sách khách hàng đồng bộ từ Sapo kèm tổng nợ và lịch sử đơn.
   - `POST /api/sapo/customers/sync`: Kích hoạt đồng bộ danh mục khách hàng mới từ Sapo về SK Workspace.
   - `GET /api/sapo/products`: Lấy danh sách sản phẩm Sapo kèm ma trận bảng giá B2B 4 cấp.

---

### YÊU CẦU NGHIỆM THU:
1. `npx tsc --noEmit` đạt 0 lỗi.
2. TUYỆT ĐỐI KHÔNG chạy `git commit` hay `git push`.
3. Ghi báo cáo vào `.claude/reports/sapo-worker-3.md`.
