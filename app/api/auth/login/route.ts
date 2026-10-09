import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { authenticate, createSessionToken, roleRedirectPath } from "@/packages/core/auth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const rawUsername: string = typeof body?.username === "string" ? body.username : "";
    const password: string = typeof body?.password === "string" ? body.password : "";
    const username = rawUsername.trim().toLowerCase();

    if (!username || !password) {
      return NextResponse.json({ success: false, error: "Sai tài khoản hoặc mật khẩu" }, { status: 401 });
    }

    const user = await authenticate(username, password);
    if (!user) {
      return NextResponse.json({ success: false, error: "Sai tài khoản hoặc mật khẩu" }, { status: 401 });
    }

    const token = await createSessionToken(user);
    const cookieStore = await cookies();
    cookieStore.set("sk_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 3600,
    });

    return NextResponse.json({ success: true, user, redirect: roleRedirectPath(user.role) });
  } catch {
    return NextResponse.json({ success: false, error: "Sai tài khoản hoặc mật khẩu" }, { status: 401 });
  }
}
