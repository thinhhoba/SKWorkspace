"use client";
import * as React from "react";
import { useTheme } from "next-themes";
import { Search, Sun, Moon, Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function Clock() {
  const [now, setNow] = React.useState<Date | null>(null);
  React.useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 60_000);
    return () => clearInterval(id);
  }, []);
  if (!now) return <span className="font-mono text-xs text-muted-foreground tabular-nums">--:-- --/--</span>;
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  // getDay 0=Sun
  const d = days[now.getDay()];
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const mo = String(now.getMonth() + 1).padStart(2, "0");
  return <span className="font-mono text-xs text-muted-foreground tabular-nums">{d} {hh}:{mm} · {dd}/{mo}</span>;
}

export function Topbar({
  onMenuClick,
  onOpenPalette,
  collapsed,
}: {
  onMenuClick: () => void;
  onOpenPalette: () => void;
  collapsed: boolean;
}) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  return (
    <header
      id="topbar"
      className="glossy-glass flex h-14 shrink-0 items-center gap-2 border-b border-white/80 bg-white/75 px-3 backdrop-blur-md md:px-4 sticky top-0 z-20 supports-[backdrop-filter]:bg-white/75 dark:bg-slate-900/60 dark:border-white/10"
    >
      <Button variant="ghost" size="icon" className="lg:hidden shrink-0" aria-label="Mở menu" onClick={onMenuClick}>
        <Menu className="h-5 w-5" />
      </Button>

      <div className="flex items-center gap-2 min-w-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground text-[11px] font-extrabold tracking-wide shrink-0">
          SK
        </div>
        <div className="hidden sm:block min-w-0">
          <div className="text-sm font-semibold leading-none">SK Workspace</div>
          <div className="text-[11px] text-muted-foreground leading-none mt-0.5">Thực Phẩm Sơn Khang</div>
        </div>
        <span className="hidden md:inline text-muted-foreground mx-1">/</span>
        <span className="hidden md:inline text-sm text-muted-foreground truncate">Tổng quan</span>
      </div>

      <div className="flex-1 flex justify-center px-2 md:px-6 max-w-[560px] mx-auto">
        <button
          onClick={onOpenPalette}
          className="glossy-pill flex w-full items-center gap-2 rounded-full border-white/80 bg-white/90 px-4 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur-sm hover:bg-white focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-left dark:bg-white/10 dark:border-white/10 dark:hover:bg-white/15"
          aria-label="Mở tìm kiếm nhanh Cmd K"
        >
          <Search className="h-4 w-4 shrink-0" />
          <span className="hidden sm:inline truncate">Tìm app, đơn hàng, KH, NCC…</span>
          <span className="sm:hidden truncate">Tìm kiếm…</span>
          <span className="ml-auto hidden md:inline-flex items-center gap-1">
            <kbd className="rounded-full border border-white/80 bg-white px-1.5 py-0.5 text-[11px] font-mono shadow-sm dark:bg-white/10 dark:border-white/10">⌘K</kbd>
          </span>
        </button>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <span className="hidden lg:inline mr-1">
          <Clock />
        </span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Đổi giao diện"
          aria-pressed={mounted ? theme === "dark" : false}
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="h-9 w-9"
          title={mounted && theme === "dark" ? "Chế độ tối — nhấn để chuyển sáng" : "Chế độ sáng — nhấn để chuyển tối"}
        >
          {mounted && theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </Button>
        <div className="hidden sm:flex items-center gap-2 pl-2 ml-1 border-l">
          <div className="h-8 w-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary">HT</div>
          <div className="hidden md:block leading-none">
            <div className="text-sm font-medium">Hồ Bá Thịnh</div>
            <div className="text-[11px] text-muted-foreground">ADMIN</div>
          </div>
        </div>
      </div>
    </header>
  );
}
