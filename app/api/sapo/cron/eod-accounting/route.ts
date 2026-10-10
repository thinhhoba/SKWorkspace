import { NextRequest, NextResponse } from "next/server";
import { runEndOfDayAccounting } from "@/packages/integrations/sapo/sapoHubService";

export const dynamic = "force-dynamic";

/**
 * /api/sapo/cron/eod-accounting
 * Hạch toán cuối ngày 18:00 — gom đơn Sapo thành 63 cột MISA AMIS
 * - GET: Vercel Cron (header x-cron-secret hoặc Authorization Bearer)
 * - POST: Manual trigger từ UI (cho phép nếu không có CRON_SECRET, hoặc check header nếu có)
 */

function isAuthorized(req: NextRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  // Nếu chưa cấu hình CRON_SECRET thì từ chối (tránh mở EOD cho bất kỳ ai)
  if (!cronSecret) return false;
  const headerSecret = req.headers.get("x-cron-secret");
  if (headerSecret && headerSecret === cronSecret) return true;
  const auth = req.headers.get("authorization");
  if (auth === `Bearer ${cronSecret}`) return true;
  // Vercel Cron gửi x-vercel-cron: 1 — chỉ chấp nhận giá trị "1" hoặc "true"
  const vercelCron = req.headers.get("x-vercel-cron");
  if (vercelCron === "1" || vercelCron === "true") return true;
  return false;
}

async function handleEod(req: NextRequest) {
  if (!isAuthorized(req)) {
    return NextResponse.json({ success: false, error: "Unauthorized — thiếu CRON_SECRET hợp lệ" }, { status: 401 });
  }
  try {
    const result = await runEndOfDayAccounting();
    const status = result.success ? 200 : 422;
    return NextResponse.json({ ...result, executed_at: new Date().toISOString() }, { status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi hạch toán cuối ngày";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return handleEod(req);
}

export async function GET(req: NextRequest) {
  return handleEod(req);
}
