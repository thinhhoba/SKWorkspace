import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

interface TelemetryPoint {
  timestamp: string;
  temperature: number;
  compressorStatus: "RUNNING" | "STOPPED" | "DEFROST";
  doorStatus: "CLOSED" | "OPEN";
  batteryVoltage: number;
  location: string;
  alert: boolean;
}

// In-memory telemetry storage for fleet
let currentTelemetry = {
  truckPlate: "29C-882.60",
  model: "Isuzu QKR 270 Thùng Đông Lạnh",
  driver: "Ngô Văn Tân",
  driverPhone: "0942 22 60 60",
  setpoint: -18.0,
  temperature: -18.4,
  compressorStatus: "RUNNING" as "RUNNING" | "STOPPED" | "DEFROST",
  doorStatus: "CLOSED" as "CLOSED" | "OPEN",
  batteryVoltage: 24.2,
  location: "Kho Tổng Định Công — 96 Ngõ 337 Định Công, Hoàng Mai, Hà Nội",
  status: "NORMAL" as "NORMAL" | "WARNING_HIGH_TEMP" | "DEFROSTING",
  lastUpdated: new Date().toISOString(),
};

const telemetryHistory: TelemetryPoint[] = [
  {
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    temperature: -18.2,
    compressorStatus: "RUNNING",
    doorStatus: "CLOSED",
    batteryVoltage: 24.3,
    location: "Kho Tổng Định Công",
    alert: false,
  },
  {
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    temperature: -18.5,
    compressorStatus: "RUNNING",
    doorStatus: "CLOSED",
    batteryVoltage: 24.2,
    location: "Đường Giải Phóng",
    alert: false,
  },
  {
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    temperature: -18.4,
    compressorStatus: "RUNNING",
    doorStatus: "CLOSED",
    batteryVoltage: 24.2,
    location: "Gần Bến xe Giáp Bát",
    alert: false,
  },
];

export async function GET() {
  return NextResponse.json({
    success: true,
    telemetry: currentTelemetry,
    history: telemetryHistory.slice(-20),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const temp = Number(body.temperature);
    const compressor = body.compressorStatus === false ? "STOPPED" : (body.compressorStatus || "RUNNING");
    const door = body.doorStatus === "OPEN" ? "OPEN" : "CLOSED";
    const loc = body.location || currentTelemetry.location;

    if (isNaN(temp)) {
      return NextResponse.json({ success: false, error: "Nhiệt độ temperature không hợp lệ" }, { status: 400 });
    }

    const isHighTemp = temp > -15.0;

    currentTelemetry = {
      ...currentTelemetry,
      temperature: temp,
      compressorStatus: compressor,
      doorStatus: door,
      location: loc,
      status: isHighTemp ? "WARNING_HIGH_TEMP" : "NORMAL",
      lastUpdated: new Date().toISOString(),
    };

    telemetryHistory.push({
      timestamp: new Date().toISOString(),
      temperature: temp,
      compressorStatus: compressor,
      doorStatus: door,
      batteryVoltage: 24.2,
      location: loc,
      alert: isHighTemp,
    });

    if (telemetryHistory.length > 100) telemetryHistory.shift();

    return NextResponse.json({
      success: true,
      message: isHighTemp ? "CẢNH BÁO: Nhiệt độ vượt ngưỡng an toàn (-15°C)!" : "Cập nhật telemetry thành công",
      telemetry: currentTelemetry,
      breached: isHighTemp,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Lỗi xử lý telemetry";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
