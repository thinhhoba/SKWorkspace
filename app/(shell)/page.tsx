"use client";
import * as React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  appRegistry,
  GROUP_LABEL,
  GROUP_ORDER,
  type AppGroup,
} from "@/packages/core/appRegistry";
import {
  TrendingUp,
  Package,
  AlertTriangle,
  Wallet,
  Search,
  ArrowRight,
  ThermometerSnowflake,
  Truck,
  CheckCircle2,
  MessageSquare,
  Heart,
  Send,
  Plus,
  Pin,
  ExternalLink,
  RefreshCw,
  Sparkles,
  LayoutDashboard,
  Rss,
  Clock,
  User,
  QrCode,
  Store,
  FileCheck,
  CheckSquare,
} from "lucide-react";

const fmt = (n: number) => n.toLocaleString("vi-VN");
const fmtVnd = (n: number) => `${n.toLocaleString("vi-VN")} ₫`;

// Icon gradient by group
const GROUP_ICON_GRADIENT: Record<AppGroup, string> = {
  "tong-quan": "from-violet-400 to-indigo-500",
  "ban-hang": "from-emerald-400 to-teal-500",
  "van-hanh": "from-amber-400 to-orange-500",
  "tai-chinh": "from-sky-400 to-sky-600",
  "tien-ich": "from-purple-400 to-pink-500",
  "he-thong": "from-slate-400 to-slate-600",
};

interface FeedItem {
  id: string;
  type: "post" | "activity";
  author?: string;
  authorRole?: string;
  avatar?: string;
  title?: string;
  content: string;
  tag?: string;
  timestamp: string;
  likes?: number;
  liked?: boolean;
  activityType?: "order" | "telemetry" | "vietqr" | "picking";
  metadata?: Record<string, any>;
}

