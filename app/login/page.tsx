"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, Lock, Eye, EyeOff } from "lucide-react";
import { Input } from "@/components/ui/input";

type RolePreset = {
  key: string;
  label: string;
  icon: string;
  username: string;
  password: string;
};

const PRESETS: RolePreset[] = [
  { key: "ADMIN", label: "GĐ: Hồ Bá Thịnh", icon: "👑", username: "admin", password: "sk@123456" },
  { key: "ACCOUNTANT", label: "KT: Hoàng Thị Nho", icon: "📊", username: "ketoan", password: "sk@123456" },
  { key: "WAREHOUSE", label: "Kho: Trần Thị Ngọc Thúy", icon: "📦", username: "thukho", password: "sk@123456" },
  { key: "DRIVER", label: "Tài xế: Ngô Văn Tân", icon: "🚚", username: "taixe", password: "sk@123456" },
];

const ROLE_REDIRECT: Record<string, string> = {
  ADMIN: "/",
  ACCOUNTANT: "/customers",
  WAREHOUSE: "/inventory",
  DRIVER: "/pwa/giaovan",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-dvh items-center justify-center">Đang tải...</div>}>
      <LoginInner />
    </Suspense>
  );
}

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectParam = searchParams.get("redirect");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);

  function fillPreset(p: RolePreset) {
    setUsername(p.username);
    setPassword(p.password);
    setActivePreset(p.key);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (loading) return;
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.success) {
        setError(data?.error || "Sai tài khoản hoặc mật khẩu");
        return;
      }
      const role: string | undefined = data?.user?.role;
      const serverRedirect: string | undefined = data?.redirect;
      const fallback = role ? ROLE_REDIRECT[role] ?? "/" : "/";
      const target = redirectParam || serverRedirect || fallback;
      router.push(target);
      router.refresh();
    } catch {
      setError("Không kết nối được máy chủ");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-sky-50 via-white to-indigo-50 p-4 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
      <div className="clay-card w-full max-w-[420px] rounded-3xl border border-white/80 p-6 shadow-xl md:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/logo-sk-circle.png"
            alt="Sơn Khang Food"
            width={64}
            height={64}
            className="h-16 w-16 rounded-full object-cover shadow-md ring-2 ring-white/80"
          />
          <h1 className="mt-4 text-sm font-bold tracking-wide text-foreground">
            SƠN KHANG FOOD — HỆ THỐNG ĐIỀU HÀNH NỘI BỘ
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">Thực Phẩm Sơn Khang</p>
        </div>

        {/* Quick role selector */}
        <div className="mb-5">
          <p className="mb-2 text-center text-xs font-medium text-muted-foreground">Chọn nhanh vai trò</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {PRESETS.map((p) => {
              const active = activePreset === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => fillPreset(p)}
                  className={
                    "glossy-pill flex flex-col items-center justify-center gap-1 rounded-full border bg-white/80 px-2 py-2.5 text-xs font-semibold transition-all hover:scale-[1.02] active:scale-[0.98] " +
                    (active ? "ring-2 ring-primary ring-offset-1" : "")
                  }
                >
                  <span className="text-base leading-none">{p.icon}</span>
                  <span>{p.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username */}
          <div className="relative">
            <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Tên đăng nhập"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setActivePreset(null);
              }}
              className="h-11 rounded-full border-input bg-white/70 pl-10 pr-4 dark:bg-slate-800/50"
              autoComplete="username"
              autoFocus
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type={showPw ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setActivePreset(null);
              }}
              className="h-11 rounded-full border-input bg-white/70 pl-10 pr-10 dark:bg-slate-800/50"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPw((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:text-foreground"
              aria-label={showPw ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
              tabIndex={-1}
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>

          {error ? (
            <p className="rounded-lg bg-rose-50 p-2 text-center text-sm text-rose-600 dark:bg-rose-950/40 dark:text-rose-300">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="glossy-btn flex min-h-[48px] w-full items-center justify-center rounded-full bg-primary px-6 font-bold text-white shadow transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:pointer-events-none"
          >
            {loading ? "Đang đăng nhập..." : "Đăng nhập"}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-muted-foreground">
          Gặp sự cố? Liên hệ IT — ext 101
        </p>
      </div>
    </div>
  );
}
