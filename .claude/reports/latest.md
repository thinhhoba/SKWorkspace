# Báo cáo PWA 4 vai trò — 08/10/2026

## Tóm tắt đã làm
PWA `/pwa` chuyển từ 4 tab cứng (Tổng quan / Kho / Giao vận / Tôi) sang 4 persona độc lập: Giám đốc (`admin`), Kế toán (`accountant`), Kho lạnh (`warehouse`), Giao hàng (`delivery`). Role Switcher trên topbar đổi vai; BottomNav và màn hình chính render theo `PwaRole`. Role shell cũ `ADMIN | MANAGER | STAFF | VIEWER` giữ nguyên.

## File
- `packages/core/rbac.ts` — thêm `PwaRole` + `PWA_ROLES`; `Role` shell `ADMIN` vẫn còn.
- `app/pwa/_components/RoleProvider.tsx` — context role/tab, persist localStorage.
- `app/pwa/_components/RoleSwitcher.tsx` — dropdown topbar, `min-h-[52px]`.
- `app/pwa/_components/roleNav.ts` — `PWA_NAV` 4 bộ 4 tab theo vai.
- `app/pwa/_components/RoleHome.tsx` — home theo vai: KPI `128.400.000` / `540.200.000`, `SP-0842`, An Thịnh, Minh Khang, `-18.2°C`, VietQR `img.vietqr.io`, `tel:`, nút `min-h-[52px]`.
- `app/pwa/_components/BottomNav.tsx` — nav theo `PWA_NAV[role]`, không còn hardcode 4 tab cũ.
- `app/pwa/layout.tsx` — bọc `RoleProvider` + `RoleSwitcher`.
- `app/pwa/page.tsx` — render `<RoleHome />`.

## Verify
- `npx tsc --noEmit` — exit 0.
- `npm run build` (Next 15.5.10) — PASS, 7 routes static (`/`, `/finance/sapo2misa`, `/pwa`, `/pwa/giaovan`, `/pwa/kho`, `/pwa/toi`).
- Grep:
  - `PwaRole` `admin|accountant|warehouse|delivery` trong `rbac.ts`; `Role` `ADMIN` còn.
  - `RoleSwitcher`, `RoleProvider`, `RoleHome` tồn tại.
  - BottomNav lấy `PWA_NAV[role]` — không còn ITEMS cứng Tổng quan/Kho/Giao vận/Tôi.
  - `vnd(128400000)`, `vnd(540200000)`, `SP-0842`, An Thịnh, Minh Khang, `-18.2°C`, `vietqr.io` / VietQR, `tel:`, `min-h-[52px]` — đủ.

## Cách thử
```
npm run dev
```
Mở `/pwa`. Trên topbar bấm Role Switcher → lần lượt Giám đốc / Kế toán / Kho lạnh / Giao hàng. BottomNav và nội dung đổi theo vai (4 tab khác nhau).
