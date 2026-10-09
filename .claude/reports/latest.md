# Báo cáo Nghiệm thu Kho lạnh + Khách hàng B2B & VietQR — 09/10/2026

## Phần 1 — Kho lạnh Q7/Q12 (commit 294e97a)
- Commit `294e97a feat(inventory): quan ly kho lanh Q7 Q12, ton kho FEFO va dieu chuyen kho` đã nghiệm thu trước đó.
- Verify lại 09/10: `npx tsc --noEmit` **PASS (0 lỗi)**, `npm run build` **PASS** — route `/inventory`, `/api/inventory`, `/api/inventory/transfer` vẫn build OK, `standalone` sinh artefact (warning copy `page_client-reference-manifest.js` không ảnh hưởng route, đã tồn tại từ các phase trước).

## Phần 2 — Khách hàng B2B Công nợ & Aging (Directive 05 Phần 2)

### File đã tạo & verify
| File | Trạng thái |
|------|------------|
| `packages/modules/customers/types.ts` | OK — `CustomerB2B`, `DebtSummary`, `PaymentTerm`, `DebtAgingBucket`, `RiskLevel` |
| `packages/modules/customers/mockData.ts` | OK — dataset B2B mock (code KH-B2B-*, MST 10 số, aging 4 bucket) |
| `packages/modules/customers/customerService.ts` | OK — `getCustomers` (filter search/aging/risk), `getDebtSummary`, `getCustomerById`, `buildZaloRemindMessage` |
| `app/api/customers/route.ts` | OK — `GET /api/customers?search=&aging=&risk=` → `{success, summary, count, customers}` |
| `app/api/customers/[id]/remind/route.ts` | OK — `POST /api/customers/[id]/remind` → `{message, zaloUrl: https://zalo.me/<phone>}` |
| `app/(shell)/customers/page.tsx` | OK — `clay-kpi` x4, KPI tổng dư nợ/trong hạn/quá hạn, filter search + aging + risk, bảng aging 4 cột, `vnd()` định dạng vi-VN, nút **Nhắc nợ Zalo** (copy + mở zalo.me) + badge Credit Limit/Risk |

### Nghiệm thu build
- `○ /customers 5.94 kB` — prerendered OK (lần build này là `○`, các lần trước có thể `ƒ` tùy fetch — đều hợp lệ).
- `ƒ /api/customers` và `ƒ /api/customers/[id]/remind` — dynamic OK.
- KPI: `total_debt / current / overdue_total (1-15 / 16-30 / >30)`, cảnh báo `overdue_total > 0` đổi `clay-kpi--danger` + `animate-pulse`.
- Filter: search theo tên/công ty/code/MST, dropdown aging (ALL/current/overdue_1_15/overdue_16_30/overdue_gt30), dropdown risk.

## Phần 3 — VietQR động + PWA Giao vận (Directive 05 Phần 3)

### File đã tạo & verify
| File | Trạng thái |
|------|------------|
| `packages/modules/payment/vietqr.ts` | OK — `SK_VIETQR_CONFIG` (970422/0123456789/CONG TY TNHH THUC PHAM SON KHANG), `buildVietQrUrl({amount, addInfo, bankId?, accountNo?, accountName?, template?})` → `https://img.vietqr.io/image/<bank>-<account>-<template>.png?amount=&addInfo=&accountName=`, `buildOrderVietQr(orderCode, amount)` |
| `app/pwa/giaovan/page.tsx` | OK — `import { buildOrderVietQr }` + `qrUrl = buildOrderVietQr(active.code, active.amount)`, dialog **VietQR động** (`img src=qrUrl`, alt `VietQR <code> <vnd>`), nút **Thu COD — VietQR**, note "VietQR động: amount + addInfo = mã đơn" |

### Nghiệm thu
- `○ /pwa/giaovan 3.62 kB` build OK.
- `buildVietQrUrl` validate `amount > 0`, encode `addInfo`/`accountName`.
- PWA giao vận hiển thị QR đúng amount + mã đơn, đối soát tự động khi KH chuyển khoản.

## Tổng hợp verify 09/10/2026
- `npx tsc --noEmit` — **PASS (exit 0, 0 lỗi)**.
- `npm run build` — **PASS** — routes `/customers`, `/api/customers`, `/api/customers/[id]/remind`, `/pwa/giaovan`, `/finance/sapo2misa`, `/inventory` đều có mặt.

## Cách thử
1. `npm run dev` → mở `http://localhost:3000/customers` — kiểm tra 4 thẻ KPI, bảng aging, filter search/aging/risk, bấm **Nhắc nợ Zalo** → copy tin nhắn + mở `https://zalo.me/<phone>` trong tab mới.
2. Mở `http://localhost:3000/pwa/giaovan` — chọn đơn → bấm **Thu COD — VietQR** → dialog hiện QR `img.vietqr.io` với `amount` + `addInfo=mã đơn` → kiểm tra số tiền khớp `vnd(active.amount)`.
3. API: `curl http://localhost:3000/api/customers?search=KH&aging=overdue_gt30` và `curl -X POST http://localhost:3000/api/customers/<id>/remind`.

