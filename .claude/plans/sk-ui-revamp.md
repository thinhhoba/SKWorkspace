# SK Workspace — Plan Cải Tổ UI/UX Toàn Diện (sk-ui-revamp)

> Ngay: 08/10/2026 — Agent Plan (Opus 5.5)
> Dong bo: C:/Users/hobat/.claude/plans/sk-ui-revamp.md <-> Z:/SK Workspace 2/.claude/plans/sk-ui-revamp.md
> Boi canh: Audit 6 van de bat buoc + chuan hoa Design System, App Shell, Bento Dashboard, Sapo2Misa Grid 63 cot, PWA thuc chien
> Stack: Next.js 15 App Router + TS + Tailwind + shadcn/ui + next-pwa | Postgres+Prisma | BullMQ+Redis | MinIO | Auth.js+RBAC | Docker+Nginx

---

## Muc luc

1. Context & Muc tieu
2. Audit hien trang — Giu / Bo / Sua
3. Design System Tokens
4. App Shell Architecture
5. Dashboard Bento Grid
6. Sapo2Misa Modular Screen
7. PWA Mobile Shell
8. File Breakdown & Thu tu trien khai
9. Rui ro & Quyet dinh kien truc
10. Verification Checklist
11. Phu luc

---

## 1. Context & Muc tieu

### 1.1 Vi sao phai cai to

6 van de audit commander neu — neu khong sua, prototype se sai nghiep vu (IT thay vi thuc pham), sai tham my (Terminal hacker) va sai thong tin kien truc (cua so gia, tron Sapo2Misa voi toan Workspace).

### 1.2 Muc tieu plan nay

- Chuan hoa Design System duy nhat (semantic tokens, typography, spacing, radius, elevation) — xoa cau vong.
- Doi sang Full-Viewport App Shell chuan Enterprise SaaS (shadcn/ui + Inter).
- #home = Bento Dashboard thuc chien Son Khang; /finance/sapo2misa = man hinh rieng voi Grid 63 cot virtualized.
- Mobile PWA du tieu chuan giao van/thu kho (>=44px, safe-area, Bottom Bar).
- Lo trinh file + dependency ro de 3 agent Code/Test/Review chay song song an toan.

### 1.3 Nguyen tac

