"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { appRegistry } from "@/packages/core/appRegistry";
import { hasAppAccess, mockRbacUser } from "@/packages/core/rbac";
import { Search } from "lucide-react";

export function CommandPalette({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const router = useRouter();
  const [q, setQ] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => clearTimeout(t);
    } else setQ("");
  }, [open]);

  const results = React.useMemo(() => {
    const term = q.trim().toLowerCase();
    const apps = appRegistry.filter((a) => hasAppAccess(mockRbacUser, a.id));
    if (!term) return apps.slice(0, 8);
    return apps.filter(
      (a) => a.label.toLowerCase().includes(term) || a.id.toLowerCase().includes(term) || a.desc.toLowerCase().includes(term)
    );
  }, [q]);

  function go(href: string) {
    onOpenChange(false);
    // appRegistry href may contain "(shell)" prefix — normalize
    const clean = href.replace("/(shell)", "") || "/";
    router.push(clean);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[20%] translate-y-0 p-0 gap-0 max-w-[560px] overflow-hidden sm:rounded-xl">
        <DialogTitle className="sr-only">Tìm kiếm nhanh</DialogTitle>
        <div className="flex items-center gap-2 border-b px-3">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm app, đơn hàng, KH, NCC… (VD: Sapo2Misa, Bán hàng)"
            className="h-12 border-0 shadow-none focus-visible:ring-0 px-2"
          />
          <kbd className="hidden sm:inline-flex h-6 items-center rounded border bg-muted px-1.5 text-[11px] font-mono text-muted-foreground">ESC</kbd>
        </div>
        <div className="max-h-[320px] overflow-auto p-2">
          {results.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Không tìm thấy kết quả</p>
          ) : (
            <ul role="listbox" aria-label="Kết quả tìm kiếm">
              {results.map((a) => {
                const Icon = a.icon;
                return (
                  <li key={a.id}>
                    <button
                      role="option"
                      onClick={() => go(a.href)}
                      className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-left hover:bg-muted focus-visible:bg-muted focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium leading-none">{a.label}</span>
                        <span className="block truncate text-xs text-muted-foreground">{a.desc}</span>
                      </span>
                      {a.badge ? (
                        <span className="rounded bg-primary/10 px-1.5 py-0.5 text-[11px] font-medium text-primary">{a.badge}</span>
                      ) : null}
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <div className="border-t bg-muted/50 px-3 py-2 text-[11px] text-muted-foreground">Nhấn Enter để mở · Esc để đóng · Cmd+K để mở nhanh</div>
      </DialogContent>
    </Dialog>
  );
}
