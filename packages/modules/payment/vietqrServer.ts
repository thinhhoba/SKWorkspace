/**
 * Server-only: HMAC-SHA256 verify cho VietQR webhook.
 * Tách riêng để không bundle node:crypto vào client.
 */
export async function verifyVietQrSignatureServer(rawBody: string, signature: string | null): Promise<boolean> {
  const secret = process.env.VIETQR_SECRET;
  if (!secret) return true;
  if (!signature) return false;
  const { createHmac, timingSafeEqual } = await import("node:crypto");
  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
