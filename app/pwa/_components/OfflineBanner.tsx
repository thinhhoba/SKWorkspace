"use client";
import { useEffect, useState } from "react";

export function OfflineBanner() {
  const [offline, setOffline] = useState(false);
  useEffect(() => {
    const upd = () => setOffline(!navigator.onLine);
    upd();
    window.addEventListener("online", upd);
    window.addEventListener("offline", upd);
    return () => {
      window.removeEventListener("online", upd);
      window.removeEventListener("offline", upd);
    };
  }, []);
  if (!offline) return null;
  return (
    <div
      id="offlineBanner"
      role="status"
      className="flex items-center gap-2 border bg-amber-50 px-4 py-2.5 text-sm font-medium text-amber-900 dark:bg-amber-950/30 dark:text-amber-200"
      style={{ borderColor: "var(--warning-bd, #FDE68A)" }}
    >
      <span className="h-2 w-2 shrink-0 animate-pulse rounded-full bg-amber-500" />
      Mất kết nối — đang dùng cache offline. Dữ liệu sẽ đồng bộ khi có mạng.
    </div>
  );
}
