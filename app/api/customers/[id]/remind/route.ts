import { NextRequest, NextResponse } from "next/server";
import { generateZaloDebtReminder } from "@/packages/modules/customers/customerService";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const result = generateZaloDebtReminder(id);

    if (!result) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khách hàng" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      customer: result.customer,
      message: result.message,
      zaloUrl: result.zaloUrl,
      vietQrUrl: result.vietQrUrl,
      vietQrNote: result.vietQrNote,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi tạo tin nhắn nhắc nợ";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
