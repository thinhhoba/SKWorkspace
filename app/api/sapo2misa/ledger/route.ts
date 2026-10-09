import { NextResponse } from "next/server";
import { getExportedLedger } from "@/packages/integrations/misa/ledgerDb";

export async function GET() {
  try {
    const ledger = getExportedLedger();
    return NextResponse.json({
      success: true,
      count: ledger.length,
      ledger
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      { status: 500 }
    );
  }
}
