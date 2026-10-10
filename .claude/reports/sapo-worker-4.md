# BÁO CÁO WORKER 4 — SAPO FULFILLMENT & DISPATCH SQUAD

**Ngày:** 10/10/2026  
**Worker:** 4 — Fulfillment & Dispatch  
**Chỉ thị:** `.claude/inbox/sapo-worker-4.md`

---

## 1. File đã tạo/chỉnh sửa

| File | Trạng thái |
|------|-----------|
| `packages/integrations/sapo/fulfillmentSync.ts` | Tạo mới |
| `app/api/sapo/fulfillment/route.ts` | Tạo mới |
| `app/api/sapo/fulfillment/dispatch/route.ts` | Tạo mới |
| `app/api/sapo/fulfillment/update/route.ts` | Tạo mới |

Không chạm file ngoài boundary.

---

## 2. Chi tiết kỹ thuật

### `fulfillmentSync.ts`
- **DRIVER_INFO / VIETQR_INFO:** Ngô Văn Tân 0942 22 60 60, xe 29C-882.60, Kho Định Công; Techcombank 22226060.
- **groupOrdersByRoute(sapoOrders):** Phân tích `customer.address + note` → gom 2 tuyến `NOI_THANH_HN` (keywords Cầu Giấy/Đống Đa/Hai Bà Trưng/Bách-Kinh-Xây + fallback Hà Nội) và `CHANH_XE_TINH` (detect 4 bến Giáp Bát/Nước Ngầm/Mỹ Đình/Gia Lâm theo tên tỉnh). Trả về `GroupedOrders` với `byStation` và `details`.
- **generateChanhXePackingSlip(order):** Ước lượng số kiện từ tổng quantity, tạo `ChanhXePackingSlip` gồm bến xe, người gửi/nhận, số kiện, biển số, COD, VietQR qrData (`img.vietqr.io`).
- **markSapoOrderFulfilled(sapoOrderId, trackingNumber):** POST `/admin/orders/{id}/fulfillments.json` với Basic Auth, tracking_company `SK-LOGISTICS — Ngô Văn Tân 29C-882.60`; fallback mock success khi thiếu credentials để không chặn PWA.

### API Endpoints
- **GET /api/sapo/fulfillment** — `?status=pending|all&limit=` — fetch Sapo orders, lọc pending, gọi `groupOrdersByRoute`, trả grouped + byStation + details.
- **POST /api/sapo/fulfillment/dispatch** — Body `{ orderIds?: number[] }` — gom đơn thành chuyến `SK-DO-YYMMDD-XXXX`, trả deliveryCode + grouped + packingSlips.
- **POST /api/sapo/fulfillment/update** — Body `{ sapoOrderId: number, trackingNumber: string }` — gọi `markSapoOrderFulfilled`, trả result; lỗi Sapo → 502.

---

## 3. Nghiệm thu

- `npx tsc --noEmit`: **0 lỗi trong các file Worker 4**. (1 lỗi sẵn có pre-existing tại `app/api/sapo/cron/eod-accounting/route.ts:24` — ngoài scope Worker 4, không chạm.)
- Không chạy `git commit` / `git push` (tuân thủ quy tắc an toàn).

---

## 4. Ghi chú
- VietQR QR dùng endpoint `img.vietqr.io` compact2, FE có thể render trực tiếp.
- Dispatch `deliveryCode` dùng `generateBusinessCode("DELIVERY_ORDER")` → prefix `SK-DO`.
