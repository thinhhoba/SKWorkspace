# CHỈ THỊ LỆNH PHÂN CÔNG — WORKER 1 (CASH FLOW & FINANCE SQUAD)
# DỰ ÁN: SK WORKSPACE 2 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# NHIỆM VỤ: PHÂN HỆ DÒNG TIỀN, THU CHI & ĐỐI SOÁT QUỸ (/finance)

---

### PHẠM VI DANH MỤC FILE CHO PHÉP (STRICT BOUNDARY):
> ⚠️ **NGUYÊN TẮC AN TOÀN:** Worker 1 CHỈ ĐƯỢC PHÉP tạo và sửa trong các file sau. Giữ nguyên trang con `finance/sapo2misa`. TUYỆT ĐỐI KHÔNG chạm vào thư mục của các worker khác.
- `packages/modules/finance/**` (`types.ts`, `mockData.ts`, `financeService.ts`)
- `app/api/finance/**` (`route.ts`, `transactions/route.ts`)
- `app/(shell)/finance/page.tsx` (Tạo mới trang chủ phân hệ tài chính)
- Báo cáo kết quả vào: `.claude/reports/worker-1-finance.md`

---

### DỮ LIỆU ĐỊNH DANH DOANH NGHIỆP:
- **Kế toán trưởng:** HOÀNG THỊ NHO (`0942 22 60 60`)
- **Tài khoản ngân hàng:** Techcombank `22226060` (CONG TY TNHH THUC PHAM SON KHANG)
- **Quỹ tiền mặt:** Quỹ kho Tổng Định Công (Hoàng Mai, Hà Nội)

---

### CHI TIẾT CÁC HẠNG MỤC CẦN LÀM:
1. **Module Nghiệp Vụ (`packages/modules/finance/`):**
   - Quản lý 2 tài khoản nguồn: Quỹ tiền mặt (`CASH`) và Ngân hàng Techcombank (`TECHCOMBANK_22226060`).
   - Giao dịch Thu (`SK-PT-`): Thu tiền hàng quán ăn, tiền đại lý chuyển khoản chành xe, thu hộ COD tài xế Ngô Văn Tân.
   - Giao dịch Chi (`SK-PC-`): Trả tiền hàng NCC (CP, Indomie, Kewpie...), cước gửi xe bến Giáp Bát/Nước Ngầm, chi phí vận hành kho.
   - Thống kê: Tổng thu, tổng chi, dòng tiền ròng (Net Cashflow), số dư quỹ hiện tại.
2. **API Endpoints:**
   - `GET /api/finance`: Lấy thống kê số dư và danh sách giao dịch.
   - `POST /api/finance/transactions`: Tạo phiếu thu (`SK-PT-`) hoặc phiếu chi (`SK-PC-`).
3. **Giao Diện 3D Claymorphism (`app/(shell)/finance/page.tsx`):**
   - 4 Thẻ Clay-KPI: Số dư Techcombank 22226060 (Sky), Quỹ tiền mặt Định Công (Emerald), Tổng thu tháng (Cyan), Tổng chi tháng (Rose).
   - Tabs lọc: Tất cả | Thu tiền mặt / Chuyển khoản | Chi tiền hàng NCC | Chi phí vận hành & Chành xe.
   - Bảng nhật ký thu chi: Mã phiếu, Thời gian, Hạng mục, Số tiền, Tài khoản (Cash / Techcombank), Người thực hiện (KT Hoàng Thị Nho).
   - Modal lập Phiếu Thu (`SK-PT-`) & Phiếu Chi (`SK-PC-`) nhanh.
   - Lối tắt chuyển nhanh sang module đối soát [Sapo2Misa](/finance/sapo2misa).

---

### YÊU CẦU NGHIỆM THU:
1. `npx tsc --noEmit` đạt 0 lỗi.
2. TUYỆT ĐỐI KHÔNG chạy `git commit` hay `git push`.
3. Ghi báo cáo vào `.claude/reports/worker-1-finance.md`.
