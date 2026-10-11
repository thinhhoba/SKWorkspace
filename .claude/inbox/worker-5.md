# PHÂN CÔNG THỰC THI — WORKER 5 (FINANCE & MISA SQUAD)
# DỰ ÁN: SƠN KHANG WORKSPACE 2.0 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: 0111252725)
# PHÂN HỆ: 5. TÀI CHÍNH - KẾ TOÁN (TÍCH HỢP OPEN API MISA)
# CĂN CỨ: CHỈ THỊ SỐ 19 TỪ COMMANDER

---

### PHẠM VI DANH MỤC TỆP CHO PHÉP (STRICT BOUNDARY):
- `packages/modules/finance/**`
- `packages/integrations/misa/**`
- `app/(shell)/finance/**`
- `app/api/finance/**`
- `app/api/sapo2misa/**`
- Báo cáo kết quả: `.claude/reports/worker-5-finance.md`

---

### NHIỆM VỤ CHI TIẾT:
1. **Kế toán bán hàng & Doanh thu MISA AMIS API:** Tự động sinh chứng từ bán kiêm xuất kho (`/api/v1/sa/voucher/save`), định khoản Nợ 131/111/112/1388 đối ứng Có 5111, Có 3331 và Nợ 632 / Có 156.
2. **Phát hành HĐĐT MISA meInvoice API:** Ký số HSM và phát hành HĐĐT có mã CQT tức thì cho B2B MST (`/api/v1/invoice/publish`) + Gom khách lẻ cuối ngày.
3. **Kế toán mua hàng MISA AMIS API:** Ghi sổ hóa đơn mua (`/api/v1/pu/voucher/save`), hạch toán Nợ 156, Nợ 1331 - Có 331.
4. **Sổ quỹ & Thu nợ:** Quỹ tiền mặt Định Công và Techcombank `22226060`, sinh phiếu thu (`/api/v1/ca/receipt/save`) khi khách trả VietQR hoặc nộp COD (Nợ 1121 / Có 131). Báo cáo Tuổi nợ B2B Aging 15/30/60 ngày.

---

### YÊU CẦU NGHIỆM THU:
- `npx tsc --noEmit` đạt 0 lỗi.
- Báo cáo kết quả vào `.claude/reports/worker-5-finance.md`.
