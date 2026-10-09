# Báo cáo Deploy VPS tự động (GHCR) — 09/10/2026

## Tóm tắt đã làm
Triển khai trọn gói deploy Cách 2: GitHub Actions + GHCR. Build Docker image siêu nhẹ trên GitHub, VPS chỉ pull & restart (5-10s, zero-downtime). Đã tạo/cập nhật 7 tệp theo chỉ thị.

## File thay đổi
- `next.config.mjs` — thêm `output: "standalone"` (Next 15 đóng gói server độc lập).
- `Dockerfile` — multi-stage 3 tầng `node:20-alpine`: `deps` (npm ci) → `builder` (npm run build) → `runner` (copy `.next/standalone` + `.next/static` + `public`, user `nextjs`, `node server.js`).
- `docker-compose.yml` — 4 service `app` (GHCR + fallback build local, healthcheck `/api/health`) + `postgres:16-alpine` + `redis:7-alpine` + `nginx:1.27-alpine`; volumes `postgres_data`/`redis_data`, network `sk-net`.
- `nginx/nginx.conf` — gzip, `client_max_body_size 50M`, cache PWA (`/sw.js` + `manifest.json` no-cache, `/_next/static/` immutable 1 năm), `proxy_pass app:3000`.
- `.github/workflows/deploy.yml` — 2 jobs: `build` (checkout, setup-node 20, npm ci, tsc --noEmit, buildx + login GHCR + build-push `ghcr.io/${{ github.repository }}:latest` với cache gha) → `deploy` (appleboy/ssh-action: `docker compose pull app && up -d --remove-orphans && prune`).
- `.env.production.example` — mẫu `POSTGRES_*`, `DATABASE_URL`, `REDIS_URL`, `NEXTAUTH_*`, `GITHUB_REPOSITORY`.
- `scripts/setup-vps.sh` — cài Docker + compose plugin, tạo `/opt/sk-workspace`, mở UFW 22/80/443.
- `.gitignore` — loại trừ `.env.production`, `nginx/certs/`, volumes, `public/sw.js`/`workbox-*.js`.

## Verify
- `npx tsc --noEmit` — exit 0.
- `npm run build` — PASS, `output: standalone` sinh `.next/standalone` (server.js + node_modules ~77M). Cảnh báo copy trace `(shell)` không chặn build (route vẫn static).
- `ls .next/standalone` — có `server.js`, `package.json`, `node_modules`.

## Cách thử
1. Đặt Secrets trên GitHub: `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_SSH_PORT` (optional).
2. Trên VPS mới: `sudo bash scripts/setup-vps.sh` rồi copy `.env.production` + `docker-compose.yml` + `nginx/` vào `/opt/sk-workspace`.
3. Push lên `main`/`master` → Actions build & push GHCR → SSH deploy tự động. Hoặc local: `docker compose up -d --build`.
