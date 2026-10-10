import { NextRequest, NextResponse } from "next/server";
import { getReport } from "@/packages/modules/reports/reportService";
import type { ReportPeriod } from "@/packages/modules/reports/types";

export async function GET(req: NextRequest) {
  try {
    const role = req.headers.get("x-user-role");
    if (role && role !== "ADMIN" && role !== "ACCOUNTANT") {
      return NextResponse.json(
        { success: false, error: "Chỉ Kế toán và Ban Giám đốc mới có quyền truy cập báo cáo tài chính & doanh thu" },
        { status: 403 }
      );
    }
    const p = (req.nextUrl.searchParams.get("period") as ReportPeriod) || "month";
    const data = getReport(p);
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
