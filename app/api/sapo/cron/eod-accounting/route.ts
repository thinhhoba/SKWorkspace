import { NextRequest, NextResponse } from "next/server";
import { runEndOfDayAccounting } from "@/packages/integrations/sapo/sapoHubService";

/**
 * POST /api/sapo/cron/eod-accounting
 * Hach toan cuoi ngay 18:00 — gom don Sapo thanh 63 cot MISA AMIS
 * Co the duoc goi boi cron (Vercel Cron / BullMQ) hoac nut "Doi soat MISA ngay"
 */
export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    // Neu CRON_SECRET duoc cau hinh thi yeu cau Bearer token (cho cron job), nhung van cho phep goi tu UI neu khong co secret
    if (cronSecret && authHeader && authHeader !== `Bearer ${cronSecret}`) {
      // van cho qua neu la goi tu UI (khong co cron header) — chi chan khi gui sai secret
      const isCronCall = req.headers.get("x-cron-trigger") === "true";
      if (isCronCall) {
        return NextResponse.json({ success: false, error: "Unauthorized cron trigger" }, { status: 401 });
      }
    }

    const result = await runEndOfDayAccounting();
    const status = result.success ? 200 : 422;
    return NextResponse.json({ ...result, executed_at: new Date().toISOString() }, { status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Loi hach toan cuoi ngay";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

// Cho phep GET de cron don gian (vercel cron mac dinh GET)
export async function GET(req: NextRequest) {
  return POST(req);
}
