"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import type { FeedTag, FeedAuthorRole, FeedPost } from "@/packages/modules/feed/types";

const TAGS: { value: FeedTag; label: string }[] = [
  { value: "thong-bao", label: "#thong-bao" },
  { value: "khen-thuong", label: "#khen-thuong" },
  { value: "kho-van", label: "#kho-van" },
  { value: "kinh-doanh", label: "#kinh-doanh" },
  { value: "khan-cap", label: "#khan-cap" },
];

const TAG_CLASS: Record<FeedTag, string> = {
  "thong-bao": "bg-slate-100 text-slate-700 border-slate-300",
  "khen-thuong": "bg-emerald-50 text-emerald-700 border-emerald-300",
  "kho-van": "bg-amber-50 text-amber-700 border-amber-300",
  "kinh-doanh": "bg-sky-50 text-sky-700 border-sky-300",
  "khan-cap": "bg-red-50 text-red-700 border-red-300",
};

interface Props {
  onPostCreated?: (post: FeedPost) => void;
  fixedAuthorRole?: FeedAuthorRole;
}

export default function NewsfeedComposer({ onPostCreated, fixedAuthorRole }: Props) {
  const [content, setContent] = React.useState("");
  const [tag, setTag] = React.useState<FeedTag>("thong-bao");
  const displayRole: FeedAuthorRole = fixedAuthorRole ?? "Giam doc";
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async () => {
    const trimmed = content.trim();
    if (!trimmed) {
      setError("Vui long nhap noi dung bai dang");
      return;
    }
    if (trimmed.length > 5000) {
      setError("Noi dung toi da 5000 ky tu");
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
        setError(data.error || "Dang bai that bai");
        return;
      }
      setContent("");
      onPostCreated?.(data.post as FeedPost);
    } catch {
      setError("Loi ket noi, vui long thu lai");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="rounded-2xl border-sky-200">
      <CardContent className="p-4 space-y-3">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Viet noi dung bai dang..."
          rows={3}
          className="w-full rounded-xl border border-slate-200 bg-transparent p-3 text-sm outline-none focus:border-sky-500 placeholder:text-muted-foreground"
        />

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Tag:</span>
          <select
            value={tag}
            onChange={(e) => setTag(e.target.value as FeedTag)}
            className="h-8 rounded-full border bg-white px-3 text-xs"
          >
            {TAGS.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          <Badge variant="outline" className={`text-xs ${TAG_CLASS[tag]}`}>{tag === "khan-cap" ? "#khan-cap" : `#${tag}`}</Badge>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-muted-foreground">Vai trò:</span>
          <Badge variant="outline" className="text-xs bg-slate-50">{displayRole}</Badge>
          <span className="text-[10px] text-muted-foreground">(theo tài khoản đăng nhập)</span>
        </div>

        {error && <p className="text-xs text-red-600">{error}</p>}

        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={loading || !content.trim()}
            size="sm"
            className="rounded-full bg-sky-600 text-white hover:bg-sky-700"
          >
            {loading ? "Dang dang..." : "Dang bai"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
