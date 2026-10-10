import { NextRequest, NextResponse } from "next/server";
import { getPostById, addComment } from "@/packages/modules/feed/feedService";

export const dynamic = "force-dynamic";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const post = getPostById(id);
  if (!post) return NextResponse.json({ success: false, error: "post not found" }, { status: 404 });
  return NextResponse.json({ success: true, comments: post.comments });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const content = typeof body.content === "string" ? body.content.trim() : "";
  if (!content) return NextResponse.json({ success: false, error: "content is required" }, { status: 400 });
  const comment = addComment(id, { content, author: body.author, parentId: body.parentId ?? null });
  if (!comment) return NextResponse.json({ success: false, error: "post not found" }, { status: 404 });
  return NextResponse.json({ success: true, comment }, { status: 201 });
}
