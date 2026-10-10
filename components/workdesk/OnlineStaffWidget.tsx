"use client";
import { Badge } from "@/components/ui/badge";

const STAFF = [
  { name: "Tran Thi Ngoc Thuy", role: "Thu kho trung tam (Dinh Cong)", status: "online" as const, initial: "T" },
  { name: "Ngo Van Tan", role: "Tai xe Isuzu 29C-882.60", status: "online" as const, initial: "T" },
  { name: "Hoang Thi Nho", role: "Ke toan truong (AMIS/VietQR)", status: "away" as const, initial: "N" },
  { name: "Ho Ba Thinh", role: "Giam doc", status: "online" as const, initial: "S" },
];

export default function OnlineStaffWidget() {
  return (
    <div className="clay-card p-4 space-y-2.5">
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">Nhan su truc ca hom nay</span>
      <div className="space-y-2.5">
        {STAFF.map((s) => (
          <div key={s.name} className="flex items-center gap-2.5">
            <div className="relative shrink-0">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-white font-bold text-xs flex items-center justify-center">{s.initial}</div>
              <span className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900 ${s.status === "online" ? "bg-emerald-500" : "bg-amber-400"}`} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold leading-none truncate">{s.name}</p>
              <p className="text-[10px] text-muted-foreground truncate">{s.role}</p>
            </div>
            <Badge className={`text-[9px] shrink-0 ${s.status === "online" ? "bg-emerald-100 text-emerald-700 border-emerald-200" : "bg-amber-100 text-amber-700 border-amber-200"}`}>
              {s.status === "online" ? "Online" : "Vang mat"}
            </Badge>
          </div>
        ))}
      </div>
    </div>
  );
}
