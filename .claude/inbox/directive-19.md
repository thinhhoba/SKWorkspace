# CHỈ THỊ LỆNH TỪ COMMANDER & CHỦ TỊCH — SỐ 19
# DỰ ÁN: SƠN KHANG WORKSPACE 2.0 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# CHỦ ĐỀ TRỌNG TÂM:
# TÁI THIẾT KIẾN TRÚC TOÀN DIỆN BỘ KHUNG 7 PHÂN HỆ CHỨC NĂNG DOANH NGHIỆP
# VÀ CHUẨN HÓA QUY TRÌNH 8 BƯỚC KHÉP KÍN: MUA HÀNG ➔ NHẬP KHO ➔ BÁN HÀNG ➔ GIAO VẬN ➔ HÓA ĐƠN & DOANH THU

---

### I. CĂN CỨ DOANH NGHIỆP & TẦM NHÌN HỆ SINH THÁI ĐỒNG BỘ:

- **Pháp nhân doanh nghiệp:** CÔNG TY TNHH THỰC PHẨM SƠN KHANG (Mã số thuế: `0111252725`)
- **Người đại diện pháp luật:** Giám đốc HỒ BÁ THỊNH (CCCD: `001094016823`, Sinh ngày: 20/11/1994)
- **Tài khoản thanh toán chính thức:** Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank) số tài khoản `22226060` (Mã BIN: `970407`) — Tự động nhận diện và đối soát giao dịch VietQR 24/7.
- **Ngành hàng sản xuất & phân phối chủ lực:**
  1. *Thực phẩm khô ăn liền:* Mì trộn Indomie (các vị đặc biệt, sườn cay, tương đen), Mì Nissin Raoh, các dòng mì khô đóng thùng 40 gói.
  2. *Gia vị & phụ gia thực phẩm:* Tương ớt, tương cà Sài Gòn Can 2L, sốt chấm Mayonnaise Kewpie Can/Chai, dầu thực vật Cái Lân Can 5L.
  3. *Thực phẩm đông lạnh chế biến sẵn:* Viên chiên LC Foods, gà Popcorn CP, xúc xích, Tokbokki CJ, bánh gà Nét Việt bảo quản chuẩn nhiệt độ âm sâu -18°C.
- **Cơ sở hạ tầng & Kho bãi vật lý:**
  * *Trụ sở văn phòng chính:* Thôn 6, Xã Yên Xuân, Thành phố Hà Nội *(VĂN PHÒNG HÀNH CHÍNH & PHÁP LÝ — TUYỆT ĐỐI KHÔNG LƯU KHO HÀNG HÓA)*.
  * *Kho hàng vận hành duy nhất:* Số 96 Ngõ 337 Phố Định Công, Phường Định Công, Thành phố Hà Nội *(KHO TỔNG ĐỊNH CÔNG — Tích hợp 2 phân khu: Kho hàng khô mì/gia vị và Kho đông lạnh chế biến sẵn -18°C)*.
- **Đội xe vận chuyển nội bộ:**
  * **Xe máy (🛵):** Giao nhanh ngõ ngách nội đô, các đơn nhỏ lẻ dưới 30kg cho các quán ăn vặt, căng tin học đường, thời gian giao 1-2h.
  * **Xe tải VAN (🚐):** Thùng bảo ôn giữ nhiệt đạt chuẩn, vận chuyển đơn sỉ số lượng lớn, thùng hàng carton cồng kềnh, hàng đông lạnh chế biến sẵn, chuyên tuyến giao đại lý và giao ra các chành xe bến Giáp Bát / Nước Ngầm. *Lợi thế pháp lý: Được phép lưu thông 24/7 nội đô Hà Nội không bị cấm giờ!*
- **Tam giác tích hợp Open API:**
  * Sapo Open API (Bán hàng đa kênh, POS quầy K80, Web Order, đồng bộ tồn kho khả dụng).
  * MISA AMIS Online (Hệ thống kế toán pháp lý 63 cột, ghi sổ mua hàng, doanh thu, giá vốn, sổ quỹ).
  * MISA meInvoice (Hệ thống Hóa đơn điện tử theo Nghị định 123, ký số HSM, cấp mã CQT tức thì cho đơn B2B có MST và gom hóa đơn tổng bán lẻ B2C cuối ngày).

