# PHÂN CÔNG THỰC THI — WORKER 1 (PROCUREMENT SQUAD)
# DỰ ÁN: SƠN KHANG WORKSPACE 2.0 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: 0111252725)
# PHÂN HỆ: 1. MUA HÀNG (PROCUREMENT & VENDOR MANAGEMENT)
# CĂN CỨ: CHỈ THỊ SỐ 19 TỪ COMMANDER

---

### PHẠM VI DANH MỤC TỆP CHO PHÉP (STRICT BOUNDARY):
- `packages/modules/purchase/**`
- `app/(shell)/purchase/**`
- `app/api/purchase/**`
- Báo cáo kết quả: `.claude/reports/worker-1-purchase.md`

---

### NHIỆM VỤ CHI TIẾT:
1. **Yêu cầu mua hàng (Purchase Requisition - PR):** Đề xuất nhập hàng nội bộ dựa trên cảnh báo mức tồn an toàn của Kho Định Công (Kho Khô mì Indomie/Gia vị & Kho Đông -18°C).
2. **Hồ sơ Nhà cung cấp (Vendor Directory):** Danh bạ NCC (CP, Indomie, Kewpie, LC Foods...), điều khoản nợ 15-30 ngày, hợp đồng, lịch sử giao dịch và đánh giá chất lượng NCC.
3. **Báo giá & So sánh giá NCC:** Quản lý bảng giá nhập từng NCC, theo dõi biến động giá nguyên liệu/thành phẩm, chiết khấu và thưởng sản lượng.
4. **Đơn mua hàng PO (Purchase Order):** Quy trình phê duyệt PO đa cấp (Thủ kho đề xuất ➔ Kế toán kiểm tra ➔ Giám đốc duyệt), theo dõi tiến độ giao hàng về Kho Định Công.
5. **Đối soát 3 chiều:** Đối chiếu tự động giữa Đơn mua PO $\leftrightarrow$ Phiếu nhập kho GRN $\leftrightarrow$ Hóa đơn VAT đầu vào trước khi chuyển sang kế toán.

---

### YÊU CẦU NGHIỆM THU:
- `npx tsc --noEmit` đạt 0 lỗi.
- Báo cáo kết quả vào `.claude/reports/worker-1-purchase.md`.
