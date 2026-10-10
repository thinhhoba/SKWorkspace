// lib/rateLimit.ts — In-memory sliding window rate limiter cho endpoint nhạy cảm (Next.js App Router)

interface RateLimitRecord {
  count: number;
  resetAt: number; // Unix timestamp tính theo ms
}

class MemoryRateLimiter {
  private records: Map<string, RateLimitRecord> = new Map();
  private cleanupTimer: ReturnType<typeof setInterval> | null = null;

  constructor() {
    // Dọn dẹp định kỳ 60s để tránh memory leak
    if (typeof setInterval !== "undefined") {
      this.cleanupTimer = setInterval(() => {
        const now = Date.now();
        for (const [key, record] of this.records.entries()) {
          if (record.resetAt <= now) {
            this.records.delete(key);
          }
        }
      }, 60_000);
      if (this.cleanupTimer && typeof this.cleanupTimer === "object" && "unref" in this.cleanupTimer) {
        this.cleanupTimer.unref();
      }
    }
  }

  /**
   * Kiểm tra và tăng số lần thử
   * @param key IP hoặc khóa định danh
   * @param maxAttempts Số lần tối đa cho phép trong khoảng thời gian windowMs
   * @param windowMs Thời gian của cửa sổ tính bằng milliseconds
   */
  check(key: string, maxAttempts: number = 5, windowMs: number = 60_000): {
    success: boolean;
    remaining: number;
    resetInSeconds: number;
  } {
    const now = Date.now();
    const existing = this.records.get(key);

    if (!existing || existing.resetAt <= now) {
      // Cửa sổ mới
      this.records.set(key, { count: 1, resetAt: now + windowMs });
      return {
        success: true,
        remaining: maxAttempts - 1,
        resetInSeconds: Math.ceil(windowMs / 1000),
      };
    }

    if (existing.count >= maxAttempts) {
      return {
        success: false,
        remaining: 0,
        resetInSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
      };
    }

    existing.count += 1;
    return {
      success: true,
      remaining: maxAttempts - existing.count,
      resetInSeconds: Math.max(1, Math.ceil((existing.resetAt - now) / 1000)),
    };
  }

  /**
   * Reset bộ đếm khi đăng nhập thành công
   */
  reset(key: string): void {
    this.records.delete(key);
  }
}

// Giữ singleton trong globalThis để không bị reset khi HMR dev
const globalForLimiter = globalThis as unknown as { loginLimiter?: MemoryRateLimiter };
export const loginRateLimiter = globalForLimiter.loginLimiter ?? new MemoryRateLimiter();
if (process.env.NODE_ENV !== "production") {
  globalForLimiter.loginLimiter = loginRateLimiter;
}