---

### II. BẢN KIẾN TRÚC CHI TIẾT 7 PHÂN HỆ CHỨC NĂNG TOÀN DIỆN (ALL-IN-ONE ENTERPRISE HUB):

Hệ thống Sơn Khang Workspace được chuẩn hóa thành 7 phân hệ chức năng độc lập nhưng liên kết dữ liệu thời gian thực:

```text
┌────────────────────────────────────────────────────────────────────────┐
│             7. HỆ THỐNG: Cấu hình, Phân quyền RBAC, Audit Log          │
└──────────────────────────────────┬─────────────────────────────────────┘
                                   │
      ┌────────────────────────────┼────────────────────────────┐
      ▼                            ▼                            ▼
[1. MUA HÀNG] ────────────► [2. KHO HÀNG] ◄────────────► [3. BÁN HÀNG & DMS]
 (Tạo PO, duyệt)            (Lô/Date, FEFO)              (Đa kênh Sapo + SFA)
      │                            │                            │
      │                            ▼                            ▼
      │                    [4. GIAO HÀNG] ◄─────────────────────┘
      │                   (Đội xe, 3PL, COD)
      │                            │
      └────────────┬───────────────┴────────────┐
                   ▼                            ▼
       [5. TÀI CHÍNH - KẾ TOÁN]         [6. NHÂN SỰ & TASK]
       (Open API MISA AMIS/meInvoice)   (Tính lương KPI Sales/Xe, Chấm công)
```

---

#### 1. PHÂN HỆ MUA HÀNG (PROCUREMENT & VENDOR MANAGEMENT)
*Quản trị toàn diện chuỗi cung ứng đầu vào từ các nhà sản xuất/nhà máy:*
* **Yêu cầu mua hàng (Purchase Requisition - PR):** Đề xuất nhập hàng nội bộ tự động sinh ra dựa trên cảnh báo mức tồn an toàn của Kho Định Công và kế hoạch tiêu thụ kinh doanh hàng tháng.
* **Hồ sơ Nhà cung cấp (Vendor Directory):** Quản lý danh bạ NCC (CP, Indomie, Kewpie, LC Foods...), lưu trữ hợp đồng, điều khoản công nợ (trả ngay / công nợ 15-30 ngày), hạn mức nợ, lịch sử mua hàng và chấm điểm chất lượng NCC.
* **Báo giá & So sánh giá:** Quản lý bảng giá nhập theo từng NCC, biểu đồ theo dõi lịch sử biến động giá nguyên liệu/thành phẩm theo thời gian, theo dõi chính sách chiết khấu thương mại và thưởng sản lượng từ nhà máy.
* **Đơn mua hàng (PO - Purchase Order):** Tạo lập đơn PO chuẩn mực gửi nhà máy, kiểm soát quy trình phê duyệt PO đa cấp theo giá trị đơn hàng (Thủ kho đề xuất ➔ Kế toán kiểm tra ngân sách ➔ Giám đốc phê duyệt), theo dõi tiến độ giao hàng và xác nhận ngày hàng về kho.
* **Hóa đơn mua & Đối soát công nợ 3 chiều:** Đối chiếu tự động 3 chiều giữa *Đơn mua (PO) $\leftrightarrow$ Phiếu nhập kho thực tế (GRN) $\leftrightarrow$ Hóa đơn VAT đầu vào từ NCC*. Chỉ khi khớp số lượng, đơn giá và tiền thuế mới chuyển sang kế toán hạch toán.

---

