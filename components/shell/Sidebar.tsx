"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { appRegistry, GROUP_LABEL, GROUP_ORDER, type AppGroup } from "@/packages/core/appRegistry";
import { hasAppAccess, mockRbacUser } from "@/packages/core/rbac";
import { Input } from "@/components/ui/input";
import { Search, PanelLeftClose, PanelLeft } from "lucide-react";

export function Sidebar({
  collapsed,
  onToggleCollapsed,
  mobileOpen,
  onMobileClose,
}: {
  collapsed: boolean;
  onToggleCollapsed: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const pathname = usePathname();
  const [q, setQ] = React.useState("");

  const filtered = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    return appRegistry.filter((a) => hasAppAccess(mockRbacUser, a.id)).filter((a) => !term || a.label.toLowerCase().includes(term) || a.id.toLowerCase().includes(term));
  }, [q]);

  const grouped = React.useMemo(() => {
    const m = new Map<AppGroup, typeof filtered>();
    for (const g of GROUP_ORDER) m.set(g, []);
    for (const a of filtered) m.get(a.group)?.push(a);
    return m;
  }, [filtered]);

  const nav = (
    <div className="flex h-full flex-col">
      <div className={cn("flex items-center gap-2 px-3 py-3 border-b", collapsed && "justify-center px-2")}>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Lọc app…" className="h-8 pl-7 text-sm" aria-label="Lọc app" />
            </div>
          </div>
        )}
        <button
          onClick={onToggleCollapsed}
          aria-label={collapsed ? "Mở rộng sidebar" : "Thu gọn sidebar"}
          aria-pressed={collapsed}
          className="hidden lg:inline-flex h-8 w-8 items-center justify-center rounded-md border bg-background hover:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring shrink-0"
        >
          {collapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </button>
      </div>

      <nav className="flex-1 overflow-auto py-2" aria-label="Điều hướng ứng dụng">
        {GROUP_ORDER.map((g) => {
          const items = grouped.get(g) ?? [];
          if (items.length === 0) return null;
          return (
            <div key={g} className="px-2 py-1">
              {!collapsed && <div className="px-2 py-1.5 text-[11px] font-semibold tracking-widest text-muted-foreground uppercase">{GROUP_LABEL[g]}</div>}
              <ul className="space-y-0.5">
                {items.map((a) => {
                  const Icon = a.icon;
                  const href = a.href.replace("/(shell)", "") || "/";
                  const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                  return (
                    <li key={a.id}>
                      <Link
                        href={href}
                        aria-current={active ? "page" : undefined}
                        onClick={onMobileClose}
                        className={cn(
                          "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                          active ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                          collapsed && "justify-center px-2"
                        )}
                        title={collapsed ? a.label : undefined}
                      >
                        <Icon className={cn("h-4 w-4 shrink-0", active ? "" : "opacity-80")} />
                        {!collapsed && <span className="flex-1 truncate font-medium">{a.label}</span>}
                        {!collapsed && a.badge ? (
                          <span className={cn("rounded px-1.5 py-0.5 text-[11px] font-medium", active ? "bg-white/20 text-white" : "bg-primary/10 text-primary")}>{a.badge}</span>
                        ) : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </nav>

      {!collapsed && (
        <div className="border-t p-3">
          <div className="rounded-lg bg-muted p-3">
            <div className="text-xs font-semibold">Cần hỗ trợ?</div>
            <div className="text-xs text-muted-foreground mt-1">Liên hệ IT Sơn Khang</div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        id="sidebar"
        aria-label="Sidebar"
        className={cn("hidden lg:flex shrink-0 flex-col border-r bg-card transition-all duration-200", collapsed ? "w-16" : "w-60")}
      >
        {nav}
      </aside>

      {/* Mobile drawer */}
      <div className={cn("lg:hidden", mobileOpen ? "fixed inset-0 z-40 flex" : "hidden")} aria-hidden={!mobileOpen}>
        <div className="fixed inset-0 bg-black/40 backdrop-blur-[1px]" onClick={onMobileClose} aria-hidden="true" />
        <aside className="relative flex w-[280px] max-w-[85vw] flex-col border-r bg-card shadow-xl animate-in slide-in-from-left duration-200">{nav}</aside>
      </div>
    </>
  );
}
