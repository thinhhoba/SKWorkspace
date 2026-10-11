# BÁO CÁO GAP ANALYSIS TOÀN DIỆN: 4 KHỐI PHÂN HỆ ERP VS SK WORKSPACE 2.0
**Doanh nghiệp:** CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: 0111252725)  
**Tài liệu tham chiếu:** Sơ đồ 4 khối phân hệ ERP B2B (Mua Hàng - Kho Hàng - Bán Hàng - Tài Chính Kế Toán)  
**Thời điểm thẩm định:** 11/10/2026 | **Cơ sở dữ liệu:** 100% Thực tế vận hành Sơn Khang Food

---

## I. ĐẶC THÙ VẬN HÀNH CỐT LÕI CỦA SƠN KHANG FOOD

1. **Ngành hàng kinh doanh cốt lõi:**
   * **Thực phẩm khô ăn liền:** Kho sỉ Mì trộn Indomie (Đặc biệt, Cay nồng, Sườn, Bò cay...), Mì Nissin Raoh, đồ khô ăn liền đóng gói.
   * **Gia vị:** Tương ớt, tương cà Sài Gòn can 2L, sốt chấm Mayonnaise Kewpie, dầu ăn Cái Lân 5L, gia vị chế biến thực phẩm.
   * **Thực phẩm đông lạnh chế biến sẵn:** Viên chiên LC Foods, gà viên chiên Popcorn CP, xúc xích, bánh gạo Tokbokki CJ, bánh gà Nét Việt, chả cá, hồ lô chiên...
2. **Cơ sở hạ tầng & Phân định Kho bãi:**
   * **Trụ sở văn phòng:** Thôn 6, Xã Yên Xuân, Thành phố Hà Nội *(VĂN PHÒNG HÀNH CHÍNH — KHÔNG LƯU KHO)*.
   * **Địa điểm kinh doanh:** Số 96 Ngõ 337 Phố Định Công, Phường Định Công, Thành phố Hà Nội *(ĐỊA ĐIỂM DUY NHẤT CÓ LƯU KHO)*:
     * Khu 1: Kho khô thường (Mì Indomie & Gia vị đóng can/thùng).
     * Khu 2: Kho đông lạnh chế biến sẵn (-18°C ~ -22°C) cho các dòng viên chiên, xúc xích, gà popcorn.
3. **Đội ngũ phương tiện vận tải:**
   * **Xe máy:** Chuyên giao hỏa tốc nội thành Hà Nội, luồn lách ngõ ngách, phục vụ quán ăn vặt, trà sữa, căng tin trường học.
   * **Xe tải VAN (Thùng bảo ôn / Giữ nhiệt):** Giao sỉ số lượng lớn, thùng carton cho đại lý, chuỗi quán ăn, và vận chuyển ra chành xe bến Giáp Bát & Nước Ngầm đi các tỉnh phía Bắc. *Ưu thế vượt trội: Xe VAN lưu thông nội đô Hà Nội 24/7 mà không bị cấm giờ như xe tải nặng!*
4. **Hệ sinh thái phần mềm kết nối API chính thức:**
   * **Sapo:** Phần mềm quản lý bán hàng đa kênh & POS quầy (Kết nối Open API).
   * **Misa Amis Online:** Phần mềm kế toán doanh nghiệp chính thức (Kết nối Open API nghiệp vụ).
   * **Misa meInvoice:** Phần mềm hóa đơn điện tử chính thức (Kết nối API ký số và phát hành HĐĐT C26TSK).

---

## II. BẢNG TỔNG QUAN ĐỐI SOÁT 4 KHỐI PHÂN HỆ

| Khối Phân Hệ | Tổng Mục Trong Ảnh | Đã Có & Vận Hành Thực Tế | Thiếu Cần Bổ Sung (Gaps) | Không Nên Làm (Thừa) | Đánh Giá Chung |
| :--- | :---: | :---: | :---: | :---: | :--- |
| **1. Mua Hàng** | 7 mục | **4 mục (57%)** | **3 mục (43%)** | 0 mục | Đủ dùng cho chu kỳ mua hàng cơ bản |
| **2. Kho Hàng** | 7 mục | **5 mục (71%)** | **2 mục (29%)** | 0 mục | Rất mạnh, quản lý chuẩn tại Kho Định Công |
| **3. Bán Hàng** | 9 mục | **7 mục (78%)** | **2 mục (22%)** | 0 mục | Hoàn chỉnh B2B Web Order & POS quầy |
| **4. Tài Chính - Kế Toán** | 9 mục | **3 mục (33%)** | **2 mục (22%)** | **4 mục (45%)** | **Giữ đúng ranh giới với MISA AMIS** |

---

