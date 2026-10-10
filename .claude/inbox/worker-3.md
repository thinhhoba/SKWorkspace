# CHỈ THỊ LỆNH PHÂN CÔNG — WORKER 3 (B2B CUSTOMERS & DEBT SQUAD)
# DỰ ÁN: SK WORKSPACE 2 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# NHIỆM VỤ: PHÂN HỆ KHÁCH HÀNG B2B, HẠN MỨC CÔNG NỢ & NHẮC NỢ ZALO (/customers)

---

### PHẠM VI DANH MỤC FILE CHO PHÉP (STRICT BOUNDARY):
> ⚠️ **NGUYÊN TẮC AN TOÀN:** Worker 3 CHỈ ĐƯỢC PHÉP tạo và sửa trong các file sau. TUYỆT ĐỐI KHÔNG chạm vào `delivery` hay `inventory` để tránh xung đột với Worker 1 và Worker 2.
- `packages/modules/customers/**` (`types.ts`, `mockData.ts`, `customerService.ts`)
- `app/api/customers/**` (`route.ts`, `[id]/remind/route.ts`)
- `app/(shell)/customers/page.tsx` (Cập nhật giao diện khách hàng B2B)
- Báo cáo kết quả vào: `.claude/reports/worker-3-database.md`

---

### DỮ LIỆU ĐỊNH DANH VẬN HÀNH:
- **Kế toán trưởng phụ trách:** HOÀNG THỊ NHO (SĐT: `0942 22 60 60`)
- **Tài khoản thụ hưởng nhận thanh toán nợ:** Techcombank `22226060` (CONG TY TNHH THUC PHAM SON KHANG)
- **Cơ cấu khách hàng thực tế của Sơn Khang:**
  1. *Quán ăn vặt / Mì trộn Hà Nội:*
     - Túy Foods (Số 5 Ngõ 27 Đại Cồ Việt, Hai Bà Trưng, HN - MST: 0111252725 - KH0009)
     - Quán Mì Trộn Cay Phố Chùa Láng (Đống Đa, HN)
     - Quán Ăn Vặt & Xiên Que Tạ Hiện (Hoàn Kiếm, HN)
     - Căn Tin Trường ĐH Bách Khoa Hà Nội (Hai Bà Trưng, HN)
  2. *Đại lý chành xe các tỉnh phía Bắc:*
     - Đại Lý Thực Phẩm Đông Lạnh Hải Hậu (Gửi xe khách bến Giáp Bát về Nam Định)
     - Đại Lý Thực Phẩm Sỉ Bãi Cháy (Gửi xe bến Giáp Bát/Nước Ngầm về Quảng Ninh)
     - NPP Thực Phẩm Miền Duyên Hải (Gửi bến Gia Lâm về Hải Phòng)
     - Đại Lý Tiên Du (Gửi xe về Bắc Ninh)

---

### CHI TIẾT CÁC HẠNG MỤC CẦN LÀM:

#### 1. MODULE DỮ LIỆU KHÁCH HÀNG B2B (`packages/modules/customers/`):
- `types.ts`:
  - `CustomerType`: `"quan_an_hn" | "dai_ly_tinh" | "bep_an_cantin" | "khach_le"`.
  - Phân loại rủi ro công nợ: `RiskLevel` (`"safe"` | `"warning"` | `"danger"` | `"blocked"`).
  - Phân tích tuổi nợ (Aging): Trong hạn, quá hạn 1–15 ngày, quá hạn 16–30 ngày, quá hạn >30 ngày.
- `mockData.ts`: Thay thế toàn bộ dữ liệu mẫu cũ bằng 12–15 khách hàng B2B thực tế theo địa bàn Hà Nội & các tỉnh phía Bắc (gắn liền với tài khoản Techcombank 22226060).
- `customerService.ts`:
  - Thống kê tổng dư nợ, tổng nợ quá hạn, tỷ lệ thu hồi nợ.
  - Hàm `generateZaloDebtReminder(customerId)`: Tự động sinh văn bản nhắc nợ Zalo trang trọng kèm bảng kê đơn hàng quá hạn và mã VietQR Techcombank `22226060`.

#### 2. API ENDPOINTS:
- `GET /api/customers`: Lấy danh sách khách hàng B2B, bộ lọc phân loại quán ăn / đại lý tỉnh, thống kê tuổi nợ.
- `POST /api/customers/[id]/remind`: Sinh tin nhắn nhắc nợ Zalo 1-chạm.

#### 3. GIAO DIỆN KHÁCH HÀNG B2B (`app/(shell)/customers/page.tsx`):
- **4 Thẻ Clay-KPI:** Tổng công nợ B2B phải thu, Nợ trong hạn, Nợ quá hạn cần thu hồi (Rose tone), Tỷ lệ thu hồi nợ (Emerald tone).
- **Tabs lọc:** Tất cả | Quán Ăn Vặt / Mì Trộn HN | Đại Lý Chành Xe Tỉnh | Bếp Ăn Căn Tin | Khách Có Nợ Quá Hạn.
- **Bảng Khách Hàng:** Mã KH, Tên quán / Đại lý, Địa chỉ & Tuyến giao, Hạn mức nợ, Dư nợ hiện tại, Số ngày quá hạn, Badge rủi ro, Nút "Nhắc nợ Zalo".
- **Modal Nhắc Nợ Zalo 1-Chạm:** Xem trước văn bản nhắc nợ lịch sự, nút Copy văn bản và mở Zalo.

---

### YÊU CẦU NGHIỆM THU:
1. Chạy `npx tsc --noEmit` đạt 0 lỗi.
2. TUYỆT ĐỐI KHÔNG chạy `git commit` hay `git push`.
3. Ghi báo cáo nghiệm thu vào `.claude/reports/worker-3-database.md`.
