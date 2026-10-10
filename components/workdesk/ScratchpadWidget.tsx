"use client";
import * as React from "react";
import { Pin } from "lucide-react";

const KEY = "sk_scratchpad";

export default function ScratchpadWidget() {
  const [value, setValue] = React.useState("");
  const [hydrated, setHydrated] = React.useState(false);

  React.useEffect(() => {
    try {
      const saved = localStorage.getItem(KEY);
      if (saved) setValue(saved);
    } catch {}
    setHydrated(true);
  }, []);

  const timerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  function onChange(v: string) {
    setValue(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try { localStorage.setItem(KEY, v); } catch {}
    }, 500);
  }

  return (
    <div className="clay-card p-4 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold flex items-center gap-1.5"><Pin className="w-3.5 h-3.5 text-amber-500" /> So ghi chu nhanh</span>
        <span className="text-[10px] text-muted-foreground">{hydrated ? "Tu luu local" : "..."}</span>
      </div>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Ghi chu nhanh..."
        rows={4}
        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
        style={{ minHeight: 80 }}
      />
    </div>
  );
}
