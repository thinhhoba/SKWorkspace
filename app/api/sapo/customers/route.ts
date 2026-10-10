import { NextRequest, NextResponse } from "next/server";
import { fetchEnrichedCustomers } from "@/packages/integrations/sapo/customerSync";

/**
 * GET /api/sapo/customers
 * Lay danh sach khach hang dong bo tu Sapo kem tong no & lich su don
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = Math.min(parseInt(searchParams.get("limit") || "50", 10) || 50, 100);
    const group = searchParams.get("group"); // QUAN_AN | CHANH_XE | CAN_TIN | BAN_LE
    const search = (searchParams.get("search") || "").toLowerCase();

    let customers = await fetchEnrichedCustomers(limit);

    if (group) customers = customers.filter((c) => c.b2b_group === group);
    if (search) {
      customers = customers.filter(
        (c) =>
          c.name.toLowerCase().includes(search) ||
          c.code.toLowerCase().includes(search) ||
          c.phone.includes(search),
      );
    }

    const totalDebt = customers.reduce((s, c) => s + c.debt_amount, 0);

    return NextResponse.json({
      success: true,
      count: customers.length,
      total_debt: totalDebt,
      customers,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Loi lay danh sach khach hang Sapo";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
