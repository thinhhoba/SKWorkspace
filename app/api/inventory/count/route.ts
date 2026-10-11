import { NextRequest, NextResponse } from "next/server";
import {
  createSession,
  addLine,
  confirmAndAdjust,
  getSessions,
  getSessionById,
} from "@/packages/modules/inventory/auditService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const sessionId = req.nextUrl.searchParams.get("sessionId");
    if (sessionId) {
      const session = getSessionById(sessionId);
      if (!session) {
        return NextResponse.json({ success: false, error: "Không tìm thấy phiên kiểm kê" }, { status: 404 });
      }
      return NextResponse.json({ success: true, session });
    }
    const sessions = getSessions();
    return NextResponse.json({ success: true, sessions });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi hệ thống";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { zone, lines, createdBy } = body as {
      zone?: string;
      lines?: Array<{ sku: string; countedQty: number; reason?: string | null; note?: string }>;
      createdBy?: string;
    };

    if (!zone || (zone !== "kho_kho" && zone !== "kho_dong" && zone !== "all")) {
      return NextResponse.json(
        { success: false, error: "Thiếu hoặc sai zone (kho_kho | kho_dong | all)" },
        { status: 400 }
      );
    }
    if (!Array.isArray(lines) || lines.length === 0) {
      return NextResponse.json({ success: false, error: "Danh sách lines không được rỗng" }, { status: 400 });
    }

    const session = createSession(zone, createdBy);

    for (const l of lines) {
      if (!l.sku || typeof l.countedQty !== "number") {
        return NextResponse.json(
          { success: false, error: `Dòng thiếu sku hoặc countedQty: ${JSON.stringify(l)}` },
          { status: 400 }
        );
      }
      try {
        addLine(session.id, l.sku, l.countedQty, (l.reason as never) ?? null, l.note);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        return NextResponse.json({ success: false, error: msg }, { status: 400 });
      }
    }

    const updated = getSessionById(session.id);
    return NextResponse.json({ success: true, session: updated });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi tạo phiên kiểm kê";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { sessionId } = body as { sessionId?: string };
    if (!sessionId) {
      return NextResponse.json({ success: false, error: "Thiếu sessionId" }, { status: 400 });
    }
    const updated = confirmAndAdjust(sessionId);
    return NextResponse.json({ success: true, session: updated, message: `Đã xác nhận & cân chỉnh tồn kho ${updated.code}` });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi xác nhận phiên kiểm kê";
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
