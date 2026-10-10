"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { FeedComment } from "@/packages/modules/feed/types";

interface Props {
  postId: string;
  comments: FeedComment[];
  onCommentAdded?: () => void;
}

export default function CommentThread({ postId, comments, onCommentAdded }: Props) {
  const [content, setContent] = React.useState("");
  const [replyTo, setReplyTo] = React.useState<string | null>(null);
  const [sending, setSending] = React.useState(false);

  // Build threaded structure: top-level + replies map
  const topLevel = React.useMemo(() => comments.filter((c) => !c.parentId), [comments]);
  const repliesByParent = React.useMemo(() => {
    const map = new Map<string, FeedComment[]>();
    for (const c of comments) {
      if (c.parentId) {
        const list = map.get(c.parentId) ?? [];
        list.push(c);
        map.set(c.parentId, list);
      }
    }
    return map;
  }, [comments]);

  const handleSend = async () => {
    const trimmed = content.trim();
    if (!trimmed) return;
    setSending(true);
    try {
      const res = await fetch(`/api/feed/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed, parentId: replyTo }),
      });
      if (res.ok) {
        setContent("");
        setReplyTo(null);
        onCommentAdded?.();
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-3 border-t pt-3">
      {topLevel.length === 0 && (
        <p className="text-xs text-muted-foreground">Chua co binh luan. Hay la nguoi dau tien!</p>
      )}

      <div className="space-y-2">
        {topLevel.map((c) => {
          const replies = repliesByParent.get(c.id) ?? [];
          return (
            <div key={c.id} className="space-y-1.5">
              <div className="flex gap-2">
                <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-bold shrink-0">
                  {c.author.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 rounded-xl bg-slate-50 px-3 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-semibold text-slate-900">{c.author}</span>
                    <span className="text-[10px] text-muted-foreground">{new Date(c.createdAt).toLocaleString("vi-VN")}</span>
                  </div>
                  <p className="text-xs text-slate-700 mt-0.5">{c.content}</p>
                  <button
                    type="button"
                    onClick={() => setReplyTo(c.id)}
                    className="mt-1 text-[11px] font-medium text-sky-600 hover:underline"
                  >
                    Tra loi
                  </button>
                </div>
              </div>

              {replies.map((r) => (
                <div key={r.id} className="flex gap-2" style={{ marginLeft: 16 }}>
                  <div className="h-5 w-5 rounded-full bg-slate-200 flex items-center justify-center text-[9px] font-bold shrink-0">
                    {r.author.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 rounded-xl bg-sky-50/60 px-3 py-2 border border-sky-100">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-slate-900">{r.author}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(r.createdAt).toLocaleString("vi-VN")}</span>
                    </div>
                    <p className="text-xs text-slate-700 mt-0.5">{r.content}</p>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {replyTo && (
        <div className="flex items-center justify-between rounded-full bg-amber-50 border border-amber-200 px-3 py-1 text-xs">
          <span className="text-amber-800">Dang tra loi binh luan...</span>
          <button type="button" onClick={() => setReplyTo(null)} className="font-semibold text-amber-700 hover:underline">Huy</button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder={replyTo ? "Viet tra loi..." : "Viet binh luan..."}
          className="h-8 text-xs rounded-full flex-1"
        />
        <Button size="sm" onClick={handleSend} disabled={sending || !content.trim()} className="h-8 rounded-full text-xs">
          {sending ? "..." : "Gui"}
        </Button>
      </div>
    </div>
  );
}
