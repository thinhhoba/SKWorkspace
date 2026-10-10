import { NextRequest, NextResponse } from "next/server";
import { getCustomers, getDebtSummary } from "@/packages/modules/customers/customerService";
import type { DebtAgingBucket, RiskLevel, CustomerType } from "@/packages/modules/customers/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || undefined;
    const customer_type = (searchParams.get("customer_type") || "ALL") as CustomerType | "ALL";
    const aging = (searchParams.get("aging") || "ALL") as DebtAgingBucket | "ALL";
    const risk = (searchParams.get("risk") || "ALL") as RiskLevel | "ALL";
    const overdueOnly = searchParams.get("overdueOnly") === "true";

    const customers = getCustomers({ search, customer_type, aging, risk, overdueOnly });
    const summary = getDebtSummary();

    return NextResponse.json({
      success: true,
      summary,
      count: customers.length,
      customers,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi lấy danh sách khách hàng";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
