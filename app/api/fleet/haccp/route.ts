import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { getHaccpReport } from "@/packages/modules/fleet/telemetryService";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const from = req.nextUrl.searchParams.get("from") || undefined;
  const to = req.nextUrl.searchParams.get("to") || undefined;
  const rows = getHaccpReport(from, to);

  const sheetData = rows.map((r) => ({
    timestamp: r.timestamp,
    temp_C: r.temperature,
    door: r.doorStatus,
    location: r.location,
    alert: r.alerts?.join(", ") || (r.alert ? "WARNING" : ""),
    compressor: r.compressorStatus,
    battery_V: r.batteryVoltage,
  }));

  // Nếu không có data vẫn xuất header
  const ws = XLSX.utils.json_to_sheet(
    sheetData.length
      ? sheetData
      : [{ timestamp: "", temp_C: "", door: "", location: "", alert: "", compressor: "", battery_V: "" }],
  );
  // Xoá dòng dummy nếu không có data thực — giữ header
  if (!sheetData.length) {
    // json_to_sheet đã tạo 1 dòng dummy, giữ lại chỉ header
    const range = XLSX.utils.decode_range(ws["!ref"] || "A1:G1");
    range.e.r = 0;
    ws["!ref"] = XLSX.utils.encode_range(range);
  }
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "HACCP");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" }) as Buffer;
  const body = new Uint8Array(buf);
  const fname = `HACCP-29C88260-${new Date().toISOString().slice(0, 10)}.xlsx`;
  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${fname}"`,
      "Content-Length": String(buf.length),
    },
  });
}
