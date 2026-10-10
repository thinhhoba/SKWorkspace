import { NextRequest, NextResponse } from "next/server";
import { getFinanceTransactions, getFinanceStats } from "@/packages/modules/finance/financeService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "ALL";
    const category = searchParams.get("category") || "ALL";
    const search = searchParams.get("search") || undefined;
    const transactions = getFinanceTransactions({ type, category, search });
    const stats = getFinanceStats();
    return NextResponse.json({ success: true, stats, count: transactions.length, transactions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi lấy dữ liệu tài chính";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
