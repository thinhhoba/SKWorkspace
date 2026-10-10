// packages/core/rbac.ts — RBAC cho SK Workspace 2 (Chỉ thị 15 / Worker 6)
// 4 vai trò thực tế: admin / ke_toan / thu_kho / tai_xe
// Map với auth.ts Role: ADMIN / ACCOUNTANT / WAREHOUSE / DRIVER

export type Role = "ADMIN" | "ACCOUNTANT" | "WAREHOUSE" | "DRIVER";

// Alias tiếng Việt cho spec D15
export type VietnameseRole = "admin" | "ke_toan" | "thu_kho" | "tai_xe";

export const VI_ROLE_MAP: Record<VietnameseRole, Role> = {
  admin: "ADMIN",
  ke_toan: "ACCOUNTANT",
  thu_kho: "WAREHOUSE",
  tai_xe: "DRIVER",
};

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: "Hồ Bá Thịnh (admin)",
  ACCOUNTANT: "Hoàng Thị Nho (ke_toan)",
  WAREHOUSE: "Trần Thị Ngọc Thúy (thu_kho)",
  DRIVER: "Ngô Văn Tân — 0942 22 60 60 (tai_xe)",
};

// ---------------------------------------------------------------------------
// Resource definitions — zero-leak principle
// ---------------------------------------------------------------------------
export type Resource =
  | "dashboard"
  | "sales"
  | "sales:view"
  | "sales:edit"
  | "sales:pick"
  | "customers"
  | "pricing"
  | "pricing:view"
  | "pricing:edit"
  | "purchase"
  | "inventory"
  | "inventory:view"
  | "inventory:edit"
  | "delivery"
  | "delivery:view"
  | "delivery:update"
  | "fleet"
  | "fleet:view"
  | "fleet:telemetry:write"
  | "finance"
  | "finance:vietqr"
  | "sapo2misa"
  | "reports"
  | "misa"
  | "hr"
  | "audit"
  | "settings"
  | "docs"
  | "pwa:giaovan"
  | "profile"
  | "chat"
  | "tasks";

/**
 * Ma trận phân quyền — mỗi role được liệt kê resource được phép.
 * ADMIN: wildcard (*)
 */
const ROLE_RESOURCES: Record<Role, Set<Resource | "*">> = {
  ADMIN: new Set(["*"] as const),
  ACCOUNTANT: new Set<Resource>([
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
  ]),
  WAREHOUSE: new Set<Resource>([
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
  ]),
  DRIVER: new Set<Resource>([
    "dashboard",
    "delivery",
    "delivery:view",
    "delivery:update",
    "fleet",
    "fleet:view",
    "pwa:giaovan",
    "profile",
    "chat",
  ]),
};

// ---------------------------------------------------------------------------
// Route -> Resource mapping (dùng cho middleware + getAllowedRoutes)
// ---------------------------------------------------------------------------
export interface RouteRule {
  pattern: RegExp;
  resource: Resource;
  /** Mô tả route để hiển thị trong getAllowedRoutes */
  route: string;
}

export const ROUTE_RULES: RouteRule[] = [
  { pattern: /^\/$/, resource: "dashboard", route: "/" },
  { pattern: /^\/sales\/[^/]+\/pick(\/|$)/, resource: "sales:pick", route: "/sales/[id]/pick" },
  { pattern: /^\/sales\/[^/]+\/edit(\/|$)/, resource: "sales:edit", route: "/sales/[id]/edit" },
  { pattern: /^\/sales(\/|$)/, resource: "sales:view", route: "/sales" },
  { pattern: /^\/customers(\/|$)/, resource: "customers", route: "/customers" },
  { pattern: /^\/pricing(\/|$)/, resource: "pricing:view", route: "/pricing" },
  { pattern: /^\/purchase(\/|$)/, resource: "purchase", route: "/purchase" },
  { pattern: /^\/inventory(\/|$)/, resource: "inventory:view", route: "/inventory" },
  { pattern: /^\/delivery(\/|$)/, resource: "delivery:view", route: "/delivery" },
  { pattern: /^\/fleet(\/|$)/, resource: "fleet:view", route: "/fleet" },
  { pattern: /^\/finance\/sapo2misa(\/|$)/, resource: "sapo2misa", route: "/finance/sapo2misa" },
  { pattern: /^\/finance(\/|$)/, resource: "finance", route: "/finance" },
  { pattern: /^\/reports(\/|$)/, resource: "reports", route: "/reports" },
  { pattern: /^\/hr(\/|$)/, resource: "hr", route: "/hr" },
  { pattern: /^\/audit(\/|$)/, resource: "audit", route: "/audit" },
  { pattern: /^\/settings(\/|$)/, resource: "settings", route: "/settings" },
  { pattern: /^\/docs(\/|$)/, resource: "docs", route: "/docs" },
  { pattern: /^\/profile(\/|$)/, resource: "profile", route: "/profile" },
  { pattern: /^\/chat(\/|$)/, resource: "chat", route: "/chat" },
  { pattern: /^\/tasks(\/|$)/, resource: "tasks", route: "/tasks" },
  { pattern: /^\/feed(\/|$)/, resource: "dashboard", route: "/feed" },
  { pattern: /^\/pwa\/giaovan(\/|$)/, resource: "pwa:giaovan", route: "/pwa/giaovan" },
  { pattern: /^\/pwa(\/|$)/, resource: "pwa:giaovan", route: "/pwa" },
  // API routes
  { pattern: /^\/api\/reports(\/|$)/, resource: "reports", route: "/api/reports" },
  { pattern: /^\/api\/pricing(\/|$)/, resource: "pricing:view", route: "/api/pricing" },
  { pattern: /^\/api\/inventory(\/|$)/, resource: "inventory:view", route: "/api/inventory" },
  { pattern: /^\/api\/finance\/vietqr(\/|$)/, resource: "finance:vietqr", route: "/api/finance/vietqr" },
  { pattern: /^\/api\/finance(\/|$)/, resource: "finance", route: "/api/finance" },
  { pattern: /^\/api\/fleet\/telemetry(\/|$)/, resource: "fleet:telemetry:write", route: "/api/fleet/telemetry" },
  { pattern: /^\/api\/fleet(\/|$)/, resource: "fleet:view", route: "/api/fleet" },
  { pattern: /^\/api\/sales(\/|$)/, resource: "sales:view", route: "/api/sales" },
  { pattern: /^\/api\/sapo(\/|$)/, resource: "sapo2misa", route: "/api/sapo" },
];

