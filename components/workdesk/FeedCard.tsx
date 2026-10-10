"use client";
import * as React from "react";
import { Heart, Pin, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import CommentThread from "./CommentThread";
import type { FeedStreamItem, FeedTag } from "@/packages/modules/feed/types";

const TAG_CLASS: Record<FeedTag, string> = {
  "thong-bao": "bg-slate-100 text-slate-700 border-slate-300",
  "khen-thuong": "bg-emerald-50 text-emerald-700 border-emerald-300",
  "kho-van": "bg-amber-50 text-amber-700 border-amber-300",
  "kinh-doanh": "bg-sky-50 text-sky-700 border-sky-300",
  "khan-cap": "bg-red-100 text-red-700 border-red-300",
};

const ACTIVITY_ICON: Record<string, string> = {
  order_new: "📦",
  vietqr: "💰",
  fleet_move: "❄️",
  fefo_done: "📋",
};

interface Props {
  item: FeedStreamItem;
  onUpdate?: () => void;
}

export default function FeedCard({ item, onUpdate }: Props) {
  const [showComments, setShowComments] = React.useState(false);
  const [liking, setLiking] = React.useState(false);
  const [pinning, setPinning] = React.useState(false);

  if (item.kind === "activity" && item.activity) {
    const a = item.activity;
    return (
      <Card className="rounded-2xl border-dashed bg-slate-50/60">
        <CardContent className="p-4 flex gap-3">
          <span className="text-xl shrink-0">{ACTIVITY_ICON[a.type] ?? "🔔"}</span>
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-semibold text-slate-900">{a.title}</p>
            <p className="text-xs text-muted-foreground">{a.description}</p>
            <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
              {a.amount != null && (
                <span className="font-medium text-emerald-700">
                  {a.amount.toLocaleString("vi-VN")}d
                </span>
              )}
              {a.aliasCode && <Badge variant="outline" className="text-[11px]">{a.aliasCode}</Badge>}
              <span>{new Date(a.createdAt).toLocaleString("vi-VN")}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (item.kind === "post" && item.post) {
    const post = item.post;

    const handleLike = async () => {
      setLiking(true);
      try {
        await fetch(`/api/feed/posts/${post.id}/like`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({}) });
        onUpdate?.();
      } finally {
        setLiking(false);
      }
    };

    const handlePin = async () => {
      setPinning(true);
      try {
        await fetch(`/api/feed/posts/${post.id}/pin`, { method: "POST" });
        onUpdate?.();
      } finally {
        setPinning(false);
      }
    };

    const handleCommentAdded = () => {
      onUpdate?.();
    };

    return (
      <Card className="rounded-2xl">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2.5">
              <div className="h-9 w-9 rounded-xl bg-sky-100 flex items-center justify-center text-sm shrink-0">
                {post.avatar}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-slate-900">{post.author}</span>
                  {post.pinned && (
                    <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-300">Ghim</Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">{post.authorRole} - {new Date(post.createdAt).toLocaleString("vi-VN")}</span>
              </div>
            </div>
            <Badge variant="outline" className={`text-xs shrink-0 ${TAG_CLASS[post.tag]}`}>#{post.tag}</Badge>
          </div>

          <p className="text-sm text-slate-800 whitespace-pre-line leading-relaxed">{post.content}</p>

          <div className="flex items-center gap-2 border-t pt-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={liking}
              className={`h-8 rounded-full text-xs gap-1.5 ${post.likedByMe ? "text-rose-600" : "text-muted-foreground"}`}
            >
              <Heart className={`h-4 w-4 ${post.likedByMe ? "fill-current" : ""}`} />
              {post.likes} Like
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowComments((v) => !v)}
              className="h-8 rounded-full text-xs gap-1.5 text-muted-foreground"
            >
              <MessageSquare className="h-4 w-4" />
              {post.comments.length} Binh luan
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={handlePin}
              disabled={pinning}
              className="h-8 rounded-full text-xs gap-1.5 text-muted-foreground ml-auto"
              title="Ghim / Bo ghim"
            >
              <Pin className={`h-4 w-4 ${post.pinned ? "fill-current text-amber-600" : ""}`} />
              {post.pinned ? "Bo ghim" : "Ghim"}
            </Button>
          </div>

          {showComments && (
            <CommentThread postId={post.id} comments={post.comments} onCommentAdded={handleCommentAdded} />
          )}
        </CardContent>
      </Card>
    );
  }

  return null;
}
