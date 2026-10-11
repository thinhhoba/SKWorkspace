# CHỈ THỊ LỆNH TỪ COMMANDER & CHỦ TỊCH — SỐ 17
# DỰ ÁN: SK WORKSPACE 2.0 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# CHỦ ĐỀ TRỌNG TÂM:
# ĐÁNH GIÁ GAP ANALYSIS KIẾN TRÚC 4 PHÂN HỆ ERP (MUA HÀNG - KHO HÀNG - BÁN HÀNG - TÀI CHÍNH KẾ TOÁN)
# ĐỐI SOÁT HIỆN TRẠNG SK WORKSPACE 2.0 VS THỰC TẾ VẬN HÀNH F&B CHUỖI LẠNH SƠN KHANG FOOD

---

### I. CĂN CỨ DOANH NGHIỆP & BỐI CẢNH NGHIỆP VỤ:
- **Doanh nghiệp:** CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: `0111252725`)
- **Người đại diện theo pháp luật:** Giám đốc HỒ BÁ THỊNH
- **Đặc thù cốt lõi:** Bán buôn / phân phối thực phẩm đông lạnh (Thịt bò, thịt lợn, gia cầm, thủy hải sản nhập khẩu), chuỗi lạnh âm sâu (-18°C ~ -22°C), lưu kho 2 điểm (Kho Tổng Định Công & Kho Yên Bình), vận chuyển xe lạnh Isuzu QKR 270 `29C-882.60`, thanh toán VietQR Techcombank `22226060`, hệ sinh thái bán hàng Sapo POS/Omni, phần mềm kế toán chuẩn mực MISA AMIS (63 cột) & hóa đơn điện tử meInvoice.

Chủ tịch ban hành sơ đồ tham chiếu 4 khối phân hệ ERP tiêu chuẩn gồm:
1. **MUA HÀNG:** Yêu cầu mua, Nhà cung cấp, Báo giá NCC, Đơn hàng mua, Hóa đơn & thanh toán, Chính sách & bảng giá, Báo cáo mua hàng.
2. **KHO HÀNG:** Kho & hàng hóa, Chứng từ kho, Nhập - xuất kho, Kiểm kho, Chất lượng (KCS), Sổ cái kho, Báo cáo kho.
3. **BÁN HÀNG:** CRM, Báo giá, Đơn hàng bán, Hóa đơn & thanh toán, Đóng gói & giao hàng, Chương trình bán hàng, Bán hàng POS, Bán hàng Website, Báo cáo bán hàng.
4. **TÀI CHÍNH - KẾ TOÁN:** Tiền mặt & tiền gửi, Kế toán bán hàng, Kế toán mua hàng, Kế toán kho hàng, Kế toán tài sản, Kế toán tiền lương, Kế toán ngân sách, Kế toán tổng hợp, Báo cáo tài chính & thuế.

---

### II. YÊU CẦU NHIỆM VỤ ĐẶT RA CHO CLAUDE (6 WORKER SQUADS):

Claude và các Subagents (Opus Plan, Sonnet Code, Haiku Test, Review) phải thực hiện phân tích chuyên sâu, quét toàn bộ codebase 66 routes của `SK Workspace 2.0` và đưa ra đánh giá toàn diện theo 4 góc nhìn:

#### 1. ĐỐI SOÁT HIỆN TRẠNG (ĐÃ CÓ & ĐANG HOẠT ĐỘNG):
- Rà soát từng mục trong 4 khối đối chiếu với mã nguồn hiện tại (`/purchase`, `/inventory`, `/sales`, `/pos`, `/dathang`, `/pricing`, `/delivery`, `/fleet`, `/finance`, `/finance/sapo2misa`, `/reports`, `/customers`, `/hr`).
- Xác định tỷ lệ bao phủ (% coverage) của từng khối phân hệ.

#### 2. PHÂN TÍCH NHỮNG ĐIỂM THIẾU CẦN BỔ SUNG (GAPS & ACTION ITEMS):
- Xác định những tính năng trong ảnh mà một doanh nghiệp phân phối F&B thực chiến như Sơn Khang Food **thực sự cần** nhưng hệ thống đang còn thiếu hoặc mới dừng ở mức sơ khởi:
  * *Mua hàng:* Phiếu yêu cầu mua hàng nội bộ (Purchase Requisition), bảng so sánh giá nhiều NCC.
  * *Kho hàng:* Phiếu điều chuyển kho nội bộ giữa Kho Định Công ↔ Yên Bình (giao diện thao tác), Phiếu kiểm kê kho định kỳ (ghi nhận chênh lệch thừa/thiếu), Phiếu kiểm tra KCS chất lượng lạnh khi nhận hàng (nhiệt độ tâm hàng đông lạnh, cảm quan bao bì).
  * *Bán hàng:* Báo giá B2B xuất PDF/Zalo cho đại lý chành xe, Quản lý công nợ gối đầu chi tiết theo hạn nợ (30-60 ngày).
  * *Tài chính:* Báo cáo tuổi nợ (Aging report) khách buôn & nhà cung cấp.

