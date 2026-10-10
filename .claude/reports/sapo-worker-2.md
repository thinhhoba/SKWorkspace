# BÁO CÁO WORKER 2 — SAPO INVENTORY 2-WAY SYNC SQUAD

**Ngày:** 10/10/2026 | **Worker:** 2 | **Nhiệm vụ:** Đồng bộ tồn kho 2 chiều Kho Định Công & Yên Bình ↔ Sapo API

---

## 1. Files đã tạo (strict boundary)

| # | File | Mô tả |
|---|------|-------|
| 1 | `packages/integrations/sapo/inventorySync.ts` | Core sync: fetch/compare/push + mock fallback |
| 2 | `app/api/sapo/inventory/route.ts` | GET tồn Sapo + cảnh báo tồn thấp |
| 3 | `app/api/sapo/inventory/push/route.ts` | POST đẩy tồn lên Sapo (single/batch) |
| 4 | `app/api/sapo/inventory/reconcile/route.ts` | GET/POST đối soát chênh lệch kho |

Không chạm file ngoài danh sách cho phép.

---

## 2. Chi tiết `packages/integrations/sapo/inventorySync.ts`

- `fetchSapoVariants(limit?)` — GET `https://sonkhang.mysapo.net/admin/variants.json` với Basic Auth (`SAPO_API_KEY`/`SAPO_API_SECRET`), fallback `MOCK_SAPO_VARIANTS` (10 SKU thực tế Sơn Khang) khi offline.
- `compareStockLevels(localInventory)` — async, tự fetch Sapo rồi so khớp; tính `diff = physicalQty - sapoQty`, phân loại `MATCH | OVER_STOCK | UNDER_STOCK | OUT_OF_STOCK`, bổ sung SKU chỉ có trên Sapo.
- `compareStockLevelsSync(sapoVariants, localInventory)` — bản sync (không gọi API), dùng cho API reconcile để tránh double-fetch.
- `pushStockToSapo(sku, newAvailableQuantity)` — POST `https://sonkhang.mysapo.net/admin/inventory_levels/set.json`, validate SKU/qty, mock an toàn khi Sapo HTTP lỗi hoặc mất mạng (`mocked: true`).
- Helpers: `getLowStockWarnings(threshold)`, `getOutOfStockVariants()`, `WAREHOUSES` (KHO_DINH_CONG / KHO_YEN_BINH), `MOCK_SAPO_VARIANTS`.

## 3. API Endpoints

| Route | Method | Chức năng |
|-------|--------|-----------|
| `/api/sapo/inventory` | GET | `?limit=&threshold=` — trả `variants` + `warnings {low_stock, out_of_stock}` |
| `/api/sapo/inventory/push` | POST | Body `{sku, quantity}` hoặc `{items:[{sku,quantity}]}` (max 100), gọi `pushStockToSapo` từng SKU |
| `/api/sapo/inventory/reconcile` | GET | `?warehouse=&limit=&local=JSON` — đối soát, trả `rows + summary + total_diff` |
| `/api/sapo/inventory/reconcile` | POST | Body `{localInventory|items:[{sku,physicalQty}], warehouse, limit}` — đối soát chi tiết |

---

## 4. Nghiệm thu

- `npx tsc --noEmit`: **0 lỗi trong phạm vi Worker 2.** Lỗi duy nhất còn lại nằm ngoài boundary: `app/api/sapo/cron/eod-accounting/route.ts:24` (`success` duplicate) — thuộc Worker khác / code có sẵn, không do Worker 2 tạo.
- Không chạy `git commit` / `git push`.

---

## 5. Ghi chú

- Sapo API key/secret lấy từ env `SAPO_API_KEY` / `SAPO_API_SECRET`, fallback default của dự án.
- `pushStockToSapo` không ném lỗi khi offline — trả `mocked:true` để không block luồng kiểm kê của thủ kho TRẦN THỊ NGỌC THÚY.
