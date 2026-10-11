"use client";

import { Badge } from "@/components/ui/badge";

const STAFF = [
  { name: "Trần Thị Ngọc Thúy", role: "Thủ kho trung tâm (Kho Định Công)", status: "online" as const, initial: "T" },
  { name: "Ngô Văn Tân", role: "Tài xế Isuzu 29C-882.60 (Nội thành HN)", status: "online" as const, initial: "T" },
  { name: "Hoàng Thị Nho", role: "Kế toán trưởng (AMIS / VietQR)", status: "away" as const, initial: "N" },
  { name: "Hồ Bá Thịnh", role: "Giám đốc điều hành", status: "online" as const, initial: "T" },
];

export default function OnlineStaffWidget() {
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between pb-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
          Nhân sự trực ban hôm nay
        </span>
        <span className="text-[10px] text-muted-foreground font-medium">4 nhân sự</span>
      </div>
      <div className="space-y-2">
        {STAFF.map((s) => (
          <div key={s.name} className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
            <div className="relative shrink-0">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-white font-bold text-xs flex items-center justify-center">
                {s.initial}
              </div>
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-white dark:border-slate-900 ${
                  s.status === "online" ? "bg-emerald-500" : "bg-amber-400"
                }`}
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold leading-tight truncate text-slate-800 dark:text-slate-200">{s.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{s.role}</p>
            </div>
            <Badge
              className={`text-[9px] shrink-0 font-bold px-1.5 py-0.2 ${
                s.status === "online"
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200"
                  : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200"
              }`}
            >
              {s.status === "online" ? "Online" : "Vắng mặt"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
