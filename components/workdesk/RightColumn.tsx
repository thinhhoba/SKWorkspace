"use client";

import * as React from "react";
import FleetRadarWidget from "./FleetRadarWidget";
import ChatMiniWidget from "./ChatMiniWidget";
import ScratchpadWidget from "./ScratchpadWidget";
import OnlineStaffWidget from "./OnlineStaffWidget";
import { Users, MessageSquare, StickyNote } from "lucide-react";

type DockTab = "staff" | "chat" | "notes";

export default function RightColumn() {
  const [activeTab, setActiveTab] = React.useState<DockTab>("staff");

  return (
    <div className="space-y-4">
      {/* 1. Radar Chuỗi Lạnh & Giám sát nhiệt độ xe tải Isuzu — Luôn hiển thị vị trí ưu tiên */}
      <FleetRadarWidget />

      {/* 2. Hub Tác Vụ Vận Hành (Operations Dock) — Gom Trực ca, Chat và Ghi chú vào Tabbed Dock để chống Visual Clutter */}
      <div className="clay-card p-4 space-y-3">
        {/* Thanh chuyển tab gọn gàng */}
        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
            Bàn Vận Hành Phụ
          </span>
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-0.5 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab("staff")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                activeTab === "staff"
                  ? "bg-white dark:bg-slate-900 text-sky-600 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-3 h-3" />
              <span>Trực ca</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                activeTab === "chat"
                  ? "bg-white dark:bg-slate-900 text-sky-600 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <MessageSquare className="w-3 h-3" />
              <span>Chat</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("notes")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-bold transition-all ${
                activeTab === "notes"
                  ? "bg-white dark:bg-slate-900 text-sky-600 shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <StickyNote className="w-3 h-3" />
              <span>Ghi chú</span>
            </button>
          </div>
        </div>

        {/* Nội dung tab tương ứng */}
        <div className="min-h-[220px]">
          {activeTab === "staff" && <OnlineStaffWidget />}
          {activeTab === "chat" && <ChatMiniWidget />}
          {activeTab === "notes" && <ScratchpadWidget bare />}
        </div>
      </div>
    </div>
  );
}
