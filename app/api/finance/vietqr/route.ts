import { NextRequest, NextResponse } from "next/server";
import { autoReconcileVietQr } from "@/packages/modules/finance/financeService";
import { markOrderPaid } from "@/packages/modules/sales/salesService";

export const dynamic = "force-dynamic";

/**
 * POST /api/finance/vietqr
 * Tiếp nhận thông báo biến động số dư VietQR Techcombank (22226060)
 * Tự động tạo phiếu thu tiền và gạch nợ đơn hàng tương ứng
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderCode, amount, senderText, transactionId } = body as {
      orderCode?: string;
      amount?: number;
      senderText?: string;
      transactionId?: string;
    };

    if (!orderCode || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "Thiếu orderCode hoặc amount hợp lệ (> 0)" },
        { status: 400 }
      );
    }

    const note = senderText || `Giao dịch VietQR #${transactionId || Date.now()}`;
    const txn = autoReconcileVietQr(orderCode, Number(amount), note);

    const updatedOrder = markOrderPaid(orderCode);

    return NextResponse.json({
      success: true,
      message: `Đã đối soát thành công đơn #${orderCode}`,
      transaction: txn,
      order_updated: !!updatedOrder,
      order: updatedOrder
        ? {
            id: updatedOrder.id,
            code: updatedOrder.code,
            status: updatedOrder.status,
            customer: updatedOrder.customer_name,
          }
        : null,
      reconciled_at: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi xử lý đối soát VietQR";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
