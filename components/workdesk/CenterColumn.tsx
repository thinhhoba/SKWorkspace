"use client";
import * as React from "react";
import { Rss } from "lucide-react";
import NewsfeedComposer from "./NewsfeedComposer";
import FeedCard from "./FeedCard";
import type { FeedStreamItem, FeedPost } from "@/packages/modules/feed/types";

interface CenterColumnProps {
  streamItems: FeedStreamItem[];
  loading: boolean;
  onPostCreated: (post: FeedPost) => void;
  onRefresh: () => void;
}

export default function CenterColumn({ streamItems, loading, onPostCreated, onRefresh }: CenterColumnProps) {
  const sorted = React.useMemo(() => {
    return [...streamItems].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [streamItems]);

  return (
    <div className="space-y-4">
      <NewsfeedComposer onPostCreated={onPostCreated} />
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Rss className="w-3.5 h-3.5 text-sky-600" /> Dong su kien van hanh &amp; Tin tuc
          </span>
          <span className="text-[11px] text-muted-foreground">Tu dong cap nhat 10s</span>
        </div>
        {loading ? (
          <div className="clay-card p-8 text-center text-xs text-muted-foreground">Dang tai dong tin...</div>
        ) : sorted.length === 0 ? (
          <div className="clay-card p-6 text-center text-xs text-muted-foreground">Chua co su kien nao</div>
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
