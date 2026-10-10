import type { AuditLog, AuditStats } from "./types";
import { MOCK_AUDIT_LOGS } from "./mockData";

let store: AuditLog[] = MOCK_AUDIT_LOGS.map((x) => ({ ...x, payload: x.payload ? { ...x.payload } : null }));

export function getAuditLogs(filters?: { module?: string; actor?: string; level?: string; search?: string }): AuditLog[] {
  let list = [...store].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  if (filters?.module && filters.module !== "ALL") list = list.filter((l) => l.module === filters.module);
  if (filters?.actor && filters.actor !== "ALL") list = list.filter((l) => l.actor === filters.actor);
  if (filters?.level && filters.level !== "ALL") list = list.filter((l) => l.level === filters.level);
  if (filters?.search?.trim()) {
    const q = filters.search.trim().toLowerCase();
    list = list.filter((l) => l.message.toLowerCase().includes(q) || l.actor_name.toLowerCase().includes(q) || l.id.toLowerCase().includes(q) || l.module.toLowerCase().includes(q));
  }
  return list;
}

export function getAuditStats(): AuditStats {
  const today = new Date().toISOString().slice(0, 10);
  const todayLogs = store.filter((l) => l.timestamp.slice(0, 10) === today);
  const total_today = todayLogs.length || store.length;
  const sync_success = store.filter((l) => l.level === "SUCCESS" && (l.action === "SYNC_SAPO" || l.action === "SYNC_MISA" || l.action === "POST_AMIS" || l.action === "EXPORT_QR")).length;
  const warning_count = store.filter((l) => l.level === "WARNING").length;
  const error_count = store.filter((l) => l.level === "ERROR").length;
  return { total_today, sync_success, warning_count, error_count };
}

export function __resetAuditStore(): void {
  store = MOCK_AUDIT_LOGS.map((x) => ({ ...x, payload: x.payload ? { ...x.payload } : null }));
}