#### 2. PHÂN HỆ KHO HÀNG (ADVANCED F&B WMS)
*Vận hành kho hàng theo chuẩn ERP, chuyên sâu cho thực phẩm khô, gia vị và thực phẩm đông lạnh:*
* **Danh mục Kho & Vị trí:** Quản lý kho đa tầng tập trung tại Kho Tổng Định Công (96 Ngõ 337 Định Công) với 2 phân khu nhiệt độ tách biệt: *Kho hàng khô (Mì Indomie & Gia vị)* và *Kho mát/đông lạnh (-18°C)*, định vị vị trí kệ (Bin/Location).
* **Quản lý Lô & Hạn sử dụng (Batch & Expiry Date):** Bắt buộc gán Số Lô (Batch No) và Ngày hết hạn (Expiry Date) cho 100% hàng nhập kho (mì Indomie, sốt Mayonnaise, viên thả lẩu...).
* **Cơ chế xuất kho FEFO (First Expired, First Out):** Tự động gợi ý và chỉ định xuất lô hàng có hạn sử dụng gần nhất trước, tuyệt đối ngăn chặn rủi ro tồn ứ hàng cận Date.
* **Chứng từ kho:** Hệ thống chứng từ tiêu chuẩn: Phiếu nhập mua (GRN), Phiếu xuất bán (GDN), Phiếu điều chuyển phân khu nội bộ, Phiếu xuất hàng đổi trả NCC, Phiếu xuất mẫu thử (Sampling).
* **Kiểm định chất lượng (KCS Hàng về):** Biên bản KCS tiếp nhận hàng: Cảm quan bao bì nguyên vẹn, Hạn dùng còn ≥ 70%, Đo nhiệt độ thùng hàng đông lạnh bắt buộc đạt ≤ -15°C (nếu > -12°C cảnh báo vi phạm HACCP).
* **Kiểm kê & Báo cáo tồn:** Kiểm kê định kỳ bằng mã vạch barcode, tự động tính chênh lệch thừa/thiếu, phân tích lý do hao hụt (rã đông, rách bao bì, hết hạn), báo cáo tuổi hàng và cảnh báo cận date theo 3 dải màu Xanh / Vàng / Đỏ.

---

#### 3. PHÂN HỆ BÁN HÀNG & PHÂN PHỐI (OMNICHANNEL & DMS)
*Trung tâm điều phối toàn bộ luồng đơn hàng từ bán buôn B2B đến bán lẻ B2C:*
* **Bán lẻ đa kênh (Omnichannel qua Sapo Sync):** Tiếp nhận đơn hàng tự động theo thời gian thực từ quầy thu ngân (POS K80 tại kho), Website đặt hàng (`dathang.sonkhang.vn`), kênh Chat (Facebook, Zalo) và các sàn TMĐT.
* **Phân phối B2B & Quản lý Tuyến (DMS):**
  * Danh bạ đại lý, quán ăn, nhà hàng, căng tin trường học, phân nhóm theo khu vực (nội thành, ngoại thành, tỉnh gửi chành xe) và quy mô.
  * Phân chia tuyến bán hàng (Route Planning) theo ngày/tuần cho Sales thị trường.
  * Ứng dụng SFA cho nhân viên kinh doanh: Check-in/check-out GPS tại điểm bán, lên đơn đặt hàng Sell-In / Sell-Out tức thời trên điện thoại.
* **Chính sách giá & Chiết khấu:** Áp dụng bảng giá sỉ linh hoạt theo cấp bậc đại lý (Đại lý cấp 1, quán ăn chuỗi, chành xe), chiết khấu theo sản lượng thùng mì / can sốt, tạo Báo giá B2B xuất ảnh/PDF gửi Zalo trong 30 giây.
* **Kiểm soát Hạn mức Tín dụng (Credit Limit):** Tự động kiểm tra công nợ khi lên đơn, chặn xuất đơn đối với khách hàng có nợ quá hạn (>30 ngày) hoặc tổng dư nợ vượt hạn mức bảo lãnh công nợ.

---

#### 4. PHÂN HỆ ĐÓNG GÓI & GIAO HÀNG (LOGISTICS & FULFILLMENT)
*Quản trị quá trình thực thi đơn hàng, đội xe vận chuyển nội bộ và đối tác 3PL:*
* **Đóng gói hàng hóa (Packing):** Tạo lệnh đóng gói (Pick & Pack), quét mã vạch đối chiếu SKU, số lượng và lô hàng hạn dùng trước khi dán tem niêm phong kiện hàng.
* **Điều phối Đội xe giao nhận (Internal Fleet):**
  * Phân luồng phương tiện: Tuyến Xe máy (🛵 hỏa tốc ngõ ngách <30kg) vs Tuyến Xe tải VAN (🚐 thùng bảo ôn, sỉ thùng, hàng đông lạnh, gửi chành xe Giáp Bát/Nước Ngầm, chạy 24/7).
  * Lập lộ trình giao hàng tối ưu, bàn giao đơn hàng kèm Biên bản giao nhận và Phiếu thu tiền mặt / Phiếu đối soát công nợ cho tài xế.
