import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { verifySessionToken } from "@/packages/core/auth";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("sk_session")?.value;
  if (!token) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  const user = await verifySessionToken(token);
  if (!user) {
    return NextResponse.json({ success: false }, { status: 401 });
  }
  return NextResponse.json({ success: true, user });
}
