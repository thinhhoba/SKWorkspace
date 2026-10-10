import { NextRequest, NextResponse } from "next/server";
import { fetchEnrichedCustomers } from "@/packages/integrations/sapo/customerSync";

/**
 * POST /api/sapo/customers/sync
 * Kich hoat dong bo danh muc khach hang moi tu Sapo ve SK Workspace
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const limit = Math.min(parseInt(String(body.limit || "50"), 10) || 50, 100);

    const customers = await fetchEnrichedCustomers(limit);

    // Thong ke theo nhom B2B
    const byGroup: Record<string, number> = {};
    for (const c of customers) byGroup[c.b2b_group] = (byGroup[c.b2b_group] || 0) + 1;

    return NextResponse.json({
      success: true,
      synced: customers.length,
      by_group: byGroup,
      customers,
      synced_at: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Loi dong bo khach hang Sapo";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