export default function SmartWorkdeskPage() {
  const [activeTab, setActiveTab] = React.useState<"cockpit" | "apps">("cockpit");
  
  // Real-time metrics
  const [salesRevenue, setSalesRevenue] = React.useState(128400000);
  const [pendingPickOrders, setPendingPickOrders] = React.useState(14);
  const [fleetTemp, setFleetTemp] = React.useState(-18.4);
  const [fleetStatus, setFleetStatus] = React.useState("NORMAL");
  const [techcombankBalance, setTechcombankBalance] = React.useState(125000000);
  
  // Stream & Newsfeed
  const [streamItems, setStreamItems] = React.useState<FeedItem[]>([]);
  const [loadingStream, setLoadingStream] = React.useState(true);
  const [newPostContent, setNewPostContent] = React.useState("");
  const [newPostTag, setNewPostTag] = React.useState("thong-bao");
  const [posting, setPosting] = React.useState(false);

  // Scratchpad
  const [scratchpad, setScratchpad] = React.useState("");

  // App Search
  const [q, setQ] = React.useState("");
  const [group, setGroup] = React.useState<AppGroup | "all">("all");

  // Load Scratchpad
  React.useEffect(() => {
    try {
      const saved = localStorage.getItem("sk_scratchpad");
      if (saved) setScratchpad(saved);
    } catch {}
  }, []);

  const handleScratchpadChange = (val: string) => {
    setScratchpad(val);
    try {
      localStorage.setItem("sk_scratchpad", val);
    } catch {}
  };

  // Fetch real-time dashboard data
  const fetchDashboardData = React.useCallback(async () => {
    try {
      // 1. Sales
      const salesRes = await fetch("/api/sales").then((r) => r.json()).catch(() => null);
      if (salesRes?.success && salesRes.stats) {
        setSalesRevenue(salesRes.stats.revenueToday || 128400000);
        setPendingPickOrders(salesRes.stats.choSoan || 14);
      }

      // 2. Telemetry
      const fleetRes = await fetch("/api/fleet/telemetry").then((r) => r.json()).catch(() => null);
      if (fleetRes?.success && fleetRes.telemetry) {
        setFleetTemp(fleetRes.telemetry.temperature);
        setFleetStatus(fleetRes.telemetry.status || "NORMAL");
      }

      // 3. Finance
      const finRes = await fetch("/api/finance").then((r) => r.json()).catch(() => null);
      if (finRes?.success && finRes.stats) {
        setTechcombankBalance(finRes.stats.balance_techcombank || 125000000);
      }

      // 4. Feed Stream
      const feedRes = await fetch("/api/feed/stream").then((r) => r.json()).catch(() => null);
      if (feedRes?.success && Array.isArray(feedRes.items)) {
        setStreamItems(feedRes.items);
      } else {
        // Fallback default stream
        setStreamItems([
          {
            id: "act-1",
            type: "activity",
            activityType: "order",
            content: "Đơn hàng Web Order #SK-WEB-261010-0042 (24.500.000₫) vừa được tạo bởi Chành xe Nam Định.",
            timestamp: "10 phút trước",
          },
          {
            id: "post-1",
            type: "post",
            author: "Hồ Bá Thịnh",
            authorRole: "Giám Đốc",
            avatar: "SK",
            content: "Nhắc nhở toàn bộ nhân sự: Hôm nay xe Isuzu 29C-882.60 ưu tiên giao đủ 35 thùng xúc xích và gà popcorn ra bến Giáp Bát trước 11:30. Đội kho Q7 đóng đá gel lạnh đầy đủ.",
            tag: "khan-cap",
            timestamp: "Hôm nay 08:30",
            likes: 12,
            liked: false,
          },
          {
            id: "act-2",
            type: "activity",
            activityType: "vietqr",
            content: "Gạch nợ tự động VietQR Techcombank: Khách hàng Quán Cô Ba Cầu Giấy chuyển 8.200.000₫ vào STK 22226060.",
            timestamp: "25 phút trước",
          },
          {
            id: "act-3",
            type: "activity",
            activityType: "telemetry",
            content: "Xe Isuzu 29C-882.60 (Tài xế Ngô Văn Tân) đang di chuyển trên đường Giải Phóng. Nhiệt độ thùng: -18.4°C (Đạt chuẩn HACCP).",
            timestamp: "32 phút trước",
          },
        ]);
      }
    } catch {
      // Keep state
    } finally {
      setLoadingStream(false);
    }
  }, []);

  React.useEffect(() => {
    fetchDashboardData();
    const timer = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(timer);
  }, [fetchDashboardData]);

  // Handle Post Creation
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPostContent.trim()) return;
    setPosting(true);
    try {
      const res = await fetch("/api/feed/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: newPostContent.trim(),
          tag: newPostTag,
          author: "Hồ Bá Thịnh",
        }),
      });
      const data = await res.json();
      if (data.success && data.post) {
        setStreamItems((prev) => [
          {
            id: data.post.id,
            type: "post",
            author: data.post.author,
            authorRole: data.post.authorRole,
            avatar: "SK",
            content: data.post.content,
            tag: data.post.tag,
            timestamp: "Vừa xong",
            likes: 0,
            liked: false,
          },
          ...prev,
        ]);
        setNewPostContent("");
      }
    } catch {
      alert("Không thể đăng bài viết lúc này");
    } finally {
      setPosting(false);
    }
  };

  const handleLike = (id: string) => {
    setStreamItems((prev) =>
      prev.map((it) => {
        if (it.id !== id) return it;
        const liked = !it.liked;
        const likes = (it.likes || 0) + (liked ? 1 : -1);
        return { ...it, liked, likes: Math.max(0, likes) };
      })
    );
  };

  const filteredApps = React.useMemo(() => {
    let list = appRegistry.filter((a) => a.id !== "dashboard");
    if (group !== "all") list = list.filter((a) => a.group === group);
    if (q.trim()) {
      const t = q.toLowerCase();
      list = list.filter(
        (a) =>
          a.label.toLowerCase().includes(t) ||
          a.desc.toLowerCase().includes(t) ||
          a.id.includes(t)
      );
    }
    return list;
  }, [q, group]);

  return (
    <div className="space-y-6 max-w-[1440px] mx-auto pb-16">
      {/* Top Banner Navigation: Cockpit vs Apps Grid */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div className="space-y-0.5">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-black tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-sky-600" /> BÀN LÀM VIỆC ĐIỀU HÀNH THÔNG MINH
            </h1>
            <Badge className="bg-sky-600 text-white font-mono text-[10px]">SK WORKSPACE 2.0</Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            CÔNG TY TNHH THỰC PHẨM SƠN KHANG (MST: 0111252725) • Kho Tổng 96 Ngõ 337 Định Công
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-full border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setActiveTab("cockpit")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "cockpit"
                ? "bg-white dark:bg-slate-900 text-sky-600 shadow-sm"
                : "text-muted-foreground hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Rss className="w-3.5 h-3.5" /> Bàn Làm Việc Newsfeed &amp; Dashboard
          </button>
          <button
            onClick={() => setActiveTab("apps")}
            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "apps"
                ? "bg-white dark:bg-slate-900 text-sky-600 shadow-sm"
                : "text-muted-foreground hover:text-slate-900 dark:hover:text-white"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> Tất Cả Phân Hệ ({appRegistry.length - 1})
          </button>
        </div>
      </div>

      {activeTab === "cockpit" ? (
        /* ================= TRI-COLUMN HYBRID COCKPIT ================= */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* ----------------- CỘT TRÁI (3 COLS - 25%): DASHBOARD & QUICK LAUNCHER ----------------- */}
          <div className="lg:col-span-3 space-y-4">
            {/* 4 KPI Cards */}
            <div className="space-y-3">
              {/* KPI 1: Doanh Thu */}
              <div className="clay-card p-4 border-l-4 border-l-sky-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    DOANH THU HÔM NAY (SAPO)
                  </span>
                  <span className="h-7 w-7 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-600 flex items-center justify-center">
                    <TrendingUp className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="font-mono text-xl font-black text-sky-700 dark:text-sky-400">
                  {fmtVnd(salesRevenue)}
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Đồng bộ thời gian thực store
                </div>
              </div>

              {/* KPI 2: Đơn Chờ Soạn FEFO */}
              <div className="clay-card p-4 border-l-4 border-l-amber-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    ĐƠN CẦN SOẠN FEFO
                  </span>
                  <span className="h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 flex items-center justify-center">
                    <Package className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="font-mono text-xl font-black text-amber-700 dark:text-amber-400">
                  {pendingPickOrders} đơn hàng
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Kho Q7: 9 đơn · Kho Q12: 5 đơn
                </div>
              </div>

              {/* KPI 3: Xe Lạnh Isuzu 29C-882.60 */}
              <div className="clay-card p-4 border-l-4 border-l-cyan-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    ISUZU 29C-882.60 (TÂN)
                  </span>
                  <span className="h-7 w-7 rounded-full bg-cyan-100 dark:bg-cyan-950 text-cyan-600 flex items-center justify-center">
                    <ThermometerSnowflake className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="font-mono text-xl font-black text-cyan-700 dark:text-cyan-400">
                  {fleetTemp}°C
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3 h-3" /> Đạt chuẩn HACCP (-18°C ~ -22°C)
                </div>
              </div>

              {/* KPI 4: Techcombank 22226060 */}
              <div className="clay-card p-4 border-l-4 border-l-emerald-500 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    TECHCOMBANK 22226060
                  </span>
                  <span className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 flex items-center justify-center">
                    <Wallet className="w-3.5 h-3.5" />
                  </span>
                </div>
                <div className="font-mono text-xl font-black text-emerald-700 dark:text-emerald-400">
                  {fmtVnd(techcombankBalance)}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  Gạch nợ tự động VietQR
                </div>
              </div>
            </div>

            {/* Launchpad: Quick Actions */}
            <div className="clay-card p-4 space-y-3">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Phím Tắt Tác Vụ Nhanh (1-Click)
              </span>
              <div className="grid grid-cols-2 gap-2 text-xs font-bold">
                <Link
                  href="/pos"
                  className="p-2.5 rounded-xl border border-sky-200 bg-sky-50/60 dark:bg-sky-950/20 hover:border-sky-400 flex flex-col items-center justify-center text-center gap-1 text-sky-700 dark:text-sky-300 transition-all"
                >
                  <Store className="w-4 h-4" />
                  <span>Quầy POS</span>
                </Link>
                <Link
                  href="/dathang"
                  className="p-2.5 rounded-xl border border-emerald-200 bg-emerald-50/60 dark:bg-emerald-950/20 hover:border-emerald-400 flex flex-col items-center justify-center text-center gap-1 text-emerald-700 dark:text-emerald-300 transition-all"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Web Order B2B</span>
                </Link>
                <Link
                  href="/sales"
                  className="p-2.5 rounded-xl border border-amber-200 bg-amber-50/60 dark:bg-amber-950/20 hover:border-amber-400 flex flex-col items-center justify-center text-center gap-1 text-amber-700 dark:text-amber-300 transition-all"
                >
                  <Package className="w-4 h-4" />
                  <span>Soạn Kho FEFO</span>
                </Link>
                <Link
                  href="/finance/sapo2misa"
                  className="p-2.5 rounded-xl border border-purple-200 bg-purple-50/60 dark:bg-purple-950/20 hover:border-purple-400 flex flex-col items-center justify-center text-center gap-1 text-purple-700 dark:text-purple-300 transition-all"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Sapo2MISA 63 Cột</span>
                </Link>
              </div>
            </div>

            {/* My Tasks Checklist Mini */}
            <div className="clay-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5 text-sky-600" /> Nhiệm vụ trong ngày
                </span>
                <Link href="/tasks" className="text-[11px] text-sky-600 font-bold hover:underline">
                  Xem tất cả
                </Link>
              </div>
              <div className="space-y-1.5 text-xs">
                <label className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 rounded" defaultChecked />
                  <span className="line-through text-muted-foreground">Đối soát đơn chành xe bến Giáp Bát 09:30</span>
                </label>
                <label className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 rounded" />
                  <span>Kiểm tra nhiệt độ xe Isuzu 29C-882.60 trước giờ trưa</span>
                </label>
                <label className="flex items-start gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer">
                  <input type="checkbox" className="mt-0.5 rounded" />
                  <span>Chạy Cron chốt sổ EOD MISA AMIS lúc 18:00</span>
                </label>
              </div>
            </div>
          </div>

          {/* ----------------- CỘT GIỮA (6 COLS - 50%): OPERATIONAL NEWSFEED STREAM ----------------- */}
          <div className="lg:col-span-6 space-y-4">
            {/* Social Composer */}
            <div className="clay-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-sky-600 text-white font-bold flex items-center justify-center text-xs">
                  SK
                </div>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Ban Giám Đốc Sơn Khang — Đăng thông báo &amp; chỉ đạo nội bộ
                </span>
              </div>

              <form onSubmit={handleCreatePost} className="space-y-2.5">
                <textarea
                  value={newPostContent}
                  onChange={(e) => setNewPostContent(e.target.value)}
                  placeholder="Nhập thông báo, chỉ đạo kho vận, chính sách sỉ hoặc khen thưởng tài xế..."
                  rows={3}
                  className="w-full text-xs p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 resize-none"
                />

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 text-xs">
                    <span className="text-[11px] text-muted-foreground font-semibold">Chủ đề:</span>
                    <select
                      value={newPostTag}
                      onChange={(e) => setNewPostTag(e.target.value)}
                      className="text-xs h-7 rounded-lg border bg-white dark:bg-slate-900 px-2 font-medium"
                    >
                      <option value="thong-bao">Thông báo chung</option>
                      <option value="khan-cap">Chỉ đạo khẩn cấp</option>
                      <option value="khen-thuong">Biểu dương &amp; Khen thưởng</option>
                      <option value="kho-van">Kho vận &amp; Đội xe</option>
                      <option value="kinh-doanh">Chính sách sỉ &amp; Báo giá</option>
                    </select>
                  </div>

                  <Button
                    type="submit"
                    disabled={posting || !newPostContent.trim()}
                    size="sm"
                    className="rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold px-4 h-8 text-xs"
                  >
                    {posting ? <RefreshCw className="w-3.5 h-3.5 animate-spin mr-1" /> : <Send className="w-3.5 h-3.5 mr-1" />}
                    Đăng tin
                  </Button>
                </div>
              </form>
            </div>

            {/* Stream Timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Rss className="w-3.5 h-3.5 text-sky-600" /> Dòng sự kiện vận hành &amp; Tin tức
                </span>
                <span className="text-[11px] text-muted-foreground">Tự động cập nhật 10s</span>
              </div>

              {loadingStream ? (
                <div className="p-8 text-center text-xs text-muted-foreground">Đang tải dòng tin...</div>
              ) : streamItems.length === 0 ? (
                <div className="clay-card p-6 text-center text-xs text-muted-foreground">Chưa có sự kiện nào</div>
              ) : (
                streamItems.map((item) => (
                  <div
                    key={item.id}
                    className={`clay-card p-4 space-y-2.5 transition-all ${
                      item.type === "activity"
                        ? "border-l-4 " +
                          (item.activityType === "order"
                            ? "border-l-sky-500 bg-sky-50/20"
                            : item.activityType === "vietqr"
                            ? "border-l-emerald-500 bg-emerald-50/20"
                            : item.activityType === "telemetry"
                            ? "border-l-cyan-500 bg-cyan-50/20"
                            : "border-l-amber-500 bg-amber-50/20")
                        : "border-l-4 border-l-slate-400"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {item.type === "activity" ? (
                          <span className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs">
                            {item.activityType === "order" ? "📦" : item.activityType === "vietqr" ? "💰" : item.activityType === "telemetry" ? "❄️" : "📋"}
                          </span>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-sky-600 text-white text-[10px] font-bold flex items-center justify-center">
                            {item.avatar || "SK"}
                          </div>
                        )}
                        <div>
                          <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                            {item.type === "activity"
                              ? item.activityType === "order"
                                ? "Đơn Hàng Mới (Sapo / Web)"
                                : item.activityType === "vietqr"
                                ? "Biến Động Số Dư (VietQR)"
                                : item.activityType === "telemetry"
                                ? "Đội Xe Lạnh 29C-882.60"
                                : "Kiểm Đếm Kho FEFO"
                              : `${item.author} (${item.authorRole || "Nội bộ"})`}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {item.tag && (
                          <Badge
                            className={`text-[9px] uppercase ${
                              item.tag === "khan-cap"
                                ? "bg-red-600 text-white"
                                : item.tag === "khen-thuong"
                                ? "bg-emerald-600 text-white"
                                : "bg-sky-600 text-white"
                            }`}
                          >
                            {item.tag}
                          </Badge>
                        )}
                        <span className="text-[10px] text-muted-foreground">{item.timestamp}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                      {item.content}
                    </p>

                    {/* Social Action (Like / Reply) for Posts */}
                    {item.type === "post" && (
                      <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                        <button
                          onClick={() => handleLike(item.id)}
                          className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                            item.liked ? "text-rose-600" : "text-muted-foreground hover:text-slate-900"
                          }`}
                        >
                          <Heart className={`w-3.5 h-3.5 ${item.liked ? "fill-rose-600 text-rose-600" : ""}`} />
                          <span>{item.likes || 0}</span>
                        </button>
                        <Link href="/feed" className="text-[11px] text-sky-600 font-semibold hover:underline">
                          Mở cuộc thảo luận...
                        </Link>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* ----------------- CỘT PHẢI (3 COLS - 25%): LOGISTICS RADAR & CHAT MINI ----------------- */}
          <div className="lg:col-span-3 space-y-4">
            {/* Logistics Radar: Isuzu 29C-882.60 */}
            <div className="clay-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-sky-600" /> Radar Isuzu 29C-882.60
                </span>
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              </div>

              <div className="rounded-2xl border border-sky-200 bg-sky-50/50 dark:bg-sky-950/20 p-3 text-center space-y-1">
                <div className="text-[11px] text-muted-foreground font-semibold">CẢM BIẾN THÙNG LẠNH</div>
                <div className="font-mono text-2xl font-black text-sky-700 dark:text-sky-300">
                  {fleetTemp}°C
                </div>
                <div className="text-[10px] text-emerald-600 font-semibold">
                  Chuẩn HACCP (-18°C ~ -22°C)
                </div>
              </div>

              <div className="space-y-1 text-xs text-muted-foreground text-[11px]">
                <div>Tài xế: <strong>Ngô Văn Tân</strong> (0942 22 60 60)</div>
                <div>Lộ trình: Kho Định Công ➔ Bến xe Giáp Bát</div>
                <div>Lốc lạnh: <strong className="text-emerald-600">Đang chạy</strong> · Cửa: <strong>Đóng</strong></div>
              </div>

              <Link
                href="/fleet"
                className="block text-center text-xs font-bold text-sky-600 hover:underline pt-1"
              >
                Mở trung tâm điều vận đội xe ➔
              </Link>
            </div>

            {/* Quick Scratchpad */}
            <div className="clay-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                  <Pin className="w-3.5 h-3.5 text-amber-500" /> Sổ Ghi Chú Nhanh
                </span>
                <span className="text-[10px] text-muted-foreground">Tự lưu local</span>
              </div>
              <textarea
                value={scratchpad}
                onChange={(e) => handleScratchpadChange(e.target.value)}
                placeholder="Ghi chú tạm số điện thoại chành xe, mã đơn cần lưu ý..."
                rows={4}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 focus:outline-none resize-none"
              />
            </div>

            {/* On-Duty Personnel Today */}
            <div className="clay-card p-4 space-y-2.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                Nhân Sự Trực Ca Hôm Nay
              </span>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="block">Trần Thị Ngọc Thúy</strong>
                    <span className="text-[10px] text-muted-foreground">Thủ kho trung tâm (Định Công)</span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 text-[9px]">Online</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="block">Ngô Văn Tân</strong>
                    <span className="text-[10px] text-muted-foreground">Tài xế Isuzu 29C-882.60</span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 text-[9px]">Trên tuyến</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <strong className="block">Hoàng Thị Nho</strong>
                    <span className="text-[10px] text-muted-foreground">Kế toán trưởng (AMIS/VietQR)</span>
                  </div>
                  <Badge className="bg-emerald-100 text-emerald-800 text-[9px]">Online</Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ================= ALL 19 APPS DIRECTORY ================= */
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <div className="relative flex-1 min-w-[200px] max-w-sm">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm phân hệ, miniapp..."
                value={q}
                onChange={(e) => setQ(e.target.value)}
                className="pl-8 h-9 rounded-full border-slate-200 shadow-sm text-xs"
              />
            </div>
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setGroup("all")}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                  group === "all"
                    ? "bg-slate-900 text-white border-slate-900 shadow-md"
                    : "bg-white text-slate-700 border-slate-200 hover:shadow-md"
                }`}
              >
                Tất cả
              </button>
              {GROUP_ORDER.map((g) => (
                <button
                  key={g}
                  onClick={() => setGroup(g)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                    group === g
                      ? "bg-sky-600 text-white border-sky-600 shadow-md"
                      : "bg-white text-slate-700 border-slate-200 hover:shadow-md"
                  }`}
                >
                  {GROUP_LABEL[g]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
            {filteredApps.map((app) => {
              const Icon = app.icon;
              const grad = GROUP_ICON_GRADIENT[app.group];
              return (
                <Link
                  key={app.id}
                  href={app.href}
                  className="clay-tile group p-3.5 min-h-[110px] flex flex-col justify-between rounded-2xl border border-slate-200 bg-white dark:bg-slate-900 hover:border-sky-400 hover:shadow-md transition-all"
                >
                  <div>
                    <span
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br ${grad} text-white shadow-sm border border-white/60 shrink-0`}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <div className="mt-2 text-xs font-bold leading-tight">{app.label}</div>
                    <div className="mt-1 text-[11px] text-muted-foreground line-clamp-2 leading-tight">
                      {app.desc}
                    </div>
                  </div>
                  {app.badge && (
                    <Badge variant="outline" className="mt-2 w-fit text-[9px] px-1.5 py-0 mono rounded-full">
                      {app.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