## III. ĐỐI SOÁT CHI TIẾT TỪNG PHÂN HỆ

### 1. KHỐI MUA HÀNG (7 Tính Năng)

| STT | Tính năng trong ảnh | Hiện trạng SK Workspace 2.0 | Đánh giá & Định hướng thực tế Sơn Khang Food |
| :---: | :--- | :--- | :--- |
| 1.1 | **Yêu cầu mua** | 🟡 *Chưa có UI riêng* | **[THIẾU - Nên bổ sung (P2)]**: Form cho nhân viên đề xuất đặt hàng khi mì Indomie hoặc đồ đông lạnh chạm ngưỡng tối thiểu tại Kho Định Công. |
| 1.2 | **Nhà cung cấp** | 🟢 **ĐÃ CÓ** (`/purchase` & `/api/purchase/suppliers`) | **[ĐẠT]**: Quản lý danh sách nhà sản xuất (CP, Indomie, LC Foods, CJ, Tân Việt...), MST, liên hệ, hạn mức nợ. |
| 1.3 | **Báo giá NCC** | 🔴 *Chưa có* | **[THIẾU - Nên bổ sung (P2)]**: Lưu trữ và so sánh giá sỉ giữa các đại lý cấp 1 và nhà phân phối lớn. |
| 1.4 | **Đơn hàng mua** | 🟢 **ĐÃ CÓ** (`/purchase`, `/api/purchase`) | **[ĐẠT]**: Tạo PO, duyệt mua hàng, nhập trực tiếp vào Kho Định Công. |
| 1.5 | **Hóa đơn & thanh toán** | 🟢 **ĐÃ CÓ** (`/finance`, `/purchase`) | **[ĐẠT]**: Ghi nhận công nợ NCC và tạo lệnh chi chuyển khoản Techcombank. |
| 1.6 | **Chính sách & bảng giá** | 🟡 *Mới có bảng giá bán* | **[Nên tích hợp vào NCC]**: Gắn bảng giá chiết khấu nhập hàng theo từng NCC. |
| 1.7 | **Báo cáo mua hàng** | 🟢 **ĐÃ CÓ** (`/reports`) | **[ĐẠT]**: Thống kê sản lượng nhập, giá vốn theo nhà cung cấp. |

---

### 2. KHỐI KHO HÀNG (7 Tính Năng — Tập trung tại Kho Định Công)

| STT | Tính năng trong ảnh | Hiện trạng SK Workspace 2.0 | Đánh giá & Định hướng thực tế Sơn Khang Food |
| :---: | :--- | :--- | :--- |
| 2.1 | **Kho & hàng hóa** | 🟢 **ĐÃ CÓ** (`/inventory`) | **[ĐẠT CHUẨN XÁC]**: Quản lý tập trung tại **Kho Định Công** (96 Ngõ 337 Định Công), phân định 2 vùng: Kho khô thường (Mì & Gia vị) và Kho đông lạnh chế biến sẵn (-18°C ~ -22°C). |
| 2.2 | **Chứng từ kho** | 🟢 **ĐÃ CÓ** (`/sales/[id]/pick`, `/inventory`) | **[ĐẠT]**: Phiếu nhập, phiếu xuất bán lẻ/sỉ điện tử. |
| 2.3 | **Nhập - xuất kho** | 🟢 **ĐÃ CÓ** | **[ĐẠT]**: Tích hợp luồng xuất bán và nhập hàng từ PO. |
| 2.4 | **Kiểm kho** | 🟡 *API có, thiếu UI kiểm kê* | **[THIẾU - Ưu tiên cao (P1)]**: Màn hình **Kiểm kê Kho Định Công**: quét barcode đối soát tồn thực tế vs số liệu Sapo, ghi nhận hao hụt/lệch tồn định kỳ. |
| 2.5 | **Chất lượng (KCS)** | 🔴 *Chưa có form KCS* | **[THIẾU - Ưu tiên cao (P1)]**: Nghiệm thu hàng về: kiểm tra cảm quan date Indomie/gia vị, đo nhiệt độ đông lạnh thùng bảo ôn hàng viên chiên/gà popcorn khi nhận. |
| 2.6 | **Sổ cái kho** | 🟢 **ĐÃ CÓ** (`/inventory`) | **[ĐẠT]**: Thẻ kho, lịch sử biến động tồn từng mặt hàng theo thời gian. |
| 2.7 | **Báo cáo kho** | 🟢 **ĐÃ CÓ VƯỢT TRỘI** (`/inventory`) | **[ĐẠT ĐẲNG CẤP CAO]**: Cảnh báo cận date **FEFO (Hạn sử dụng < 30 ngày)**, cảnh báo tồn kho dưới ngưỡng an toàn để chủ động nhập hàng. |

