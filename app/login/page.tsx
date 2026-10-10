"use client";

import React, { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  Loader2,
  ShieldAlert,
  Phone,
  Mail,
  Clock,
  HelpCircle,
  X,
  CheckCircle2,
} from "lucide-react";
import { sanitizeRedirect } from "@/lib/security";

const ROLE_REDIRECT: Record<string, string> = {
  ADMIN: "/",
  ACCOUNTANT: "/customers",
  WAREHOUSE: "/inventory",
  DRIVER: "/pwa/giaovan",
};

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            <span>Đang tải SK Workspace...</span>
          </div>
        </main>
      }
    >
      <LoginContent />
    </Suspense>
  );
}

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");
  const reasonParam = searchParams.get("reason");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [showHelp, setShowHelp] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(
    reasonParam === "idle_timeout"
      ? "Phiên làm việc đã tự động kết thúc sau 30 phút không thao tác để bảo vệ an toàn kho hàng."
      : null
  );

  // Bộ đếm ngược khi bị Rate Limiting (HTTP 429)
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          setErrorMessage(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  // Xử lý gửi biểu mẫu
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading || cooldown > 0) return;

    if (!username.trim() || !password) {
      setErrorMessage("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.");
      return;
    }

    setErrorMessage(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: username.trim(),
          password,
          rememberMe,
        }),
      });

      const data = await response.json().catch(() => null);

      if (response.status === 429) {
        const retryAfter = Number(data?.retryAfter) || 60;
        setCooldown(retryAfter);
        setErrorMessage(
          data?.error || `Bạn đã thử quá số lần quy định. Vui lòng thử lại sau ${retryAfter} giây.`
        );
        return;
      }

      if (!response.ok || !data?.success) {
        // Luôn trả về thông báo chung để chống tấn công rà quét tài khoản (CWE-200)
        setErrorMessage(data?.error || "Tên đăng nhập hoặc mật khẩu không chính xác.");
        return;
      }

      const role: string | undefined = data?.user?.role;
      const serverRedirect: string | undefined = data?.redirect;
      const fallback = role ? ROLE_REDIRECT[role] ?? "/" : "/";

      // Chống lỗ hổng Open Redirect: Sanitize và chỉ cho phép relative URL an toàn
      const target = sanitizeRedirect(redirectParam || serverRedirect, fallback);

      router.push(target);
      router.refresh();
    } catch {
      setErrorMessage("Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại đường truyền mạng.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
        
        {/* 1. Header & Typography chuẩn Semantic */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 mb-3 shadow-sm ring-1 ring-blue-500/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/logo-sk-circle.png"
              alt="Sơn Khang Food"
              width={48}
              height={48}
              className="h-12 w-12 rounded-full object-cover"
            />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight [text-wrap:balance]">
            SK Workspace
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-medium [text-wrap:balance]">
            Hệ thống điều hành — Thực Phẩm Sơn Khang
          </p>
        </div>

        {/* 2. Banner cảnh báo lỗi chung (Accessible Live Region) */}
        {errorMessage && (
          <div
            role="alert"
            aria-live="polite"
            className="mb-5 p-3.5 rounded-lg bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 flex items-start gap-3 text-red-700 dark:text-red-300 text-sm"
          >
            <ShieldAlert className="w-5 h-5 flex-shrink-0 text-red-500 mt-0.5" />
            <span className="font-medium leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {/* 3. Biểu mẫu đăng nhập chuẩn WCAG & Virtual Keyboard */}
        <form onSubmit={handleSubmit} method="POST" className="space-y-4" noValidate={false}>
          
          {/* Tên đăng nhập */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5"
            >
              Tên đăng nhập
            </label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                id="username"
                name="username"
                type="text"
                required
                autoComplete="username"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                placeholder="Mã nhân viên hoặc Email"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isLoading}
                className="w-full pl-10 pr-3.5 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-500"
              />
            </div>
          </div>

          {/* Mật khẩu */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-slate-700 dark:text-slate-300"
              >
                Mật khẩu
              </label>
              <button
                type="button"
                onClick={() => setShowHelp(true)}
                className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 hover:underline"
              >
                Quên mật khẩu?
              </button>
            </div>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errorMessage) setErrorMessage(null);
                }}
                disabled={isLoading}
                className="w-full pl-10 pr-10 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-colors disabled:bg-slate-50 dark:disabled:bg-slate-800/50 disabled:text-slate-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiển thị mật khẩu"}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Tiện ích Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-xs text-slate-600 dark:text-slate-400 font-medium">
                Duy trì đăng nhập (thiết bị cá nhân)
              </span>
            </label>
          </div>

          {/* 4. Nút bấm chuẩn WCAG Contrast Ratio 8.5:1 (Vượt chuẩn AAA) */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading || cooldown > 0 || !username || !password}
              className="w-full py-2.5 px-4 rounded-lg font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2 shadow-sm
                bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800
                disabled:bg-slate-200 dark:disabled:bg-slate-800 disabled:text-slate-400 dark:disabled:text-slate-600 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Đang xác thực...</span>
                </>
              ) : cooldown > 0 ? (
                <span>Thử lại sau {cooldown}s</span>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </div>
        </form>

        {/* 5. Cụm Quick Login (CHỈ render trên Development / Staging) */}
        {process.env.NODE_ENV !== "production" && (
          <div className="mt-8 pt-6 border-t border-dashed border-amber-300 dark:border-amber-900 bg-amber-50/60 dark:bg-amber-950/20 -mx-6 -mb-6 sm:-mx-8 sm:-mb-8 p-4 rounded-b-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-amber-800 dark:text-amber-400 tracking-wider uppercase">
                🛠 [DEV ONLY] Chọn nhanh tài khoản
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { role: "Giám đốc", user: "admin" },
                { role: "Kế toán", user: "ketoan" },
                { role: "Thủ kho", user: "thukho" },
                { role: "Tài xế", user: "taixe" },
              ].map((item) => (
                <button
                  key={item.user}
                  type="button"
                  onClick={() => {
                    setUsername(item.user);
                    setPassword("sk@123456");
                  }}
                  className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-amber-200 dark:border-amber-800 rounded text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-amber-100/50 text-left truncate"
                >
                  <span className="font-semibold text-amber-900 dark:text-amber-300">{item.role}:</span> {item.user}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Footer ghi nhận hỗ trợ */}
        <div className="mt-6 text-center text-xs text-slate-400">
          Hỗ trợ kỹ thuật nội bộ: <span className="font-medium text-slate-600 dark:text-slate-300">Ext 101</span> (P. CNTT)
        </div>
      </div>

      {/* Modal Hỗ trợ IT / Quên mật khẩu tự phục vụ */}
      {showHelp && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="help-modal-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
          <div className="w-full max-w-md rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-900 dark:text-slate-100">
                <HelpCircle className="h-5 w-5 text-blue-600" />
                <h2 id="help-modal-title" className="text-base font-bold">
                  Trung Tâm Hỗ Trợ Kỹ Thuật SK
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200"
                aria-label="Đóng hộp thoại hỗ trợ"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
              <p>
                Để bảo vệ an toàn thông tin doanh nghiệp (báo giá sỉ, công nợ, tồn kho), tài khoản SK Workspace được quản lý tập trung theo phân quyền RBAC.
              </p>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-3 space-y-2">
                <div className="font-semibold text-slate-900 dark:text-slate-100">Đường dây nóng hỗ trợ 24/7:</div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span>Hotline điều hành: <strong>0942 22 60 60</strong></span>
                </div>
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <Phone className="h-4 w-4 text-blue-600" />
                  <span>Máy lẻ P. CNTT: <strong>(024) 22 60 60 60 (ext 101)</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-600" />
                  <span>Email IT: <strong>it@sonkhang.vn</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Trực ban ca kho sáng sớm: <strong>04:00 – 22:00 hàng ngày</strong></span>
                </div>
              </div>

              <div className="rounded-xl border border-amber-200 bg-amber-50/70 dark:border-amber-900/50 dark:bg-amber-950/40 p-3 text-amber-900 dark:text-amber-200">
                <div className="font-semibold flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-amber-600" />
                  Lưu ý thiết bị dùng chung tại kho lạnh:
                </div>
                <p className="mt-1 text-[11px] leading-relaxed">
                  Thiết bị tại bàn cân kho sẽ tự động đăng xuất sau 30 phút không thao tác. Vui lòng không lưu mật khẩu trên trình duyệt của máy tính dùng chung.
                </p>
              </div>
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="w-full rounded-xl bg-slate-100 dark:bg-slate-800 py-2.5 text-xs font-semibold text-slate-800 dark:text-slate-200 transition hover:bg-slate-200 dark:hover:bg-slate-700"
              >
                Đã hiểu
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
