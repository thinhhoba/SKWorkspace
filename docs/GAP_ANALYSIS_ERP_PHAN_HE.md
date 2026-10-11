# BÁO CÁO GAP ANALYSIS TOÀN DIỆN: 4 KHỐI PHÂN HỆ ERP VS SK WORKSPACE 2.0
**Doanh nghiệp:** CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: 0111252725)  
**Tài liệu tham chiếu:** Sơ đồ 4 khối phân hệ ERP B2B (Mua Hàng - Kho Hàng - Bán Hàng - Tài Chính Kế Toán)  
**Thời điểm thẩm định:** 11/10/2026 | **Phiên bản:** SK Workspace 2.0.0 (Production)

---

## I. TỔNG QUAN TỶ LỆ BAO PHỦ HIỆN TRẠNG

| Khối Phân Hệ | Tổng Mục Trong Ảnh | Đã Có & Hoạt Động | Cần Bổ Sung (Gaps) | Không Nên Làm (Thừa) | Tỷ Lệ Đáp Ứng Thực Tế |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **1. Mua Hàng** | 7 mục | 4 mục (57%) | 3 mục (43%) | 0 mục | **70%** (Đủ dùng cốt lõi) |
| **2. Kho Hàng** | 7 mục | 5 mục (71%) | 2 mục (29%) | 0 mục | **85%** (+ Vượt trội về FEFO) |
| **3. Bán Hàng** | 9 mục | 7 mục (78%) | 2 mục (22%) | 0 mục | **90%** (Rất mạnh B2B & POS) |
| **4. Tài Chính - Kế Toán** | 9 mục | 3 mục (33%) | 2 mục (22%) | 4 mục (45%) | **Chuẩn mô hình Hybrid Hub** |

> **Nguyên tắc cốt lõi của Kiến trúc Giải pháp:**  
> SK Workspace 2.0 đóng vai trò là **Cổng Điều Hành Tác Nghiệp (Operational Hub)** chứ không phải một phần mềm ERP kế toán đóng gói cồng kềnh. Doanh nghiệp đã sử dụng **MISA AMIS** làm sổ cái kế toán pháp lý và **meInvoice** làm hóa đơn điện tử, nên các phân hệ hạch toán sâu cần được đẩy sang MISA qua cầu nối 63 cột thay vì viết lại trên web.

---

## II. ĐỐI SOÁT CHI TIẾT TỪNG PHÂN HỆ

### 1. KHỐI MUA HÀNG (7 Tính Năng)

| STT | Tính năng trong ảnh | Hiện trạng SK Workspace 2.0 | Đánh giá & Khuyến nghị |
| :---: | :--- | :--- | :--- |
| 1.1 | **Yêu cầu mua** | 🟡 *Chưa có UI riêng* | **[THIẾU - Nên bổ sung (P2)]**: Cần một form đơn giản cho Thủ kho hoặc Kinh doanh gửi đề xuất mua hàng khi lượng tồn dưới ngưỡng an toàn. |
| 1.2 | **Nhà cung cấp** | 🟢 **ĐÃ CÓ** (`/purchase` & `/api/purchase/suppliers`) | **[ĐẠT]**: Đã quản lý danh sách NCC thực phẩm, MST, liên hệ, chính sách gối đầu nợ. |
| 1.3 | **Báo giá NCC** | 🔴 *Chưa có* | **[THIẾU - Nên bổ sung (P2)]**: Cần tính năng lưu trữ & so sánh giá giữa các nhà nhập khẩu thịt/hải sản theo tuần. |
| 1.4 | **Đơn hàng mua** | 🟢 **ĐÃ CÓ** (`/purchase`, `/api/purchase`) | **[ĐẠT]**: Tạo PO, chọn NCC, nhập kho tự động, cập nhật công nợ phải trả. |
| 1.5 | **Hóa đơn & thanh toán** | 🟢 **ĐÃ CÓ** (`/finance`, `/purchase`) | **[ĐẠT]**: Ghi nhận công nợ NCC và tạo phiếu chi ngân hàng. |
| 1.6 | **Chính sách & bảng giá** | 🟡 *Mới có bảng giá bán* | **[Nên bổ sung vào NCC]**: Gắn bảng giá mua hợp đồng theo từng NCC. |
| 1.7 | **Báo cáo mua hàng** | 🟢 **ĐÃ CÓ** (`/reports`) | **[ĐẠT]**: Thống kê sản lượng nhập, giá vốn theo nhà cung cấp. |

