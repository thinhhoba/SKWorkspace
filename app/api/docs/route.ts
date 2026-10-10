import { NextRequest, NextResponse } from "next/server";
import { getDocStats, getDocs } from "@/packages/modules/docs/docService";
import type { DocCategory } from "@/packages/modules/docs/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = (searchParams.get("category") || "ALL") as DocCategory | "ALL";
    const search = searchParams.get("search") || undefined;
    const docs = getDocs({ category, search });
    const stats = getDocStats();
    return NextResponse.json({ success: true, stats, count: docs.length, docs });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi lấy danh mục văn bản";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
