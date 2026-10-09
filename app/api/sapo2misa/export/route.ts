import { NextRequest, NextResponse } from "next/server";
import { generateMisaExcelBuffer } from "@/packages/integrations/misa/excelExporter";
import { fetchSapoOrders, normalizeToCentralOrders } from "@/packages/integrations/sapo/sapoClient";
import { transformToMisaRows, MisaRowData } from "@/packages/integrations/misa/misaTransformer";

export async function POST(req: NextRequest) {
  try {
    let rows: MisaRowData[] = [];
    const body = await req.json().catch(() => null);

    if (body && Array.isArray(body.rows) && body.rows.length > 0) {
      rows = body.rows;
    } else {
      // Nếu không gửi body rows, tự động kéo và chuyển đổi
      const sapoOrders = await fetchSapoOrders();
      const centralOrders = normalizeToCentralOrders(sapoOrders);
      const transformed = transformToMisaRows(centralOrders);
      rows = transformed.rows;
    }

    const timestamp = new Date().toISOString().replace(/[-:T.]/g, "").slice(0, 14);
    const fileName = `MISA_63COT_SONKHANG_${timestamp}.xlsx`;

    const excelBuffer = generateMisaExcelBuffer(rows, fileName);

    return new Response(Buffer.from(excelBuffer), {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Cache-Control": "no-store, no-cache, must-revalidate"
      }
    });
  } catch (err: any) {
    console.error("[SAPO2MISA EXPORT ERROR]", err);
    return NextResponse.json(
      { error: err.message || "Lỗi tạo file Excel MISA 63 cột" },
      { status: 500 }
    );
  }
}
