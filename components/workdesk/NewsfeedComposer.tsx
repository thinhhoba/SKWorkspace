"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquarePlus, Send, X, ChevronDown, Sparkles } from "lucide-react";
import type { FeedTag, FeedAuthorRole, FeedPost } from "@/packages/modules/feed/types";

const TAGS: { value: FeedTag; label: string; activeClass: string; inactiveClass: string }[] = [
  {
    value: "thong-bao",
    label: "#thong-bao",
    activeClass: "bg-slate-800 text-white border-slate-800 dark:bg-slate-200 dark:text-slate-900",
    inactiveClass: "bg-slate-100 text-slate-700 hover:bg-slate-200 border-slate-200 dark:bg-slate-800 dark:text-slate-300",
  },
  {
    value: "khan-cap",
    label: "#khan-cap",
    activeClass: "bg-rose-600 text-white border-rose-600",
    inactiveClass: "bg-rose-50 text-rose-700 hover:bg-rose-100 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300",
  },
  {
    value: "kho-van",
    label: "#kho-van",
    activeClass: "bg-amber-600 text-white border-amber-600",
    inactiveClass: "bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300",
  },
  {
    value: "kinh-doanh",
    label: "#kinh-doanh",
    activeClass: "bg-sky-600 text-white border-sky-600",
    inactiveClass: "bg-sky-50 text-sky-700 hover:bg-sky-100 border-sky-200 dark:bg-sky-950/40 dark:text-sky-300",
  },
  {
    value: "khen-thuong",
    label: "#khen-thuong",
    activeClass: "bg-emerald-600 text-white border-emerald-600",
    inactiveClass: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300",
  },
];

interface Props {
  onPostCreated?: (post: FeedPost) => void;
  fixedAuthorRole?: FeedAuthorRole;
}

export default function NewsfeedComposer({ onPostCreated, fixedAuthorRole }: Props) {
  const [expanded, setExpanded] = React.useState(false);
  const [content, setContent] = React.useState("");
  const [tag, setTag] = React.useState<FeedTag>("thong-bao");
  const displayRole: FeedAuthorRole = fixedAuthorRole ?? "Giám đốc";
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError("Vui lòng nhập nội dung bài đăng");
      return;
    }
    if (trimmed.length > 5000) {
      setError("Nội dung tối đa 5.000 ký tự");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/feed/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: trimmed, tag }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Đăng bài thất bại");
        return;
      }
      setContent("");
      setExpanded(false);
      onPostCreated?.(data.post as FeedPost);
    } catch {
      setError("Lỗi kết nối, vui lòng thử lại sau");
    } finally {
      setLoading(false);
    }
  };

  // Trạng thái thu gọn (Collapsed View — Tinh gọn, không chiếm đất vàng)
  if (!expanded) {
    return (
      <div
        onClick={() => setExpanded(true)}
        className="clay-card rounded-2xl border border-slate-200/90 dark:border-slate-800 p-3 flex items-center justify-between gap-3 cursor-pointer hover:border-sky-400/80 transition-all bg-white/80 dark:bg-slate-900/80 shadow-sm group"
      >
        <div className="flex items-center gap-2.5 text-muted-foreground flex-1 min-w-0">
          <div className="h-8 w-8 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <MessageSquarePlus className="w-4 h-4" />
          </div>
          <span className="text-xs font-medium truncate text-slate-500 dark:text-slate-400 group-hover:text-slate-800 dark:group-hover:text-slate-200 transition-colors">
            Viết chỉ đạo điều hành, thông báo ca làm việc mới...
          </span>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="rounded-full h-8 text-xs font-semibold shrink-0 gap-1.5 border-slate-200 dark:border-slate-700"
        >
          <Sparkles className="w-3.5 h-3.5 text-sky-600" />
          <span>Tạo tin</span>
        </Button>
      </div>
    );
  }

  // Trạng thái mở rộng (Expanded Composer)
  return (
    <Card className="rounded-2xl border-sky-300 dark:border-sky-900/60 shadow-sm bg-white dark:bg-slate-900 transition-all">
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <MessageSquarePlus className="w-4 h-4 text-sky-600" />
            <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
              Đăng Thông Báo &amp; Chỉ Đạo Điều Hành
            </span>
            <Badge variant="outline" className="text-[10px] bg-slate-50 dark:bg-slate-800">
              {displayRole}
            </Badge>
          </div>
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              setError("");
            }}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
            aria-label="Thu gọn"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Nhập nội dung thông báo ca, chỉ đạo xuất nhập kho hoặc khen thưởng..."
          rows={3}
          autoFocus
          className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 p-3 text-sm outline-none focus:border-sky-500 placeholder:text-muted-foreground transition-colors resize-none"
        />

        {/* Chuẩn hóa Chip-Select Tags (Bỏ dropdown thừa) */}
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-muted-foreground block">
            Chọn chủ đề thẻ (Tags):
          </span>
          <div className="flex flex-wrap items-center gap-1.5">
            {TAGS.map((t) => {
              const active = tag === t.value;
              return (
                <button
                  key={t.value}
                  type="button"
                  onClick={() => setTag(t.value)}
                  className={`text-xs px-2.5 py-1 rounded-full border font-semibold transition-all cursor-pointer ${
                    active ? t.activeClass : t.inactiveClass
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        </div>

        {error && (
          <p className="text-xs text-rose-600 font-medium bg-rose-50 dark:bg-rose-950/40 p-2 rounded-lg border border-rose-200 dark:border-rose-900">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between pt-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => setExpanded(false)}
            className="rounded-full text-xs text-muted-foreground"
          >
            Thu gọn
          </Button>

          <Button
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
            size="sm"
            className="rounded-full bg-sky-600 text-white hover:bg-sky-700 gap-1.5 px-4 font-semibold text-xs"
          >
            {loading ? "Đang đăng..." : "Đăng thông báo"}
            <Send className="w-3.5 h-3.5" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
