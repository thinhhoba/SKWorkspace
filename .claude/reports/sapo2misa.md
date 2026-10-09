# Báo cáo Phân hệ Sapo2Misa (Core Engine & Xuất Excel 63 Cột) — 09/10/2026

## 1. Tóm tắt các thành phần đã triển khai
- **`packages/integrations/sapo/types.ts`**: Định nghĩa chuẩn `SapoOrder`, `SapoOrderLineItem`, `CentralOrder`, `CentralOrderItem`.
- **`packages/integrations/sapo/sapoClient.ts`**: Adapter kéo đơn hàng từ Sapo API (hỗ trợ live token `SAPO_API_URL` & fallback mock dataset nghiệp vụ thực phẩm Sơn Khang: Thịt heo xay, Bò viên, Chả lụa, Ba rọi rút sườn...). Hàm `normalizeToCentralOrders` chuẩn hóa sang mô hình chung.
- **`packages/integrations/misa/types.ts`**: Định nghĩa `LedgerEntry`, `ValidationError`, `ValidationSummary`.
- **`packages/integrations/misa/ledgerDb.ts`**: Sổ cái `sapo2misaLedgerDb` lưu trữ và truy vấn lịch sử các đơn hàng đã xuất (`external_id`), chống trùng lặp khi import vào MISA AMIS.
- **`packages/integrations/misa/misaTransformer.ts`**: Engine chuyển đổi từ `CentralOrder` sang 63 cột MISA AMIS chuẩn kế toán:
  - Tự động tính toán tiền thuế, thành tiền quy đổi, tài khoản nợ/có (131/5111), hạn thanh toán, chi nhánh kho (Q7 / Q12).
  - Thẩm định lỗi/cảnh báo: Thiếu MST, SKU chưa map (`UNKNOWN-SKU`), SL <= 0, đơn bị trùng `external_id`.
- **`packages/integrations/misa/excelExporter.ts`**: Tạo file Excel `.xlsx` chuẩn 63 cột MISA AMIS bằng thư viện `xlsx` (SheetJS), căn chỉnh độ rộng cột tự động và cập nhật sổ cái Ledger.
- **Next.js App Router API Routes**:
  - `GET / POST /api/sapo2misa/sync`: Kéo đơn, chuẩn hóa và kiểm tra 63 cột.
  - `POST /api/sapo2misa/export`: Xuất file nhị phân `.xlsx` kèm header download.
  - `GET /api/sapo2misa/ledger`: Truy vấn danh sách lịch sử các lần xuất.
- **Giao diện người dùng (`app/(shell)/finance/sapo2misa/page.tsx`)**:
  - Nút **"Đồng bộ Sapo"**: Gọi API thật, chạy stepper 4 bước và nạp log hệ thống thời gian thực.
  - Nút **"Xuất Excel 63 cột"**: Tạo và tải file `.xlsx` thật về máy tính.
  - Nút **"Lịch sử Ledger"**: Mở modal xem danh sách các đơn đã được bảo vệ chống trùng.

## 2. Kết quả kiểm thử & Nghiệm thu chất lượng
- `npx tsc --noEmit`: **PASS (Exit 0, 0 lỗi kiểu dữ liệu)**.
- `npm run build`: **PASS (Exit 0)**:
  - `ƒ /api/sapo2misa/export` — Dynamic server-rendered.
  - `ƒ /api/sapo2misa/ledger` — Dynamic server-rendered.
  - `ƒ /api/sapo2misa/sync` — Dynamic server-rendered.
  - `○ /finance/sapo2misa` — 9.13 kB prerendered.
