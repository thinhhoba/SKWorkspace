import { NextResponse } from "next/server";
import { getSuppliers } from "@/packages/modules/purchase/purchaseService";

export async function GET() {
  try {
    const suppliers = getSuppliers();
    return NextResponse.json({ success: true, suppliers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi lấy NCC";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