---

### 3. KHỐI BÁN HÀNG (9 Tính Năng)

| STT | Tính năng trong ảnh | Hiện trạng SK Workspace 2.0 | Đánh giá & Định hướng thực tế Sơn Khang Food |
| :---: | :--- | :--- | :--- |
| 3.1 | **CRM** | 🟢 **ĐÃ CÓ** (`/customers`) | **[ĐẠT]**: Hồ sơ đại lý, quán ăn vặt, nhà hàng, căng tin, khách sỉ gửi chành xe, hạn mức nợ gối đầu. |
| 3.2 | **Báo giá** | 🟡 *Chưa có module báo giá riêng* | **[THIẾU - Nên bổ sung (P1)]**: Tạo báo giá sỉ mì Indomie, gia vị, đồ viên chiên nhanh gửi Zalo cho khách hàng. |
| 3.3 | **Đơn hàng bán** | 🟢 **ĐÃ CÓ** (`/sales`, `/api/sales`) | **[ĐẠT XUẤT SẮC]**: Luồng 4 bước (`Chờ duyệt` ➔ `Soạn kho FEFO` ➔ `Đang giao` ➔ `Hoàn tất`). |
| 3.4 | **Hóa đơn & thanh toán** | 🟢 **ĐÃ CÓ** (`/finance/vietqr`, `/finance/sapo2misa`) | **[ĐẠT XUẤT SẮC]**: Gạch nợ tự động VietQR Techcombank `22226060` và xuất hóa đơn meInvoice. |
| 3.5 | **Đóng gói & giao hàng** | 🟢 **ĐÃ CÓ** (`/delivery`, `/pwa/giaovan`) | **[ĐẠT]**: Phân luồng rõ: **Tuyến Xe máy** (nội thành, đơn lẻ hỏa tốc) và **Tuyến Xe tải VAN** (đơn sỉ nhiều thùng, hàng đông lạnh chế biến sẵn, gửi chành xe bến Giáp Bát / Nước Ngầm). |
| 3.6 | **Chương trình bán hàng** | 🟢 **ĐÃ CÓ** (`/pricing`) | **[ĐẠT]**: Chính sách giá bán sỉ theo sản lượng, chiết khấu đại lý. |
| 3.7 | **Bán hàng POS** | 🟢 **ĐÃ CÓ** (`/pos`) | **[ĐẠT]**: POS online quầy kho Định Công in bill K80, thanh toán VietQR động. |
| 3.8 | **Bán hàng Website** | 🟢 **ĐÃ CÓ** (`/dathang`) | **[ĐẠT]**: Cổng Web Order B2B đặt hàng trực tuyến cho khách buôn. |
| 3.9 | **Báo cáo bán hàng** | 🟢 **ĐÃ CÓ** (`/reports`, Dashboard `/`) | **[ĐẠT]**: Doanh thu realtime đồng bộ Sapo, phân loại kênh sỉ vs lẻ. |

---

### 4. KHỐI TÀI CHÍNH - KẾ TOÁN (9 Tính Năng) — *RANH GIỚI VỚI MISA AMIS ONLINE*

| STT | Tính năng trong ảnh | Hiện trạng SK Workspace 2.0 | Đánh giá kiến trúc (Thừa hay Thiếu?) |
| :---: | :--- | :--- | :--- |
| 4.1 | **Tiền mặt & tiền gửi** | 🟢 **ĐÃ CÓ** (`/finance`) | **[ĐẠT]**: Sổ quỹ tiền mặt và tài khoản Techcombank 22226060, VietQR tự động. |
| 4.2 | **Kế toán bán hàng** | 🟡 *Có công nợ, thiếu tuổi nợ* | **[NÊN BỔ SUNG NHẸ (P1)]**: Bảng theo dõi tuổi nợ khách buôn (trong hạn, quá hạn 15 ngày, quá hạn 30 ngày). |
| 4.3 | **Kế toán mua hàng** | 🟢 **ĐÃ CÓ** (`/purchase`, `/finance`) | **[ĐẠT]**: Theo dõi công nợ gối đầu nhà cung cấp. |
| 4.4 | **Kế toán kho hàng** | 🟢 **ĐÃ CÓ** (`/finance/sapo2misa`) | **[ĐẨY QUA API MISA]**: Đẩy dữ liệu xuất kho giá vốn 63 cột sang Misa Amis Online tự động. |
| 4.5 | **Kế toán tài sản** | ⛔ *Không có* | **[THỪA - KHÔNG LÀM TRÊN WEB]**: Thuộc nghiệp vụ Misa Amis Online. |
| 4.6 | **Kế toán tiền lương** | 🟢 **ĐÃ CÓ** (`/hr`) | **[ĐẠT MỨC QUẢN TRỊ]**: Chấm công, tính lương và phụ cấp cơ bản cho đội ngũ. |
| 4.7 | **Kế toán ngân sách** | ⛔ *Không có* | **[THỪA - KHÔNG CẦN THIẾT]**: Quy mô SME không cần lập ngân sách phức tạp. |
| 4.8 | **Kế toán tổng hợp** | ⛔ *Không có* | **[THỪA - TUYỆT ĐỐI KHÔNG LÀM]**: Kế toán trưởng Hoàng Thị Nho hạch toán trên Misa Amis Online. |
| 4.9 | **Báo cáo tài chính & thuế** | 🟢 **XUẤT QUA MISA & MEINVOICE** | **[THỪA TRÊN WEB]**: Khai thuế và báo cáo tài chính pháp lý được kết xuất chính thức từ MISA AMIS. |

