# BÁO CÁO WORKER 1 — SAPO WEBHOOK & REALTIME ENGINE

- **Thời gian:** 10/10/2026
- **Shop:** `sonkhang.mysapo.net` | Secret: `e2cc59d4...a8b4` | Headers: `X-Sapo-Hmac-Sha256`, `X-Sapo-Topic`, `X-Sapo-Shop-Domain`
- **Kết quả `npx tsc --noEmit`:** 0 lỗi

## File đã tạo/sửa (đúng ranh giới)
| File | Mô tả |
|------|-------|
| `packages/integrations/sapo/webhookService.ts` | **Mới** — `verifySapoWebhook(rawBody, hmacHeader)` dùng `crypto.createHmac('sha256', secret)` + `timingSafeEqual`, `signPayload`, `processOrderWebhook` chuẩn hóa qua `normalizeToCentralOrders` (alias `SK-*`, thuế 8%, kênh `inferOrderChannel`), ring buffer 200 logs, `getWebhookLogs/getProcessedOrders/getWebhookStatus/clearWebhookLogs` |
| `packages/integrations/sapo/types.ts` | **Mở rộng** — thêm `SapoWebhookTopic`, `SapoWebhookPayload`, `SapoWebhookLog`, `SapoWebhookStatus` |
| `app/api/sapo/webhooks/route.ts` | **Mới** — `GET` trả `status+logs+orders`, `POST` xác thực HMAC → `processWebhookPayload` trả `central_order` 200; hỗ trợ `?ping=1` self-test trả `hmac` |
| `app/api/sapo/webhooks/orders/create/route.ts` | **Mới** — `POST` chuyên biệt `orders/create` (topic mặc định `orders/create`) |
| `app/api/sapo/webhooks/orders/update/route.ts` | **Mới** — `POST` chuyên biệt `orders/updated` cho đổi trạng thái |

## Tuân thủ
- Không chạy `git commit` / `git push`.
- HMAC-SHA256 dùng `crypto` native, base64, `timingSafeEqual`.
