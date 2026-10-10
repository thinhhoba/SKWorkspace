/**
 * Security & Sanitization utilities for SK Workspace
 */

/**
 * Sanitize URL redirect parameter to prevent Open Redirect vulnerabilities.
 * Strictly allows only relative URLs within the same origin (starting with a single '/').
 * Blocks:
 * - External schemes (http:, https:, javascript:, data:, etc.)
 * - Protocol-relative URLs (//attacker.com)
 * - Backslash bypass attempts (/\attacker.com, \attacker.com)
 * - Control characters and CRLF
 */
export function sanitizeRedirect(
  target: string | null | undefined,
  fallback: string = "/"
): string {
  if (!target || typeof target !== "string") {
    return fallback;
  }

  const trimmed = target.trim();

  // Must begin with a single slash '/'
  if (!trimmed.startsWith("/") || trimmed.startsWith("//") || trimmed.startsWith("/\\")) {
    return fallback;
  }

  // Reject any embedded URL schemes (e.g., /?redirect=https://...)
  if (trimmed.includes("://")) {
    return fallback;
  }

  try {
    // Parse against a dummy base origin to verify safety
    const parsed = new URL(trimmed, "http://localhost");
    if (parsed.origin !== "http://localhost") {
      return fallback;
    }

    // Only allow pathname + search + hash
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return fallback;
  }
}

/**
 * Validates if a redirect URL is safe to use
 */
export function isValidRedirectUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  return sanitizeRedirect(url, "") !== "";
}