* **Kết nối Đơn vị vận chuyển (3PL qua Sapo Express):** Đẩy mã vận đơn tự động sang các hãng chuyển phát nhanh (GHN, Viettel Post...), tự động cập nhật trạng thái hành trình theo thời gian thực.
* **Đối soát & Quản lý COD:** Theo dõi tiền thu hộ COD từ tài xế nội bộ hoặc hãng 3PL, lập bảng kê đối soát, tự động cấn trừ phí giao hàng và cảnh báo chốt nộp tiền COD trong ngày.

---

#### 5. PHÂN HỆ TÀI CHÍNH - KẾ TOÁN (TÍCH HỢP OPEN API MISA)
*Tự động hóa hoàn toàn luồng dữ liệu sang sổ sách kế toán pháp lý và hóa đơn điện tử:*
* **Kế toán bán hàng & Doanh thu (MISA AMIS API):**
  * Tự động sinh chứng từ bán hàng kiêm xuất kho qua API (`/api/v1/sa/voucher/save`).
  * Tự động hạch toán định khoản: Nợ TK 131/111/112/1388 đối ứng Có TK 5111 (Doanh thu), Có TK 3331 (Thuế GTGT) và Nợ TK 632 (Giá vốn) / Có TK 156 (Hàng hóa).
* **Phát hành Hóa đơn điện tử (MISA meInvoice API):**
  * Ký số HSM từ xa và phát hành HĐĐT có mã CQT tức thì cho đơn B2B có MST (`/api/v1/invoice/publish`).
  * Tự động gom các đơn hàng khách lẻ B2C không lấy hóa đơn trong ngày để lập bảng kê/hóa đơn điện tử tổng cuối ngày.
* **Kế toán mua hàng & Kho (MISA AMIS API):** Ghi sổ hóa đơn mua hàng (`/api/v1/pu/voucher/save`), tự động hạch toán Nợ TK 156, Nợ TK 1331 (Thuế GTGT đầu vào) đối ứng Có TK 331 (Phải trả NCC).
* **Sổ quỹ & Thu nợ:** Quản lý Quỹ tiền mặt Định Công và Ngân hàng Techcombank `22226060`, tự động sinh Phiếu thu (`/api/v1/ca/receipt/save`) khi khách thanh toán VietQR hoặc tài xế nộp COD thành công (Nợ TK 1121 / Có TK 131). Theo dõi báo cáo Tuổi nợ B2B Aging 4 mốc (15/30/60 ngày).

---

#### 6. PHÂN HỆ NHÂN SỰ & QUẢN TRỊ CÔNG VIỆC (HRM & TASK FLOW)
*Quản lý nhân sự, hiệu suất làm việc và tự động hóa tính lương gắn liền với dữ liệu kinh doanh:*
* **Hồ sơ nhân sự:** Quản lý lý lịch nhân viên, hợp đồng lao động, phân loại 4 phòng ban thực tế (Khối Văn phòng, Khối Kho Định Công, Đội Giao vận, Đội Sales thị trường).
* **Chấm công thông minh:**
  * Chấm công theo ca kíp bằng wifi nội bộ tại Kho Định Công và văn phòng.
  * Tự động ghi nhận ngày công cho Sales thị trường dựa trên lịch sử check-in GPS đủ số điểm bán trên tuyến quy định.
* **Tính lương & KPI tự động:**
  * **Lương Sales thị trường:** Tự động tính thưởng doanh số, thưởng sản lượng (số thùng mì Indomie, số can sốt) căn cứ dữ liệu đơn hàng giao thành công từ phân hệ Bán hàng.
  * **Lương Đội xe/Giao nhận:** Tự động tính phụ cấp chuyến, định mức xăng xe, thưởng theo số lượng đơn giao thành công và tỷ lệ đối soát COD đúng hạn (phạt nếu trễ hạn nộp tiền COD).
  * **Bảng lương tự động:** Tổng hợp lương cứng, phụ cấp, thưởng KPI, trích đóng bảo hiểm và xuất phiếu lương (Payslip) điện tử gửi nhân viên.
