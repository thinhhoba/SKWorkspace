"use client";

import { useEffect, useState } from "react";
import { PWA_ROLES } from "@/packages/core/rbac";
import { cn } from "@/lib/utils";
import { usePwaRole } from "./RoleProvider";

const BADGE_TONE: Record<string, string> = {
  sky: "border-sky-200 bg-sky-100 text-sky-700 dark:border-sky-800 dark:bg-sky-950/50 dark:text-sky-300",
  amber: "border-amber-200 bg-amber-100 text-amber-800 dark:border-amber-800 dark:bg-amber-950/50 dark:text-amber-300",
  emerald: "border-emerald-200 bg-emerald-100 text-emerald-700 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300",
  rose: "border-rose-200 bg-rose-100 text-rose-700 dark:border-rose-800 dark:bg-rose-950/50 dark:text-rose-300",
};

export function RoleSwitcher() {
  const { role, setRole } = usePwaRole();
  const [open, setOpen] = useState(false);
  const current = PWA_ROLES.find((r) => r.id === role) ?? PWA_ROLES[0];

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="glossy-pill ml-auto flex min-h-[36px] items-center gap-1.5 px-2.5 text-xs font-semibold"
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        <span className={cn("rounded-full border px-1.5 py-0.5 text-[10px] font-bold", BADGE_TONE[current.tone])}>
          {current.badge}
        </span>
        <span className="max-w-[7rem] truncate">{current.label}</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="role-switcher-title">
          <button type="button" className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" aria-label="Đóng" onClick={() => setOpen(false)} />
          <div className="clay-card absolute inset-x-0 bottom-0 rounded-b-none p-4 pb-[max(16px,env(safe-area-inset-bottom))]">
            <h2 id="role-switcher-title" className="text-sm font-bold">
              Chọn vai trò
            </h2>
            <p className="mt-0.5 text-[11px] text-muted-foreground">Giao diện PWA đổi theo nhóm nhân sự Sơn Khang.</p>
            <div className="mt-3 grid gap-2">
              {PWA_ROLES.map((r) => {
                const active = r.id === role;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => {
                      setRole(r.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex min-h-[52px] items-center gap-3 rounded-2xl border border-white/70 bg-white/70 px-3 text-left dark:border-white/10 dark:bg-white/5",
                      active && "ring-2 ring-sky-400/70 shadow-[0_6px_16px_rgba(14,165,233,0.28)]"
                    )}
                  >
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-bold", BADGE_TONE[r.tone])}>{r.badge}</span>
                    <span className="text-sm font-semibold">{r.label}</span>
                    {active ? <span className="ml-auto text-[11px] font-bold text-sky-600">Đang dùng</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
