"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Package, Truck, User } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/pwa", label: "Tổng quan", Icon: LayoutGrid },
  { href: "/pwa/kho", label: "Kho", Icon: Package },
  { href: "/pwa/giaovan", label: "Giao vận", Icon: Truck },
  { href: "/pwa/toi", label: "Tôi", Icon: User },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Bottom navigation"
      className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-center px-3"
      style={{ paddingBottom: "max(12px, env(safe-area-inset-bottom))" }}
    >
      <div
        className="pointer-events-auto flex h-[56px] min-h-[56px] items-center justify-around gap-1 rounded-[9999px] border border-white/80 bg-white/75 px-2 shadow-[0_12px_32px_rgba(15,23,42,0.12),0_2px_8px_rgba(15,23,42,0.06),inset_0_1px_0_rgba(255,255,255,0.9)] backdrop-blur-xl dark:border-white/10 dark:bg-slate-900/70 dark:shadow-[0_12px_32px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)]"
        style={{ width: "min(380px, 100%)" }}
      >
        {ITEMS.map(({ href, label, Icon }) => {
          const active = pathname === href || (href !== "/pwa" && pathname?.startsWith(href));
          return (
            <Link
              key={href}
              href={href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex min-h-[44px] min-w-[44px] flex-1 flex-col items-center justify-center gap-0.5 rounded-full px-2 py-1 text-muted-foreground transition-all duration-200",
                active &&
                  "bg-white text-sky-600 shadow-[0_4px_16px_rgba(14,165,233,0.28),0_1px_4px_rgba(14,165,233,0.18),inset_0_1px_0_rgba(255,255,255,1)] ring-1 ring-sky-200/60 dark:bg-white/10 dark:text-sky-300 dark:shadow-[0_4px_16px_rgba(56,189,248,0.25)] dark:ring-sky-500/20"
              )}
              style={{ minWidth: 44, minHeight: 44 }}
            >
              <Icon
                className={cn("h-5 w-5", active && "drop-shadow-[0_0_8px_rgba(14,165,233,0.45)]")}
                strokeWidth={active ? 2 : 1.7}
              />
              <span className={cn("font-mono text-[10px] leading-none", active && "font-bold")}>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
