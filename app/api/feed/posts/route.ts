import { NextRequest, NextResponse } from "next/server";
import { getPosts, createPost } from "@/packages/modules/feed/feedService";
import type { FeedTag } from "@/packages/modules/feed/types";

export const dynamic = "force-dynamic";

export async function GET() {
  const posts = getPosts();
  return NextResponse.json({ success: true, posts });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const content = typeof body.content === "string" ? body.content.trim() : "";
  const tag = (body.tag as FeedTag) ?? "thong-bao";
  if (!content) {
    return NextResponse.json({ success: false, error: "content is required" }, { status: 400 });
  }
  const post = createPost({ content, tag, author: body.author });
  return NextResponse.json({ success: true, post }, { status: 201 });
}
