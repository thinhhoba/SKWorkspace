import { NextRequest, NextResponse } from "next/server";
import { togglePin } from "@/packages/modules/feed/feedService";

export const dynamic = "force-dynamic";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = togglePin(id);
  if (!result) return NextResponse.json({ success: false, error: "post not found" }, { status: 404 });
  return NextResponse.json({ success: true, ...result });
}