#### 3. CẢNH BÁO NHỮNG ĐIỂM "THỪA" / OVER-ENGINEERING (RANH GIỚI VỚI MISA AMIS):
- Chỉ rõ những tính năng trong sơ đồ ERP tổng quát mà **KHÔNG NÊN** xây dựng phức tạp trên mini-app nội bộ vì sẽ gây lãng phí tài nguyên và xung đột dữ liệu với MISA AMIS:
  * *Kế toán tài sản, Kế toán ngân sách, Kế toán tổng hợp (General Ledger), Báo cáo tài chính & thuế:* Đây là nghiệp vụ pháp lý chuyên sâu mà kế toán trưởng Hoàng Thị Nho bắt buộc phải thao tác và kết xuất trên phần mềm kế toán **MISA AMIS**.
  * Vai trò của SK Workspace tại đây là **Cổng vận hành tác nghiệp (Operational Hub) & Trạm tiền xử lý**: gom dòng tiền VietQR, chuẩn hóa hóa đơn, xuất file 63 cột chuẩn sang MISA AMIS, chứ không biến mình thành một bản sao cồng kềnh của MISA!

#### 4. ĐÁNH GIÁ LỢI THẾ ĐẶC THÙ F&B CHUỖI LẠNH (VƯỢT TRỘI SO VỚI ERP THÔNG THƯỜNG):
- Làm nổi bật những module sống còn mà ảnh ERP mẫu thông thường **hoàn toàn không có**, nhưng SK Workspace đã xây dựng thành công:
  * *IoT Radar Chuỗi Lạnh Xe Tải Isuzu 29C-882.60:* Giám sát nhiệt độ thùng xe -18°C ~ -22°C, GPS, cảm biến lốc lạnh, cửa thùng, còi báo động vi phạm HACCP.
  * *Kho vận xuất hàng FEFO (First Expired, First Out):* Cảnh báo cận hạn sử dụng (< 30 ngày), ưu tiên nhặt hàng theo Lot/Date để tránh hủy hàng đông lạnh.
  * *Đối soát tự động VietQR Techcombank 22226060:* Tự động khớp lệnh và gạch nợ real-time không cần thủ công.
  * *Cầu nối Sapo2Misa 63 cột:* Đồng bộ tự động doanh thu và đơn hàng Sapo sang chứng từ kế toán MISA.

---

### III. MA TRẬN PHÂN BỔ THỰC THI (CLAUDE SQUADS):

| Squad | Phạm Vi Đánh Giá & Kế Hoạch | Tệp Trọng Tâm Cần Quét |
| :--- | :--- | :--- |
| **Squad 1 (Mua Hàng & NCC)** | Phân tích quy trình Thu mua, Nhà cung cấp, Báo giá, So sánh NCC | `packages/modules/purchase/**`<br>`app/purchase/**`<br>`app/api/purchase/**` |
| **Squad 2 (Kho Hàng & FEFO)** | Phân tích Kho lạnh, Chứng từ Nhập/Xuất/Chuyển, Kiểm kê, KCS lạnh | `packages/modules/inventory/**`<br>`app/inventory/**`<br>`app/api/inventory/**` |
| **Squad 3 (Bán Hàng & Đa Kênh)** | Phân tích B2B Web Order, POS Kho, Báo giá, Chính sách giá, Đóng gói | `packages/modules/sales/**`<br>`app/sales/**`<br>`app/pos/**`<br>`app/dathang/**`<br>`app/pricing/**` |
| **Squad 4 (Tài Chính & Kế Toán)** | Phân định ranh giới SK Workspace vs MISA AMIS, Quản lý công nợ & dòng tiền | `packages/modules/finance/**`<br>`app/finance/**`<br>`app/finance/sapo2misa/**` |
| **Squad 5 (Chuỗi Lạnh & Vận Tải)** | Đánh giá phân hệ Đội xe, HACCP, Giao vận tuyến nội thành | `packages/modules/fleet/**`<br>`packages/modules/delivery/**`<br>`app/fleet/**`<br>`app/delivery/**` |
| **Squad 6 (Kiến Trúc & Lộ Trình)** | Lập bảng ma trận GAP Analysis toàn diện và xây dựng Lộ trình nâng cấp 3 giai đoạn | `docs/GAP_ANALYSIS_ERP_PHAN_HE.md`<br>`.claude/reports/directive-17.md` |

---

### IV. TIÊU CHUẨN ĐẦU RA & BÁO CÁO (QUALITY GATE):
1. Xuất bản tệp phân tích chiến lược chi tiết: `docs/GAP_ANALYSIS_ERP_PHAN_HE.md`.
2. Ghi nhận toàn bộ kết quả thẩm định vào tệp báo cáo chính thức `.claude/reports/directive-17.md` và đồng bộ sang `.claude/reports/latest.md`.
3. Bảng ma trận đối chiếu phải có đầy đủ: Trạng thái (Đã có / Thiếu / Thừa), Mức độ ưu tiên (P1 - Cần ngay, P2 - Trung hạn, P3 - Không khuyến nghị), và Đề xuất giải pháp kỹ thuật cụ thể.

**BAN HÀNH BỞI: COMMANDER & CHỦ TỊCH HỒ BÁ THỊNH**  
*Chỉ thị số 17 có hiệu lực thi hành ngay lập tức. Claude hãy đọc tệp này và tiến hành phân tích toàn diện.*
