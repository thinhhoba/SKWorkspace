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

const INITIAL_POSTS: Post[] = [
  {
    id: "post-1",
    author: "Ban Giám Đốc Sơn Khang",
    role: "Quản trị hệ thống",
    avatarText: "SK",
    avatarBg: "bg-sky-600",
    title: "Chính sách chiết khấu chành xe & căn tin trường học Quý 4/2026",
    content:
      "Công ty thông báo cập nhật bảng giá sỉ mới cho nhóm khách chành xe (Cấp 1 - chiết khấu 12%) và chuỗi căn tin (Cấp 2 - chiết khấu 7%). Mọi đơn đặt trên 5 thùng xúc xích, gà popcorn hoặc cá viên được hỗ trợ cấp đá gel đông lạnh miễn phí.",
    tag: "kinh-doanh",
    likes: 18,
    liked: false,
    pinned: true,
    createdAt: "Hôm nay 08:30",
    comments: [
      {
        id: "c-1",
        author: "Ngô Văn Tân",
        role: "Tài xế xe 29C-882.60",
        content: "Đã nắm thông tin chính sách đóng thùng đá gel, sáng nay em vừa giao đủ 30 thùng cho bến xe Giáp Bát ạ.",
        createdAt: "09:15",
      },
      {
        id: "c-2",
        author: "Nguyễn Thị Mai",
        role: "Kế toán bán hàng",
        content: "Hóa đơn điện tử và VietQR tự động trên hệ thống đã khớp tỷ lệ chiết khấu mới.",
        createdAt: "09:40",
      },
    ],
  },
  {
    id: "post-2",
    author: "Bộ Phận Điều Vận & Đội Xe",
    role: "Điều phối vận tải",
    avatarText: "TX",
    avatarBg: "bg-emerald-600",
    title: "Biểu dương tài xế Ngô Văn Tân - Xe tải lạnh 29C-882.60 hoàn thành 100% chuyến giao",
    content:
      "Tài xế Ngô Văn Tân (SĐT 0942 22 60 60) đã duy trì nhiệt độ thùng lạnh Isuzu QKR đạt chuẩn -18.5°C liên tục trong tuần qua, hoàn thành giao đúng giờ 85 đơn hàng sỉ mà không phát sinh bất kỳ khiếu nại chất lượng nào.",
    tag: "khen-thuong",
    likes: 24,
    liked: true,
    createdAt: "Hôm qua 16:45",
    comments: [
      {
        id: "c-3",
        author: "Trần Quốc Toản",
        role: "Thủ kho Q7",
        content: "Chúc mừng anh Tân! Đội kho kiểm tra nhiệt độ lúc bốc hàng lên xe luôn đạt chuẩn.",
        createdAt: "17:02",
      },
    ],
  },
  {
    id: "post-3",
    author: "Ban An Toàn Kho Lạnh",
    role: "Kiểm soát nội bộ",
    avatarText: "KL",
    avatarBg: "bg-amber-600",
    title: "Nhắc nhở quy trình FEFO và kiểm soát rã đông định kỳ tại Kho Q7 & Q12",
    content:
      "Yêu cầu thủ kho kiểm tra hạn sử dụng trên tem phụ và quét mã SKU 100% trước khi cho xuất hàng lên xe tải lạnh. Lô hàng nhập trước phải được đưa ra vị trí xuất trước (First-Expired, First-Out).",
    tag: "kho-van",
    likes: 12,
    liked: false,
    createdAt: "2 ngày trước",
    comments: [],
  },
];

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
