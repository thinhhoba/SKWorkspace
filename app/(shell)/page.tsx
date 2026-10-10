"use client";
import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { appRegistry, GROUP_LABEL, GROUP_ORDER, type AppGroup } from "@/packages/core/appRegistry";
import { Search, LayoutDashboard, Rss, Sparkles } from "lucide-react";
import WorkdeskShell from "@/components/workdesk/WorkdeskShell";
import type { FeedStreamItem, FeedPost } from "@/packages/modules/feed/types";
import type { WorkdeskTask } from "@/packages/modules/tasks/types";

const GROUP_ICON_GRADIENT: Record<AppGroup, string> = {
  "tong-quan": "from-violet-400 to-indigo-500",
  "ban-hang": "from-emerald-400 to-teal-500",
  "van-hanh": "from-amber-400 to-orange-500",
  "tai-chinh": "from-sky-400 to-sky-600",
  "tien-ich": "from-purple-400 to-pink-500",
  "he-thong": "from-slate-400 to-slate-600",
};

export default function SmartWorkdeskPage() {
  const [activeTab, setActiveTab] = React.useState<"cockpit" | "apps">("cockpit");
  const [salesRevenue, setSalesRevenue] = React.useState(128400000);
  const [pendingPickOrders, setPendingPickOrders] = React.useState(14);
  const [fleetTemp, setFleetTemp] = React.useState(-18.4);
  const [techcombankBalance, setTechcombankBalance] = React.useState(125000000);
  const [streamItems, setStreamItems] = React.useState<FeedStreamItem[]>([]);
  const [tasks, setTasks] = React.useState<WorkdeskTask[] | undefined>(undefined);
  const [loadingStream, setLoadingStream] = React.useState(true);
  const [q, setQ] = React.useState("");
  const [group, setGroup] = React.useState<AppGroup | "all">("all");

  const fetchDashboardData = React.useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        fetch("/api/sales").then((r) => r.json()).catch(() => null),
        fetch("/api/fleet/telemetry").then((r) => r.json()).catch(() => null),
        fetch("/api/finance").then((r) => r.json()).catch(() => null),
        fetch("/api/feed/stream").then((r) => r.json()).catch(() => null),
        fetch("/api/tasks").then((r) => r.json()).catch(() => null),
      ]);
      const [salesRes, fleetRes, finRes, feedRes, tasksRes] = results.map((r) => (r.status === "fulfilled" ? r.value : null));
      if (salesRes?.success && salesRes.stats) {
        setSalesRevenue(salesRes.stats.revenueToday || 128400000);
        setPendingPickOrders(salesRes.stats.choSoan || 14);
      }
      if (fleetRes?.success && fleetRes.telemetry) setFleetTemp(fleetRes.telemetry.temperature);
      if (finRes?.success && finRes.stats) setTechcombankBalance(finRes.stats.balance_techcombank || 125000000);
      if (feedRes?.success && Array.isArray(feedRes.items)) {
        setStreamItems(feedRes.items);
      } else if (feedRes?.success && Array.isArray(feedRes.stream)) {
        setStreamItems(feedRes.stream);
      }
      if (tasksRes?.success && Array.isArray(tasksRes.tasks)) setTasks(tasksRes.tasks);
    } catch {}
    setLoadingStream(false);
  }, []);

  React.useEffect(() => {
    fetchDashboardData();
    const t = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(t);
  }, [fetchDashboardData]);

  function handlePostCreated(post: FeedPost) {
    const item: FeedStreamItem = { kind: "post", pinned: post.pinned, createdAt: post.createdAt, post };
    setStreamItems((prev) => [item, ...prev]);
  }

  const filteredApps = React.useMemo(() => {
    let list = appRegistry.filter((a) => a.id !== "dashboard");
    if (group !== "all") list = list.filter((a) => a.group === group);
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter((a) => a.label.toLowerCase().includes(t) || a.desc.toLowerCase().includes(t) || a.id.includes(t));
    }
    return list;
  }, [q, group]);

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto pb-16">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-sky-600" /> BAN LAM VIEC DIEU HANH THONG MINH
            </h1>
            <Badge className="bg-sky-600 text-white font-mono text-[10px]">SK WORKSPACE 2.0</Badge>
          </div>
          <p className="text-xs text-muted-foreground">CONG TY TNHH THUC PHAM SON KHANG (MST: 0111252725) - Kho Tong 96 Ngo 337 Dinh Cong</p>
        </div>
        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-full border border-slate-200 dark:border-slate-700">
          <button onClick={() => setActiveTab("cockpit")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === "cockpit" ? "bg-white dark:bg-slate-900 text-sky-600 shadow-sm" : "text-muted-foreground hover:text-slate-900 dark:hover:text-white"}`}>
            <Rss className="w-3.5 h-3.5" /> Ban Lam Viec Newsfeed &amp; Dashboard
          </button>
          <button onClick={() => setActiveTab("apps")} className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${activeTab === "apps" ? "bg-white dark:bg-slate-900 text-sky-600 shadow-sm" : "text-muted-foreground hover:text-slate-900 dark:hover:text-white"}`}>
            <Sparkles className="w-3.5 h-3.5" /> Tat Ca Phan He ({appRegistry.length - 1})
          </button>
        </div>
      </div>

      {activeTab === "cockpit" ? (
        <WorkdeskShell
          streamItems={streamItems}
          tasks={tasks}
          revenue={salesRevenue}
          pendingPickCount={pendingPickOrders}
          fleetTemp={fleetTemp}
          bankBalance={techcombankBalance}
          loadingStream={loadingStream}
          onPostCreated={handlePostCreated}
          onRefresh={fetchDashboardData}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Tim kiem phan he, miniapp..." value={q} onChange={(e) => setQ(e.target.value)} className="pl-8 h-9 rounded-full border-slate-200 shadow-sm text-xs" />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setGroup("all")} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${group === "all" ? "bg-slate-900 text-white border-slate-900 shadow-md" : "bg-white text-slate-700 border-slate-200 hover:shadow-md"}`}>Tat ca</button>
              {GROUP_ORDER.map((g) => (
                <button key={g} onClick={() => setGroup(g)} className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${group === g ? "bg-sky-600 text-white border-sky-600 shadow-md" : "bg-white text-slate-700 border-slate-200 hover:shadow-md"}`}>{GROUP_LABEL[g]}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {filteredApps.map((app) => {
              const Icon = app.icon;
              const grad = GROUP_ICON_GRADIENT[app.group];
              return (
                <Link key={app.id} href={app.href} className="clay-tile group p-3.5 min-h-[110px] flex flex-col justify-between rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 hover:border-sky-400 hover:shadow-md transition-all">
                  <div>
                    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-white shadow-sm border border-white/60 shrink-0`}><Icon className="h-4 w-4" /></span>
                    <div className="mt-2 text-xs font-bold leading-tight">{app.label}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-tight">{app.desc}</div>
                  </div>
                  {app.badge && <Badge variant="outline" className="mt-2 w-fit text-[9px] px-1.5 py-0 mono rounded-full">{app.badge}</Badge>}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
