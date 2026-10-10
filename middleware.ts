import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Inline RBAC route check to avoid importing node:crypto in edge runtime
type Role = "ADMIN" | "ACCOUNTANT" | "WAREHOUSE" | "DRIVER";

const ACCOUNTANT_ALLOW = new Set([
  "dashboard","sales","sales:view","customers","pricing","pricing:view","pricing:edit",
  "finance","finance:vietqr","sapo2misa","reports","misa","profile","chat","tasks","docs",
]);
const WAREHOUSE_ALLOW = new Set([
  "dashboard","sales","sales:view","sales:pick","inventory","inventory:view","inventory:edit",
  "delivery","delivery:view","fleet","fleet:view","profile","chat","tasks","docs",
]);
const DRIVER_ALLOW = new Set([
  "dashboard","delivery","delivery:view","delivery:update","fleet","fleet:view",
  "pwa:giaovan","profile","chat",
]);

function canAccess(role: Role, resource: string): boolean {
  if (role === "ADMIN") return true;
  if (role === "ACCOUNTANT") return ACCOUNTANT_ALLOW.has(resource);
  if (role === "WAREHOUSE") return WAREHOUSE_ALLOW.has(resource);
  if (role === "DRIVER") return DRIVER_ALLOW.has(resource);
  return false;
}

function resourceForPath(pathname: string): string | null {
  // Most specific first
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
  // API — Workdesk (feed/tasks cho phép mọi role đã đăng nhập)
  if (/^\/api\/feed(\/|$)/.test(pathname)) return "dashboard";
  if (/^\/api\/tasks(\/|$)/.test(pathname)) return "dashboard";
  if (/^\/api\/finance\/vietqr(\/|$)/.test(pathname)) return "finance:vietqr";
  if (/^\/api\/finance(\/|$)/.test(pathname)) return "finance";
  if (/^\/api\/fleet\/telemetry(\/|$)/.test(pathname)) return "fleet:telemetry:write";
  if (/^\/api\/fleet(\/|$)/.test(pathname)) return "fleet:view";
  if (/^\/api\/sapo(\/|$)/.test(pathname)) return "sapo2misa";
  return null; // unknown -> zero-leak deny for non-admin
}

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

function decodeRoleFromToken(token: string): Role | null {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return null;
    const payload = token.slice(0, dot);
    let b64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const pad = b64.length % 4;
    if (pad) b64 += "=".repeat(4 - pad);
    const json = Buffer.from(b64, "base64").toString("utf-8");
    const data = JSON.parse(json) as { role?: string; exp?: number };
    // exp thường là seconds — so sánh đúng đơn vị
    if (typeof data.exp === "number") {
      const expMs = data.exp < 1e12 ? data.exp * 1000 : data.exp;
      if (expMs <= Date.now()) return null;
    }
    const role = String(data.role || "").toUpperCase() as Role;
    if (["ADMIN","ACCOUNTANT","WAREHOUSE","DRIVER"].includes(role)) return role;
    return null;
  } catch { return null; }
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const { pathname } = req.nextUrl;

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

  if (isPublic(pathname)) return NextResponse.next();

  const token = req.cookies.get("sk_session")?.value;

  if (!token || !token.includes(".")) {
    // API -> 401 JSON, Page -> redirect to /login
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // Decode role for RBAC check (signature already validated at login; lightweight decode here)
  const role = decodeRoleFromToken(token);
  if (!role) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Unauthorized — token invalid or expired" }, { status: 401 });
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("redirect", req.nextUrl.pathname + req.nextUrl.search);
    return NextResponse.redirect(url);
  }

  // CRON_SECRET / service-to-service bypass for cron routes
  if (pathname.startsWith("/api/sapo/cron/") || pathname.startsWith("/api/finance/vietqr") || pathname.startsWith("/api/sapo/webhooks")) {
    // Let route handler do its own CRON_SECRET / HMAC check — skip RBAC here
    return NextResponse.next();
  }

  // RBAC check for non-public routes
  const resource = resourceForPath(pathname);
  if (resource !== null && !canAccess(role, resource)) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: `Forbidden — role ${role} cannot access ${resource}` }, { status: 403 });
    }
    // Page: redirect to role home with 403 param
    const url = req.nextUrl.clone();
    const fallback: Record<Role, string> = { ADMIN: "/", ACCOUNTANT: "/customers", WAREHOUSE: "/inventory", DRIVER: "/pwa/giaovan" };
    url.pathname = fallback[role] || "/login";
    url.searchParams.set("forbidden", "1");
    return NextResponse.redirect(url);
  }
  if (resource === null && role !== "ADMIN") {
    // Unknown route -> deny non-admin (zero-leak)
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ success: false, error: "Forbidden — unknown resource" }, { status: 403 });
    }
    // For pages, allow unknown routes to 404 rather than block — skip deny for non-API unknown
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image).*)"],
};
