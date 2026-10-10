/**
 * Telemetry service — tách logic khỏi route cho W4
 * Shared in-memory store (chuẩn bị Prisma: thay bằng DB sau)
 */

export type AlertCode = "WARNING_HIGH_TEMP" | "WARNING_DOOR_OPEN";

export interface TelemetryPoint {
  timestamp: string;
  temperature: number;
  compressorStatus: "RUNNING" | "STOPPED" | "DEFROST";
  doorStatus: "CLOSED" | "OPEN";
  batteryVoltage: number;
  location: string;
  alert: boolean;
  alerts: AlertCode[];
  doorOpenedAt: string | null;
}

export interface CurrentTelemetry {
  truckPlate: string;
  model: string;
  driver: string;
  driverPhone: string;
  setpoint: number;
  temperature: number;
  compressorStatus: "RUNNING" | "STOPPED" | "DEFROST";
  doorStatus: "CLOSED" | "OPEN";
  batteryVoltage: number;
  location: string;
  status: "NORMAL" | AlertCode;
  alerts: AlertCode[];
  doorOpenedAt: string | null;
  lastUpdated: string;
}

export interface ChatNotification {
  channel: string;
  message: string;
  timestamp: string;
  alerts: AlertCode[];
}

// Thresholds
const HIGH_TEMP_THRESHOLD = -15; // °C — trên ngưỡng này là cảnh báo
const DOOR_OPEN_MS = 10 * 60 * 1000; // 10 phút

/**
 * Đánh giá cảnh báo từ temp + door + doorOpenedAt
 * Pure — không side-effect, dễ test
 */
export function evaluateTelemetry(
  temp: number,
  doorStatus: "CLOSED" | "OPEN",
  doorOpenedAt: string | null,
  nowMs: number = Date.now(),
): AlertCode[] {
  const alerts: AlertCode[] = [];
  if (temp > HIGH_TEMP_THRESHOLD) alerts.push("WARNING_HIGH_TEMP");
  if (doorStatus === "OPEN" && doorOpenedAt) {
    const opened = new Date(doorOpenedAt).getTime();
    if (!isNaN(opened) && nowMs - opened > DOOR_OPEN_MS) {
      alerts.push("WARNING_DOOR_OPEN");
    }
  }
  return alerts;
}

// In-memory shared store
export let doorOpenedAt: string | null = null;

export function setDoorOpenedAt(v: string | null) {
  doorOpenedAt = v;
}

export const currentTelemetry: CurrentTelemetry = {
  truckPlate: "29C-882.60",
  model: "Isuzu QKR 270 Thùng Đông Lạnh",
  driver: "Ngô Văn Tân",
  driverPhone: "0942 22 60 60",
  setpoint: -18.0,
  temperature: -18.4,
  compressorStatus: "RUNNING",
  doorStatus: "CLOSED",
  batteryVoltage: 24.2,
  location: "Kho Tổng Định Công — 96 Ngõ 337 Định Công, Hoàng Mai, Hà Nội",
  status: "NORMAL",
  alerts: [],
  doorOpenedAt: null,
  lastUpdated: new Date().toISOString(),
};

export const telemetryHistory: TelemetryPoint[] = [
  {
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    temperature: -18.2,
    compressorStatus: "RUNNING",
    doorStatus: "CLOSED",
    batteryVoltage: 24.3,
    location: "Kho Tổng Định Công",
    alert: false,
    alerts: [],
    doorOpenedAt: null,
  },
  {
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    temperature: -18.5,
    compressorStatus: "RUNNING",
    doorStatus: "CLOSED",
    batteryVoltage: 24.2,
    location: "Đường Giải Phóng",
    alert: false,
    alerts: [],
    doorOpenedAt: null,
  },
  {
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    temperature: -18.4,
    compressorStatus: "RUNNING",
    doorStatus: "CLOSED",
    batteryVoltage: 24.2,
    location: "Gần Bến xe Giáp Bát",
    alert: false,
    alerts: [],
    doorOpenedAt: null,
  },
];

// Chat #dieu-xe log (in-memory — thay bằng ChatMessage Prisma sau)
export const chatNotifications: ChatNotification[] = [];

export function appendTelemetryLog(point: TelemetryPoint) {
  telemetryHistory.push(point);
  if (telemetryHistory.length > 500) telemetryHistory.shift();
}

export function pushChatNotification(alerts: AlertCode[], temp: number, door: string, location: string) {
  if (!alerts.length) return;
  const msg =
    alerts.includes("WARNING_HIGH_TEMP") && alerts.includes("WARNING_DOOR_OPEN")
      ? `[CẢNH BÁO KÉP] Xe 29C-882.60 — Nhiệt độ ${temp}°C vượt -15°C & Cửa mở quá 10 phút — ${location}`
      : alerts.includes("WARNING_HIGH_TEMP")
        ? `[CẢNH BÁO NHIỆT ĐỘ] Xe 29C-882.60 — Nhiệt độ ${temp}°C vượt ngưỡng -15°C — ${location}`
        : `[CẢNH BÁO CỬA] Xe 29C-882.60 — Cửa thùng mở quá 10 phút — ${location} — Tài xế Ngô Văn Tân 0942 22 60 60`;
  chatNotifications.push({
    channel: "#dieu-xe",
    message: msg,
    timestamp: new Date().toISOString(),
    alerts: [...alerts],
  });
  if (chatNotifications.length > 100) chatNotifications.shift();
  // eslint-disable-next-line no-console
  console.warn("[fleet:chat#dieu-xe]", msg);
}

export function getHaccpReport(from?: string, to?: string): TelemetryPoint[] {
  let data = [...telemetryHistory];
  if (from) {
    const f = new Date(from).getTime();
    if (!isNaN(f)) data = data.filter((p) => new Date(p.timestamp).getTime() >= f);
  }
  if (to) {
    const t = new Date(to).getTime();
    if (!isNaN(t)) data = data.filter((p) => new Date(p.timestamp).getTime() <= t);
  }
  return data;
}