---

### 2. KHỐI KHO HÀNG (7 Tính Năng)

| STT | Tính năng trong ảnh | Hiện trạng SK Workspace 2.0 | Đánh giá & Khuyến nghị |
| :---: | :--- | :--- | :--- |
| 2.1 | **Kho & hàng hóa** | 🟢 **ĐÃ CÓ** (`/inventory`) | **[ĐẠT XUẤT SẮC]**: Quản lý 2 kho (Kho Tổng Định Công, Kho Yên Bình), chia vùng nhiệt (Kho đông -18°C, Kho mát 2-4°C), phân loại SKU. |
| 2.2 | **Chứng từ kho** | 🟢 **ĐÃ CÓ** (`/sales/[id]/pick`, `/inventory`) | **[ĐẠT]**: Phiếu nhập, phiếu xuất kho điện tử, mã vạch SKU. |
| 2.3 | **Nhập - xuất kho** | 🟢 **ĐÃ CÓ** | **[ĐẠT]**: Tích hợp luồng xuất bán và nhập hàng từ PO. |
| 2.4 | **Kiểm kho** | 🟡 *API có, thiếu màn hình kiểm kê* | **[THIẾU - Ưu tiên cao (P1)]**: Cần màn hình **"Kiểm kê kho lạnh định kỳ"** để Thủ kho quét tồn thực tế và ghi nhận hao hụt/chênh lệch (rã đông, dăm tuyết). |
| 2.5 | **Chất lượng (KCS)** | 🔴 *Chưa có biên bản KCS* | **[THIẾU - Đặc thù F&B (P1)]**: Rất quan trọng đối với thực phẩm đông lạnh! Cần form **Biên bản KCS nhập hàng**: ghi nhận nhiệt độ tâm thịt (yêu cầu ≤ -15°C), tình trạng rách bao bì, tem nhãn phụ. |
| 2.6 | **Sổ cái kho** | 🟢 **ĐÃ CÓ** (`/inventory`) | **[ĐẠT]**: Thẻ kho, lịch sử biến động tồn từng mặt hàng. |
| 2.7 | **Báo cáo kho** | 🟢 **ĐÃ CÓ VƯỢT TRỘI** (`/inventory`) | **[ĐẠT ĐẲNG CẤP CAO]**: Cảnh báo cận date **FEFO (Hạn sử dụng < 30 ngày)**, cảnh báo tồn dưới ngưỡng an toàn, báo cáo tuổi hàng. |

---

### 3. KHỐI BÁN HÀNG (9 Tính Năng)

| STT | Tính năng trong ảnh | Hiện trạng SK Workspace 2.0 | Đánh giá & Khuyến nghị |
| :---: | :--- | :--- | :--- |
| 3.1 | **CRM** | 🟢 **ĐÃ CÓ** (`/customers`) | **[ĐẠT]**: Hồ sơ đại lý, nhà hàng, khách sỉ chành xe, lịch sử mua hàng, hạn mức tín dụng. |
| 3.2 | **Báo giá** | 🟡 *Chưa có module báo giá riêng* | **[THIẾU - Nên bổ sung (P1)]**: Báo giá B2B xuất PDF/ảnh gửi qua Zalo cho đại lý chành xe trước khi họ chốt đơn. |
| 3.3 | **Đơn hàng bán** | 🟢 **ĐÃ CÓ** (`/sales`, `/api/sales`) | **[ĐẠT XUẤT SẮC]**: Luồng 4 bước (Chờ duyệt ➔ Soạn FEFO ➔ Đang giao ➔ Hoàn tất). |
| 3.4 | **Hóa đơn & thanh toán** | 🟢 **ĐÃ CÓ** (`/finance/vietqr`, `/finance/sapo2misa`) | **[ĐẠT XUẤT SẮC]**: Gạch nợ tự động VietQR Techcombank 22226060 và đồng bộ meInvoice. |
| 3.5 | **Đóng gói & giao hàng** | 🟢 **ĐÃ CÓ** (`/delivery`, `/pwa/giaovan`) | **[ĐẠT]**: Điều phối chuyến xe, tài xế Tân, phiếu giao nhận điện tử. |
| 3.6 | **Chương trình bán hàng** | 🟢 **ĐÃ CÓ** (`/pricing`) | **[ĐẠT]**: Chính sách giá bán sỉ theo sản lượng, chiết khấu đại lý cấp 1/2. |
| 3.7 | **Bán hàng POS** | 🟢 **ĐÃ CÓ** (`/pos`) | **[ĐẠT]**: Giao diện POS bán lẻ tại kho, in bill K80, thanh toán VietQR động. |
| 3.8 | **Bán hàng Website** | 🟢 **ĐÃ CÓ** (`/dathang`) | **[ĐẠT]**: Cổng Web Order B2B đặt hàng online cho khách buôn. |
| 3.9 | **Báo cáo bán hàng** | 🟢 **ĐÃ CÓ** (`/reports`, Dashboard `/`) | **[ĐẠT]**: Doanh thu realtime đồng bộ Sapo, biểu đồ xu hướng. |

