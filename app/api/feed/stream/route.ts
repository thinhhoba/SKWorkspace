import { NextResponse } from "next/server";
import { getStream } from "@/packages/modules/feed/feedService";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = getStream();
  return NextResponse.json({ success: true, items });
}
