import { NextRequest, NextResponse } from "next/server";
import { createFinanceTransaction } from "@/packages/modules/finance/financeService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const txn = createFinanceTransaction({
      type: body.type,
      category: body.category,
      amount: Number(body.amount),
      account: body.account,
      description: body.description,
      performer: body.performer,
    });
    return NextResponse.json({ success: true, transaction: txn }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi tạo phiếu";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