* **Quản trị Luồng công việc (Task Flow & Workflow):**
  * Thiết lập luồng phê duyệt chứng từ liên phòng ban (Duyệt PO mua hàng, duyệt vượt hạn mức nợ, duyệt chi tiền khẩn).
  * Giao việc nội bộ, theo dõi tiến độ công việc dạng Kanban / Gantt, đánh giá mức độ hoàn thành nhiệm vụ theo chuẩn SLA.

---

#### 7. PHÂN HỆ QUẢN TRỊ HỆ THỐNG (SYSTEM CORE & ADMINISTRATION)
*Nền tảng vận hành cốt lõi đảm bảo an toàn dữ liệu, bảo mật và khả năng kết nối mở rộng:*
* **Trang cá nhân (User Workspace):** Không gian làm việc cá nhân hóa cho từng tài khoản: Đổi mật khẩu, thiết lập chữ ký điện tử, xem danh sách việc cần xử lý (To-do list), lịch sử chấm công và phiếu lương cá nhân.
* **Phân quyền người dùng (Role-Based Access Control - RBAC):**
  * Phân quyền chi tiết theo vai trò: Admin, Kế toán trưởng, Thủ kho, Tài xế, Sales Admin, Nhân viên kinh doanh.
  * Kiểm soát quyền đến từng hành động: Xem, Thêm, Sửa, Xóa, Duyệt và phân quyền dữ liệu theo chi nhánh/kho hàng.
* **Cấu hình Phân hệ (Master Settings):**
  * Cài đặt tham số vận hành: Thuế suất mặc định (8%, 10%), đơn vị tiền tệ VNĐ, mẫu số - ký hiệu hóa đơn (C26TSK), quy tắc làm tròn số, tỷ lệ quy đổi UoM (Thùng $\leftrightarrow$ Gói/Can).
  * Cấu hình hạn mức duyệt tự động, số ngày cảnh báo hàng cận Date.
* **Quản lý Kết nối & Tích hợp (Integration Gateway):**
  * Quản lý Webhook nhận dữ liệu đơn hàng và khách hàng từ Sapo.
  * Quản lý OAuth 2.0 Credentials kết nối MISA Open API (AMIS Kế toán & meInvoice).
  * Cấu hình kết nối cổng thanh toán VietQR Techcombank, đơn vị vận chuyển 3PL và cổng SMS/Zalo ZNS.
* **Trung tâm Thông báo (Notification Center):** Thông báo tức thời trên giao diện Web và ứng dụng di động: Đơn hàng mới, cảnh báo nợ quá hạn, hàng sắp hết hạn, chứng từ chờ duyệt; tích hợp gửi cảnh báo khẩn cấp qua Telegram Bot hoặc Zalo ZNS.
* **Nhật ký hệ thống & Kiểm toán dữ liệu (Audit Trail / Logs):** Ghi lại toàn bộ lịch sử thao tác: Ai làm gì, sửa trường dữ liệu nào, thời gian nào; lưu vết toàn bộ Request/Response API gửi sang MISA để phục vụ đối soát và xử lý sự cố.

---

### III. QUY TRÌNH 3 GIAI ĐOẠN / 8 BƯỚC KHÉP KÍN (END-TO-END LIFECYCLE):