// Routes that are public (no auth needed) — đồng bộ với middleware isPublic
export const PUBLIC_ROUTE_PATTERNS: RegExp[] = [
  /^\/login(\/|$)/,
  /^\/dathang(\/|$)/,
  /^\/pos(\/|$)/,
  /^\/api\/auth(\/|$)/,
  /^\/api\/health(\/|$)/,
  /^\/api\/sapo\/products(\/|$)/,
  /^\/favicon\.ico$/,
  /^\/manifest\.json$/,
  /^\/sw\.js$/,
];

// ---------------------------------------------------------------------------
// Core helpers
// ---------------------------------------------------------------------------
export function canAccess(role: Role, resource: Resource): boolean {
  const allowed = ROLE_RESOURCES[role];
  if (!allowed) return false;
  if (allowed.has("*")) return true;
  if (allowed.has(resource)) return true;
  // Hierarchical fallback: e.g. "pricing:view" implies check "pricing"
  // But NOT reverse — having "pricing" does not imply "pricing:edit"
  // We handle specific hierarchical grants below.
  return false;
}

/** Check if role can access a URL pathname */
export function canAccessRoute(role: Role, pathname: string): boolean {
  // Public routes always allowed
  if (PUBLIC_ROUTE_PATTERNS.some((re) => re.test(pathname))) return true;
  // ADMIN bypass
  if (role === "ADMIN") return true;
  // Find matching route rule (first match wins — ordered most-specific first)
  for (const rule of ROUTE_RULES) {
    if (rule.pattern.test(pathname)) {
      return canAccess(role, rule.resource);
    }
  }
  // Unknown route: deny for non-admin by default (zero-leak)
  return false;
}

export function getAllowedRoutes(role: Role): string[] {
  if (role === "ADMIN") {
    return [...new Set(ROUTE_RULES.map((r) => r.route))];
  }
  const allowed: string[] = [];
  for (const rule of ROUTE_RULES) {
    if (canAccess(role, rule.resource) && !allowed.includes(rule.route)) {
      allowed.push(rule.route);
    }
  }
  return allowed;
}

export function getAllowedResources(role: Role): Resource[] {
  const set = ROLE_RESOURCES[role];
  if (!set) return [];
  if (set.has("*" as Resource)) {
    // Return all resources for ADMIN
    const all = new Set<Resource>();
    for (const r of Object.values(ROLE_RESOURCES)) {
      for (const v of r) if (v !== "*") all.add(v as Resource);
    }
    return [...all];
  }
  return [...set] as Resource[];
}

// ---------------------------------------------------------------------------
// Legacy compat — hasAppAccess (used by shell layout)
// ---------------------------------------------------------------------------
export interface RbacUser {
  role: Role;
  allowedApps: string[];
}

/** Map Resource -> appId for legacy shell check */
const RESOURCE_TO_APP: Record<string, string> = {
  dashboard: "dashboard",
  sales: "sales",
  customers: "customers",
  pricing: "pricing",
  purchase: "purchase",
  inventory: "inventory",
  delivery: "delivery",
  finance: "finance",
  sapo2misa: "sapo2misa",
  reports: "reports",
  misa: "sapo2misa",
  hr: "hr",
  audit: "audit",
  settings: "settings",
  docs: "docs",
  fleet: "fleet",
};

export function hasAppAccess(user: RbacUser | null | undefined, appId: string): boolean {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
  // Check via resource mapping
  const resource = Object.entries(RESOURCE_TO_APP).find(([, app]) => app === appId)?.[0] as Resource | undefined;
  if (resource && canAccess(user.role, resource)) return true;
  // Fallback to allowedApps list
  return user.allowedApps.includes(appId);
}

/** Mock user for shell dev (before Auth.js wire). Replace with session user in prod. */
export const mockRbacUser: RbacUser = {
  role: "ADMIN",
  allowedApps: [
    "dashboard",
    "sales",
    "customers",
    "pricing",
    "purchase",
    "inventory",
    "delivery",
    "finance",
    "sapo2misa",
    "reports",
    "hr",
    "docs",
    "audit",
    "settings",
  ],
};

/** PWA persona — độc lập với Role shell (ADMIN/MANAGER/STAFF/VIEWER). */
export type PwaRole = "admin" | "accountant" | "warehouse" | "delivery";

export const PWA_ROLES: { id: PwaRole; label: string; badge: string; tone: string }[] = [
  { id: "admin", label: "Giám đốc", badge: "ADMIN", tone: "sky" },
  { id: "accountant", label: "Kế toán", badge: "KT", tone: "amber" },
  { id: "warehouse", label: "Kho lạnh", badge: "KHO", tone: "emerald" },
  { id: "delivery", label: "Giao hàng", badge: "SHIP", tone: "rose" },
];
