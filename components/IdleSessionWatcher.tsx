"use client";

import { useEffect, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";

// Thời gian chờ không hoạt động: 30 phút (1,800,000 ms)
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
// Kiểm tra chu kỳ mỗi 15 giây
const CHECK_INTERVAL_MS = 15 * 1000;

const PUBLIC_PATHS = ["/login", "/pos", "/dathang"];

export function IdleSessionWatcher() {
  const pathname = usePathname();
  const router = useRouter();
  const lastActiveRef = useRef<number>(Date.now());

  useEffect(() => {
    // Không áp dụng cho các trang công cộng hoặc đang ở màn hình login
    if (PUBLIC_PATHS.some((p) => pathname === p || pathname?.startsWith(p + "/"))) {
      return;
    }

    const resetTimer = () => {
      lastActiveRef.current = Date.now();
    };

    // Lắng nghe các tương tác của người dùng (chuột, bàn phím, chạm màn hình cảm ứng kho)
    const events = ["mousedown", "mousemove", "keydown", "touchstart", "scroll", "click"];
    let throttleTimer: NodeJS.Timeout | null = null;

    const handleUserActivity = () => {
      if (!throttleTimer) {
        resetTimer();
        throttleTimer = setTimeout(() => {
          throttleTimer = null;
        }, 2000); // Throttle 2s để tối ưu hiệu năng
      }
    };

    for (const ev of events) {
      window.addEventListener(ev, handleUserActivity, { passive: true });
    }

    // Interval kiểm tra thời gian nhàn rỗi
    const interval = setInterval(async () => {
      const idleTime = Date.now() - lastActiveRef.current;
      if (idleTime >= IDLE_TIMEOUT_MS) {
        clearInterval(interval);
        try {
          await fetch("/api/auth/logout", { method: "POST" });
        } catch {
          // Ignore network errors during logout
        }
        router.push("/login?reason=idle_timeout");
      }
    }, CHECK_INTERVAL_MS);

    return () => {
      for (const ev of events) {
        window.removeEventListener(ev, handleUserActivity);
      }
      clearInterval(interval);
      if (throttleTimer) clearTimeout(throttleTimer);
    };
  }, [pathname, router]);

  return null;
}