```text
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 1: MUA HÀNG & NHẬP KHO                                                       │
│ 1. LẬP ĐƠN MUA HÀNG (PO) ──► 2. NHẬP KHO & GÁN LÔ - DATE ──► 3. ĐỒNG BỘ TỒN & GHI NỢ MUA│
│ (Nhân viên mua tạo PO)      (KCS kiểm tra, gán Lô/Date)    (Tồn lên Sapo, Nợ 156-Có 331)│
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
┌────────────────────────────────────────────────────────────────────────────────────────┐
│ GIAI ĐOẠN 2: BÁN HÀNG & LOGISTICS                                                      │
│ 4. BÁN HÀNG & PHÊ DUYỆT (SO) ──► 5. XUẤT KHO FEFO & ĐÓNG GÓI ──► GIAO HÀNG (XE / 3PL)       │
│ (Sapo lẻ + DMS sỉ, check nợ)(FEFO lô cận Date, đóng gói)   (Xe máy / VAN 24/7 / Sapo Exp)│
└──────────────────────────────────────────┬─────────────────────────────────────────────┘
                                           │
┌──────────────────────────────────────────▼─────────────────────────────────────────────┐
│ GIAI ĐOẠN 3: TÀI CHÍNH - KẾ TOÁN & HÓA ĐƠN                                             │
│ 6. XUẤT HÓA ĐƠN ĐIỆN TỬ (HĐĐT) ──► 7. GHI NHẬN DOANH THU & GIÁ VỐN ──► 8. ĐỐI SOÁT & THU TIỀN │
│ (meInvoice HSM / gom lẻ)    (AMIS: Nợ 131-Có 5111/3331)    (VietQR 22226060 / COD)     │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

* **1. LẬP ĐƠN MUA HÀNG (PO):** Nhân viên thu mua tạo PO gửi Nhà cung cấp trên Sơn Khang Workspace.
* **2. NHẬP KHO & GÁN LÔ - DATE:** Thủ kho kiểm tra chất lượng (KCS: hạn dùng ≥ 70%, nhiệt độ đông lạnh ≤ -15°C), bắt buộc gán Số Lô (Batch) & Hạn sử dụng (Date).
* **3. ĐỒNG BỘ TỒN & GHI NỢ MUA:** Tự động đồng bộ tồn kho khả dụng lên Sapo POS/Web; đồng thời gọi MISA Open API hạch toán Nhập mua (`/api/v1/pu/voucher/save`: Nợ TK 156, Nợ TK 1331 - Có TK 331).
* **4. BÁN HÀNG & PHÊ DUYỆT (SO):** Đơn hàng từ Sapo (bán lẻ) và DMS (bán sỉ) đổ về Hub trung tâm, tự động kiểm tra bảng giá & hạn mức công nợ khách hàng.
* **5. XUẤT KHO FEFO & ĐÓNG GÓI:** Thủ kho xuất hàng ưu tiên Lô cận Date trước (FEFO), đóng gói và chuyển cho Giao nhận (đội xe tải nhà hoặc Sapo Express).
* **6. XUẤT HÓA ĐƠN ĐIỆN TỬ (HĐĐT):** Đơn hoàn tất ➔ meInvoice API tự động ký HSM/phát hành HĐĐT có mã CQT (Đơn B2B có MST) hoặc gom hóa đơn tổng cuối ngày (Đơn lẻ B2C).
* **7. GHI NHẬN DOANH THU & GIÁ VỐN:** AMIS API tự động ghi sổ Doanh thu (Nợ TK 131/111/112/1388 - Có TK 5111, Có TK 3331) & Giá vốn (Nợ TK 632 - Có TK 156).
* **8. ĐỐI SOÁT & THU TIỀN:** Nhận tiền từ đại lý hoặc đối soát COD ➔ Tự động sinh Phiếu thu/Báo có ngân hàng Techcombank `22226060` (Nợ TK 1121 - Có TK 131/1388).

---

### IV. MA TRẬN PHÂN CÔNG THỰC THI (WORKER SQUADS):

| Worker Squad | Phân Hệ Mục Tiêu | Trách Nhiệm Trọng Tâm | Danh Mục Tệp/Tài Nguyên |
| :--- | :--- | :--- | :--- |
| **Worker 1 (Procurement)** | **1. Mua Hàng & NCC** | Hoàn thiện module Đề xuất mua PR, Báo giá NCC so sánh, Duyệt PO đa cấp, Đối soát 3 chiều PO $\leftrightarrow$ GRN $\leftrightarrow$ Hóa đơn. | `packages/modules/purchase/**`<br>`app/(shell)/purchase/**`<br>`app/api/purchase/**` |
| **Worker 2 (WMS & Inventory)** | **2. Kho Hàng WMS** | Chuẩn hóa Kho Định Công (Kho Khô + Kho Đông -18°C), Lô/Date bắt buộc, thuật toán FEFO, Kiểm kê barcode và Biên bản KCS tiếp nhận. | `packages/modules/inventory/**`<br>`app/(shell)/inventory/**`<br>`app/api/inventory/**` |
| **Worker 3 (Sales & DMS)** | **3. Bán Hàng & DMS** | Đồng bộ Omnichannel Sapo, Quản lý tuyến Sales SFA GPS, Bảng giá sỉ Thùng/Pallet, Báo giá B2B Zalo, Kiểm soát Credit Limit. | `packages/modules/sales/**`<br>`app/(shell)/sales/**`<br>`app/(shell)/customers/**`<br>`app/(shell)/pricing/**` |
| **Worker 4 (Logistics & Fleet)**| **4. Giao Hàng & Đội Xe** | Đóng gói Pick & Pack, Phân luồng Xe máy vs Xe tải VAN (chạy 24/7), Bàn giao đơn & Biên bản thu nợ, Đối soát thu hộ COD. | `packages/modules/delivery/**`<br>`app/(shell)/delivery/**`<br>`app/(shell)/fleet/**`<br>`app/pwa/giaovan/**` |
| **Worker 5 (Finance & MISA)** | **5. Tài Chính & MISA** | Sổ quỹ Techcombank 22226060, Sapo2Misa 63 cột, Tích hợp Open API AMIS & meInvoice C26TSK, Báo cáo Tuổi nợ B2B Aging 15/30/60. | `packages/modules/finance/**`<br>`packages/integrations/misa/**`<br>`app/(shell)/finance/**` |
| **Worker 6 (HRM & Tasks)** | **6. Nhân Sự & Luồng Việc**| Quản lý 4 phòng ban, Chấm công GPS tuyến, Tính lương KPI thưởng thùng mì / chuyến xe VAN, Workflow duyệt PO/Nợ/Chi, Kanban SLA. | `packages/modules/hr/**`<br>`packages/modules/tasks/**`<br>`app/(shell)/hr/**`<br>`app/(shell)/tasks/**` |
| **Worker 7 (System & Hub Core)**| **7. Quản Trị Hệ Thống** | Trang cá nhân, Phân quyền RBAC, Master Settings UoM Thùng $\leftrightarrow$ Gói, Gateway Sapo/MISA/ZNS, Audit Trail & API Request Log. | `packages/core/**`<br>`app/(shell)/settings/**`<br>`app/(shell)/audit/**`<br>`app/(shell)/profile/**` |
| **Worker 8 (QA & Verification)**| **Toàn Hệ Thống** | Viết kịch bản `scripts/verify-directive-19.cjs`, kiểm tra tính toàn vẹn 7 Phân hệ, tsc --noEmit 0 lỗi, build 98+ routes thành công. | `scripts/verify-directive-19.cjs`<br>`scripts/system-audit.cjs` |

---

### V. TIÊU CHÍ NGHIỆM THU NGHIÊM NGẶT (ACCEPTANCE CRITERIA):

1. **Phân nhóm điều hướng chuẩn 7 phân hệ:**
   - `packages/core/appRegistry.ts` cập nhật kiểu `AppGroup` và `GROUP_ORDER` thành 7 phân hệ chính thức:
     `"mua-hang" | "kho-hang" | "ban-hang" | "giao-hang" | "tai-chinh" | "nhan-su" | "he-thong"`.
   - Sidebar và Trang Bàn làm việc (`/`) hiển thị đầy đủ, đẹp mắt và phân loại chính xác 100% miniapps vào đúng 7 phân hệ.
2. **Toàn vẹn luồng dữ liệu 8 bước:**
   - Dòng chảy từ Đơn mua PO ➔ Nhập kho Lô-Date ➔ Đồng bộ Sapo/MISA ➔ Bán hàng SO ➔ Xuất kho FEFO ➔ HĐĐT meInvoice ➔ Sổ cái AMIS ➔ Thu tiền VietQR được mô tả và hiển thị trực quan trên hệ thống.
3. **Chất lượng mã nguồn:**
   - Lệnh `npx tsc --noEmit` đạt **0 lỗi tuyệt đối**.
   - Toàn bộ các route hiện hữu (98 routes) biên dịch thành công khi chạy `npm run build`.
   - Không được làm vỡ hoặc mất mát bất kỳ tính năng GAP P1 nào vừa hoàn thành ở Chỉ thị 18 (Kiểm kê, KCS -15°C, Báo giá B2B Zalo, Phân luồng Xe máy/VAN, Tuổi nợ B2B Aging).
