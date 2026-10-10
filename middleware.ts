import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { sanitizeRedirect } from "@/lib/security";

// Inline RBAC route check to avoid importing heavy dependencies in Edge runtime
type Role = "ADMIN" | "ACCOUNTANT" | "WAREHOUSE" | "DRIVER";

const ACCOUNTANT_ALLOW = new Set([
  "dashboard",
  "sales",
  "sales:view",
  "customers",
  "pricing",
  "pricing:view",
  "pricing:edit",
  "finance",
  "finance:vietqr",
  "sapo2misa",
  "reports",
  "misa",
  "profile",
  "chat",
  "tasks",
  "docs",
]);

const WAREHOUSE_ALLOW = new Set([
  "dashboard",
  "sales",
  "sales:view",
  "sales:pick",
  "inventory",
  "inventory:view",
  "inventory:edit",
  "delivery",
  "delivery:view",
  "fleet",
  "fleet:view",
  "profile",
  "chat",
  "tasks",
  "docs",
]);

const DRIVER_ALLOW = new Set([
  "dashboard",
  "delivery",
  "delivery:view",
  "delivery:update",
  "fleet",
  "fleet:view",
  "pwa:giaovan",
  "profile",
  "chat",
]);

function canAccess(role: Role, resource: string): boolean {
  if (role === "ADMIN") return true;
  if (role === "ACCOUNTANT") return ACCOUNTANT_ALLOW.has(resource);
  if (role === "WAREHOUSE") return WAREHOUSE_ALLOW.has(resource);
  if (role === "DRIVER") return DRIVER_ALLOW.has(resource);
  return false;
}

function resourceForPath(pathname: string, method: string = "GET"): string | null {
  // Page routes (Most specific first)
  if (/^\/sales\/[^/]+\/pick(\/|$)/.test(pathname)) return "sales:pick";
  if (/^\/sales\/[^/]+\/edit(\/|$)/.test(pathname)) return "sales:edit";
  if (/^\/sales(\/|$)/.test(pathname)) return "sales:view";
  if (/^\/customers(\/|$)/.test(pathname)) return "customers";
  if (/^\/pricing(\/|$)/.test(pathname)) return "pricing:view";
  if (/^\/purchase(\/|$)/.test(pathname)) return "purchase";
  if (/^\/inventory(\/|$)/.test(pathname)) return "inventory:view";
  if (/^\/delivery(\/|$)/.test(pathname)) return "delivery:view";
  if (/^\/fleet(\/|$)/.test(pathname)) return "fleet:view";
  if (/^\/finance\/sapo2misa(\/|$)/.test(pathname)) return "sapo2misa";
  if (/^\/finance(\/|$)/.test(pathname)) return "finance";
  if (/^\/reports(\/|$)/.test(pathname)) return "reports";
  if (/^\/hr(\/|$)/.test(pathname)) return "hr";
  if (/^\/audit(\/|$)/.test(pathname)) return "audit";
  if (/^\/settings(\/|$)/.test(pathname)) return "settings";
  if (/^\/docs(\/|$)/.test(pathname)) return "docs";
  if (/^\/profile(\/|$)/.test(pathname)) return "profile";
  if (/^\/chat(\/|$)/.test(pathname)) return "chat";
  if (/^\/tasks(\/|$)/.test(pathname)) return "tasks";
  if (/^\/feed(\/|$)/.test(pathname)) return "dashboard";
  if (/^\/pwa\/giaovan(\/|$)/.test(pathname)) return "pwa:giaovan";
  if (/^\/pwa(\/|$)/.test(pathname)) return "pwa:giaovan";
  if (/^\/$/.test(pathname)) return "dashboard";

  // Backend API routes RBAC
  if (/^\/api\/feed(\/|$)/.test(pathname)) return "dashboard";
  if (/^\/api\/tasks(\/|$)/.test(pathname)) return "dashboard";
  if (/^\/api\/reports(\/|$)/.test(pathname)) return "reports";
  if (/^\/api\/pricing(\/|$)/.test(pathname)) return "pricing:view";
  if (/^\/api\/customers(\/|$)/.test(pathname)) return "customers";
  if (/^\/api\/delivery(\/|$)/.test(pathname)) return "delivery:view";
  if (/^\/api\/purchase(\/|$)/.test(pathname)) return "purchase";
  if (/^\/api\/inventory\/transfer(\/|$)/.test(pathname)) {
    return method === "POST" ? "inventory:edit" : "inventory:view";
  }
  if (/^\/api\/inventory(\/|$)/.test(pathname)) return "inventory:view";
  if (/^\/api\/sales\/[^/]+(\/|$)/.test(pathname)) {
    return method === "PATCH" || method === "PUT" ? "sales:edit" : "sales:view";
  }
  if (/^\/api\/sales(\/|$)/.test(pathname)) return "sales:view";
  if (/^\/api\/finance\/vietqr(\/|$)/.test(pathname)) return "finance:vietqr";
  if (/^\/api\/finance(\/|$)/.test(pathname)) return "finance";
  if (/^\/api\/fleet\/telemetry(\/|$)/.test(pathname)) return "fleet:telemetry:write";
  if (/^\/api\/fleet(\/|$)/.test(pathname)) return "fleet:view";
  if (/^\/api\/sapo(\/|$)/.test(pathname)) return "sapo2misa";

  return null; // unknown -> zero-leak deny for non-admin
}

