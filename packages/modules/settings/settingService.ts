import type { SystemSettings } from "./types";
import { MOCK_SETTINGS } from "./mockData";

let settingsStore: SystemSettings = structuredClone(MOCK_SETTINGS);

export function getSettings(): SystemSettings {
  return structuredClone(settingsStore);
}

export function updateSettings(patch: Partial<SystemSettings> & Record<string, unknown>): SystemSettings {
  // Shallow merge per top-level group; deep-merge known groups
  const next: SystemSettings = structuredClone(settingsStore);

  if (patch.company && typeof patch.company === "object") {
    next.company = { ...next.company, ...(patch.company as object) };
  }
  if (patch.vietqr && typeof patch.vietqr === "object") {
    next.vietqr = { ...next.vietqr, ...(patch.vietqr as object) };
  }
  if (patch.sapo && typeof patch.sapo === "object") {
    next.sapo = { ...next.sapo, ...(patch.sapo as object) };
  }
  if (patch.misa && typeof patch.misa === "object") {
    next.misa = { ...next.misa, ...(patch.misa as object) };
  }
  if (patch.policy && typeof patch.policy === "object") {
    next.policy = { ...next.policy, ...(patch.policy as object) };
  }
  if (patch.meta && typeof patch.meta === "object") {
    next.meta = { ...next.meta, ...(patch.meta as object) };
  }

  // Validate nhẹ
  if (next.company.mst && !/^\d{10}(-\d{3})?$/.test(next.company.mst)) {
    throw new Error("MST không hợp lệ (10 số, ví dụ 0111252725)");
  }
  if (next.policy.min_order_value < 0 || next.policy.freeship_threshold_8km < 0 || next.policy.freeship_threshold_12km < 0) {
    throw new Error("Ngưỡng giá trị đơn / freeship phải >= 0");
  }

  next.meta.updated_at = new Date().toLocaleDateString("vi-VN");
  settingsStore = next;
  return structuredClone(settingsStore);
}

export function __resetSettingsStore(): void {
  settingsStore = structuredClone(MOCK_SETTINGS);
}
