// packages/core/auth.ts — SK Workspace Auth (HMAC SHA-256 session token + DEFAULT_USERS + DB fallback)
export type Role = "ADMIN" | "ACCOUNTANT" | "WAREHOUSE" | "DRIVER";

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: Role;
  warehouse?: string | null;
}

const AUTH_SECRET: string = process.env.AUTH_SECRET || "sk-workspace-dev-secret-2026";

// ---------------------------------------------------------------------------
// base64url helpers
// ---------------------------------------------------------------------------
function b64urlEncode(input: string): string {
  const b64 =
    typeof Buffer !== "undefined"
      ? Buffer.from(input, "utf-8").toString("base64")
      : btoa(unescape(encodeURIComponent(input)));
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function b64urlDecode(input: string): string {
  let b64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4;
  if (pad) b64 += "=".repeat(4 - pad);
  if (typeof Buffer !== "undefined") {
    return Buffer.from(b64, "base64").toString("utf-8");
  }
  // browser fallback
  return decodeURIComponent(
    Array.from(atob(b64))
      .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
      .join(""),
  );
}

// ---------------------------------------------------------------------------
// HMAC SHA-256 — Web Crypto subtle nếu có, fallback DJB2 đơn giản cho dev
// ---------------------------------------------------------------------------
async function hmacSha256(data: string, secret: string): Promise<string> {
  const subtle: SubtleCrypto | undefined =
    typeof globalThis !== "undefined" ? (globalThis as unknown as { crypto?: Crypto }).crypto?.subtle : undefined;

  if (subtle) {
    try {
      const enc = new TextEncoder();
      const key = await subtle.importKey(
        "raw",
        enc.encode(secret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const sig = await subtle.sign("HMAC", key, enc.encode(data));
      const bytes = new Uint8Array(sig);
      let b64: string;
      if (typeof Buffer !== "undefined") {
        b64 = Buffer.from(bytes).toString("base64");
      } else {
        let bin = "";
        for (const b of bytes) bin += String.fromCharCode(b);
        b64 = btoa(bin);
      }
      return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
    } catch {
      // fall through to DJB2
    }
  }

  // Fallback DJB2 — đủ cho dev, deterministic & verify được
  let h1 = 5381;
  let h2 = 0x6d2b_79f5;
  const combined = data + "." + secret;
  for (let i = 0; i < combined.length; i++) {
    const c = combined.charCodeAt(i);
    h1 = ((h1 << 5) + h1 + c) >>> 0; // h1 * 33 + c
    h2 = ((h2 << 5) - h2 + c) >>> 0; // h2 * 31 + c  (variant)
  }
  // trộn 2 hash thành 8 byte hex rồi base64url — deterministic
  const hex =
    h1.toString(16).padStart(8, "0") +
    h2.toString(16).padStart(8, "0") +
    (h1 ^ h2).toString(16).padStart(8, "0") +
    ((h1 >>> 1) ^ h2).toString(16).padStart(8, "0");
  // hex -> bytes -> base64url
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) bytes.push(parseInt(hex.slice(i, i + 2), 16));
  let b64: string;
  if (typeof Buffer !== "undefined") {
    b64 = Buffer.from(bytes).toString("base64");
  } else {
    b64 = btoa(String.fromCharCode(...bytes));
  }
  return b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

// ---------------------------------------------------------------------------
// Session token: payload(sig payload = base64url JSON).sig(HMAC)
// ---------------------------------------------------------------------------
export async function createSessionToken(user: AuthUser, expiresInSeconds: number = 7 * 24 * 3600): Promise<string> {
  const raw = JSON.stringify({ ...user, exp: Date.now() + expiresInSeconds * 1000 });
  const payload = b64urlEncode(raw);
  const sig = await hmacSha256(payload, AUTH_SECRET);
  return payload + "." + sig;
}

export async function verifySessionToken(token: string): Promise<AuthUser | null> {
  try {
    const dot = token.lastIndexOf(".");
    if (dot === -1) return null;
    const payload = token.slice(0, dot);
    const sig = token.slice(dot + 1);
    const expected = await hmacSha256(payload, AUTH_SECRET);
    if (sig !== expected) return null;
    const json = b64urlDecode(payload);
    const data = JSON.parse(json) as AuthUser & { exp: number };
    if (typeof data.exp !== "number" || data.exp <= Date.now()) return null;
    const { exp: _exp, ...user } = data;
    void _exp;
    return user as AuthUser;
  } catch {
    return null;
  }
}

/** Alias theo spec cũ (nếu có code gọi signToken) */
export async function signToken(payload: string): Promise<string> {
  return hmacSha256(payload, AUTH_SECRET);
}

// ---------------------------------------------------------------------------
// Default users
// ---------------------------------------------------------------------------
export const DEFAULT_USERS: Array<AuthUser & { password: string; full_name: string }> = [
  { id: "u1", username: "admin", password: "sk@123456", name: "Hồ Bá Thịnh", full_name: "Hồ Bá Thịnh", role: "ADMIN", warehouse: null },
  { id: "u2", username: "ketoan", password: "sk@123456", name: "Hoàng Thị Nho", full_name: "Hoàng Thị Nho", role: "ACCOUNTANT", warehouse: null },
  { id: "u3", username: "thukho", password: "sk@123456", name: "Trần Thị Ngọc Thúy", full_name: "Trần Thị Ngọc Thúy", role: "WAREHOUSE", warehouse: "Hà Nội" },
  { id: "u4", username: "taixe", password: "sk@123456", name: "Ngô Văn Tân", full_name: "Ngô Văn Tân", role: "DRIVER", warehouse: null },
];

/**
 * Constant-time string comparison to prevent Timing Attacks (CWE-208) on authentication.
 */
export function timingSafeEqualStr(a: string, b: string): boolean {
  if (typeof a !== "string" || typeof b !== "string") return false;
  const maxLen = Math.max(a.length, b.length);
  let diff = a.length === b.length ? 0 : 1;
  for (let i = 0; i < maxLen; i++) {
    const charA = i < a.length ? a.charCodeAt(i) : 0;
    const charB = i < b.length ? b.charCodeAt(i) : 0;
    diff |= charA ^ charB;
  }
  return diff === 0;
}

// ---------------------------------------------------------------------------
// authenticate — thử Prisma trước, fallback DEFAULT_USERS
// ---------------------------------------------------------------------------
export async function authenticate(username: string, password: string): Promise<AuthUser | null> {
  // Thử Prisma nếu có DATABASE_URL (dynamic import để không crash khi DB thiếu)
  if (process.env.DATABASE_URL) {
    try {
      const { prisma } = await import("./db");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const row = await (prisma as any).user.findUnique({ where: { username } });
      if (row) {
        const hash: string | null | undefined = row.password_hash ?? row.passwordHash ?? row.password;
        const ok =
          timingSafeEqualStr(hash || "", password) ||
          timingSafeEqualStr(hash || "", "hashed_" + password);
        if (ok) {
          const u: AuthUser = {
            id: String(row.id),
            username: String(row.username),
            name: String(row.name ?? row.full_name ?? row.username),
            role: String(row.role ?? "DRIVER").toUpperCase() as Role,
            warehouse: (row.warehouse as string | null) ?? null,
          };
          return u;
        }
        // sai mật khẩu DB -> vẫn cho fallback DEFAULT_USERS nếu trùng username
      }
    } catch {
      // DB fail -> fallback
    }
  }

  const found = DEFAULT_USERS.find(
    (u) => u.username === username && timingSafeEqualStr(u.password, password)
  );
  if (!found) return null;
  const { password: _pw, full_name: _fn, ...user } = found;
  void _pw;
  void _fn;
  return user as AuthUser;
}

// ---------------------------------------------------------------------------
// roleRedirectPath
// ---------------------------------------------------------------------------
export function roleRedirectPath(role: Role): string {
  switch (role) {
    case "ADMIN":
      return "/";
    case "ACCOUNTANT":
      return "/customers";
    case "WAREHOUSE":
      return "/inventory";
    case "DRIVER":
      return "/pwa/giaovan";
    default:
      return "/";
  }
}
