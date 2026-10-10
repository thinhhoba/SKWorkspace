import { NextRequest, NextResponse } from "next/server";
import {
  currentTelemetry,
  telemetryHistory,
  chatNotifications,
  doorOpenedAt,
  setDoorOpenedAt,
  evaluateTelemetry,
  appendTelemetryLog,
  pushChatNotification,
} from "@/packages/modules/fleet/telemetryService";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    success: true,
    telemetry: currentTelemetry,
    history: telemetryHistory.slice(-20),
    alerts: currentTelemetry.alerts,
    doorOpenedAt: currentTelemetry.doorOpenedAt,
    chatNotifications: chatNotifications.slice(-10),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const temp = Number(body.temperature);
    const compressor =
      body.compressorStatus === false ? "STOPPED" : body.compressorStatus || "RUNNING";
    const door: "CLOSED" | "OPEN" = body.doorStatus === "OPEN" ? "OPEN" : "CLOSED";
    const loc = body.location || currentTelemetry.location;

    if (isNaN(temp)) {
      return NextResponse.json(
        { success: false, error: "Nhiệt độ temperature không hợp lệ" },
        { status: 400 },
      );
    }

    // doorOpenedAt tracking
    const nowIso = new Date().toISOString();
    if (door === "OPEN") {
      if (!doorOpenedAt) setDoorOpenedAt(nowIso);
    } else {
      if (doorOpenedAt) setDoorOpenedAt(null);
    }

    const alerts = evaluateTelemetry(temp, door, doorOpenedAt);

    const status = alerts.length ? alerts[0] : "NORMAL";

    Object.assign(currentTelemetry, {
      temperature: temp,
      compressorStatus: compressor as typeof currentTelemetry.compressorStatus,
      doorStatus: door,
      location: loc,
      status,
      alerts,
      doorOpenedAt,
      lastUpdated: nowIso,
    });

    appendTelemetryLog({
      timestamp: nowIso,
      temperature: temp,
      compressorStatus: compressor as "RUNNING" | "STOPPED" | "DEFROST",
      doorStatus: door,
      batteryVoltage: 24.2,
      location: loc,
      alert: alerts.length > 0,
      alerts,
      doorOpenedAt,
    });

    if (alerts.length) pushChatNotification(alerts, temp, door, loc);

    return NextResponse.json({
      success: true,
      message: alerts.length
        ? alerts.includes("WARNING_HIGH_TEMP" as never) && alerts.includes("WARNING_DOOR_OPEN" as never)
          ? "CẢNH BÁO KÉP: Nhiệt độ vượt -15°C & cửa mở quá 10 phút!"
          : alerts.includes("WARNING_HIGH_TEMP" as never)
            ? "CẢNH BÁO: Nhiệt độ vượt ngưỡng an toàn (-15°C)!"
            : "CẢNH BÁO: Cửa thùng mở quá 10 phút!"
        : "Cập nhật telemetry thành công",
      telemetry: currentTelemetry,
      breached: alerts.length > 0,
      alerts,
      doorOpenedAt,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi xử lý telemetry";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
