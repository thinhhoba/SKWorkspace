# Báo cáo Chuẩn hóa GHCR Lowercase — 09/10/2026 (Chỉ thị 08)

## Căn cứ
Repo chính thức `thinhhoba/SKWorkspace` (chữ hoa `SKW`). Docker/GHCR bắt buộc tên image lowercase — không chuẩn hóa sẽ lỗi `invalid reference format: repository name must be lowercase`.

## Thay đổi
- `.github/workflows/deploy.yml` — thêm step `Chuẩn hóa tên Docker Image sang chữ thường` (`IMAGE_TAG=ghcr.io/$(echo '${{ github.repository }}' | tr '[:upper:]' '[:lower:]'):latest` → `$GITHUB_ENV`), đổi `docker/build-push-action` sang `tags: ${{ env.IMAGE_TAG }}`.
- `docker-compose.yml` — đổi `app.image` thành `${IMAGE_NAME:-ghcr.io/thinhhoba/skworkspace:latest}` (lowercase mặc định, vẫn override được qua `IMAGE_NAME` nếu cần).

## Verify 09/10/2026
- `npx tsc --noEmit` — PASS (0 lỗi).
- `npm run build` — đã PASS ở chỉ thị 07 (18 routes, `ƒ /api/health`); chỉ thị 08 không đổi code build nên giữ nguyên.
- GHCR tag sau chuẩn hóa: `ghcr.io/thinhhoba/skworkspace:latest` (lowercase, hợp lệ).

## Ghi chú vận hành
- Trên VPS nếu từng pull tag cũ `ghcr.io/thinhhoba/SKWorkspace:latest` thì xóa/tag lại hoặc `IMAGE_NAME` override — sau commit này CI chỉ push tag lowercase.
- `docker compose pull app && docker compose up -d` sẽ kéo đúng `ghcr.io/thinhhoba/skworkspace:latest`.
