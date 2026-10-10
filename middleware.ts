import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isPublic(pathname: string): boolean {
  return (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/health") ||
    pathname === "/dathang" ||
    pathname.startsWith("/dathang/") ||
    pathname === "/pos" ||
    pathname.startsWith("/pos/") ||
    pathname.startsWith("/api/sales") ||
    pathname.startsWith("/api/sapo/products") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname.startsWith("/workbox-") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/apple-touch")
  );
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const { pathname } = req.nextUrl;

  // Subdomain routing for pos.sonkhang.vn
  if (host.startsWith("pos.sonkhang.vn")) {
    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = "/pos";
      return NextResponse.rewrite(url);
    }
  }

  // Subdomain routing for dathang.sonkhang.vn
  if (host.startsWith("dathang.sonkhang.vn")) {
    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = "/dathang";
      return NextResponse.rewrite(url);
    }
  }

  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get("sk_session")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  if (!token.includes(".")) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