---

## IV. TAM GIÁC TÍCH HỢP API CỦA SƠN KHANG FOOD

Hệ thống của Sơn Khang Food được xây dựng theo mô hình **Tam giác API khép kín**, tận dụng tối đa sức mạnh của 3 phần mềm chuyên trách sẵn có:

```
                            ┌────────────────────────────────────────┐
                            │          SAPO OPEN API (BÁN HÀNG)      │
                            │  • Bán hàng đa kênh & POS quầy K80     │
                            │  • Quản lý đơn hàng & tồn kho store    │
                            └──────────────────┬─────────────────────┘
                                               │ (Webhook & API 2 chiều)
                                               ▼
                      ┌────────────────────────────────────────────────────┐
                      │            SK WORKSPACE 2.0 (HUB ĐIỀU HÀNH)        │
                      │  • Kho Tổng Định Công (Kho khô & Kho đông -18°C)   │
                      │  • Đội xe: Xe máy (Hỏa tốc) & Xe tải VAN (Sỉ/Bến)  │
                      │  • Thuật toán nhặt hàng FEFO (Date < 30 ngày)      │
                      │  • Gạch nợ tự động VietQR Techcombank 22226060     │
                      │  • Trạm tiền xử lý dữ liệu chuẩn hóa 63 cột        │
                      └────────────────────────┬───────────────────────────┘
                                               │ (API đẩy chứng từ & hóa đơn)
                                               ▼
        ┌────────────────────────────────────────────────────────────────────────┐
        │                 HỆ SINH THÁI MISA API (KẾ TOÁN & PHÁP LÝ)              │
        │  • MISA AMIS Online: Sổ cái, giá vốn, công nợ, BCTC, thuế GTGT         │
        │  • MISA meInvoice: Ký số và phát hành HĐĐT tự động (Ký hiệu C26TSK)    │
        └────────────────────────────────────────────────────────────────────────┘
```

---

## V. LỘ TRÌNH TRIỂN KHAI BỔ SUNG (ACTIONABLE ROADMAP)

### Giai đoạn 1: Hoàn thiện nghiệp vụ Kho Định Công & Bán buôn (Ưu tiên P1 — 1-2 tuần)
1. **Kiểm kê Kho Định Công:** Form kiểm kê định kỳ đối soát tồn thực tế tại Kho Định Công, ghi nhận chênh lệch hàng khô vs đông lạnh chế biến sẵn.
2. **KCS Tiếp Nhận Hàng:** Form nghiệm thu hàng về (date Indomie/gia vị, nhiệt độ thùng bảo ôn hàng viên chiên).
3. **Báo giá B2B Chuyên Nghiệp:** Xuất báo giá nhanh (PDF/ảnh) gửi Zalo cho đại lý chành xe và quán ăn vặt.
4. **Phân Luồng Giao Vận Thực Tế:** Giao diện điều phối chọn rõ phương tiện: **Xe máy** vs **Xe tải VAN**.

### Giai đoạn 2: Tối ưu Quy trình Mua hàng (Ưu tiên P2 — 2-3 tuần)
1. **Yêu Cầu Mua Hàng:** Form đề xuất đặt hàng khi mì Indomie hoặc đồ đông lạnh chạm ngưỡng tối thiểu.
2. **So sánh Báo giá NCC:** Bảng so giá giữa các nhà phân phối cấp 1.

### Giai đoạn 3: Giữ vững ranh giới hệ thống (Ngăn chặn Over-Engineering)
* Kiên quyết **KHÔNG** lập trình các phân hệ: Kế toán tài sản, Kế toán ngân sách, Bút toán kết chuyển tổng hợp.
* Tối ưu hóa API **Sapo ➔ SK Workspace ➔ Misa Amis 63 cột & meInvoice** để dữ liệu tự động đồng bộ xuyên suốt.
