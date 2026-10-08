import type { Metadata, Viewport } from "next";
import { BottomNav } from "./_components/BottomNav";
import { OfflineBanner } from "./_components/OfflineBanner";
import { RoleProvider } from "./_components/RoleProvider";
import { RoleSwitcher } from "./_components/RoleSwitcher";

export const metadata: Metadata = {
  title: "SK Workspace — PWA",
  description: "Kho · Giao vận · VietQR — Sơn Khang",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#F8FAFC",
};

export default function PwaLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleProvider>
      <div
        id="pwa-shell"
        className="flex min-h-dvh flex-col bg-background text-foreground"
        style={{ paddingLeft: "env(safe-area-inset-left)", paddingRight: "env(safe-area-inset-right)" }}
      >
        <header
          id="pwa-topbar"
          className="glossy-glass sticky top-0 z-30 flex h-14 min-h-14 shrink-0 items-center gap-2 px-3"
          style={{ paddingTop: "env(safe-area-inset-top)" }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo-sk-circle.png"
            alt="SK"
            className="h-6 w-6 shrink-0 rounded-full border object-cover"
            width={24}
            height={24}
          />
          <span className="font-mono text-[11px] font-bold text-muted-foreground">SK Workspace · PWA</span>
          <RoleSwitcher />
        </header>

        <OfflineBanner />

        <main
          id="pwa-content"
          className="flex flex-1 flex-col gap-2.5 overflow-auto bg-background p-2.5 pb-[calc(56px+16px+env(safe-area-inset-bottom))]"
        >
          {children}
        </main>

        <BottomNav />
      </div>
    </RoleProvider>
  );
}
