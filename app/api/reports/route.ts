import { NextRequest, NextResponse } from "next/server";
import { getReport } from "@/packages/modules/reports/reportService";
import type { ReportPeriod } from "@/packages/modules/reports/types";

export async function GET(req: NextRequest) {
  try {
    const p = (req.nextUrl.searchParams.get("period") as ReportPeriod) || "month";
    const data = getReport(p);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
