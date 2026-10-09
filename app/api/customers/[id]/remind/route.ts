import { NextRequest, NextResponse } from "next/server";
import { getCustomerById, buildZaloRemindMessage } from "@/packages/modules/customers/customerService";

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const customer = getCustomerById(id);

    if (!customer) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy khách hàng" },
        { status: 404 }
      );
    }

    const message = buildZaloRemindMessage(customer);

    return NextResponse.json({
      success: true,
      customer,
      message,
      zaloUrl: `https://zalo.me/${customer.phone}`,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Lỗi tạo tin nhắn nhắc nợ";
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
