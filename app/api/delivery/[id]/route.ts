import { NextRequest, NextResponse } from "next/server";
import { getDeliveryTripById, updateTripStatus, updateStopStatus, generateChanhXeSlip } from "@/packages/modules/delivery/deliveryService";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const trip = getDeliveryTripById(decodeURIComponent(id));
  if (!trip) return NextResponse.json({ success: false, error: "Không tìm thấy chuyến" }, { status: 404 });
  // ?slip=1 optionally returns text slip
  return NextResponse.json({ success: true, trip });
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const url = new URL(req.url);
    const body = await req.json().catch(() => ({}));

    // Generate slip: ?action=slip&stopId=...
    if (url.searchParams.get("action") === "slip" || body.action === "slip") {
      const text = generateChanhXeSlip(decodeURIComponent(id), body.stopId || url.searchParams.get("stopId") || undefined);
      return NextResponse.json({ success: true, text });
    }

    // Update stop status
    if (body.stopId && body.stopStatus) {
      const trip = updateStopStatus(decodeURIComponent(id), body.stopId, body.stopStatus);
      return NextResponse.json({ success: true, trip });
    }

    // Update trip status
    if (body.status) {
      const trip = updateTripStatus(decodeURIComponent(id), body.status);
      return NextResponse.json({ success: true, trip });
    }

    return NextResponse.json({ success: false, error: "Thiếu status hoặc stopId/stopStatus" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi cập nhật";
    const status = message.includes("Không tìm thấy") ? 404 : 400;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
