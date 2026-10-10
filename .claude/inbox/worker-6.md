# CHỈ THỊ LỆNH PHÂN CÔNG — WORKER 6 (SYSTEM CONFIG & INTEGRATIONS SQUAD)
# DỰ ÁN: SK WORKSPACE 2 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# NHIỆM VỤ: PHÂN HỆ CẤU HÌNH HỆ THỐNG, TÍCH HỢP & THÔNG TIN DOANH NGHIỆP (/settings)

---

### PHẠM VI DANH MỤC FILE CHO PHÉP (STRICT BOUNDARY):
> ⚠️ **NGUYÊN TẮC AN TOÀN:** Worker 6 CHỈ ĐƯỢC PHÉP tạo và sửa trong các file sau. TUYỆT ĐỐI KHÔNG chạm vào thư mục của các worker khác.
- `packages/modules/settings/**` (`types.ts`, `mockData.ts`, `settingService.ts`)
- `app/api/settings/**` (`route.ts`)
- `app/(shell)/settings/page.tsx` (Tạo mới giao diện cài đặt)
- Báo cáo kết quả vào: `.claude/reports/worker-6-settings.md`

---

### DỮ LIỆU ĐỊNH DANH HỆ THỐNG:
- **Doanh nghiệp:** CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: `0111252725`)
- **Kho trung tâm:** Số 96 Ngõ 337 Phố Định Công, Hoàng Mai, Hà Nội
- **Ngân hàng:** Techcombank `22226060` (CONG TY TNHH THUC PHAM SON KHANG)
- **Tích hợp:** Sapo API (`sonkhang.mysapo.net`), MISA AMIS Kế toán OpenAPI, MISA meInvoice Bot, Zalo OA / ZNS.

---

### CHI TIẾT CÁC HẠNG MỤC CẦN LÀM:
1. **Module Nghiệp Vụ (`packages/modules/settings/`):**
   - Quản lý 5 nhóm cấu hình:
     1. *Thông tin doanh nghiệp:* Tên pháp nhân, MST, Trụ sở, Tổng kho, Hotline, Email, Đại diện pháp luật Hồ Bá Thịnh.
     2. *Cổng thanh toán VietQR:* Ngân hàng Techcombank, STK 22226060, Chủ TK, Cú pháp nạp/thanh toán.
     3. *Kết nối Sapo API:* URL `sonkhang.mysapo.net`, API Key `0166bd3c...`, Trạng thái kết nối (Connected).
     4. *Kết nối MISA OpenAPI:* AMIS AppID, meInvoice Serial `C26TSK`, Mẫu số `1/001`, Trạng thái.
     5. *Chính sách vận hành:* Giá trị đơn tối thiểu 500k, Mức freeship 1tr (<8km) và 3tr (<12km), Chiết khấu bốc kho 1k/thùng.
2. **API Endpoints:**
   - `GET /api/settings`: Lấy toàn bộ cấu hình hệ thống.
   - `PATCH /api/settings`: Cập nhật cấu hình.
3. **Giao Diện Cài Đặt Hệ Thống (`app/(shell)/settings/page.tsx`):**
   - 4 Thẻ Clay-KPI: Phiên bản hệ thống (SK Workspace v2.1), Cổng tích hợp hoạt động (4/4 Connected), Tình trạng Database VPS (Online), Bảo mật RBAC (Active).
   - Sidebar Tabs cài đặt: Doanh nghiệp & Kho bãi | Thanh toán VietQR | Tích hợp Sapo API | MISA AMIS & meInvoice | Chính sách bán hàng & Chành xe.
   - Form chỉnh sửa chuyên nghiệp với các trường dữ liệu có sẵn của Sơn Khang, nút **"Lưu Cấu Hình"** có thông báo Toast.

---

### YÊU CẦU NGHIỆM THU:
1. `npx tsc --noEmit` đạt 0 lỗi.
2. TUYỆT ĐỐI KHÔNG chạy `git commit` hay `git push`.
3. Ghi báo cáo vào `.claude/reports/worker-6-settings.md`.
