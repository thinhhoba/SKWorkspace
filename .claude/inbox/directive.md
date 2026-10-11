# CHỈ THỊ LỆNH TỪ COMMANDER & CHỦ TỊCH — SỐ 17 (HIỆU CHỈNH CHUẨN XÁC)
# DỰ ÁN: SK WORKSPACE 2.0 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# CHỦ ĐỀ TRỌNG TÂM:
# ĐÁNH GIÁ HIỆN TRẠNG, KHẢ NĂNG TRIỂN KHAI VÀ GAP ANALYSIS 4 PHÂN HỆ ERP
# DỰA TRÊN ĐẶC THÙ VẬN HÀNH THỰC TẾ 100% CỦA SƠN KHANG FOOD

---

### I. CĂN CỨ DOANH NGHIỆP & ĐẶC THÙ CỐT LÕI (BẢN CHÍNH THỨC):

1. **Pháp nhân & Đại diện:**
   - **Tên doanh nghiệp:** CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: `0111252725`)
   - **Người đại diện theo pháp luật:** Giám đốc HỒ BÁ THỊNH (CCCD: `001094016823`, Sinh 20/11/1994)
   - **Tài khoản thanh toán:** Techcombank `22226060` (BIN: `970407`) — Tự động đối soát VietQR

2. **Ngành hàng kinh doanh cốt lõi:**
   - **Thực phẩm khô ăn liền:** Kho sỉ Mì trộn Indomie (Đặc biệt, Cay nồng, Sườn, Bò cay...), Mì Nissin Raoh, đồ khô ăn liền đóng gói.
   - **Gia vị:** Tương ớt, tương cà Sài Gòn Can 2L, sốt chấm Mayonnaise Kewpie, dầu ăn Cái Lân 5L, bột gia vị chế biến.
   - **Thực phẩm đông lạnh chế biến sẵn:** Viên chiên LC Foods, gà viên chiên Popcorn CP, xúc xích, bánh gạo Tokbokki CJ, bánh gà Nét Việt, chả cá, hồ lô chiên...

3. **Cơ sở hạ tầng & Phân định Kho bãi:**
   - **1 Trụ sở văn phòng:** Thôn 6, Xã Yên Xuân, Thành phố Hà Nội *(VĂN PHÒNG HÀNH CHÍNH — TUYỆT ĐỐI KHÔNG LƯU KHO)*.
   - **1 Địa điểm kinh doanh:** Số 96 Ngõ 337 Phố Định Công, Phường Định Công, Thành phố Hà Nội *(ĐỊA ĐIỂM DUY NHẤT CÓ LƯU KHO)*.
     * Khu 1: Kho khô thường (Mì Indomie & Gia vị đóng can/thùng).
     * Khu 2: Kho đông lạnh chế biến sẵn (-18°C ~ -22°C) cho các dòng viên chiên, xúc xích, gà popcorn.

4. **Đội ngũ phương tiện vận tải thực tế:**
   - **Xe máy:** Chuyên giao hỏa tốc nội thành Hà Nội, luồn lách ngõ ngách, phục vụ quán ăn vặt, trà sữa, căng tin trường học, đơn hàng nhỏ lẻ.
   - **Xe tải VAN (Thùng bảo ôn / Giữ nhiệt):** Giao đơn sỉ số lượng lớn, thùng carton cho đại lý, chuỗi quán ăn, và vận chuyển ra chành xe các bến Giáp Bát & Nước Ngầm đi các tỉnh phía Bắc. *Ưu điểm: Xe VAN được phép lưu thông nội đô Hà Nội 24/7 mà không bị cấm giờ như xe tải thùng nặng!*

5. **Hệ sinh thái phần mềm đang sử dụng (Đều hỗ trợ kết nối API chính thức):**
   - **Sapo:** Phần mềm quản lý bán hàng đa kênh & POS quầy (Kết nối Open API).
   - **Misa Amis Online:** Phần mềm kế toán doanh nghiệp chính thức (Kết nối Open API nghiệp vụ).
   - **Misa meInvoice:** Phần mềm hóa đơn điện tử chính thức (Kết nối API ký số và phát hành HĐĐT C26TSK).

---

### II. YÊU CẦU NHIỆM VỤ ĐẶT RA CHO CLAUDE CODE (CHỈ THỊ 17):

Claude và các Subagents (Opus Plan, Sonnet Code, Haiku Test, Review) phải phân tích, đánh giá hiện trạng và khả năng triển khai 4 khối phân hệ ERP trong ảnh tham chiếu dựa trên đúng 100% đặc thù cốt lõi trên:

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│             SƠ ĐỒ 4 KHỐI PHÂN HỆ ERP THAM CHIẾU CẦN ĐÁNH GIÁ (ẢNH GỐC)                 │
├──────────────────────────┬──────────────────────────────┬──────────────────────────────┤
│ 1. MUA HÀNG (7 mục)      │ 2. KHO HÀNG (7 mục)          │ 3. BÁN HÀNG (9 mục)          │
│ • Yêu cầu mua            │ • Kho & hàng hóa (SKU, vị trí)│ • CRM (Hồ sơ, lịch sử KH)   │
│ • Nhà cung cấp           │ • Chứng từ kho (Nhập, xuất)  │ • Báo giá B2B                │
│ • Báo giá NCC            │ • Nhập - xuất kho            │ • Đơn hàng bán               │
│ • Đơn hàng mua           │ • Kiểm kho (Kiểm kê chênh)   │ • Hóa đơn & thanh toán       │
│ • Hóa đơn & thanh toán   │ • Chất lượng (KCS hàng về)   │ • Đóng gói & giao hàng       │
│ • Chính sách & bảng giá  │ • Sổ cái kho                 │ • Chương trình bán hàng      │
│ • Báo cáo mua hàng       │ • Báo cáo kho                │ • Bán hàng POS               │
│                          │                              │ • Bán hàng Website           │
│                          │                              │ • Báo cáo bán hàng           │
├──────────────────────────┴──────────────────────────────┴──────────────────────────────┤
│ 4. TÀI CHÍNH - KẾ TOÁN (9 mục)                                                         │
│ • Tiền mặt & tiền gửi    • Kế toán kho hàng             • Kế toán ngân sách            │
│ • Kế toán bán hàng       • Kế toán tài sản              • Kế toán tổng hợp             │
│ • Kế toán mua hàng       • Kế toán tiền lương           • Báo cáo tài chính & thuế     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

