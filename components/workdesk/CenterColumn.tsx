"use client";

import * as React from "react";
import { Rss, Radio } from "lucide-react";
import OrderPipelineWidget from "./OrderPipelineWidget";
import NewsfeedComposer from "./NewsfeedComposer";
import FeedCard from "./FeedCard";
import type { FeedStreamItem, FeedPost } from "@/packages/modules/feed/types";

interface CenterColumnProps {
  streamItems: FeedStreamItem[];
  loading: boolean;
  onPostCreated: (post: FeedPost) => void;
  onRefresh: () => void;
  salesStats?: {
    cho_duyet?: number;
    cho_soan?: number;
    dang_soan?: number;
    dang_giao?: number;
    hoan_tat?: number;
  };
  fleetTemp?: number;
  fefoAlertCount?: number;
}

export default function CenterColumn({
  streamItems,
  loading,
  onPostCreated,
  onRefresh,
  salesStats,
  fleetTemp,
  fefoAlertCount,
}: CenterColumnProps) {
  const sorted = React.useMemo(() => {
    return [...streamItems].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [streamItems]);

  return (
    <div className="space-y-4">
      {/* 1. Khu vực trọng yếu trung tâm: Luồng đơn hàng & Cảnh báo bất thường */}
      <OrderPipelineWidget
        stats={salesStats}
        fleetTemp={fleetTemp}
        fefoAlertCount={fefoAlertCount}
      />

      {/* 2. Thanh tạo thông báo tinh gọn (Expandable Newsfeed Composer) */}
      <NewsfeedComposer onPostCreated={onPostCreated} />

      {/* 3. Dòng sự kiện vận hành & Tin tức nội bộ */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Rss className="w-3.5 h-3.5 text-sky-600" /> Dòng Sự Kiện Vận Hành &amp; Tin Tức
          </span>
          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>Trực tiếp • Tự động đồng bộ</span>
          </span>
        </div>

        {loading ? (
          <div className="clay-card p-8 text-center text-xs text-muted-foreground">
            Đang tải dòng sự kiện vận hành...
          </div>
        ) : sorted.length === 0 ? (
          <div className="clay-card p-6 text-center text-xs text-muted-foreground">
            Chưa có sự kiện nào trong ca làm việc này.
          </div>
        ) : (
          sorted.map((item) => {
            const key = item.post?.id ?? item.activity?.id ?? item.createdAt;
            return <FeedCard key={key} item={item} onUpdate={onRefresh} />;
          })
        )}
      </div>
    </div>
  );
}
