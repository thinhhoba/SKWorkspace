# PHÂN CÔNG THỰC THI — WORKER 3 (SALES & DMS SQUAD)
# DỰ ÁN: SƠN KHANG WORKSPACE 2.0 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: 0111252725)
# PHÂN HỆ: 3. BÁN HÀNG & PHÂN PHỐI (OMNICHANNEL & DMS)
# CĂN CỨ: CHỈ THỊ SỐ 19 TỪ COMMANDER

---

### PHẠM VI DANH MỤC TỆP CHO PHÉP (STRICT BOUNDARY):
- `packages/modules/sales/**`
- `app/(shell)/sales/**`
- `app/(shell)/customers/**`
- `app/(shell)/pricing/**`
- `app/(shell)/pos/**`
- `app/(shell)/dathang/**`
- `app/api/sales/**`
- `app/api/pricing/**`
- `app/api/customers/**`
- Báo cáo kết quả: `.claude/reports/worker-3-sales.md`

---

### NHIỆM VỤ CHI TIẾT:
1. **Bán lẻ đa kênh (Sapo Omnichannel Sync):** Tiếp nhận đơn tự động từ quầy thu ngân POS K80, Website dathang, Chat Facebook/Zalo, TMĐT.
2. **Phân phối B2B & Quản lý Tuyến DMS:** Danh bạ đại lý, quán ăn, căng tin; Tuyến bán hàng Route Planning; SFA check-in GPS & đặt đơn Sell-In/Sell-Out tức thời.
3. **Chính sách giá & Chiết khấu:** Bảng giá sỉ cấp bậc đại lý, giá theo Thùng/Pallet; Báo giá B2B xuất ảnh/PDF Zalo có logo thương hiệu Sơn Khang trong 30s.
4. **Kiểm soát Credit Limit:** Tự động chặn lên đơn khi đại lý có nợ quá hạn (>30 ngày) hoặc vượt hạn mức công nợ bảo lãnh.

---

### YÊU CẦU NGHIỆM THU:
- `npx tsc --noEmit` đạt 0 lỗi.
- Báo cáo kết quả vào `.claude/reports/worker-3-sales.md`.