function isPublic(pathname: string, method: string = "GET"): boolean {
  if (
    pathname === "/login" ||
    pathname.startsWith("/login/") ||
    pathname.startsWith("/api/auth") ||
    pathname.startsWith("/api/health") ||
    pathname === "/dathang" ||
    pathname.startsWith("/dathang/") ||
    pathname === "/pos" ||
    pathname.startsWith("/pos/") ||
    pathname.startsWith("/api/sapo/products") ||
    pathname === "/favicon.ico" ||
    pathname.startsWith("/assets/") ||
    pathname.startsWith("/_next/") ||
    pathname === "/manifest.json" ||
    pathname === "/sw.js" ||
    pathname.startsWith("/workbox-") ||
    pathname.startsWith("/icon") ||
    pathname.startsWith("/apple-touch")
  ) {
    return true;
  }

  // Khách đặt hàng công khai từ POS hoặc cổng /dathang được phép gửi đơn POST /api/sales
  // TUYỆT ĐỐI KHÔNG mở GET /api/sales (chứa toàn bộ danh sách đơn hàng và doanh thu công ty)
  if (pathname === "/api/sales" && method === "POST") {
    return true;
  }

  return false;
}

function decodeSessionFromToken(
  token: string
): { role: Role; id: string; username: string; name: string } | null {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return null;
    const payload = token.slice(0, dot);
    let b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    if (pad) b64 += "=".repeat(4 - pad);
    const json = Buffer.from(b64, "base64").toString("utf-8");
    const data = JSON.parse(json) as {
      role?: string;
      id?: string;
      username?: string;
      name?: string;
      exp?: number;
    };
    if (typeof data.exp === "number") {
      const expMs = data.exp < 1e12 ? data.exp * 1000 : data.exp;
      if (expMs <= Date.now()) return null;
    }
    const role = String(data.role || "").toUpperCase() as Role;
    if (["ADMIN", "ACCOUNTANT", "WAREHOUSE", "DRIVER"].includes(role)) {
      return {
        role,
        id: String(data.id || ""),
        username: String(data.username || ""),
        name: String(data.name || ""),
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const { pathname } = req.nextUrl;
  const method = req.method;

  if (host.startsWith("pos.sonkhang.vn")) {
    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = "/pos";
      return NextResponse.rewrite(url);
    }
  }
  if (host.startsWith("dathang.sonkhang.vn")) {
    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = "/dathang";
      return NextResponse.rewrite(url);
    }
  }

  if (isPublic(pathname, method)) return NextResponse.next();

  const token = req.cookies.get("sk_session")?.value;

  if (!token || !token.includes(".")) {
    // API -> 401 JSON, Page -> redirect to /login
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", sanitizeRedirect(req.nextUrl.pathname + req.nextUrl.search, "/"));
    return NextResponse.redirect(url);
  }

  // Decode session token for RBAC check
  const session = decodeSessionFromToken(token);
  if (!session) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: "Unauthorized — token invalid or expired" },
        { status: 401 }
      );
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", sanitizeRedirect(req.nextUrl.pathname + req.nextUrl.search, "/"));
    return NextResponse.redirect(url);
  }

  const { role } = session;

  // CRON_SECRET / service-to-service bypass for cron routes
  if (
    pathname.startsWith("/api/sapo/cron/") ||
    pathname.startsWith("/api/finance/vietqr") ||
    pathname.startsWith("/api/sapo/webhooks")
  ) {
    return NextResponse.next();
  }

  // RBAC check for protected routes
  const resource = resourceForPath(pathname, method);
  if (resource !== null && !canAccess(role, resource)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, error: `Forbidden — role ${role} cannot access ${resource}` },
        { status: 403 }
      );
    }
    // Page: redirect to role home with 403 param
    const url = req.nextUrl.clone();
    const fallback: Record<Role, string> = {
      ADMIN: "/",
      ACCOUNTANT: "/customers",
      WAREHOUSE: "/inventory",
      DRIVER: "/pwa/giaovan",
    };
    url.pathname = fallback[role] || "/login";
    url.searchParams.set("forbidden", "1");
    return NextResponse.redirect(url);
  }

  if (resource === null && role !== "ADMIN") {
    // Unknown route -> deny non-admin (zero-leak principle)
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Forbidden — unknown resource" }, { status: 403 });
    }
    return NextResponse.next();
  }

  // Truyền thông tin session qua request headers cho các API Route Handlers downstream
  const requestHeaders = new Headers(req.headers);
  requestHeaders.set("x-user-id", session.id);
  requestHeaders.set("x-user-role", session.role);
  requestHeaders.set("x-user-username", session.username);
  requestHeaders.set("x-user-name", encodeURIComponent(session.name));

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