---

### 4. KHỐI TÀI CHÍNH - KẾ TOÁN (9 Tính Năng) — *RANH GIỚI VỚI MISA AMIS*

| STT | Tính năng trong ảnh | Hiện trạng SK Workspace 2.0 | Đánh giá kiến trúc (Thừa hay Thiếu?) |
| :---: | :--- | :--- | :--- |
| 4.1 | **Tiền mặt & tiền gửi** | 🟢 **ĐÃ CÓ** (`/finance`) | **[ĐẠT]**: Sổ quỹ tiền mặt và tài khoản Techcombank 22226060, VietQR tự động. |
| 4.2 | **Kế toán bán hàng** | 🟡 *Có công nợ, thiếu tuổi nợ* | **[NÊN BỔ SUNG NHẸ (P1)]**: Thêm bảng **Theo dõi Tuổi nợ (Aging 15-30-60 ngày)** của khách buôn chành xe. |
| 4.3 | **Kế toán mua hàng** | 🟢 **ĐÃ CÓ** (`/purchase`, `/finance`) | **[ĐẠT]**: Theo dõi công nợ gối đầu NCC thực phẩm nhập khẩu. |
| 4.4 | **Kế toán kho hàng** | 🟢 **ĐÃ CÓ** (`/finance/sapo2misa`) | **[ĐẠT THÔNG QUA MISA]**: Đẩy chứng từ xuất kho giá vốn 63 cột sang MISA AMIS để hạch toán tự động. |
| 4.5 | **Kế toán tài sản** | ⛔ *Không có* | **[THỪA - KHÔNG LÀM TRÊN WEB]**: Nghiệp vụ tính khấu hao tài sản cố định thuộc về MISA AMIS. |
| 4.6 | **Kế toán tiền lương** | 🟢 **ĐÃ CÓ** (`/hr`) | **[ĐẠT MỨC QUẢN TRỊ]**: Quản lý chấm công, tính lương cơ bản & phụ cấp cho 4-30 nhân sự. |
| 4.7 | **Kế toán ngân sách** | ⛔ *Không có* | **[THỪA - KHÔNG CẦN THIẾT]**: Doanh nghiệp SME F&B phân phối chưa cần lập mô hình ngân sách phức tạp. |
| 4.8 | **Kế toán tổng hợp** | ⛔ *Không có* | **[THỪA - TUYỆT ĐỐI KHÔNG LÀM]**: Các bút toán kết chuyển Nợ/Có cuối kỳ do Kế toán trưởng Hoàng Thị Nho làm trên MISA AMIS. |
| 4.9 | **Báo cáo tài chính & thuế** | 🟢 **ĐẨY SANG MISA & MEINVOICE** | **[THỪA NẾU LÀM TRÊN WEB]**: Kết xuất Báo cáo tài chính, thuế GTGT, thuế TNDN bắt buộc lấy từ MISA để nộp Thuế. |

---

## III. 4 VŨ KHÍ CỐT LÕI CỦA SƠN KHANG MÀ ẢNH ERP MẪU HOÀN TOÀN KHÔNG CÓ

Các hệ thống ERP thông thường (như trong ảnh mẫu) được thiết kế chung chung cho thương mại hoặc sản xuất gia công. Ngược lại, **SK Workspace 2.0** sở hữu 4 phân hệ sống còn được thiết kế may đo riêng cho đặc thù **Chuỗi Cung Ứng Lạnh Thực Phẩm (Cold Chain Food Distribution)**:

