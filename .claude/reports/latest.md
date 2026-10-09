# Báo cáo Bento Dashboard & Favicon — 09/10/2026 (Chỉ thị 09)

## Nguyên nhân
- `app/page.tsx` scaffold (`SK Workspace — scaffold OK`) che mất `app/(shell)/page.tsx` (Bento 3D Claymorphism) — Next.js ưu tiên `app/page.tsx` ngoài cùng.
- `public/favicon.ico` thiếu → browser 404.

## Khắc phục
- **Xóa** `app/page.tsx` — route `/` nay render `app/(shell)/page.tsx` qua `app/(shell)/layout.tsx` (Topbar + RoleSwitcher + BottomNav 4 vai).
- **Tạo** `public/favicon.ico` — Vista PNG ICO nhúng `public/assets/logo-sk-circle.png` (971 KB → ICO 971 KB, header `00 00 01 00`), `GET /favicon.ico` 200.
- **Cập nhật** `app/layout.tsx` metadata: `icons: { icon: "/favicon.ico", apple: "/assets/logo-sk-circle.png" }`.

## Verify 09/10/2026
- `npx tsc --noEmit` — PASS (0 lỗi nguồn; `.next/types` tham chiếu cũ tự hết sau build).
- `npm run build` — PASS — `○ / 5.5 kB` (Bento, trước là scaffold), 18 routes gồm `○ /customers`, `○ /inventory`, `ƒ /api/health`.
- `ls public/favicon.ico` — tồn tại, magic `00 00 01 00` hợp lệ.

## Thử
Mở `https://workspace.sonkhang.vn/` → thấy Bento Dashboard (4 KPI Clay, lưới 14 app, filter), không còn dòng scaffold. Console không còn 404 favicon (favicon là logo tròn SK).
