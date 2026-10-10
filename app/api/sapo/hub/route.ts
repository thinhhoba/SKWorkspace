import { NextResponse } from "next/server";
import { getSapoHubTelemetry } from "@/packages/integrations/sapo/sapoHubService";

export async function GET() {
  try {
    const data = await getSapoHubTelemetry();
    return NextResponse.json({ success: true, ...data, generated_at: new Date().toISOString() });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Loi lay telemetry Sapo Hub";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
