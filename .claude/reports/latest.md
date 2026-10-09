# Báo cáo Deploy VPS Cách 2 (GHCR) — 09/10/2026

## Tóm tắt file
- `next.config.mjs` — `output: "standalone"`, PWA next-pwa, `eslint.ignoreDuringBuilds: true`.
- `Dockerfile` — 3 stages `node:20-alpine`: `deps` (npm ci) → `builder` (npm run build) → `runner` (copy `public` + `.next/standalone` + `.next/static`, user `nextjs`, `node server.js`).
- `docker-compose.yml` — 4 services `app`/`postgres`/`redis`/`nginx`; `app` image `ghcr.io/${GITHUB_REPOSITORY}:latest` + `build` fallback, `3000:3000`, `restart: always`, healthcheck `wget /api/health`; `postgres:16-alpine` + `redis:7-alpine`; `nginx:1.27-alpine` mount `nginx.conf` + `certs`; volumes `postgres_data`/`redis_data`, network `sk-net`.
- `nginx/nginx.conf` — `gzip on`, `client_max_body_size 50M`, `proxy_pass http://app:3000` (qua upstream), cache `sw.js`/`manifest.json` no-cache, `/_next/static/` immutable 1 năm.
- `.github/workflows/deploy.yml` — 2 jobs `build` (checkout, setup-node 20, npm ci, `tsc --noEmit`, buildx + login `ghcr.io` + build-push `ghcr.io/${{ github.repository }}:latest` cache gha) → `deploy` (`appleboy/ssh-action` với `VPS_HOST`/`VPS_SSH_KEY`, `docker compose pull app && up -d && prune`).
- `.env.production.example` — mẫu `POSTGRES_*`, `DATABASE_URL`, `REDIS_URL`, `NEXTAUTH_*`, `GITHUB_REPOSITORY`.
- `scripts/setup-vps.sh` — cài Docker + compose plugin, tạo `/opt/sk-workspace`, mở UFW 22/80/443.
- `.gitignore` — ignore `.env.production`, `nginx/certs/`, `public/sw.js`/`workbox-*.js`.

## Verify
- `npx tsc --noEmit` — **PASS** (exit 0, 0 lỗi).
- `npm run build` — **PASS** (standalone, `server.js` tồn tại tại `.next/standalone/server.js` ~6.3K, build trace warning `(shell)` không chặn build).
- File tồn tại: `next.config.mjs` (standalone) ✓, `Dockerfile` (3 stages) ✓, `docker-compose.yml` (4 services + ghcr.io + 3000:3000 + restart always) ✓, `nginx/nginx.conf` (gzip + 50M + proxy_pass + cache) ✓, `.github/workflows/deploy.yml` (build+deploy + tsc + ghcr.io + appleboy/ssh-action + VPS_HOST/VPS_SSH_KEY) ✓, `.env.production.example` ✓, `scripts/setup-vps.sh` ✓, `.gitignore` (.env.production + nginx/certs) ✓.

## Hướng dẫn cấu hình & chạy
1. **GitHub Secrets** (Settings → Secrets → Actions): `VPS_HOST`, `VPS_USER`, `VPS_SSH_KEY`, `VPS_SSH_PORT` (optional, default 22). `GITHUB_TOKEN` có sẵn.
2. **VPS mới**: `sudo bash scripts/setup-vps.sh` (cài Docker, tạo `/opt/sk-workspace`, mở UFW). Sau đó copy `docker-compose.yml` + `nginx/` + tạo `.env.production` từ `.env.production.example` vào `/opt/sk-workspace`.
3. **Deploy**: push lên `main`/`master` → Actions tự build & push GHCR → SSH pull & restart. Hoặc local: `docker compose up -d --build`.
