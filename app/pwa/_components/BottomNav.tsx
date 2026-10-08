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
      className="fixed inset-x-0 bottom-0 z-40 flex h-14 min-h-[56px] items-center justify-around border-t bg-card"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {ITEMS.map(({ href, label, Icon }) => {
        const active = pathname === href || (href !== "/pwa" && pathname?.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex min-h-[44px] min-w-[44px] flex-col items-center justify-center gap-0.5 rounded-xl px-3 py-1 text-muted-foreground transition-colors",
              active && "text-primary"
            )}
            style={{ minWidth: 44, minHeight: 44 }}
          >
            <Icon className="h-5 w-5" strokeWidth={1.7} />
            <span className={cn("font-mono text-[10px] leading-none", active && "font-bold")}>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
