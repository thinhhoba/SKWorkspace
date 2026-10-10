import { NextRequest, NextResponse } from "next/server";
import { markSapoOrderFulfilled } from "@/packages/integrations/sapo/fulfillmentSync";

/**
 * POST /api/sapo/fulfillment/update
 * Cập nhật trạng thái fulfilled ngược lại Sapo khi tài xế giao thành công trên PWA.
 * Body: { sapoOrderId: number, trackingNumber: string }
 */
export async function POST(req: NextRequest) {
  let body: { sapoOrderId?: number; trackingNumber?: string };
  try {
    const text = await req.text();
    if (!text) {
      return NextResponse.json({ success: false, error: "Thiếu body JSON" }, { status: 400 });
    }
    body = JSON.parse(text) as typeof body;
  } catch {
    return NextResponse.json({ success: false, error: "Body JSON không hợp lệ" }, { status: 400 });
  }

  if (!body.sapoOrderId || typeof body.sapoOrderId !== "number") {
    return NextResponse.json({ success: false, error: "Thiếu hoặc sai kiểu sapoOrderId (number)" }, { status: 400 });
  }
  if (!body.trackingNumber || typeof body.trackingNumber !== "string" || !body.trackingNumber.trim()) {
    return NextResponse.json({ success: false, error: "Thiếu trackingNumber" }, { status: 400 });
  }

  const result = await markSapoOrderFulfilled(body.sapoOrderId, body.trackingNumber.trim());

  if (!result.success) {
    return NextResponse.json({ success: false, error: result.message, result }, { status: 502 });
  }

  return NextResponse.json({ success: true, result });
}
