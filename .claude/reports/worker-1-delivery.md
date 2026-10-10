# Báo cáo nghiệm thu — Worker 1: Giao vận & Điều phối chành xe

**Ngày:** 10/10/2026 | **Worker:** Worker 1 — Logistics & Fleet Squad | **Route:** `/delivery` + PWA `/pwa/giaovan` | **APIs:** `/api/delivery`

## 1. Phạm vi tuân thủ
Chỉ tạo/sửa trong: `packages/modules/delivery/**`, `app/api/delivery/**`, `app/(shell)/delivery/**`, `app/pwa/giaovan/**`. Không chạm `inventory`/`customers`/`finance`. Không `git commit/push`.

## 2. File đã tạo/cập nhật
| File | Mô tả |
|------|-------|
| `packages/modules/delivery/types.ts` | `RouteType` (noi_thanh_hn/chanh_xe_tinh), `TripStatus` (cho_xep_xe/dang_giao/da_giao/hoan_tat), `DeliveryStop`/`DeliveryTrip`/`DeliveryStats`, hằng số `DRIVER_NAME/DRIVER_PHONE/WAREHOUSE_ADDRESS/COLLECTION_ACCOUNT` |
| `packages/modules/delivery/mockData.ts` | 9 chuyến SK-DO-… thực tế: nội thành HN (quán ăn/KCN) + chành xe 4 bến Giáp Bát/Nước Ngầm/Mỹ Đình/Gia Lâm (Nam Định, Hải Phòng, Quảng Ninh, Bắc Ninh, Hưng Yên, Thái Bình, Ninh Bình) |
| `packages/modules/delivery/deliveryService.ts` | `getDeliveryTrips`, `getDeliveryStats`, `createDeliveryTrip`, `updateTripStatus`, `updateStopStatus` (auto-sync chuyến), `generateChanhXeSlip` (phiếu dán thùng xốp + QR VietQR Techcombank 22226060) |
| `app/api/delivery/route.ts` | `GET /api/delivery?route_type=&status=&search=` + `POST /api/delivery` |
| `app/api/delivery/[id]/route.ts` | `GET /api/delivery/[id]` + `PATCH` (update trip status / stop status / `action=slip` in phiếu chành xe) |
| `app/(shell)/delivery/page.tsx` | Shell web: 4 Clay-KPI (đang lăn bánh/nội thành/kiện chành xe/tổng thu hộ), tabs tuyến, bảng chuyến (SK-DO-, tài xế Ngô Văn Tân, biển số, lộ trình, điểm giao, trạng thái), modal chi tiết + **In Phiếu Gửi Chành Xe** (dán thùng xốp kèm nhà xe/người nhận/QR 22226060), modal Tạo chuyến |
| `app/pwa/giaovan/page.tsx` | PWA tài xế: danh sách điểm dừng thực tế của Ngô Văn Tân từ API, nút **Quét VietQR 22226060** (VietQR động theo `SK-DO-` + số tiền) + **Đã Giao** (PATCH stopStatus), gọi/bản đồ, dialog copy QR |

## 3. Quy tắc giao hàng áp dụng
- Nội thành HN: Freeship 1tr (<8km), 3tr (<12km); dưới 500k phụ thu +10%.
- Chành xe tỉnh: thùng xốp, 4 bến Giáp Bát/Nước Ngầm/Mỹ Đình/Gia Lâm, CK 100% trước khi xuất kho (không COD qua xe khách). Thể hiện trong header shell + note từng stop + phiếu in.

## 4. Nghiệm thu
- `npx tsc --noEmit`: **0 lỗi mới** (lỗi pre-existing ở `app/(shell)/inventory` không thuộc phạm vi, đã loại trừ khi kiểm).
- Không chạy `git commit`/`push`.
- Phiếu chành xe in qua `window.print()` với QR VietQR động + STK `Techcombank 22226060 — CONG TY TNHH THUC PHAM SON KHANG`.
