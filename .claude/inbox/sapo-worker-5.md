# CHỈ THỊ LỆNH PHÂN CÔNG — WORKER 5 (SAPO HUB & MISA AUTO-ACCOUNTING SQUAD)
# DỰ ÁN: SK WORKSPACE 2 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# NHIỆM VỤ: GIAO DIỆN SAPO LIVE HUB & TỰ ĐỘNG HÓA ĐỐI SOÁT SAPO2MISA (/sales/sapo)

---

### PHẠM VI DANH MỤC FILE CHO PHÉP (STRICT BOUNDARY):
> ⚠️ **NGUYÊN TẮC AN TOÀN:** Worker 5 CHỈ ĐƯỢC PHÉP tạo và sửa trong các file sau. TUYỆT ĐỐI KHÔNG chạm vào thư mục của các worker khác.
- `app/(shell)/sales/sapo/page.tsx` (Tạo mới giao diện Sapo Live Hub)
- `packages/integrations/sapo/sapoHubService.ts` (Tạo mới)
- `app/api/sapo/hub/route.ts` (Tạo mới — Thống kê & telemetry Sapo Hub)
- `app/api/sapo/cron/eod-accounting/route.ts` (Tạo mới — Tự động hạch toán cuối ngày 18:00)
- Báo cáo kết quả vào: `.claude/reports/sapo-worker-5.md`

---

### DỮ LIỆU ĐỊNH DANH NGHIỆP VỤ KẾ TOÁN SƠN KHANG:
- **Kế toán trưởng phụ trách:** HOÀNG THỊ NHO (`0942 22 60 60`).
- **Phần mềm kế toán:** MISA AMIS Kế toán OpenAPI & HĐĐT meInvoice (Mẫu 1/001 Ký hiệu C26TSK).
- **Luồng 63 cột MISA:** Tự động sinh chứng từ bán hàng kiêm phiếu xuất kho từ các đơn Sapo hoàn tất.
- **Giờ chốt sổ cuối ngày:** 18:00 hàng ngày (End of Day).

---

### CHI TIẾT CÁC HẠNG MỤC CẦN LÀM:
1. **Module Sapo Hub Service (`packages/integrations/sapo/sapoHubService.ts`):**
   - Hàm `getSapoHubTelemetry()`:
     - Thống kê số đơn phát sinh hôm nay trên Sapo.
     - Doanh thu tức thời trong ngày.
     - Tỷ lệ đơn đã chuyển sang chuyến xe giao nhận.
     - Số đơn đã hạch toán sang MISA AMIS vs số đơn chờ đối soát.
   - Hàm `runEndOfDayAccounting()`:
     - Tự động gom toàn bộ đơn Sapo đã hoàn thành trong ngày.
     - Sinh tự động file/dòng 63 cột MISA AMIS.
     - Cập nhật Ledger DB chống trùng lặp.
2. **Giao Diện Sapo Live Hub (`app/(shell)/sales/sapo/page.tsx`):**
   - **4 Thẻ Clay-KPI:**
     - Đơn Sapo hôm nay (Sky)
     - Doanh thu Sapo tức thời (Emerald)
     - Đơn chành xe tỉnh chờ gửi (Amber)
     - Đơn đã vào MISA AMIS (Cyan)
   - **Thanh trạng thái kết nối Live:**
     - Badge xanh: `● Live Connected: sonkhang.mysapo.net (Cloudflare 1/40 calls/s)`
     - Nút `[⚡ Kéo đơn tức thì]` và `[🔄 Đối soát MISA ngay]`
   - **Bảng Đơn Hàng Sapo Thời Gian Thực:**
     - Mã đơn (#13547, #13546...), Thời gian đặt, Khách hàng & SĐT, Địa chỉ / Tuyến giao, Tổng tiền (VNĐ), Trạng thái thanh toán, Lối tắt in phiếu chành xe / hạch toán MISA.
3. **API Endpoints:**
   - `GET /api/sapo/hub`: Trả về dữ liệu telemetry và danh sách đơn Sapo live.
   - `POST /api/sapo/cron/eod-accounting`: Endpoint kích hoạt hạch toán tự động cuối ngày.

---

### YÊU CẦU NGHIỆM THU:
1. `npx tsc --noEmit` đạt 0 lỗi.
2. TUYỆT ĐỐI KHÔNG chạy `git commit` hay `git push`.
3. Ghi báo cáo vào `.claude/reports/sapo-worker-5.md`.
