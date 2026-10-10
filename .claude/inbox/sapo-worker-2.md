# CHỈ THỊ LỆNH PHÂN CÔNG — WORKER 2 (SAPO INVENTORY 2-WAY SYNC SQUAD)
# DỰ ÁN: SK WORKSPACE 2 — CÔNG TY TNHH THỰC PHẨM SƠN KHANG
# NHIỆM VỤ: ĐỒNG BỘ TỒN KHO 2 CHIỀU KHO LẠNH ĐỊNH CÔNG & YÊN BÌNH ↔ SAPO API

---

### PHẠM VI DANH MỤC FILE CHO PHÉP (STRICT BOUNDARY):
> ⚠️ **NGUYÊN TẮC AN TOÀN:** Worker 2 CHỈ ĐƯỢC PHÉP tạo và sửa trong các file sau. TUYỆT ĐỐI KHÔNG chạm vào thư mục của các worker khác.
- `packages/integrations/sapo/inventorySync.ts` (Tạo mới)
- `app/api/sapo/inventory/route.ts` (Tạo mới — Lấy tồn Sapo & Báo cáo lệch tồn)
- `app/api/sapo/inventory/push/route.ts` (Tạo mới — Đẩy tồn thực tế lên Sapo)
- `app/api/sapo/inventory/reconcile/route.ts` (Tạo mới — Đối soát chênh lệch kho)
- Báo cáo kết quả vào: `.claude/reports/sapo-worker-2.md`

---

### DỮ LIỆU ĐỊNH DANH KHO VẬT LÝ SƠN KHANG:
- **Kho Tổng Định Công (`KHO_DINH_CONG`):** 96 Ngõ 337 Định Công, Hoàng Mai, Hà Nội (Kho phân phối chính).
- **Kho Yên Bình (`KHO_YEN_BINH`):** Thôn 6 Yên Bình, Thạch Thất, Hà Nội (Kho đệm & bảo quản lạnh).
- **Thủ kho phụ trách:** TRẦN THỊ NGỌC THÚY
- **Nhóm bảo quản:** Hàng đông lạnh (-18°C), Hàng mát (0–4°C), Hàng khô thường (Mì Indomie/Koreno).

---

### CHI TIẾT CÁC HẠNG MỤC CẦN LÀM:
1. **Module Đồng Bộ Tồn Kho (`packages/integrations/sapo/inventorySync.ts`):**
   - Hàm `fetchSapoVariants(limit?: number)`: Gọi Sapo API `GET /admin/variants.json` lấy danh sách SKU, barcode, tồn Sapo (`inventory_quantity`).
   - Hàm `compareStockLevels(localInventory: Array<{sku: string, physicalQty: number}>)`:
     - So khớp tồn thực tế trong kho Sơn Khang với tồn hiển thị trên Sapo.
     - Tính chênh lệch `diff = physicalQty - sapoQty`.
     - Phân loại trạng thái: `MATCH` (Khớp), `OVER_STOCK` (Kho thừa so với Sapo), `UNDER_STOCK` (Kho thiếu so với Sapo), `OUT_OF_STOCK` (Hết hàng).
   - Hàm `pushStockToSapo(sku: string, newAvailableQuantity: number)`:
     - Gửi yêu cầu cập nhật tồn lên Sapo API qua endpoint `POST /admin/inventory_levels/set.json` (hoặc mock an toàn khi offline).
2. **API Endpoints:**
   - `GET /api/sapo/inventory`: Trả về danh sách tồn kho trên Sapo kèm danh sách cảnh báo tồn thấp.
   - `GET /api/sapo/inventory/reconcile`: Bảng đối soát chênh lệch giữa Kho Tổng Định Công và Sapo.
   - `POST /api/sapo/inventory/push`: Đẩy cập nhật số lượng tồn khả dụng thực tế của danh sách SKU lên Sapo.

---

### YÊU CẦU NGHIỆM THU:
1. `npx tsc --noEmit` đạt 0 lỗi.
2. TUYỆT ĐỐI KHÔNG chạy `git commit` hay `git push`.
3. Ghi báo cáo vào `.claude/reports/sapo-worker-2.md`.
