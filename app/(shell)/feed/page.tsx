"use client";
import * as React from "react";
import {
  Rss,
  Heart,
  MessageSquare,
  Share2,
  Send,
  Plus,
  Tag,
  Sparkles,
  Award,
  AlertCircle,
  Truck,
  Warehouse,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Comment {
  id: string;
  author: string;
  role: string;
  content: string;
  createdAt: string;
}

interface Post {
  id: string;
  author: string;
  role: string;
  avatarText: string;
  avatarBg: string;
  title: string;
  content: string;
  tag: "thong-bao" | "khen-thuong" | "kho-van" | "kinh-doanh";
  likes: number;
  liked: boolean;
  comments: Comment[];
  createdAt: string;
  pinned?: boolean;
}

const INITIAL_POSTS: Post[] = [];

const TAG_LABELS: Record<Post["tag"], { label: string; color: string }> = {
  "thong-bao": { label: "Thông báo chung", color: "bg-slate-100 text-slate-800 border-slate-300" },
  "khen-thuong": { label: "Khen thưởng", color: "bg-emerald-50 text-emerald-700 border-emerald-300" },
  "kho-van": { label: "Kho vận & Kỹ thuật", color: "bg-amber-50 text-amber-700 border-amber-300" },
  "kinh-doanh": { label: "Chính sách kinh doanh", color: "bg-sky-50 text-sky-700 border-sky-300" },
};

export default function FeedPage() {
  const [posts, setPosts] = React.useState<Post[]>(INITIAL_POSTS);
  const [filterTag, setFilterTag] = React.useState<string>("all");
  const [showCreate, setShowCreate] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState("");
  const [newContent, setNewContent] = React.useState("");
  const [newTag, setNewTag] = React.useState<Post["tag"]>("thong-bao");
  const [commentInputs, setCommentInputs] = React.useState<Record<string, string>>({});

  const toggleLike = (postId: string) => {
    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        return {
          ...p,
          liked: !p.liked,
          likes: p.liked ? p.likes - 1 : p.likes + 1,
        };
      })
    );
  };

  const handleAddComment = (postId: string) => {
    const text = (commentInputs[postId] || "").trim();
    if (!text) return;

    setPosts((prev) =>
      prev.map((p) => {
        if (p.id !== postId) return p;
        const newC: Comment = {
          id: `c-${Date.now()}`,
          author: "Tôi (Nhân viên trực)",
          role: "Nội bộ Sơn Khang",
          content: text,
          createdAt: "Vừa xong",
        };
        return { ...p, comments: [...p.comments, newC] };
      })
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    const newPost: Post = {
      id: `post-${Date.now()}`,
      author: "Hồ Bá Thịnh",
      role: "Quản trị viên",
      avatarText: "BT",
      avatarBg: "bg-indigo-600",
      title: newTitle.trim(),
      content: newContent.trim(),
      tag: newTag,
      likes: 0,
      liked: false,
      comments: [],
      createdAt: "Vừa xong",
    };

    setPosts([newPost, ...posts]);
    setNewTitle("");
    setNewContent("");
    setShowCreate(false);
  };

  const filteredPosts = posts.filter((p) => filterTag === "all" || p.tag === filterTag);

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Rss className="w-5 h-5 text-sky-500" /> Bảng Tin Nội Bộ Sơn Khang
          </h1>
          <p className="text-xs text-muted-foreground">
            Thông báo điều hành, tiến độ chuỗi cung ứng thực phẩm đông lạnh & khen thưởng
          </p>
        </div>
        <Button
          onClick={() => setShowCreate(!showCreate)}
          size="sm"
          className="rounded-full bg-sky-600 hover:bg-sky-700 text-white font-semibold"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Đăng tin mới
        </Button>
      </div>

      {/* Create Post Card */}
      {showCreate && (
        <form onSubmit={handleCreatePost} className="rounded-3xl border border-sky-200 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-sky-500" /> Tạo bản tin công ty mới
          </h2>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Tiêu đề bản tin (VD: Cập nhật lịch nhập hàng cá viên tuần này)..."
            required
            className="text-sm font-semibold"
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Nội dung chi tiết thông báo gửi đến toàn thể đội ngũ Sơn Khang..."
            required
            rows={3}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent p-3 text-sm outline-none focus:border-sky-500"
          />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">Phân loại:</span>
              <select
                value={newTag}
                onChange={(e) => setNewTag(e.target.value as Post["tag"])}
                className="h-8 rounded-full border bg-white dark:bg-slate-950 px-3 text-xs"
              >
                <option value="thong-bao">Thông báo chung</option>
                <option value="kinh-doanh">Chính sách kinh doanh</option>
                <option value="kho-van">Kho vận & Kỹ thuật</option>
                <option value="khen-thuong">Khen thưởng</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowCreate(false)}>Hủy</Button>
              <Button type="submit" size="sm" className="bg-sky-600 text-white rounded-full">Đăng bài</Button>
            </div>
          </div>
        </form>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <Button
          variant={filterTag === "all" ? "default" : "outline"}
          size="sm"
          className="rounded-full h-8"
          onClick={() => setFilterTag("all")}
        >
          Tất cả ({posts.length})
        </Button>
        <Button
          variant={filterTag === "kinh-doanh" ? "default" : "outline"}
          size="sm"
          className="rounded-full h-8"
          onClick={() => setFilterTag("kinh-doanh")}
        >
          Kinh doanh
        </Button>
        <Button
          variant={filterTag === "khen-thuong" ? "default" : "outline"}
          size="sm"
          className="rounded-full h-8"
          onClick={() => setFilterTag("khen-thuong")}
        >
          Khen thưởng
        </Button>
        <Button
          variant={filterTag === "kho-van" ? "default" : "outline"}
          size="sm"
          className="rounded-full h-8"
          onClick={() => setFilterTag("kho-van")}
        >
          Kho & Xe lạnh
        </Button>
      </div>

      {/* Post List */}
      <div className="space-y-4">
        {filteredPosts.length === 0 && (
          <div className="rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center space-y-3 bg-white/40 dark:bg-slate-900/40">
            <div className="mx-auto w-12 h-12 rounded-full bg-sky-50 dark:bg-sky-950/40 flex items-center justify-center text-sky-600">
              <Rss className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Chưa có bản tin nội bộ nào</h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Bấm nút &quot;Đăng tin mới&quot; ở trên để tạo thông báo điều hành, khen thưởng hoặc thông tin kỹ thuật kho vận.
            </p>
          </div>
        )}
        {filteredPosts.map((post) => (
          <div key={post.id} className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
            {/* Author info & Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-2xl ${post.avatarBg} text-white flex items-center justify-center font-bold text-sm shadow-sm`}>
                  {post.avatarText}
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    {post.author}
                    {post.pinned && (
                      <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700 border-amber-300">
                        Ghim
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {post.role} • {post.createdAt}
                  </div>
                </div>
              </div>
              <Badge variant="outline" className={`text-xs ${TAG_LABELS[post.tag].color}`}>
                {TAG_LABELS[post.tag].label}
              </Badge>
            </div>

            {/* Post Content */}
            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {post.title}
              </h2>
              <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                {post.content}
              </p>
            </div>

            {/* Post Metrics & Actions */}
            <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800 pt-3">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${
                    post.liked ? "text-rose-600" : "text-muted-foreground hover:text-slate-900"
                  }`}
                >
                  <Heart className={`w-4 h-4 ${post.liked ? "fill-current" : ""}`} />
                  <span>{post.likes} Yêu thích</span>
                </button>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-semibold">
                  <MessageSquare className="w-4 h-4" />
                  <span>{post.comments.length} Bình luận</span>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            {post.comments.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                {post.comments.map((cm) => (
                  <div key={cm.id} className="rounded-2xl bg-slate-50 dark:bg-slate-800/60 p-3 text-xs space-y-1">
                    <div className="flex items-center justify-between font-semibold">
                      <span className="text-slate-900 dark:text-slate-100">{cm.author} <span className="font-normal text-muted-foreground">({cm.role})</span></span>
                      <span className="text-[10px] text-muted-foreground">{cm.createdAt}</span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300">{cm.content}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Add Comment Input */}
            <div className="flex items-center gap-2 pt-1">
              <Input
                value={commentInputs[post.id] || ""}
                onChange={(e) =>
                  setCommentInputs((prev) => ({ ...prev, [post.id]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAddComment(post.id);
                }}
                placeholder="Viết phản hồi nội bộ..."
                className="h-8 text-xs rounded-full"
              />
              <Button
                size="sm"
                variant="secondary"
                onClick={() => handleAddComment(post.id)}
                className="h-8 rounded-full px-3 text-xs"
              >
                <Send className="w-3.5 h-3.5 mr-1" /> Gửi
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