#### 1. ĐỐI SOÁT HIỆN TRẠNG & TỶ LỆ BAO PHỦ:
- Quét toàn bộ codebase 66 routes hiện tại của `SK Workspace 2.0` đối chiếu với 4 khối trên.
- Khẳng định rõ các module đã hoàn thiện và hoạt động thực tế.

#### 2. LÀM RÕ CÁC ĐIỂM THIẾU CẦN BỔ SUNG (GAPS):
- **Kho Hàng (Định Công):**
  * *Kiểm kho (Stocktake):* Cần màn hình kiểm kê định kỳ đối soát tồn thực tế tại Kho Định Công, ghi nhận hao hụt/lệch tồn giữa hàng khô và hàng đông lạnh chế biến sẵn.
  * *KCS Hàng Về:* Kiểm tra cảm quan, hạn sử dụng trên bao bì Mì Indomie, gia vị và kiểm nhiệt độ đông lạnh các dòng viên chiên/gà popcorn khi xe nhà máy giao đến.
- **Bán Hàng:**
  * *Báo giá B2B:* Tạo báo giá nhanh gửi Zalo cho các quán ăn, đại lý sỉ.
  * *Đóng gói & Điều phối Giao vận:* Phân tách rõ luồng giao: **Tuyến Xe máy** (nội thành, đơn lẻ, hỏa tốc) vs **Tuyến Xe tải VAN** (đơn sỉ nhiều thùng, hàng đông lạnh chế biến sẵn, gửi chành xe bến Giáp Bát / Nước Ngầm).
- **Mua Hàng:**
  * *Phiếu yêu cầu mua hàng:* Đề xuất đặt hàng khi mì Indomie hoặc đồ đông lạnh chạm ngưỡng tối thiểu.

#### 3. CHỈ RÕ CÁC ĐIỂM "THỪA" / OVER-ENGINEERING (RANH GIỚI VỚI MISA AMIS):
- **Khối Tài chính - Kế toán:** Nhấn mạnh kiên quyết **KHÔNG LÀM TRÊN MINI-APP** các mục:
  * *Kế toán tài sản, Kế toán ngân sách, Kế toán tổng hợp (General Ledger), Báo cáo tài chính & quyết toán thuế.*
  * **Lý do kiến trúc:** Doanh nghiệp đang sử dụng **Misa Amis Online** và **meInvoice** có đầy đủ kết nối API. Mọi nghiệp vụ hạch toán chuyên sâu, khấu hao, thuế GTGT đều được Kế toán trưởng xử lý trên MISA AMIS.
  * SK Workspace chỉ tập trung làm tốt: **Sổ quỹ dòng tiền thực (Techcombank 22226060), Gạch nợ tự động VietQR, và Cầu nối Sapo2Misa chuẩn 63 cột nghiệp vụ** để đẩy dữ liệu sạch sang AMIS qua API.

#### 4. ĐÁNH GIÁ 4 LỢI THẾ ĐẶC THÙ CỦA SƠN KHANG (ERP MẪU KHÔNG CÓ):
- Phân tích sâu 4 vũ khí đã hoạt động trên hệ thống:
  1. *Giám sát Xe Tải VAN (Thùng bảo ôn/giữ nhiệt):* Đảm bảo nhiệt độ hàng đông lạnh chế biến sẵn khi giao quán ăn hoặc ra bến xe Giáp Bát.
  2. *Cảnh báo Cận Date FEFO:* Cực kỳ quan trọng cho thực phẩm ăn liền và đông lạnh chế biến sẵn (cảnh báo date < 30 ngày để kích hoạt xả kho).
  3. *VietQR Instant Reconcile:* Khớp lệnh tự động số dư Techcombank 22226060 theo từng đơn hàng.
  4. *Bộ tích hợp Tam Giác API: Sapo (Bán hàng) ↔ SK Workspace (Vận hành) ↔ Misa Amis & meInvoice (Kế toán).*

---

### III. SẢN PHẨM ĐẦU RA YÊU CẦU:
1. Cập nhật và hoàn thiện tài liệu chiến lược: `docs/GAP_ANALYSIS_ERP_PHAN_HE.md`.
2. Xuất bản báo cáo thẩm định chính thức vào `.claude/reports/directive-17.md` và `.claude/reports/latest.md`.
3. Bảng ma trận đối soát phải nêu rõ: Tên tính năng, Hiện trạng trên SK Workspace, Đánh giá (Đã có / Thiếu / Thừa), Mức độ ưu tiên (P1, P2, P3), và Hướng kết nối API (Sapo / Misa / meInvoice).

**BAN HÀNH BỞI: COMMANDER & CHỦ TỊCH HỒ BÁ THỊNH**  
*Chỉ thị số 17 có hiệu lực thi hành ngay lập tức.*
