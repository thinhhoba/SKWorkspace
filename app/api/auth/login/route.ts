import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { authenticate, createSessionToken, roleRedirectPath } from "@/packages/core/auth";
import { loginRateLimiter } from "@/lib/rateLimit";
import { sanitizeRedirect } from "@/lib/security";

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }
  return req.headers.get("x-real-ip") || "127.0.0.1";
}

const GENERIC_AUTH_ERROR = "Tài khoản hoặc mật khẩu không chính xác.";

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // 1. Kiểm tra Rate Limiting (chống brute-force / dò quét tự động)
    const rateCheck = loginRateLimiter.check(ip, 5, 60_000);
    if (!rateCheck.success) {
      return NextResponse.json(
        {
          success: false,
          error: `Bạn đã thử đăng nhập sai quá nhiều lần. Vui lòng thử lại sau ${rateCheck.resetInSeconds} giây.`,
          retryAfter: rateCheck.resetInSeconds,
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(rateCheck.resetInSeconds),
          },
        }
      );
    }

    const body = await req.json().catch(() => null);
    const rawUsername: string = typeof body?.username === "string" ? body.username : "";
    const password: string = typeof body?.password === "string" ? body.password : "";
    const rememberMe: boolean = Boolean(body?.rememberMe);
    const username = rawUsername.trim().toLowerCase();

    // 2. Validate input & authenticate với thông báo lỗi an toàn (Generic Error)
    if (!username || !password) {
      return NextResponse.json({ success: false, error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    const user = await authenticate(username, password);
    if (!user) {
      return NextResponse.json({ success: false, error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    // 3. Đăng nhập thành công -> Reset bộ đếm rate limit
    loginRateLimiter.reset(ip);

    // 4. Quản lý thời hạn phiên:
    // Ca làm việc tại kho / máy tính chung mặc định: 12 giờ (1 shift)
    // Thiết bị cá nhân có tick "Duy trì đăng nhập": tối đa 7 ngày
    const sessionDurationSeconds = rememberMe ? 7 * 24 * 3600 : 12 * 3600;
    const token = await createSessionToken(user, sessionDurationSeconds);

    const cookieStore = await cookies();
    cookieStore.set("sk_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: sessionDurationSeconds,
    });

    const safeRedirect = sanitizeRedirect(roleRedirectPath(user.role), "/");

    return NextResponse.json({
      success: true,
      user,
      redirect: safeRedirect,
    });
  } catch {
    return NextResponse.json({ success: false, error: GENERIC_AUTH_ERROR }, { status: 401 });
  }
}
