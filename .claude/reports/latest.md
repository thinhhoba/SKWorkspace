# Báo cáo Claymorphism — 08/10/2026

## Tổng quan directive
Chủ tịch phê duyệt định hướng 3D Claymorphism + Glossy Soft Tech (Apple Widgets / Zalo Cloud / Linear) — nâng toàn bộ Shell + Bento + PWA từ phẳng sang xúc giác phồng/kính mờ bóng ngọc trai.

## File đã sửa
- `app/globals.css` — tokens `.clay-card` (pearl gradient + dual-shadow + inset), `.clay-kpi` 3 tone sky/warning/danger (sky/warning/danger glow), `.clay-tile` (hover `translateY(-3px) scale(1.01)` cubic-bezier), `.glossy-pill/.glossy-btn` (viên thuốc specular), `.glossy-glass` (backdrop-blur 12px).
- `app/(shell)/page.tsx` — 4 KPI `.clay-kpi[data-tone]` border-l-4 + 3 bento `.clay-card` + 14 mini-app `.clay-tile`.
- `components/shell/Topbar.tsx` — `.glossy-glass` 56px sticky + search `.glossy-pill`.
- `components/shell/Sidebar.tsx` — aside desktop + drawer mobile đổi sang `.glossy-glass` (240px/64px/280px <1024).
- `app/(shell)/finance/sapo2misa/page.tsx` — stepper `.glossy-pill` + wrapper ngoài `.clay-card`, riêng `MisaGrid.tsx` giữ phẳng (0 clay) đảm bảo 60fps virtualized.
- `app/pwa/_components/BottomNav.tsx` — floating pill `rounded-[9999px]` 56px `env(safe-area-inset-bottom)` active Sky glow; `QrViewport.tsx` khung `clay-card rounded-3xl` 4 góc + scanline.
- `app/pwa/page.tsx` — thẻ thao tác `.clay-card` + pill `.glossy-pill`.

## Verify
- `npx tsc --noEmit` — 0 lỗi.
- `npm run build` (Next 15.5) — PASS (7 routes static).
- Grep: `globals.css` 6 tokens đủ; `(shell)/page.tsx` clay-kpi/card/tile đủ; Topbar/Sidebar glossy-glass đủ; BottomNav floating-pill + safe-area đủ; `MisaGrid.tsx` 0 clay (giữ phẳng).

Sẵn sàng nghiệm thu — `npm run dev` → `/` (shell), `/finance/sapo2misa` (Grid 63), `/pwa`.
