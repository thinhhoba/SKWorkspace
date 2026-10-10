import { NextRequest, NextResponse } from "next/server";
import {
  autoReconcileVietQr,
  isVietQrTxProcessed,
  getTxnByVietQrId,
} from "@/packages/modules/finance/financeService";
import { markOrderPaid } from "@/packages/modules/sales/salesService";
import { parseFirstSkAlias } from "@/packages/modules/payment/vietqr";
import { verifyVietQrSignatureServer } from "@/packages/modules/payment/vietqrServer";

export const dynamic = "force-dynamic";

/**
 * POST /api/finance/vietqr
 * Tiếp nhận thông báo biến động số dư VietQR Techcombank (22226060)
 * Payload hỗ trợ:
 *   - { orderCode, amount, senderText, transactionId }
 *   - Payload Techcombank thực tế: { transactionId|reference|tid, amount|transferAmount, content|description|addInfo, ... }
 *   - Wrapper { data: { ... } }
 * Tự động tạo phiếu thu SK-PT-* và gạch nợ đơn hàng → hoan_tat
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    let body: Record<string, unknown>;
    try {
      body = rawBody ? JSON.parse(rawBody) : {};
    } catch {
      return NextResponse.json({ success: false, error: "Payload JSON không hợp lệ" }, { status: 400 });
    }

    // Hỗ trợ wrapper { data: {...} } của Techcombank
    const payload: Record<string, unknown> =
      body.data && typeof body.data === "object" ? (body.data as Record<string, unknown>) : body;

    // Verify HMAC optional nếu VIETQR_SECRET được cấu hình
    const sigHeader =
      req.headers.get("x-vietqr-signature") ||
      req.headers.get("x-hub-signature") ||
      (payload.signature as string) ||
      (payload.hmac as string) ||
      null;
    if (process.env.VIETQR_SECRET) {
      const ok = await verifyVietQrSignatureServer(rawBody, sigHeader);
      if (!ok) {
        return NextResponse.json({ success: false, error: "Chữ ký VietQR không hợp lệ" }, { status: 401 });
      }
    }

    // Parse linh hoạt các field
    const transactionId = String(
      payload.transactionId || payload.transaction_id || payload.reference || payload.tid || payload.transId || payload.id || ""
    ).trim();

    // Idempotency: nếu transactionId đã xử lý thì trả success ngay
    if (transactionId && isVietQrTxProcessed(transactionId)) {
      const existing = getTxnByVietQrId(transactionId);
      return NextResponse.json({
        success: true,
        deduped: true,
        message: "Giao dịch đã được xử lý trước đó",
        transaction: existing || null,
      });
    }

    const rawAmount = payload.amount ?? payload.transferAmount ?? payload.transactionAmount ?? payload.value ?? 0;
    const amount = Number(rawAmount);
    const senderText = String(
      payload.senderText || payload.content || payload.description || payload.addInfo || payload.memo || payload.note || ""
    );

    // Tìm SK-* alias trong description nếu orderCode không gửi trực tiếp
    let orderCode = String(payload.orderCode || payload.order_code || payload.order_code_alias || "").trim();
    if (!orderCode && senderText) {
      const alias = parseFirstSkAlias(senderText);
      if (alias) orderCode = alias;
    }

    // Fallback: tìm alias trong toàn bộ rawBody
    if (!orderCode && rawBody) {
      const alias = parseFirstSkAlias(rawBody);
      if (alias) orderCode = alias;
    }

    if (!orderCode) {
      return NextResponse.json(
        { success: false, error: "Không tìm thấy mã đơn SK-* trong payload hoặc description" },
        { status: 400 }
      );
    }
    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: "Thiếu amount hợp lệ (> 0)" }, { status: 400 });
    }

    const note = senderText || `Giao dịch VietQR #${transactionId || Date.now()}`;
    const txn = autoReconcileVietQr(orderCode, amount, note, transactionId || undefined);
    const updatedOrder = markOrderPaid(orderCode);

    return NextResponse.json({
      success: true,
      message: `Đã đối soát thành công đơn #${orderCode}`,
      transaction: txn,
      order_updated: !!updatedOrder,
      order: updatedOrder
        ? { id: updatedOrder.id, code: updatedOrder.code, status: updatedOrder.status, customer: updatedOrder.customer_name }
        : null,
      reconciled_at: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi xử lý đối soát VietQR";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({
    success: true,
    service: "VietQR Techcombank 22226060",
    usage: "POST { orderCode, amount, senderText, transactionId } hoặc payload Techcombank",
  });
}
