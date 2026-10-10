import type { ReportData, ReportPeriod } from "./types";
import { MOCK_REPORTS } from "./mockData";

export function getReport(period: ReportPeriod = "month"): ReportData {
  return MOCK_REPORTS[period] ?? MOCK_REPORTS.month;
}
