export type Role = "ADMIN" | "MANAGER" | "STAFF" | "VIEWER";

export interface RbacUser {
  role: Role;
  allowedApps: string[];
}

/** ADMIN passes all, else check allowedApps includes appId */
export function hasAppAccess(user: RbacUser | null | undefined, appId: string): boolean {
  if (!user) return false;
  if (user.role === "ADMIN") return true;
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
