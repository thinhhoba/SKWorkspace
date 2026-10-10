import { NextResponse } from "next/server";
import { fetchSapoOrders, normalizeToCentralOrders } from "@/packages/integrations/sapo/sapoClient";
import { transformToMisaRows } from "@/packages/integrations/misa/misaTransformer";

export async function GET() {
  return handleSync();
}

export async function POST() {
  return handleSync();
}

async function handleSync() {
  try {
    const startTime = Date.now();
    const nowStr = new Date().toLocaleTimeString("vi-VN");

    // 1. Kéo đơn từ Sapo API (hoặc dataset mô phỏng Sơn Khang)
    const sapoOrders = await fetchSapoOrders();

    // 2. Chuẩn hóa sang CentralOrder
    const centralOrders = normalizeToCentralOrders(sapoOrders);

    // 3. Biến đổi sang 63 cột MISA và kiểm tra tính hợp lệ
    const { rows, validation } = transformToMisaRows(centralOrders);

    const elapsed = Date.now() - startTime;

    const logs = [
      `[${nowStr}] [INFO] Kết nối Sapo API — xác thực thành công.`,
      `[${nowStr}] [OK] Kéo thành công ${sapoOrders.length} đơn hàng từ Sapo (${elapsed}ms).`,
      `[${nowStr}] [OK] Chuẩn hóa CentralOrders: ${centralOrders.length} đơn đã sẵn sàng.`,
      `[${nowStr}] [RUN] Kiểm tra tính hợp lệ 63 cột MISA: ${rows.length} dòng dữ liệu.`
    ];

    if (validation.duplicate_external_ids.length > 0) {
      logs.push(
        `[${nowStr}] [WARN] Phát hiện ${validation.duplicate_external_ids.length} đơn đã tồn tại trong Ledger (${validation.duplicate_external_ids.join(", ")}).`
      );
    }

    if (validation.errors.length > 0) {
      for (const err of validation.errors) {
        logs.push(`[${nowStr}] [ERR] Dòng ${err.row_index + 1} (${err.external_id}): ${err.message}`);
      }
    }

    if (validation.warnings.length > 0) {
      for (const warn of validation.warnings) {
        logs.push(`[${nowStr}] [WARN] Dòng ${warn.row_index + 1} (${warn.external_id}): ${warn.message}`);
      }
    }

    logs.push(`[${nowStr}] [OK] Trạng thái: ${validation.is_exportable ? "Đạt điều kiện xuất Excel" : "Cần chuẩn hóa trước khi xuất"}`);

    return NextResponse.json({
      success: true,
      orders_count: sapoOrders.length,
      rows_count: rows.length,
      rows,
      centralOrders,
      validation,
      logs
    });
  } catch (error: any) {
    console.error("[SAPO2MISA SYNC API ERROR]", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || "Lỗi trong quá trình đồng bộ Sapo sang MISA"
      },
      { status: 500 }
    );
  }
}
