# PHÂN CÔNG THỰC THI — WORKER 2 (WMS & INVENTORY SQUAD)
# DỰ ÁN: SƠN KHANG WORKSPACE 2.0 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: 0111252725)
# PHÂN HỆ: 2. KHO HÀNG (ADVANCED F&B WMS)
# CĂN CỨ: CHỈ THỊ SỐ 19 TỪ COMMANDER

---

### PHẠM VI DANH MỤC TỆP CHO PHÉP (STRICT BOUNDARY):
- `packages/modules/inventory/**`
- `app/(shell)/inventory/**`
- `app/api/inventory/**`
- Báo cáo kết quả: `.claude/reports/worker-2-inventory.md`

---

### NHIỆM VỤ CHI TIẾT:
1. **Kho Đa Tầng Kho Định Công:** Quản lý kho tập trung tại 96 Ngõ 337 Định Công, phân khu nhiệt độ: Kho hàng khô (Mì Indomie, gia vị) và Kho đông lạnh (-18°C), vị trí kệ Bin Location.
2. **Quản lý Lô & Hạn sử dụng (Batch/Expiry):** Bắt buộc gán Số Lô & Ngày hết hạn cho 100% hàng nhập kho (mì Indomie, Mayonnaise Kewpie, viên thả lẩu...).
3. **Cơ chế xuất kho FEFO:** Tự động chỉ định xuất lô hàng cận Date trước, ngăn chặn tồn ứ hàng cận hạn.
4. **Chứng từ kho chuẩn ERP:** Phiếu nhập mua (GRN), xuất bán (GDN), điều chuyển phân khu, đổi trả NCC, xuất mẫu thử.
5. **Kiểm định chất lượng (KCS Hàng về):** Kiểm tra cảm quan, date $\ge$ 70%, nhiệt độ đông lạnh $\le$ -15°C (cảnh báo vi phạm HACCP nếu > -12°C).
6. **Kiểm kê & Báo cáo tồn:** Kiểm kê barcode thừa/thiếu, hao hụt (rã đông, rách bao bì, hết hạn), báo cáo tuổi hàng & cảnh báo dải màu Xanh/Vàng/Đỏ.

---

### YÊU CẦU NGHIỆM THU:
- `npx tsc --noEmit` đạt 0 lỗi.
- Báo cáo kết quả vào `.claude/reports/worker-2-inventory.md`.
