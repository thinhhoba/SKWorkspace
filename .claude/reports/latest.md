# Báo cáo Đơn hàng Bán & Soạn Kho Lạnh — 09/10/2026

## Triển khai
- `packages/modules/sales/types.ts` — `OrderStatus` 7 trạng thái (cho_duyet/cho_soan/dang_soan/da_soan/dang_giao/hoan_tat/huy), `ORDER_STATUS_LABEL` + `ORDER_STATUS_COLOR`, `PaymentMethod` (COD_VIETQR/DEBT_B2B/TRANSFER), `SalesOrderItem` + `SalesOrder`.
- `packages/modules/sales/mockData.ts` — 8 đơn mẫu thực tế (Lẩu Bò Q7, Bếp KCN Hiệp Phước, Cơm Tấm SG ...), 3 kho Q7/Q12, thịt heo xay/ba rọi/bò viên, total_amount khớp sum items.
- `packages/modules/sales/salesService.ts` — `getSalesOrders(filters)`, `getSalesStats()` (totalToday/choSoan/dangGiao/revenueToday/byStatus), `getSalesOrderById`, `updateOrderStatus`, `toggleItemPicked`, `completeOrderPicking` (check 100% picked → da_soan).
- `app/api/sales/route.ts` — `GET /api/sales?status&warehouse&search` → {success, stats, count, orders}; `POST /api/sales` tạo đơn mới (validate customer_name/warehouse/items).
- `app/api/sales/[id]/route.ts` — `GET /api/sales/[id]`, `PATCH /api/sales/[id]` với 3 nhánh: `action:complete` → da_soan, `itemId+picked` → toggle, `status/newStatus` → updateOrderStatus (validate 7 trạng thái).
- `app/(shell)/sales/page.tsx` — "use client":
  - 4 Clay-KPI grid 2/4 cột: Tổng đơn hôm nay (sky border-l-sky-500), Chờ soạn (amber/warning), Đang giao (sky), Doanh thu dự kiến VNĐ emerald + format vi-VN + `.clay-kpi--sky/warning`.
  - Bộ lọc: Select trạng thái (8 options), Select kho (ALL/Q7/Q12), Input search mã đơn/tên KH (glossy-pill, debounce 300ms).
  - Grid card `.clay-card`: code mono, customer_name, warehouse badge Q7/Q12, status badge theo ORDER_STATUS_COLOR, delivery_address, payment VietQR/Công nợ/Chuyển khoản, số món, total_amount VNĐ, delivery_date, nút Soạn hàng (cho_soan/dang_soan) + Chi tiết + đổi trạng thái nhanh (Duyệt→cho_soan, Bắt đầu soạn, Giao→dang_giao).
  - Modal Checklist Soạn hàng: checkbox 52px (min-h/w-[52px] rounded-xl), haptic vibrate 50ms, SKU mono/lot/quantity, progress bar Đã soạn X/Y percent, nút Hoàn tất disabled nếu chưa 100% → PATCH {action:"complete"}.
  - Modal Chi tiết: danh sách items, lot, đơn giá, tổng.
  - Loading skeleton / empty / toast 3s. Tone Sky/Emerald/Amber/Rose/Slate.

## Verify 09/10/2026
- `npx tsc --noEmit` — PASS (0 lỗi).
- `npm run build` — PASS — 24 routes, `/sales` 7.43 kB / First Load 133 kB, `ƒ /api/sales`, `ƒ /api/sales/[id]`, Middleware 34 kB.
- Commit `2d86d1b` — `feat(sales): quan ly don hang ban, checklist soan kho lanh FEFO va ban giao giao van`.

## Thử
Mở `/sales` → thấy 4 KPI (7 đơn active, 81tr+ doanh thu). Lọc Chờ soạn → 2 đơn. Bấm Soạn hàng trên DH-2026-002 → tick 52px từng món (rung haptic 50ms), progress Đã soạn X/Y, đủ 100% → Hoàn tất soạn hàng & Sẵn sàng giao → `PATCH {action:"complete"}` → badge chuyển `da_soan` (emerald) → đơn sẵn sàng bàn giao tại `/pwa/giaovan`. Duyệt DH-2026-001 (`cho_duyet`→`cho_soan`) → vào luồng soạn FEFO kho lạnh.
