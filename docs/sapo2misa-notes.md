# Sapo2Misa — Ghi chú kế thừa cho SK Workspace

> Nguồn: workflow tổng thể + file `sk-workspace-platform-architecture.html` anh gửi + mô hình ERPNext/MISA.
> SK Workspace là **Data Hub**: Sapo (API đơn/KH/tồn) + nhập tay → DataStore → Excel 63 cột MISA / API MISA → Hóa đơn ĐT.
> **Sapo2Misa chỉ là 1 app trong 14**, nằm trong nhóm Tài chính-Kế toán, không đồng nhất với toàn Workspace.

## Luồng hiện tại (Sapo2Misa standalone)
1. Pull đơn Sapo (SapoApiClient / SapoOmni / Sapo OAuth) → chuẩn hóa CentralOrders
2. Stepper 4 bước (chọn đơn, map KH/sản phẩm, kiểm tra, xuất)
3. Sinh Excel 63 cột theo template MISA AMIS (`sapo2misaLedgerDb` chống trùng)
4. Import thủ công vào MISA AMIS → xuất hóa đơn điện tử (meInvoice)

## Excel 63 cột MISA — nhóm chính
- Header: Ngày hạch toán, Ngày chứng từ, Số chứng từ, Khách hàng (MST, tên, địa chỉ), Diễn giải
- Dòng chi tiết: Mã hàng, Tên hàng, ĐVT, Số lượng, Đơn giá, Thành tiền, Thuế suất, Tiền thuế, TK nợ/có
- Tổng hợp: Tổng tiền hàng, Tổng thuế, Tổng thanh toán, Hình thức TT, Hạn TT
- Các cột còn lại là mở rộng MISA (chi phí, chiết khấu, lô/hạn, v.v.) — giữ đúng thứ tự 63 cột khi xuất.

## Mapping quan trọng
- Sapo Order → MISA Chứng từ bán hàng (1 đơn = 1 chứng từ, nhiều dòng)
- Sapo Customer → MISA Khách hàng (map theo MST + mã KH; tạo mới nếu chưa có)
- Sapo Product Variant → MISA Vật tư hàng hóa (map theo SKU)
- Giá theo khách (customer_prices) ưu tiên khi tạo đơn trong SK Workspace

## Ranh giới trong SK Workspace
- Adapter `packages/integrations/sapo` (pull/push) và `packages/integrations/misa` (xuất Excel → sau này push API) đều dùng `external_id + last_synced_at + integration_logs`.
- UI Sapo2Misa nằm trong app **Tài chính-Kế toán**, stepper giữ nguyên để kế toán quen.
- Các app khác tự trị: Kanban (SKTask), RFM, tuổi nợ, v.v. — không phụ thuộc Sapo2Misa.

## Việc cần làm khi code
- Kế thừa `sapo2misa/*` nếu có: giữ `ledgerDb`, template 63 cột, mapping; bọc trong adapter MISA.
- Thêm Google OAuth (Auth.js) cho đăng nhập nhanh, RBAC `hasAppAccess('sapo2misa')`.
- Workflow Engine: đơn Sapo mới / nợ quá hạn / tồn thấp → tạo Task/Note/Cảnh báo liên app.
