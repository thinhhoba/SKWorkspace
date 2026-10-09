# Báo cáo Docker Cutover Zero-Downtime — 09/10/2026

## 1) Dockerfile — Prisma Linux
- `FROM node:20-alpine` 3 stage (deps/builder/runner). `COPY prisma ./prisma/` + `RUN npx prisma generate` trước `RUN npm run build` — đảm bảo Prisma Client sinh trên Linux trước khi build Next.js standalone (tránh lỗi engine mismatch Alpine).
- Stage runner `COPY --from=builder /app/.next/standalone ./` + `/.next/static`, chạy `node server.js` trên port 3000, user `nextjs`.

## 2) Compose — localhost only (127.0.0.1)
- `app`: `127.0.0.1:3000:3000` (không expose 0.0.0.0), `healthcheck` wget `/api/health`.
- `postgres`: `127.0.0.1:5432:5432` (chỉ host, không public).
- `redis`: không expose port (chỉ nội bộ `sk-net`).
- **Đã bỏ service `nginx` container chiếm 80/443** — Host Nginx làm reverse proxy duy nhất, tránh xung đột port Let's Encrypt.

## 3) Deploy — `.github/workflows/deploy.yml`
- Build job: `npm ci` → `npx prisma generate` → `npx tsc --noEmit` → `docker/build-push-action` (GHCR, cache gha).
- Deploy job (appleboy/ssh-action): `with` có cả `password: VPS_PASSWORD` + `key: VPS_SSH_KEY` (dual auth), script: `docker compose pull app` → `up -d --remove-orphans` → `docker compose exec -T app npx prisma db push --skip-generate || true` → `docker system prune -f`.

## 4) Script cutover / rollback
- `scripts/switch-to-v2.sh`: `cp $CONF $CONF.bak`, `sed s|127.0.0.1:6060|127.0.0.1:3000|`, `nginx -t`, `systemctl reload nginx`.
- `scripts/rollback-to-v1.sh`: kiểm tra `$CONF.bak` tồn tại, `cp $CONF.bak $CONF`, `nginx -t`, `systemctl reload nginx`.

## 5) Verify 09/10/2026
- `npx tsc --noEmit` — PASS (0 lỗi).
- `npm run build` — PASS — 18 routes (có `ƒ /api/health`, `○ /customers`, `○ /inventory`...), `standalone` sinh `.next/standalone/server.js` (6.3 KB). Warning copy `page_client-reference-manifest.js` đã biết, không block build.
- `npx prisma generate` — PASS (v7.10.0).

## 6) Hướng dẫn Host Nginx + Cutover
```nginx
# /etc/nginx/sites-available/workspace.sonkhang.vn — trước cutover
location / { proxy_pass http://127.0.0.1:6060; }
# sau cutover (script tự đổi)
location / { proxy_pass http://127.0.0.1:3000; }
```
```bash
# Chuẩn bị: đảm bảo app v2 chạy
docker compose up -d --build && curl http://127.0.0.1:3000/api/health

# Cutover zero-downtime (không tắt v1 trước, đổi proxy rồi reload)
bash scripts/switch-to-v2.sh

# Kiểm tra
curl https://workspace.sonkhang.vn/api/health

# Rollback nếu lỗi
bash scripts/rollback-to-v1.sh
```
- Tắt v1 (port 6060) thủ công sau khi v2 ổn định.