- Prototype truoc, app sau: sua docs/*.html truoc de duyet truc quan, roi moi app/* Next.js.
- Giu adapter pattern va hash router #home -> #app/* -> /finance/sapo2misa da thong nhat.
- Khong phat minh lai — tai dung appRegistry, hasAppAccess, integration_logs, external_id.

---

## 2. Audit hien trang — Giu / Bo / Sua

### 2.1 Tong quan file da khao sat

| File | Dong | Vai tro hien tai |
|------|------|------------------|
| docs/ui-web.html | 625 | Shell chinh Modern Utility Light/Dark (html[data-mu]) |
| docs/ui-pwa.html | 194 | PWA mock |
| docs/mindmap.html | ~400 | Flow Nguon->Shell->14app->Dich (5 cot) |
| docs/sk-workspace-prototype-modern-utility.html | 352 | Prototype goc bi lac nghiep vu IT |
| docs/sapo2misa-notes.md | — | Ghi chu 63 cot, adapter, ranh gioi |
| docs/manifest.json | — | PWA manifest (start_url ui-web.html#home) |
| CLAUDE.md | — | Stack + 4-agent workflow |

### 2.2 Chi tiet 6 van de

| # | Van de | Hien trang | Quyet dinh |
|---|--------|------------|------------|
| 1 | Lac nghiep vu IT | sk-workspace-prototype-modern-utility.html chua NVMe/BitLocker/EFI/Driver Windows | Xoa 100%, thay bang seed thuc pham: don thit/ca, kho lanh Q7/Q12, NCC, cong no B2B, MISA |
| 2 | Bay Dark Cockpit | Nen #0B1329 + JetBrains Mono tran lan, data-mu dark chiem spotlight | Mac dinh Light (#F8FAFC), Mono chi cho Ma don/MST/Tien. Dark giu nhung la tuy chon thu cap |
| 3 | Fake Window Frame | Khung gia desktop — □ x + border 20px radius lang phi | Bo hoan toan -> Full-Viewport App Shell (sidebar 240px + topbar 56px co dinh, khong khung) |
| 4 | Tron Sapo2Misa/Workspace | Sapo2Misa chiem spotlight nhu toan bo Workspace, #home lan stepper | Tach ranh gioi: #home = Bento Dashboard; Sapo2Misa -> /finance/sapo2misa (hoac #app/sapo2misa) voi stepper 4 buoc + Grid 63 cot rieng |
| 5 | Cau vong mau | amber/sky/violet/orange/emerald/slate/red rai rac khong ngu nghia | Semantic 5 nhom duy nhat (xem §3) |
| 6 | PWA chua thuc chien | Chua du 44px, thieu safe-area, bottom bar so sai | Chuan hoa Bottom Nav 4 muc + card >=44px + QR + offline banner |

### 2.3 Giu / Bo — tung token hien tai

| Thanh phan | Gia tri hien tai | Giu | Bo/Sua |
|------------|------------------|-----|--------|
| Light bg #EBF3FA / Dark #0B1329 | Background | Giu y tuong dual-theme | Doi Light ve #F8FAFC (Slate-50) cho Enterprise Clean; Dark giu #0B1329 nhung giam tuong phan grid |
| html[data-mu] | Theme switch | Bo o Next.js (chuyen next-themes) | Giu tam o docs/*.html prototype de khong block duyet |
| Sidebar 240px + Topbar 56px | Layout | Giu nguyen kich thuoc | Bo position:fixed fake-window, chuyen flex viewport |
| 14 app + 5 nhom | IA | Giu | Doi icon cau vong -> semantic outline (lucide) |
| Stepper 4 buoc | Sapo2Misa | Giu cau truc 4 buoc | Tach khoi #home, them validation + ledger |
| Terminal 280px | Log panel | Bo khoi #home | Chuyen vao Sapo2Misa nhu collapsible drawer (mac dinh dong) |
| Grid 5x3 #home | Dashboard | Bo | Thay Bento Grid (§5) |
| Tailwind CDN 3.4.17 | Prototype | Giu cho docs/*.html | Build Tailwind khi sang app/* |
| Inter + JetBrains Mono | Font | Giu | Inter 400/500/600/700 lam chu dao; Mono chi cho ma/tien |

---

## 3. Design System Tokens

### 3.1 Color — Semantic 5 nhom (xoa cau vong)

Quy tac: khong dung mau truc tiep trong component, chi dung var(--*) hoac Tailwind token.

#### Light (mac dinh — Enterprise Clean)

```css
:root {
  /* Surface */
  --bg:            #F8FAFC;  /* Slate-50 — nen app, thay #EBF3FA */
  --surface:       #FFFFFF;
  --surface-2:     #F1F5F9;  /* Slate-100 — card muted, table head */
  --line:          #E2E8F0;  /* Slate-200 — border */
  --ink:           #0F172A;  /* Slate-900 — text chinh */
  --muted:         #64748B;  /* Slate-500 — text phu */
  --muted-2:       #94A3B8;  /* Slate-400 — placeholder */

  /* Semantic — 5 nhom duy nhat */
  --primary:       #0EA5E9;  /* Sky-500 — CTA chinh, link, active nav */
  --primary-soft:  #F0F9FF;  /* Sky-50 */
  --primary-bd:    #BAE6FD;  /* Sky-200 */

  --success:       #059669;  /* Emerald-600 — du hang, da giao, OK */
  --success-soft:  #ECFDF5;
  --success-bd:    #A7F3D0;

  --warning:       #D97706;  /* Amber-600 — canh bao, cho, sap thieu */
  --warning-soft:  #FFFBEB;
  --warning-bd:    #FDE68A;

  --danger:        #E11D48;  /* Rose-600 — no qua han, loi, thieu hang */
  --danger-soft:   #FFF1F2;
  --danger-bd:     #FECDD3;

  --neutral:       #475569;
  --neutral-soft:  #F8FAFC;
  --neutral-bd:    #E2E8F0;
}
```

#### Dark (tuy chon — giam tuong phan so voi Cockpit cu)

```css
html[data-mu="dark"] {
  --bg:            #0B1329;
  --surface:       #111E3A;
  --surface-2:     #0F172A;
  --line:          rgba(255,255,255,.08);
  --ink:           #F1F5F9;
  --muted:         #94A3B8;
  --primary:       #38BDF8;
  --success:       #34D399;
  --warning:       #FBBF24;
  --danger:        #FB7185;
}
```

#### Semantic mapping

| Ngu nghia | Token | Dung cho |
|-----------|-------|----------|
| Primary (Sky/Navy) | --primary | CTA, link, nav active, stepper current |
| Success (Emerald) | --success | Da giao, du hang (>100), dong bo OK |
| Warning (Amber) | --warning | Cho duyet, sap thieu (20-100), no <7 ngay |
| Danger (Rose/Red) | --danger | Qua han, thieu hang (<20), loi |
| Neutral (Slate) | --muted/--line | Border, text phu, empty state |

Cam: violet, orange, purple, cyan rai rac ngoai 5 nhom. Neu can accent thu 6 -> dung --primary voi opacity.

### 3.2 Typography — Inter chu dao, Mono co kiem soat

```css
--font-sans: 'Inter', system-ui, -apple-system, sans-serif;
--font-mono: 'JetBrains Mono', ui-monospace, monospace;
--text-xs:   11px;
--text-sm:   13px;
--text-base: 14px;
--text-lg:   16px;
--text-xl:   20px;
--text-2xl:  24px;
```

Quy tac Mono:

| Cho phep Mono | Khong dung Mono |
|---------------|-----------------|
| Ma don SP-0841, MST 0301234567, tien 42.800.000, SKU, external_id | Ten KH, ten SP, mo ta, heading, nav label, toast |

```html
<span class="mono text-xs">SP-0841</span> — An Thinh Mart
<span class="mono">42.800.000 ₫</span>
```

### 3.3 Spacing / Radius / Elevation

```css
--space-1: 4px;  --space-2: 8px;  --space-3: 12px; --space-4: 16px;
--space-6: 24px; --space-8: 32px;
--radius-sm: 6px;   /* badge, input */
--radius-md: 10px;  /* card, button */
--radius-lg: 14px;  /* bento tile */
--radius-xl: 20px;  /* modal */
--shadow-sm: 0 1px 2px rgba(15,23,42,.06);
--shadow-md: 0 4px 12px rgba(15,23,42,.08);
--shadow-lg: 0 12px 32px rgba(15,23,42,.12);
```

### 3.4 shadcn/ui mapping

| shadcn token | Map toi |
|--------------|---------|
| --primary | var(--primary) |
| --destructive | var(--danger) |
| --muted | var(--surface-2) |
| --border | var(--line) |
| --radius | var(--radius-md) |

---

## 4. App Shell Architecture

### 4.1 Layout — Full-Viewport (bo Fake Window)

```
┌──────────────────────────────────────────────┐
│ Topbar 56px (fixed, border-b)                │  search + Cmd+K + user + theme toggle nho
├──────────┬───────────────────────────────────┤
│ Sidebar  │ Canvas (flex-1, scroll)           │
│ 240px    │  #home = Bento Dashboard          │
│ collaps- │  #app/* = module content          │
│ ible     │  /finance/sapo2misa = Sapo2Misa   │
│ overlay  │                                   │
│ <1024px  │  Foot 28px (border-t, muted)      │
└──────────┴───────────────────────────────────┘
```

CSS:

```css
#app-shell { display: flex; flex-direction: column; min-height: 100dvh; }
#shell-body { display: flex; flex: 1; min-height: 0; }
#sidebar { width: 240px; flex-shrink: 0; border-right: 1px solid var(--line); background: var(--surface); }
#topbar { height: 56px; position: sticky; top: 0; z-index: 20; border-bottom: 1px solid var(--line); background: var(--surface); }
@media (max-width: 1024px) {
  #sidebar { position: fixed; inset: 0 auto 0 0; width: 280px; z-index: 40; transform: translateX(-100%); transition: transform .25s ease; }
  #sidebar.open { transform: translateX(0); }
  #backdrop { display: block; }
}
```

### 4.2 Sidebar — Collapsible + RBAC

- Desktop (>=1024px): co dinh 240px, toggle thu gon -> 64px (chi icon).
- Mobile/Tablet (<1024px): overlay drawer + backdrop.
- State: hasAppAccess(appId) loc navItems + apps truoc khi render.

```ts
// packages/core/rbac.ts
export function hasAppAccess(user: User, appId: string): boolean {
  if (user.role === 'ADMIN') return true;
  return user.allowedApps.includes(appId);
}
```

```ts
// packages/core/appRegistry.ts
export const appRegistry = [
  { id: 'dashboard', label: 'Ban lam viec', group: 'finance', icon: 'LayoutDashboard' },
  { id: 'sapo2misa', label: 'Sapo2Misa', group: 'finance', icon: 'ArrowLeftRight' },
  // ... 12 app con lai — icon lucide outline
] as const;
```

### 4.3 Header — Search + Cmd+K + User

| Phan | Noi dung |
|------|----------|
| Trai | Logo SK + SK Workspace + breadcrumb |
| Giua | Search input + Cmd+K palette |
| Phai | Clock T2 09:41 08/10, theme toggle nho, avatar + role |

Command palette: cmdk (shadcn) — tim app, don, KH, NCC, lenh nhanh.

### 4.4 Navigation & Routing

```
#home              → Bento Dashboard (mac dinh sau login)
#app/<id>          → Module generic (dung appRegistry)
#app/sapo2misa     → alias → /finance/sapo2misa (modular screen rieng)
#settings          → ADMIN only
#profile           → ho so user
/finance/sapo2misa → Next.js route thuc te (khi sang app/*)
```

Hash router giu cho docs/*.html prototype; khi sang Next.js -> next/navigation + app/(shell)/finance/sapo2misa/page.tsx.

### 4.5 Auth — Google OAuth

- Auth.js provider Google -> sonkhang.vn allowlist -> JWT.
- Chua dang nhap -> LoginView (Google button + email/OTP fallback).
- Da dang nhap -> hasAppAccess loc sidebar/grid.

---

## 5. Dashboard Bento Grid

### 5.1 Muc tieu

#home phai tra loi trong 5 giay: hom nay ban bao nhieu, don nao can soan sang nay, kho nao sap thieu, ai no qua han.

### 5.2 Layout — 4 KPI + 3 Bento Row

```
┌─────────────────────────────────────────────────────┐
│ KPI Row (4 cards)                                   │
│ [Doanh thu hom nay] [Don can soan] [Ton canh bao] [Cong no QH] │
├──────────────────────────┬──────────────────────────┤
│ Bento A (2/3)            │ Bento B (1/3)            │
│ Don can soan sang nay    │ Ton kho lanh Q7/Q12      │
├──────────────────────────┼──────────────────────────┤
│ Bento C (full)           │ (hoac 2/3 + 1/3)         │
│ Cong no qua han (B2B)    │ Lich giao hom nay        │
└──────────────────────────┴──────────────────────────┘
```

Responsive: >=1024px 4-col KPI + 2-col bento; 640-1024px 2-col; <640px 1-col stack, card >=44px.

### 5.3 KPI Cards — 4 chi so

| KPI | Value (mock thuc pham) | Trend | Semantic |
|-----|------------------------|-------|----------|
| Doanh thu hom nay | 128.400.000 | +12% vs hom qua | Primary (Sky) |
| Don can soan sang nay | 14 don | 3 don gap | Warning dot |
| Canh bao ton kho | 5 SKU | Heo xay thieu | Danger pulse |
| Cong no qua han | 84.200.000 | An Thinh Mart 12 ngay | Danger |

```html
<div class="grid grid-cols-4 gap-3 max-[1024px]:grid-cols-2 max-[640px]:grid-cols-1">
  <div class="rounded-xl border bg-white p-4 border-l-4 border-l-sky-500">
    <div class="mono text-[11px] tracking-widest font-bold text-slate-500">DOANH THU HOM NAY</div>
    <div class="mono text-xl font-extrabold mt-2">128.400.000 ₫</div>
    <div class="text-xs text-emerald-700 mt-1">+12% vs hom qua</div>
  </div>
</div>
```

### 5.4 Bento Tiles — du lieu thuc pham Son Khang

Tile A — Don can soan sang nay (2/3): SP-0841 An Thinh Mart 42.8T Cho soan; SP-0840 Minh Khang 18.3T Dang soan; CTA Xem tat ca -> #app/sales.

Tile B — Ton kho lanh Q7/Q12 (1/3): Heo xay 500g 12 Thieu (Rose); Bo vien 1kg 60 Sap thieu (Amber); Cha lua 500g 200 Du (Emerald). Kho Q7 68% Q12 42%.

Tile C — Cong no qua han B2B: An Thinh Mart 84.2T 12 ngay [Nhac]; Minh Khang 42.1T 5 ngay [Nhac].

Tile D (optional) — Lich giao hom nay: tuyen, tai xe, trang thai.

### 5.5 Khong con o #home

- Stepper Sapo2Misa -> /finance/sapo2misa
- Terminal log -> drawer trong Sapo2Misa
- Filter cau vong -> filter semantic 5 nhom (neu can)

---

## 6. Sapo2Misa Modular Screen

Ranh gioi: Sapo2Misa la 1/14 app, nhom Tai chinh. Route: #app/sapo2misa (prototype) -> /finance/sapo2misa (Next.js).

### 6.1 Stepper 4 buoc

| Buoc | Tieu de | Mo ta | Trang thai |
|------|---------|-------|------------|
| 1 | Sapo pull & incremental sync | Sapo API last_synced_at external_id | done |
| 2 | Chuan hoa CentralOrders | Map MST (gdt.gov.vn) & SKU -> MISA | current |
| 3 | Sinh Excel 63 cot | Ledger chong trung kiem tra 63 cot | cho |
| 4 | Day MISA & phat hanh | Import AMIS meInvoice doi soat | cho |

Visual: horizontal stepper (>=768px) / vertical (mobile), done=Emerald, current=Sky+ring, wait=Slate.

### 6.2 Data Grid 63 cot — virtualized, sticky header, column filter

Yeu cau cung:

- Virtualized rows: @tanstack/react-virtual
- Sticky header: position sticky top 0 + shadow khi scroll
- Column filter: moi header co filter icon -> dropdown
- Column visibility: toggle 63 cot (mac dinh hien ~12 cot chinh)
- Frozen first 2 cols: Ma don + Khach hang

Nhom cot MISA 63:

| Nhom | Cot vi du |
|------|-----------|
| Header (1-10) | Ngay HT, Ngay CT, So CT, MST, Ten KH, Dia chi, Dien giai |
| Chi tiet (11-35) | Ma hang, Ten hang, DVT, So luong, Don gia, Thanh tien, Thue suat, Tien thue, TK No/Co |
| Tong hop (36-45) | Tong tien hang, Tong thue, Tong TT, Hinh thuc TT, Han TT |
| Mo rong (46-63) | Chiet khau, Chi phi, Lo/han, Ghi chu, NV ban, Kenh |

```tsx
// app/(shell)/finance/sapo2misa/_components/MisaGrid.tsx
import { useVirtualizer } from '@tanstack/react-virtual';
const VISIBLE_COLS = ['so_ct','ngay_ht','mst','ten_kh','ma_hang','so_luong','don_gia','thanh_tien','thue_suat','tien_thue','tk_no','tk_co'];
```

### 6.3 Validation & Modal

- Pre-export validation: MST rong, SKU chua map, so luong <=0, thue sai -> highlight Rose + tooltip.
- Mapping modal: bang Sapo field -> MISA cot.
- Ledger chong trung: external_id unique -> block + toast Da ton tai.

### 6.4 Terminal Drawer (collapsible)

- Mac dinh dong, nut Nhat ky dong bo (88 dong).
- Khi mo: filter ALL/INFO/OK/RUN/WARN, copy, auto-scroll.

---

## 7. PWA Mobile Shell

### 7.1 Doi tuong

Tai xe, thu kho, nhan vien hien truong — dung ngoai kho lanh, tren xe.

### 7.2 Layout

```
┌─────────────────────┐
│ Topbar 56px         │
├─────────────────────┤
│ Content (scroll)    │
│ Card >=44px         │
├─────────────────────┤
│ Bottom Bar 56px     │  4 muc — safe-area-inset-bottom
└─────────────────────┘
```

### 7.3 Bottom Nav — 4 muc

| Icon (lucide) | Label | Route |
|---------------|-------|-------|
| LayoutDashboard | Tong quan | #home |
| Package | Kho | #app/warehouse |
| Truck | Giao van | #app/logistics |
| User | Toi | #profile |

```css
#bottom-nav {
  position: fixed; bottom: 0; left: 0; right: 0; height: 56px;
  padding-bottom: env(safe-area-inset-bottom);
  background: var(--surface); border-top: 1px solid var(--line);
  display: flex; justify-content: space-around; align-items: center;
}
#bottom-nav a { min-height: 44px; min-width: 44px; display: grid; place-items: center; border-radius: 10px; }
```

### 7.4 Touch & Safe Area

- Touch target >=44x44px cho moi button/card tappable.
- padding: env(safe-area-inset-*) cho shell.
- QR frame: camera viewport voi goc bo + overlay toi.
- Offline banner: navigator.onLine -> banner Amber Ban dang offline.

### 7.5 next-pwa config

```js
import withPWA from 'next-pwa';
export default withPWA({
  dest: 'public', register: true, skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    { urlPattern: /^https:\/\/fonts\.(?:gstatic|googleapis)\.com\/.*/i, handler: 'CacheFirst' },
    { urlPattern: /\/api\/.*/i, handler: 'NetworkFirst', options: { networkTimeoutSeconds: 10 } },
  ],
});
```

---

## 8. File Breakdown & Thu tu trien khai

### 8.1 Giai doan 1 — Prototype docs/*.html (duyet truc quan truoc)

| # | File | Viec | Phu thuoc |
|---|------|------|-----------|
| 1.1 | docs/ui-web.html | Sua chinh: bo fake window -> Full-Viewport shell, doi token semantic 5 nhom, Bento #home, tach Sapo2Misa | — |
| 1.2 | docs/sk-workspace-prototype-modern-utility.html | Dai phau: xoa NVMe/BitLocker -> seed thuc pham, doi Dark lam dung -> Enterprise SaaS, bo khung gia | 1.1 |
| 1.3 | docs/ui-pwa.html | Chuan hoa Bottom Bar 4 muc, card >=44px, safe-area, QR, offline | 1.1 |
| 1.4 | docs/mindmap.html | Dong bo token + bo Dark Cockpit label neu can | 1.1 |
| 1.5 | docs/manifest.json | Cap nhat start_url, theme_color (#F8FAFC), icons | 1.1 |

Song song: 1.2, 1.3, 1.4 lam song song sau khi 1.1 chot token. 1.5 cuoi.

### 8.2 Giai doan 2 — Next.js App app/* (sau khi prototype duyet)

| # | File | Viec | Phu thuoc |
|---|------|------|-----------|
| 2.1 | app/globals.css | Token CSS vars + Tailwind base | 1.1 |
| 2.2 | app/layout.tsx | Root layout, next-themes ThemeProvider | 2.1 |
| 2.3 | app/(shell)/layout.tsx | App Shell: Sidebar + Topbar + Cmd+K + RBAC gate | 2.2 |
| 2.4 | components/ui/* (shadcn) | Button, Card, Input, Table, Dialog, Tabs, Badge | 2.1 |
| 2.5 | app/(shell)/page.tsx (#home) | Bento Dashboard: 4 KPI + 3 tiles | 2.3, 2.4 |
| 2.6 | app/(shell)/finance/sapo2misa/page.tsx | Sapo2Misa screen: stepper + MisaGrid 63 cols | 2.3, 2.4 |
| 2.7 | app/(shell)/finance/sapo2misa/_components/MisaGrid.tsx | Virtualized grid 63 cot | 2.6 |
| 2.8 | packages/core/appRegistry.ts | 14 app registry + hasAppAccess | 2.3 |
| 2.9 | packages/integrations/sapo/* + misa/* | Adapter sync/push/pull, external_id | 2.6 |
| 2.10 | app/(pwa)/layout.tsx + BottomNav | PWA shell rieng, safe-area, offline | 2.3 |
| 2.11 | next.config.mjs + public/manifest.json | next-pwa, runtimeCaching | 2.10 |

### 8.3 Dependency Graph

```
1.1 (token+shell) -> 1.2, 1.3, 1.4 (song song) -> 1.5 -> duyet prototype
2.1 -> 2.2 -> 2.3 -+-> 2.5 (Bento #home)
                 +-> 2.6->2.7 (Sapo2Misa Grid)
                 +-> 2.10 (PWA shell)
2.4 + 2.8 + 2.9 song song (khac file)
2.5 va 2.6 song song sau 2.3
```

Song song an toan: Nhom A (2.4+2.8+2.9) 3 agent; Nhom B (2.5+2.6) 2 agent. Tuan tu bat buoc: 2.1->2.2->2.3.

---

## 9. Rui ro & Quyet dinh kien truc

| # | Rui ro / Cau hoi | Quyet dinh | Ly do |
|---|------------------|------------|-------|
| R1 | Giu html[data-mu] hay next-themes? | Prototype giu data-mu, Next.js dung next-themes (class) | Khong block duyet; next-themes chuan shadcn, tranh FOUC |
| R2 | Tailwind CDN -> build | CDN cho docs/*.html, build cho app/* | Prototype zero-build; app can purge + token |
| R3 | Grid 63 cot performance | Virtualized + col visibility (mac dinh 12 cot) | 63x500 DOM node se lag |
| R4 | Seed thuc pham lay dau? | Mock JSON data/seeds/sk-seed.json -> sau Prisma seed | Chua co DB that; mock phai dung nghiep vu |
| R5 | Dark mode co giu? | Giu nhung thu cap — toggle nho, mac dinh Light | Bo Bay Dark Cockpit |
| R6 | Hash router vs Next.js routing | Hash cho docs, file-based cho Next.js | Hash giu prototype khong can server |
| R7 | PWA offline — BullMQ/Redis chua co | next-pwa NetworkFirst cho /api, UI offline banner truoc | Khong block PWA vi thieu Redis |
| R8 | Icon emoji vs lucide | lucide-react outline cho app/*, emoji chi cho docs neu can | Enterprise SaaS dung outline |

---

## 10. Verification Checklist

### Cho Agent Test (Haiku 4.5)

- [ ] Prototype duyet tay: docs/ui-web.html#home -> Bento 4 KPI + 3 tiles du lieu thuc pham, khong con NVMe/BitLocker.
- [ ] Token: --primary Sky #0EA5E9, khong con violet/orange rai rac; Mono chi o ma/tien.
- [ ] Shell: khong con khung gia — □ x; sidebar 240px desktop / overlay <1024px; topbar sticky 56px.
- [ ] Bento: #home khong con stepper/terminal; Sapo2Misa o #app/sapo2misa rieng.
- [ ] Grid 63: render 63 cot, sticky header, filter tung cot, virtualized scroll muot (>=200 dong).
- [ ] PWA: ui-pwa.html bottom bar 4 muc, card >=44px, env(safe-area-inset-bottom) co tac dung.
- [ ] A11y: tab order, focus-visible ring, aria-pressed/aria-selected, touch >=44px.
- [ ] Manifest: start_url, theme_color, icons load duoc; Lighthouse PWA >=90.

### Cho Agent Review (Opus 5.5)

- [ ] Correctness: ranh gioi Sapo2Misa 1/14 dung, ledger external_id chong trung, 63 cot dung thu tu MISA.
- [ ] Bao mat: RBAC hasAppAccess chan app chua cap quyen, allowlist sonkhang.vn, no XSS trong grid.
- [ ] Hieu nang: virtualized grid, Tailwind purge, next-pwa caching, khong CDN trong app/*.
- [ ] Don gian: xoa code cau vong chet, tai dung appRegistry/integration_logs.
- [ ] Thiet ke: Enterprise SaaS tinh te, khong Terminal Hacker, khong Fake Window.

---

## 11. Phu luc

### A. Seed thuc pham — mock

```json
{
  "orders": [
    { "code": "SP-0841", "customer": "An Thinh Mart", "total": 42800000, "status": "cho_soan", "warehouse": "Q7" },
    { "code": "SP-0840", "customer": "Minh Khang Food", "total": 18300000, "status": "dang_soan", "warehouse": "Q12" }
  ],
  "skus": [
    { "sku": "HEO-XAY-500", "name": "Heo xay 500g", "stock_q7": 12, "stock_q12": 45 },
    { "sku": "BO-VIEN-1K", "name": "Bo vien 1kg", "stock_q7": 60, "stock_q12": 30 }
  ],
  "debts": [
    { "customer": "An Thinh Mart", "amount": 84200000, "overdue_days": 12 }
  ]
}
```

### B. MISA 63 cot — hang so

```ts
// constants/misaColumns.ts
export const MISA_COLUMNS = [
  { key: 'ngay_ht', label: 'Ngay HT', group: 'header' },
  { key: 'ngay_ct', label: 'Ngay CT', group: 'header' },
  { key: 'so_ct', label: 'So CT', group: 'header' },
];
```

### C. Lench chay

```bash
start docs/ui-web.html
npm run dev        # http://localhost:3000
docker compose up -d
```

---

> Handoff: Plan cho Commander duyet -> Agent Code (Sonnet 5.5) nhan Giai doan 1 (docs/*.html) truoc, Giai doan 2 (app/*) sau. Co the tach 2-3 Code agent song song theo §8.3.
