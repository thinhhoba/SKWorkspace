# Báo cáo nghiệm thu — Worker 3: B2B Customers & Debt (database)

**Ngày:** 2026-10-10
**Worker:** Worker 3 — B2B Customers & Debt Squad
**Phạm vi cho phép:** `packages/modules/customers/**`, `app/(shell)/customers/**`, `app/api/customers/**`

## 1. Hoàn thành

### `packages/modules/customers/types.ts`
- Thêm `CustomerType`: `quan_an_hn | dai_ly_tinh | bep_an_cantin | khach_le` + `CUSTOMER_TYPE_LABEL`.
- Mở rộng `CustomerB2B`: thêm `customer_type`, `delivery_route` (tuyến giao chành xe).
- Thêm `ZaloDebtReminder` interface.

### `packages/modules/customers/mockData.ts`
- Thay toàn bộ 8 khách HCM cũ → **14 khách B2B thực tế Sơn Khang** (Hà Nội + tỉnh phía Bắc), gắn Techcombank 22226060:
  - 5 quán ăn vặt/mì trộn HN (Túy Foods KH0009 MST 0111252725, Mì Trộn Chùa Láng, Xiên Que Tạ Hiện, Phố Huế, Giảng Võ)
  - 3 bếp ăn/căn tin (ĐHBK, KCN Thăng Long, BV Bạch Mai)
  - 5 đại lý chành xe tỉnh (Hải Hậu-Nam Định bến Giáp Bát, Bãi Cháy-Quảng Ninh, Miền Duyên Hải-Hải Phòng bến Gia Lâm, Tiên Du-Bắc Ninh, Ninh Bình)
  - 1 khách lẻ (Long Biên)
- Phân bổ rủi ro: 3 safe | 5 warning | 4 danger | 2 blocked. `aging` tổng = `current_debt`, nhất quán `overdue_days`.

### `packages/modules/customers/customerService.ts`
- Thêm hằng số vận hành: `TECHCOMBANK_ACCOUNT=22226060`, `TECHCOMBANK_NAME`, `ACCOUNTANT_NAME/PHONE`.
- `getCustomers` mở rộng lọc `customer_type` và `overdueOnly` + tìm theo `delivery_route`.
- Thêm `generateZaloDebtReminder(customerId)` — API chuẩn cho `POST /api/customers/[id]/remind`, trả `message + zaloUrl + vietQrUrl + vietQrNote`.
- `buildZaloRemindMessage` viết lại: văn bản trang trọng, bảng kê tuổi nợ, tuyến giao, VietQR Techcombank 22226060, liên hệ KT Hoàng Thị Nho 0942 22 60 60.
- Thống kê `getDebtSummary` giữ nguyên logic.

### `app/api/customers/route.ts`
- `GET /api/customers` thêm query `customer_type` và `overdueOnly`.

### `app/api/customers/[id]/remind/route.ts`
- Chuyển sang dùng `generateZaloDebtReminder`, trả thêm `vietQrUrl` + `vietQrNote`.

### `app/(shell)/customers/page.tsx`
- **4 thẻ Clay-KPI:** Tổng công nợ B2B phải thu (Sky) / Nợ trong hạn (Emerald) / Nợ quá hạn cần thu hồi (Rose, pulse khi >0) / Tỷ lệ thu hồi (Emerald progress).
- **Tabs lọc:** Tất cả | Quán Ăn Vặt / Mì Trộn HN | Đại Lý Chành Xe Tỉnh | Bếp Ăn Căn Tin | Khách Có Nợ Quá Hạn.
- **Bảng khách hàng (grid cards):** Mã KH, tên quán/đại lý, MST, badge CustomerType + RiskLevel, hạn mức + thanh tiến độ, số ngày quá hạn, 4 ô aging, tuyến giao, nút Nhắc nợ Zalo.
- **Modal Nhắc Nợ Zalo 1-Chạm:** Preview văn bản, VietQR image (970407-22226060), nút Copy văn bản + Mở Zalo (`https://zalo.me/<phone>`).

## 2. Kiểm tra

- `npx tsc --noEmit` — **0 lỗi trong phạm vi customers** (lỗi còn lại thuộc `app/(shell)/inventory` của Worker 2, không liên quan).
- Không chạy `git commit` / `git push` (tuân thủ yêu cầu song song).

## 3. Tuân thủ chỉ thị

- Dữ liệu định danh: Túy Foods KH0009 MST 0111252725, các tuyến bến Giáp Bát/Nước Ngầm/Gia Lâm, Techcombank 22226060, KT Hoàng Thị Nho 0942 22 60 60.
- Chỉ sửa trong phạm vi cho phép, không chạm `delivery`/`inventory`.
