# Báo cáo Xác thực & Đăng nhập Claymorphism — 09/10/2026 (Chỉ thị 10)

## Triển khai
- `packages/core/auth.ts` — `AuthUser` (id/username/name/role/warehouse), HMAC SHA-256 `createSessionToken`/`verifySessionToken` (payload base64url + sig, exp 7 ngày, fallback DJB2 nếu thiếu `crypto.subtle`), `DEFAULT_USERS` 4 tài khoản `admin`/`ketoan`/`thukho`/`taixe` / `sk@123456` (Vũ Như Sơn / Trần Thị Thu Thảo / Lê Văn Đạt / Nguyễn Văn Hùng), `authenticate` (Prisma fallback → DEFAULT_USERS), `roleRedirectPath` (`/` / `/customers` / `/inventory` / `/pwa/giaovan`).
- `POST /api/auth/login` — set `sk_session` httpOnly lax 7d, trả `redirect` theo role.
- `POST /api/auth/logout` — xóa `sk_session`.
- `GET /api/auth/me` — verify token → user hoặc 401.
- `middleware.ts` — public: `/login`, `/api/auth/*`, `/api/health`, `/favicon.ico`, `/assets/*`, `/_next/*`, `/manifest.json`, `/sw.js`, `workbox*.js`; còn lại thiếu `sk_session` hoặc không chứa `.` → redirect `/login?redirect=`, `matcher: /((?!_next/static|_next/image).*)`.
- `app/login/page.tsx` — Claymorphism: nền `sky-50→white→indigo-50`, `.clay-card rounded-3xl max-w-[420px]`, logo 64 tròn, tiêu đề SƠN KHANG FOOD, 4 pill Quick Role 👑📊❄️🚚 auto-fill, 2 input (User/Lock + Eye toggle), `.glossy-btn` Đăng nhập, lỗi `rose-50`, `Suspense` bọc `useSearchParams` (fix prerender).
- `components/shell/Topbar.tsx` — fetch `/api/auth/me`, hiển thị avatar initials + tên + badge role (ADMIN sky/ACCOUNTANT amber/WAREHOUSE emerald/DRIVER slate) + nút `LogOut` → `POST /api/auth/logout` → `/login`.

## Verify 09/10/2026
- `npx tsc --noEmit` — PASS (0 lỗi).
- `npm run build` — PASS — 19 routes: `○ /login 3.02 kB`, `ƒ /api/auth/login|logout|me`, `ƒ Middleware 34 kB`, `/` (Bento) + `/customers` + `/inventory` + `/finance/sapo2misa` + PWA. Sửa lỗi `useSearchParams() should be wrapped in suspense` bằng `Suspense` fallback.
- Tài khoản demo: `admin/sk@123456` → `/`, `ketoan` → `/customers`, `thukho` → `/inventory`, `taixe` → `/pwa/giaovan`.

## Thử
Chưa đăng nhập mở `/` → redirect `/login?redirect=/`. Chọn pill Tài xế → đăng nhập → vào `/pwa/giaovan` + VietQR động. Topbar hiện tên + Đăng xuất.
