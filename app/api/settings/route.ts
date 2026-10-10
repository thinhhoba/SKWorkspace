import { NextRequest, NextResponse } from "next/server";
import { getSettings, updateSettings } from "@/packages/modules/settings/settingService";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const settings = getSettings();
    return NextResponse.json({ success: true, settings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi lấy cấu hình";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ success: false, error: "Body phải là object" }, { status: 400 });
    }
    const settings = updateSettings(body as Record<string, unknown>);
    return NextResponse.json({ success: true, settings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi cập nhật cấu hình";
    const status = message.includes("MST") || message.includes("Ngưỡng") ? 400 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