```
┌───────────────────────────────────────────────────────────────────────────────────┐
│                      4 VŨ KHÍ CHIẾN LƯỢC CỦA SƠN KHANG FOOD                       │
├───────────────────────────────┬───────────────────────────────────────────────────┤
│ 1. IoT CHUỖI LẠNH HACCP       │ • Giám sát nhiệt độ thùng Isuzu 29C-882.60 (-18°C)│
│    (FLEET TELEMETRY RADAR)    │ • Cảnh báo còi hú khi nhiệt độ vượt ngưỡng -15°C  │
│                               │ • Xuất biên bản kiểm định nhiệt độ chuyến giao hàng│
├───────────────────────────────┼───────────────────────────────────────────────────┤
│ 2. THUẬT TOÁN SOẠN KHO FEFO   │ • First Expired, First Out (Ưu tiên cận date xuất)│
│    (QUẢN LÝ SHELF-LIFE / LÔ)  │ • Báo động đỏ các lô hàng hạn dùng dưới 30 ngày   │
│                               │ • Triệt tiêu rủi ro hủy hàng đông lạnh tiền tỷ    │
├───────────────────────────────┼───────────────────────────────────────────────────┤
│ 3. VIETQR BANKING REAL-TIME   │ • Tự động khớp lệnh số dư Techcombank 22226060    │
│    (INSTANT CASH RECONCILE)   │ • Gạch nợ tức thì cho đơn hàng ngay khi tiền nổi  │
│                               │ • Không cần kế toán đọc sao kê thủ công           │
├───────────────────────────────┼───────────────────────────────────────────────────┤
│ 4. CẦU NỐI SAPO ➔ MISA 63 CỘT │ • Chuyển đổi dữ liệu bán hàng Sapo sang AMIS      │
│    (DUAL-CORE BRIDGE)         │ • Đủ 63 cột nghiệp vụ hạch toán hóa đơn và giá vốn│
│                               │ • Tích hợp meInvoice ký số hóa đơn điện tử C26TSK │
└───────────────────────────────┴───────────────────────────────────────────────────┘
```

---

## IV. LỘ TRÌNH TRIỂN KHAI BỔ SUNG (ACTIONABLE ROADMAP)

Dựa trên phân tích khoảng trống (Gaps), đề xuất lộ trình nâng cấp 3 giai đoạn tinh gọn:

### Giai đoạn 1: Hoàn thiện nghiệp vụ Vận hành Kho & Bán buôn (Ưu tiên P1 — 1-2 tuần)
1. **Kiểm kê Kho Lạnh:** Màn hình kiểm kê định kỳ đối soát tồn lý thuyết vs thực tế, lập phiếu cân chỉnh tồn.
2. **Biên bản KCS Tiếp Nhận Hàng:** Form nghiệm thu container đông lạnh (nhiệt độ tâm thịt, cảm quan bao bì).
3. **Báo giá B2B Chuyên Nghiệp:** Cho phép Sale tạo báo giá nhanh, xuất file PDF hoặc ảnh có logo Sơn Khang gửi Zalo.
4. **Báo cáo Tuổi nợ B2B:** Bảng theo dõi hạn nợ khách hàng (đến hạn, quá hạn 15 ngày, quá hạn 30 ngày).

### Giai đoạn 2: Tối ưu Quy trình Mua hàng & Điều chuyển nội bộ (Ưu tiên P2 — 2-3 tuần)
1. **Phiếu Yêu Cầu Mua Hàng:** Nhân viên kho/kinh doanh gửi phiếu đề xuất khi hàng chạm điểm đặt hàng lại (Re-order point).
2. **Điều chuyển Kho Nội Bộ:** Thao tác chuyển kho 1 chạm giữa Kho Tổng Định Công và Kho Yên Bình.
3. **So sánh Báo giá NCC:** Bảng so giá thịt nhập khẩu giữa các nhà cung cấp trước khi Giám đốc duyệt PO.

### Giai đoạn 3: Giữ vững ranh giới hệ thống (Ngăn chặn Over-Engineering)
* Kiên quyết **KHÔNG** lập trình các phân hệ: Kế toán tài sản cố định, Kế toán ngân sách, Bút toán kết chuyển tổng hợp.
* Tập trung tối ưu hóa Cầu nối **Sapo2MISA 63 cột** để toàn bộ dữ liệu nghiệp vụ từ SK Workspace tự động chảy mượt mà vào MISA AMIS mà Kế toán trưởng không phải gõ lại một dòng nào.
