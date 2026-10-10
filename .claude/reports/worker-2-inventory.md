# Báo cáo Worker 2 — Phân hệ Quản lý Kho Lạnh & FEFO (Inventory)

**Ngày:** 10/10/2026 | **Thủ kho:** Trần Thị Ngọc Thúy (0942 22 60 60)
**Phạm vi:** `packages/modules/inventory/**`, `app/api/inventory/**`, `app/(shell)/inventory/page.tsx`, `app/pwa/kho/page.tsx`
**Chỉ thị:** `.claude/inbox/worker-2.md` (Warehouse & Cold Chain Squad)

## 1. Chuẩn hóa dữ liệu kho (packages/modules/inventory)

**types.ts**
- `WarehouseCode`: `"KHO_DINH_CONG" | "KHO_YEN_BINH"` (thay Q7/Q12).
- `StorageTempZone`: `"dong_lanh" | "kho_mat" | "kho_kho"`.
- `InventoryItem`: thêm `temp_zone`, `is_near_expiry` (<30 ngày), `days_until_expiry`. `WarehouseMetrics` đổi `q7/q12_capacity_pct` → `dinh_cong/yen_binh_capacity_pct`, thêm `dong_lanh_qty`, `kho_mat_qty`. Thêm `InventoryAudit`.

**mockData.ts** — Thay 100% dữ liệu cũ (thịt heo xay Q7/Q12) bằng 22 SKU thực tế Sơn Khang:
- Đông lạnh -18°C: Viên chiên LC Foods, Gà Popcorn CP, Nem Đức Minh, Dồi sụn, Khoai Bỉ, Chả mực Deli, Bánh gà Nét Việt...
- Mát 0–4°C: Tokbokki, Xúc xích CP, Kim chi, Sốt mì trộn...
- Khô thường: Mì Indomie/Koreno/Nissin, Tương ớt/cà Sài Gòn, Mayonnaise Kewpie, Dầu ăn...
- Phân bổ 2 kho: Định Công (12 SKU) + Yên Bình (10 SKU), lot `L2607–L2610`, giá trị thực tế.

**inventoryService.ts**
- `getInventoryList({ warehouse, tempZone, status, search })` — lọc kho + phân vùng nhiệt + FEFO.
- `getFefoWarnings(30)` — trả lô cận hạn sắp xếp theo `days_until_expiry`.
- `getWarehouseMetrics()` — tính sức chứa Định Công/Yên Bình, tồn đông/mát, cận hạn.
- `createStockTransfer` — mã `SK-DC-YYMMDD-XXXX`, trừ/cộng tồn 2 kho.
- `createInventoryAudit` — mã `SK-KK-YYMMDD-XXXX`.

## 2. API

- `GET /api/inventory` — query `warehouse`, `tempZone`, `status`, `search`; trả `items`, `metrics`, `fefo_count`.
- `GET/POST /api/inventory/transfer` — GET lịch sử; POST tạo `SK-DC-...` hoặc nếu `audit:true` thì tạo `SK-KK-...`.

## 3. Giao diện Shell (`app/(shell)/inventory/page.tsx`)

- 4 thẻ Clay-KPI: Tổng tồn trị giá, Sắp hết hàng, Cận hạn FEFO <30 ngày (rose tone), Tồn đông & mát (-18°C / 0–4°C).
- Tabs: Tất cả kho | Kho Tổng Định Công | Kho Yên Bình; Tabs nhiệt độ: Mọi nhiệt độ / -18°C / 0–4°C / Thường; Filter FEFO cận hạn.
- Badge nhiệt độ trực quan (-18°C sky / 0–4°C cyan / Thường amber).
- Cột HSD & còn lại: badge đỏ <30 ngày, vàng <60 ngày, xanh >60 ngày.
- Modal **Luân chuyển SK-DC-...** (chọn SKU, từ/đến kho, số lượng, ghi chú) + Modal **Kiểm kê SK-KK-...** (chọn kho, ghi chú).

## 4. PWA Thủ kho (`app/pwa/kho/page.tsx`)

- Header gradient thủ kho Trần Thị Ngọc Thúy + badge 2 kho.
- Ô quét mã/nhập SKU + lưới 12 SKU (badge kho + nhiệt độ + lot/HSD).
- Panel kiểm đếm nhanh: hiển thị tồn hệ thống, nhập số đếm thực tế, tính chênh lệch, ghi nhận vào SK-KK.

## 5. Nghiệm thu

- `npx tsc --noEmit` — **0 lỗi** (đã xóa thư mục ảo `(shell` gây nhiễu).
- Không chạy `git commit`/`git push`.
- Không chạm `delivery`, `customers`, `pricing`.
