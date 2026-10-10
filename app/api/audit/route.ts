import { NextRequest, NextResponse } from "next/server";
import { getAuditLogs, getAuditStats } from "@/packages/modules/audit/auditService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const module = searchParams.get("module") || "ALL";
    const actor = searchParams.get("actor") || "ALL";
    const level = searchParams.get("level") || "ALL";
    const search = searchParams.get("search") || undefined;
    const items = getAuditLogs({ module, actor, level, search });
    const stats = getAuditStats();
    return NextResponse.json({ success: true, stats, count: items.length, items });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi lấy nhật ký kiểm toán";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
