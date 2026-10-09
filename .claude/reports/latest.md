# Báo cáo Prisma & Healthcheck Go-Live — 09/10/2026

## 1) Schema — `prisma/schema.prisma`
- Provider `postgresql`, generator `prisma-client-js`. Đã bổ sung 2 model còn thiếu so với bản trước: `StockTransfer` và `Order` (theo yêu cầu verify "User/Customer/InventoryItem/StockTransfer/Order/MisaLedgerEntry").
- 6 models: `User` (@unique username), `Customer` (@unique code), `InventoryItem` (@unique [sku, warehouse] `sku_warehouse`), `StockTransfer` (@unique code), `Order` (@unique external_id), `MisaLedgerEntry` (@unique external_id).
- `@map` bảng snake_case, `@unique external_id` cho chống trùng đồng bộ.

## 2) Singleton — `packages/core/db.ts`
- `createPrismaClient()` dùng `@prisma/adapter-pg` (Prisma 7) khi có `DATABASE_URL`; thiếu thì trả `Proxy` fallback ném lỗi có kiểm soát.
- `globalThis` singleton, `checkDatabaseConnection()` → `"connected" | "fallback_mock"` (`SELECT 1`).

## 3) Seed — `prisma/seed.ts` + `prisma` trong `package.json`
- `seed.ts`: lazy import `PrismaClient`+`PrismaPg` chỉ khi có `DATABASE_URL`; không có DB thì log fallback và exit 0. Upsert 4 users (admin/ketoan/thukho/taixe), customers từ `MOCK_CUSTOMERS`, inventory từ `INITIAL_INVENTORY_ITEMS`.
- `package.json`: `scripts.db:seed = "tsx prisma/seed.ts"`, `prisma.seed = "tsx prisma/seed.ts"`.

## 4) Healthcheck — `app/api/health/route.ts`
- `GET /api/health` trả `{status:"healthy", services:{database: fallback_mock|connected, pwa:"active"}}` — không throw khi thiếu DB (fallback_mock).

## 5) Fallback — `packages/integrations/misa/ledgerDb.ts`
- `getLedger()/addLedgerEntry()` thử `checkDatabaseConnection() === "connected"` thì dùng Prisma, catch thì fallback file `.data/sapo2misa_ledger.json` + `memoryLedger`.

## 6) Verify 09/10/2026
- `npx prisma generate` — PASS (Generated Prisma Client v7.10.0).
- `npx tsc --noEmit` — PASS (0 lỗi).
- `npm run build` — PASS — 18 routes, có `ƒ /api/health`, `○ /customers`, `○ /inventory` (output chứa "/api/health" và "/customers" và "/inventory"). Warning copy `page_client-reference-manifest.js` là vấn đề standalone đã có sẵn, không block build.

## 7) Hướng dẫn go-live
```bash
# .env
DATABASE_URL="postgresql://user:pass@host:5432/sk_workspace?schema=public"

npx prisma migrate dev --name init   # tạo migration từ schema.prisma
npm run db:seed                       # hoặc: npx prisma db seed
# Docker (Postgres + Redis + MinIO + App)
docker compose up -d --build
curl http://localhost:3000/api/health  # -> {"status":"healthy","services":{"database":"connected"}}
```
- Chưa có `DATABASE_URL` thì app vẫn chạy bằng mock/fallback (build & health trả `fallback_mock`).

