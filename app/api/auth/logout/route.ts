import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();
  // Next 15: cookies().delete + fallback maxAge 0 for compatibility
  try {
    cookieStore.delete("sk_session");
  } catch {
    cookieStore.set("sk_session", "", { path: "/", maxAge: 0 });
  }
  // Ensure cleared even if delete succeeded (belt-and-suspenders)
  cookieStore.set("sk_session", "", { path: "/", maxAge: 0 });
  return NextResponse.json({ success: true });
}
