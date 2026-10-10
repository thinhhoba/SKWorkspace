import { NextRequest, NextResponse } from "next/server";
import { getDeliveryTrips, getDeliveryStats, createDeliveryTrip } from "@/packages/modules/delivery/deliveryService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const route_type = searchParams.get("route_type") || "ALL";
    const status = searchParams.get("status") || "ALL";
    const search = searchParams.get("search") || undefined;
    const trips = getDeliveryTrips({ route_type, status, search });
    const stats = getDeliveryStats();
    return NextResponse.json({ success: true, stats, count: trips.length, trips });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi lấy danh sách chuyến";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const trip = createDeliveryTrip({
      route_type: body.route_type,
      license_plate: body.license_plate,
      stops: body.stops,
    });
    return NextResponse.json({ success: true, trip }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi tạo chuyến";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
