import { NextRequest, NextResponse } from "next/server";
import { toggleLike } from "@/packages/modules/feed/feedService";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const userId = typeof body.userId === "string" && body.userId.trim() ? body.userId.trim() : "me";
  const result = toggleLike(id, userId);
  if (!result) return NextResponse.json({ success: false, error: "post not found" }, { status: 404 });
  return NextResponse.json({ success: true, ...result });
}
