# PHÂN CÔNG THỰC THI — WORKER 4 (LOGISTICS & FLEET SQUAD)
# DỰ ÁN: SƠN KHANG WORKSPACE 2.0 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: 0111252725)
# PHÂN HỆ: 4. ĐÓNG GÓI & GIAO HÀNG (LOGISTICS & FULFILLMENT)
# CĂN CỨ: CHỈ THỊ SỐ 19 TỪ COMMANDER

---

### PHẠM VI DANH MỤC TỆP CHO PHÉP (STRICT BOUNDARY):
- `packages/modules/delivery/**`
- `app/(shell)/delivery/**`
- `app/(shell)/fleet/**`
- `app/pwa/giaovan/**`
- `app/api/delivery/**`
- `app/api/fleet/**`
- Báo cáo kết quả: `.claude/reports/worker-4-delivery.md`

---

### NHIỆM VỤ CHI TIẾT:
1. **Lệnh đóng gói (Pick & Pack):** Kiểm tra đối chiếu SKU, số lượng, lô hạn dùng trước khi niêm phong.
2. **Phân luồng Giao vận Nội bộ:**
   - Tuyến Xe máy (🛵): Hỏa tốc ngõ ngách, đơn lẻ quán ăn <30kg, giao 1-2h.
   - Tuyến Xe tải VAN (🚐): Thùng bảo ôn, sỉ thùng, hàng đông lạnh -18°C, gửi chành Giáp Bát/Nước Ngầm, chạy 24/7 không cấm giờ.
3. **Bàn giao đơn hàng:** Biên bản giao nhận và phiếu thu tiền mặt/thu nợ cho tài xế.
4. **Kết nối 3PL Sapo Express:** Đẩy mã vận đơn GHN, Viettel Post, theo dõi hành trình realtime.
5. **Đối soát & Quản lý COD:** Theo dõi thu hộ COD, bảng kê đối soát, cấn trừ phí giao hàng phát sinh.

---

### YÊU CẦU NGHIỆM THU:
- `npx tsc --noEmit` đạt 0 lỗi.
- Báo cáo kết quả vào `.claude/reports/worker-4-delivery.md`.
