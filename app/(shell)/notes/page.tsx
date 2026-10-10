"use client";
import * as React from "react";
import {
  StickyNote,
  Plus,
  Pin,
  Trash2,
  Search,
  Tag,
  Copy,
  Check,
  Calendar,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Note {
  id: string;
  title: string;
  content: string;
  category: "kho-lanh" | "kinh-doanh" | "van-tai" | "ke-toan" | "chung";
  pinned: boolean;
  color: string;
  updatedAt: string;
}

const INITIAL_NOTES: Note[] = [
  {
    id: "n-1",
    title: "Thông tin chành xe gửi hàng đi tỉnh (Cập nhật 10/2026)",
    content: `1. Xe Tuấn Bình (Bến Giáp Bát): Đi Hải Phòng, Quảng Ninh. Xuất bến 11h30 trưa & 18h tối. Phụ xe: 0988.123.456.
2. Nhà xe Hưng Thịnh (Bến Nước Ngầm): Tuyến Vinh, Hà Tĩnh. Cần đóng đá gel trước 14h.
3. Chành xe Phương Trang: Gửi văn phòng Hoàng Mai.`,
    category: "van-tai",
    pinned: true,
    color: "from-amber-500/10 to-orange-500/5 border-amber-200",
    updatedAt: "10/10/2026 09:30",
  },
  {
    id: "n-2",
    title: "Tài khoản thanh toán VietQR & Đối soát Techcombank",
    content: `Số tài khoản: 22226060 (Techcombank)
Tên tài khoản: CONG TY TNHH THUC PHAM SON KHANG
Nội dung chuẩn: "TT DH [Mã đơn]" hoặc "COD [Mã đơn] [Tên khách]"
Tài xế Tân thu tiền mặt phải nộp lại hoặc quét QR nộp về tài khoản công ty trước 18h hàng ngày.`,
    category: "ke-toan",
    pinned: true,
    color: "from-sky-500/10 to-cyan-500/5 border-sky-200",
    updatedAt: "09/10/2026 15:45",
  },
  {
    id: "n-3",
    title: "Quy định nhiệt độ bảo quản kho đông & xe tải lạnh",
    content: `Kho âm sâu Q7 (Định Công): Duy trì nhiệt độ -18°C đến -22°C.
Kho Q12 (Tân Thới Hiệp): Duy trì nhiệt độ -20°C.
Xe tải lạnh Isuzu 29C-882.60: Bật máy lạnh trước khi xếp hàng 20 phút để đạt dưới -10°C trước khi bốc hàng lên xe.`,
    category: "kho-lanh",
    pinned: false,
    color: "from-emerald-500/10 to-teal-500/5 border-emerald-200",
    updatedAt: "08/10/2026 11:20",
  },
  {
    id: "n-4",
    title: "Chính sách thưởng doanh số nhóm hàng viên thả lẩu",
    content: `Cá viên Munchee 500g (HH123) & Bò viên Muwono (HH201): Thưởng 500đ/gói khi đại lý đặt từ 100 gói.
Áp dụng cho nhân viên kinh doanh hoàn thành chỉ tiêu tháng 10.`,
    category: "kinh-doanh",
    pinned: false,
    color: "from-purple-500/10 to-pink-500/5 border-purple-200",
    updatedAt: "07/10/2026 16:00",
  },
];

const CATEGORY_NAMES: Record<Note["category"], { label: string; badge: string }> = {
  "van-tai": { label: "Vận tải & Chành xe", badge: "bg-amber-100 text-amber-800" },
  "ke-toan": { label: "Kế toán & VietQR", badge: "bg-sky-100 text-sky-800" },
  "kho-lanh": { label: "Kho đông lạnh", badge: "bg-emerald-100 text-emerald-800" },
  "kinh-doanh": { label: "Kinh doanh & Báo giá", badge: "bg-purple-100 text-purple-800" },
  "chung": { label: "Ghi chú chung", badge: "bg-slate-100 text-slate-800" },
};

export default function NotesPage() {
  const [notes, setNotes] = React.useState<Note[]>(INITIAL_NOTES);
  const [search, setSearch] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState<string>("all");
  const [showAdd, setShowAdd] = React.useState(false);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  const [newTitle, setNewTitle] = React.useState("");
  const [newContent, setNewContent] = React.useState("");
  const [newCat, setNewCat] = React.useState<Note["category"]>("chung");

  const togglePin = (id: string) => {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, pinned: !n.pinned } : n))
    );
  };

  const deleteNote = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  const copyNote = (id: string, text: string) => {
    navigator.clipboard?.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newN: Note = {
      id: `n-${Date.now()}`,
      title: newTitle.trim(),
      content: newContent.trim(),
      category: newCat,
      pinned: false,
      color: "from-sky-500/10 to-transparent border-slate-200",
      updatedAt: "Vừa xong",
    };

    setNotes([newN, ...notes]);
    setNewTitle("");
    setNewContent("");
    setShowAdd(false);
  };

  const filtered = notes
    .filter((n) => activeCategory === "all" || n.category === activeCategory)
    .filter(
      (n) =>
        !search.trim() ||
        n.title.toLowerCase().includes(search.toLowerCase()) ||
        n.content.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));

  return (
    <div className="mx-auto max-w-5xl space-y-6 pb-16">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <StickyNote className="w-5 h-5 text-sky-500" /> Sổ Tay Ghi Chú & Biên Bản
          </h1>
          <p className="text-xs text-muted-foreground">
            Lưu nhanh số điện thoại chành xe, biên bản bàn giao ca kho lạnh, quy định và tài khoản VietQR
          </p>
        </div>

        <Button
          onClick={() => setShowAdd(!showAdd)}
          size="sm"
          className="rounded-full bg-sky-600 hover:bg-sky-700 text-white font-semibold"
        >
          <Plus className="w-4 h-4 mr-1.5" /> Tạo ghi chú mới
        </Button>
      </div>

      {/* Add note card */}
      {showAdd && (
        <form onSubmit={handleAddNote} className="rounded-3xl border border-sky-200 bg-white dark:bg-slate-900 p-5 shadow-sm space-y-3">
          <h2 className="text-sm font-bold text-slate-800 dark:text-slate-200">Ghi chú công việc mới</h2>
          <Input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Tiêu đề ghi chú (VD: Lịch xe chạy tuyến Thái Nguyên)..."
            required
            className="text-sm font-semibold"
          />
          <textarea
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="Nội dung chi tiết ghi chú..."
            rows={4}
            className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent p-3 text-sm outline-none focus:border-sky-500"
          />
          <div className="flex items-center justify-between">
            <select
              value={newCat}
              onChange={(e) => setNewCat(e.target.value as Note["category"])}
              className="h-9 rounded-md border bg-white dark:bg-slate-950 px-3 text-xs"
            >
              <option value="chung">Ghi chú chung</option>
              <option value="van-tai">Vận tải & Chành xe</option>
              <option value="kho-lanh">Kho đông lạnh</option>
              <option value="ke-toan">Kế toán & VietQR</option>
              <option value="kinh-doanh">Kinh doanh & Báo giá</option>
            </select>
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="sm" onClick={() => setShowAdd(false)}>Hủy</Button>
              <Button type="submit" size="sm" className="bg-sky-600 text-white rounded-full">Lưu</Button>
            </div>
          </div>
        </form>
      )}

      {/* Search & Category Filter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
          <Button
            variant={activeCategory === "all" ? "default" : "outline"}
            size="sm"
            className="rounded-full h-8"
            onClick={() => setActiveCategory("all")}
          >
            Tất cả ({notes.length})
          </Button>
          <Button
            variant={activeCategory === "van-tai" ? "default" : "outline"}
            size="sm"
            className="rounded-full h-8"
            onClick={() => setActiveCategory("van-tai")}
          >
            Chành xe
          </Button>
          <Button
            variant={activeCategory === "kho-lanh" ? "default" : "outline"}
            size="sm"
            className="rounded-full h-8"
            onClick={() => setActiveCategory("kho-lanh")}
          >
            Kho lạnh
          </Button>
          <Button
            variant={activeCategory === "ke-toan" ? "default" : "outline"}
            size="sm"
            className="rounded-full h-8"
            onClick={() => setActiveCategory("ke-toan")}
          >
            Kế toán & VietQR
          </Button>
        </div>

        <div className="relative min-w-[200px] flex-1 max-w-xs">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm ghi chú..."
            className="pl-8 h-8 text-xs rounded-full"
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((note) => (
          <div
            key={note.id}
            className={`rounded-3xl border bg-gradient-to-br ${note.color} p-5 shadow-sm space-y-3 relative flex flex-col justify-between hover:shadow-md transition-shadow`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="outline" className={`text-[10px] ${CATEGORY_NAMES[note.category].badge}`}>
                  {CATEGORY_NAMES[note.category].label}
                </Badge>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => togglePin(note.id)}
                    className={`p-1 rounded-full transition-colors ${
                      note.pinned ? "text-amber-500 bg-amber-50 dark:bg-amber-950/40" : "text-slate-400 hover:text-slate-700"
                    }`}
                  >
                    <Pin className={`w-3.5 h-3.5 ${note.pinned ? "fill-current" : ""}`} />
                  </button>
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="p-1 rounded-full text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                {note.title}
              </h2>

              <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                {note.content}
              </p>
            </div>

            <div className="flex items-center justify-between border-t border-slate-200/60 dark:border-slate-800/60 pt-3 text-[10px] text-muted-foreground">
              <span>Cập nhật: {note.updatedAt}</span>
              <button
                onClick={() => copyNote(note.id, `${note.title}\n\n${note.content}`)}
                className="flex items-center gap-1 text-sky-600 hover:underline font-semibold"
              >
                {copiedId === note.id ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" /> Đã sao chép
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" /> Sao chép
                  </>
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
