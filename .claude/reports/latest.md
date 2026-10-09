# Báo cáo Mua hàng & Nhập kho — 09/10/2026

## Triển khai
- `packages/modules/purchase/types.ts` — `Supplier` (code/name/tax_code/phone/payment_terms_days/total_payable), `PurchaseStatus` 4 trạng thái (draft/ordered/received/cancelled) + `PURCHASE_STATUS_LABEL/COLOR`, `PurchaseOrderItem` (sku/name/dvt/quantity/received_quantity/unit_price/total_price/lot_number/expiry_date/location), `PurchaseOrder` (code/supplier_id/warehouse Q7|Q12/items/total_amount/paid_amount/status/order_date/received_date/invoice_no/notes).
- `packages/modules/purchase/mockData.ts` — 5 NCC mẫu (C.P. Việt Nam, VISSAN, San Hà, Japfa, Bao bì Chợ Lớn) + 8 PO mẫu thực tế (Q7/Q12, thịt heo/bò viên, total_amount khớp sum items, trạng thái draft/ordered/received).
- `packages/modules/purchase/purchaseService.ts` — `getPurchaseOrders(filters: status/warehouse/search)`, `getPurchaseStats()` (total/draft/ordered/received/totalAmount/payable331), `getSuppliers()`, `getPurchaseOrderById`, `createPurchaseOrder`, `receivePurchaseOrder(id, rows: lot_number/expiry_date/location)` → chuyển ordered→received + gán lot/expiry/location FEFO, `updatePurchaseStatus`, `__resetPurchaseStore`.
- `app/api/purchase/route.ts` — `GET /api/purchase?status&warehouse&search` → {success, stats, count, orders}; `POST /api/purchase` tạo PO mới (validate supplier_id/warehouse Q7|Q12/items sku/name/quantity/unit_price, check NCC tồn tại).
- `app/api/purchase/[id]/route.ts` — `GET /api/purchase/[id]`, `PATCH /api/purchase/[id]` nhánh `action:receive` (validate lot_number+expiry_date bắt buộc cho mọi dòng → receivePurchaseOrder) và nhánh `status/newStatus` → updatePurchaseStatus.
- `app/api/purchase/suppliers/route.ts` — `GET /api/purchase/suppliers` → {success, count, suppliers} (5 NCC).
- `app/(shell)/purchase/page.tsx` — "use client":
  - 4 Clay-KPI grid 2/4 cột: Tổng đơn mua, Dự thảo (slate), Đã đặt hàng (amber/warning), Đã nhập kho (emerald) + Tổng công nợ 331 VNĐ format vi-VN + `.clay-kpi--warning/success`.
  - Bộ lọc: Select trạng thái (ALL/draft/ordered/received/cancelled), Select kho (ALL/Q7/Q12), Input search mã PO/tên NCC (glossy-pill, debounce 300ms).
  - Grid card `.clay-card`: code mono, supplier_name, warehouse badge Q7/Q12, status badge theo PURCHASE_STATUS_COLOR, ngày đặt, số món, total_amount VNĐ, đã thanh toán, nút Nhập kho (ordered) + Chi tiết + đổi trạng thái nhanh.
  - Modal Nhập kho (Goods Receipt): mỗi dòng item có Input SL thực nhận, Số lô * (lot_number), Hạn dùng * (expiry_date date), Vị trí kệ (location) — `canConfirmReceive` check đủ lot+expiry mới cho Xác nhận; `PATCH {action:"receive", rows}` → toast "đã nhập kho — tăng tồn FEFO" + badge chuyển received (emerald).
  - Modal Tạo PO: Select NCC (5 options), Select kho Q7/Q12, thêm dòng hàng (sku/name/dvt/quantity/unit_price), validate trước POST.
  - Loading skeleton / empty / toast 3s. Tone Sky/Emerald/Amber/Rose/Slate — FEFO kho lạnh.
- `packages/core/appRegistry.ts` — thêm `{id:"purchase", label:"Mua hàng", group:"van-hanh", icon:ShoppingBag, href:"/purchase", color:"warning", desc:"Đặt NCC & nhập kho"}`.

## Verify 09/10/2026
- `npx tsc --noEmit` — PASS (0 lỗi).
- `npm run build` — PASS — 25 routes, `/purchase` 7.77 kB / First Load 133 kB, `ƒ /api/purchase`, `ƒ /api/purchase/[id]`, `ƒ /api/purchase/suppliers`, Middleware 34 kB.
- Commit `68b1d0c` — `feat(purchase): quan ly mua hang nha cung cap, phieu nhap kho lanh FEFO va cong no phai tra 331`.

## Thử
Mở `/purchase` → thấy 4 KPI (8 PO, công nợ 331). Lọc Đã đặt hàng → danh sách ordered. Bấm Nhập kho trên PO-2026-002 → nhập Số lô + Hạn dùng + Vị trí kệ cho từng món, đủ điều kiện → Xác nhận Nhập kho & Tăng tồn FEFO → `PATCH {action:"receive"}` → badge chuyển `received` (emerald) + tồn kho FEFO tăng theo lot/expiry. Tạo PO mới → chọn NCC + kho → thêm dòng hàng → Tạo đơn → `POST /api/purchase` → PO mới ở trạng thái draft.
