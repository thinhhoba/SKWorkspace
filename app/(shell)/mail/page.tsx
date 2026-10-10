"use client";
import * as React from "react";
import {
  Mail,
  Send,
  Inbox,
  SendHorizontal,
  FileText,
  Trash2,
  Search,
  Star,
  Paperclip,
  CheckCircle2,
  RefreshCw,
  Archive,
  Reply,
  Forward,
  Plus,
  ShieldCheck,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

type MailProvider = "gmail" | "outlook";
type MailFolder = "inbox" | "sent" | "starred" | "trash";

interface EmailMessage {
  id: string;
  provider: MailProvider;
  folder: MailFolder;
  from: string;
  fromName: string;
  to: string;
  subject: string;
  preview: string;
  body: string;
  date: string;
  unread: boolean;
  starred: boolean;
  attachments?: string[];
}

const INITIAL_EMAILS: EmailMessage[] = [
  {
    id: "mail-1",
    provider: "gmail",
    folder: "inbox",
    from: "quan.anvat.beba@gmail.com",
    fromName: "Quán Ăn Vặt Bé Ba (Cầu Giấy)",
    to: "kinhdoanh.sonkhang@gmail.com",
    subject: "Yêu cầu báo giá sỉ 20 thùng Gà Popcorn CP và 10 thùng khoai tây",
    preview: "Chào công ty Sơn Khang, quán mình bên Cầu Giấy muốn nhập định kỳ mỗi tuần 20 thùng...",
    body: `Kính gửi Bộ phận Kinh doanh Thực Phẩm Sơn Khang,

Quán mình hiện đang mở thêm cơ sở 2 tại ngõ 165 Cầu Giấy. Mình muốn xin bảng giá sỉ mới nhất tháng 10 cho:
1. Gà Viên Chiên Popcorn CP (Thùng 10kg) - 20 thùng/tuần
2. Khoai tây cọng Bỉ Aviko - 10 thùng/tuần
3. Tương ớt Sài Gòn Can 2L - 5 can

Nhờ công ty báo giá chiết khấu đại lý cấp 2 và điều kiện giao hàng miễn phí qua xe tải lạnh giúp mình nhé.

Trân trọng,
Quán Ăn Vặt Bé Ba - SĐT 0912.888.999`,
    date: "10:15 Hôm nay",
    unread: true,
    starred: true,
    attachments: ["danh_sach_mat_hang_be_ba.pdf"],
  },
  {
    id: "mail-2",
    provider: "outlook",
    folder: "inbox",
    from: "ebanking@techcombank.com.vn",
    fromName: "Techcombank Corporate Notification",
    to: "ke-toan@sonkhang.vn",
    subject: "[Thông báo biến động số dư] TK 22226060 - Nhận thanh toán COD đơn #13537",
    preview: "Techcombank thông báo: Tài khoản 22226060 (CONG TY TNHH THUC PHAM SON KHANG) +3.159.500 VND...",
    body: `Kính gửi Quý khách,

Techcombank xin thông báo giao dịch chuyển khoản thành công:
- Tài khoản: 22226060
- Tên chủ tài khoản: CONG TY TNHH THUC PHAM SON KHANG
- Số tiền giao dịch: +3.159.500 VND
- Nội dung giao dịch: TT DH 13537 HOANG THI TUY VIETQR
- Ngày giờ: 10/10/2026 09:12:45
- Số dư khả dụng hiện tại: 842.150.000 VND

Trân trọng,
Ngân hàng TMCP Kỹ Thương Việt Nam (Techcombank)`,
    date: "09:15 Hôm nay",
    unread: false,
    starred: true,
  },
  {
    id: "mail-3",
    provider: "gmail",
    folder: "inbox",
    from: "cantin.daihocbachkhoa@gmail.com",
    fromName: "Căn Tin Ký Túc Xá ĐH Bách Khoa",
    to: "kinhdoanh.sonkhang@gmail.com",
    subject: "Xác nhận lịch giao hàng chiều nay trước 15h",
    preview: "Xác nhận đơn hàng xúc xích hồ lô và viên thả lẩu đã đặt qua hệ thống dathang.sonkhang.vn...",
    body: `Chào Sơn Khang,

Căn tin trường xác nhận nhận chuyến hàng giao bằng xe tải lạnh Isuzu 29C-882.60 của tài xế Tân chiều nay.
Địa điểm nhận hàng: Cổng sau KTX ĐH Bách Khoa (đường Tạ Quang Bửu).
Số lượng: 20 thùng xúc xích + 15 thùng chả cá.

Cảm ơn công ty!`,
    date: "Hôm qua 16:30",
    unread: false,
    starred: false,
  },
  {
    id: "mail-4",
    provider: "outlook",
    folder: "sent",
    from: "ke-toan@sonkhang.vn",
    fromName: "Kế toán Sơn Khang",
    to: "daily.haiphong.tuanbinh@gmail.com",
    subject: "Gửi biên bản đối soát công nợ tháng 09/2026 - Nhà xe Tuấn Bình",
    preview: "Kính gửi Nhà xe Tuấn Bình, đính kèm biên bản đối soát cước vận chuyển và tiền COD thu hộ...",
    body: `Kính gửi Nhà xe Tuấn Bình,

Công ty TNHH Thực Phẩm Sơn Khang gửi anh biên bản đối soát tiền hàng thu hộ COD tháng 9 tuyến Hà Nội - Hải Phòng.
Tổng tiền cước đã thanh toán: 14.500.000đ.
Số tiền COD chành xe cần chuyển về TK 22226060: 89.200.000đ.

Vui lòng kiểm tra và ký xác nhận giúp em nhé.

Kế toán bán hàng Sơn Khang`,
    date: "08/10/2026",
    unread: false,
    starred: false,
    attachments: ["doi_soat_tuan_binh_t9.xlsx"],
  },
];

export default function MailHubPage() {
  const [provider, setProvider] = React.useState<MailProvider>("gmail");
  const [folder, setFolder] = React.useState<MailFolder>("inbox");
  const [emails, setEmails] = React.useState<EmailMessage[]>(INITIAL_EMAILS);
  const [selectedMailId, setSelectedMailId] = React.useState<string>("mail-1");
  const [search, setSearch] = React.useState("");
  const [showCompose, setShowCompose] = React.useState(false);

  // Compose form states
  const [toEmail, setToEmail] = React.useState("");
  const [subject, setSubject] = React.useState("");
  const [bodyText, setBodyText] = React.useState("");
  const [toast, setToast] = React.useState<string | null>(null);

  const activeEmail = emails.find((m) => m.id === selectedMailId) || emails[0];

  const filteredEmails = emails
    .filter((m) => m.provider === provider && m.folder === folder)
    .filter(
      (m) =>
        !search.trim() ||
        m.subject.toLowerCase().includes(search.toLowerCase()) ||
        m.fromName.toLowerCase().includes(search.toLowerCase()) ||
        m.preview.toLowerCase().includes(search.toLowerCase())
    );

  const toggleStar = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEmails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m))
    );
  };

  const handleSendMail = (e: React.FormEvent) => {
    e.preventDefault();
    if (!toEmail.trim() || !subject.trim()) return;

    const newSentMail: EmailMessage = {
      id: `mail-${Date.now()}`,
      provider,
      folder: "sent",
      from: provider === "gmail" ? "kinhdoanh.sonkhang@gmail.com" : "ke-toan@sonkhang.vn",
      fromName: provider === "gmail" ? "Sơn Khang Frozen Foods" : "Kế Toán Sơn Khang",
      to: toEmail.trim(),
      subject: subject.trim(),
      preview: bodyText.slice(0, 80) + "...",
      body: bodyText,
      date: "Vừa gửi",
      unread: false,
      starred: false,
    };

    setEmails([newSentMail, ...emails]);
    setToast(`Đã gửi email qua ${provider === "gmail" ? "Gmail" : "Outlook"} thành công đến ${toEmail}!`);
    setToEmail("");
    setSubject("");
    setBodyText("");
    setShowCompose(false);
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="mx-auto max-w-6xl space-y-4 pb-12">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Mail className="w-5 h-5 text-sky-500" /> Hộp Thư Tích Hợp Gmail & Outlook
          </h1>
          <p className="text-xs text-muted-foreground">
            Đọc, xem, soạn và gửi thư trực tiếp kết nối Gmail và Microsoft 365 Outlook của Sơn Khang
          </p>
        </div>

        {/* Mail Provider Switcher */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-full border border-slate-200 dark:border-slate-800 p-0.5 bg-slate-100 dark:bg-slate-800">
            <button
              onClick={() => setProvider("gmail")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-bold transition-colors ${
                provider === "gmail"
                  ? "bg-rose-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-slate-900"
              }`}
            >
              <span className="font-mono text-sm">G</span> Gmail (kinhdoanh.sonkhang)
            </button>
            <button
              onClick={() => setProvider("outlook")}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full font-bold transition-colors ${
                provider === "outlook"
                  ? "bg-sky-600 text-white shadow-sm"
                  : "text-muted-foreground hover:text-slate-900"
              }`}
            >
              <span className="font-mono text-sm">O</span> Outlook (ke-toan@sonkhang.vn)
            </button>
          </div>

          <Button
            onClick={() => setShowCompose(true)}
            size="sm"
            className="rounded-full bg-sky-600 hover:bg-sky-700 text-white font-semibold"
          >
            <Plus className="w-4 h-4 mr-1.5" /> Soạn thư mới
          </Button>
        </div>
      </div>

      {toast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {toast}
        </div>
      )}

      {/* Main Mail Client Body */}
      <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-12 h-[680px]">
        {/* Left Column: Folders (2 cols) */}
        <div className="md:col-span-2 border-r border-slate-200 dark:border-slate-800 p-3 space-y-1 bg-slate-50/60 dark:bg-slate-900/40">
          <button
            onClick={() => setFolder("inbox")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-colors ${
              folder === "inbox" ? "bg-sky-600 text-white" : "hover:bg-slate-200/60 text-slate-700 dark:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Inbox className="w-4 h-4" /> Hộp thư đến
            </div>
            <span className="text-[10px] opacity-80 font-mono">
              {emails.filter((m) => m.provider === provider && m.folder === "inbox").length}
            </span>
          </button>

          <button
            onClick={() => setFolder("sent")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-colors ${
              folder === "sent" ? "bg-sky-600 text-white" : "hover:bg-slate-200/60 text-slate-700 dark:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <SendHorizontal className="w-4 h-4" /> Thư đã gửi
            </div>
            <span className="text-[10px] opacity-80 font-mono">
              {emails.filter((m) => m.provider === provider && m.folder === "sent").length}
            </span>
          </button>

          <button
            onClick={() => setFolder("starred")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-colors ${
              folder === "starred" ? "bg-sky-600 text-white" : "hover:bg-slate-200/60 text-slate-700 dark:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4" /> Có gắn sao
            </div>
          </button>

          <button
            onClick={() => setFolder("trash")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-2xl text-xs font-semibold transition-colors ${
              folder === "trash" ? "bg-sky-600 text-white" : "hover:bg-slate-200/60 text-slate-700 dark:text-slate-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <Trash2 className="w-4 h-4" /> Thùng rác
            </div>
          </button>

          <div className="pt-6 px-3">
            <div className="rounded-2xl border border-sky-100 bg-sky-50/70 p-3 text-[11px] space-y-1 text-sky-900">
              <div className="font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Kết nối an toàn
              </div>
              <p className="text-[10px] text-muted-foreground">
                Giao thức IMAP/SMTP & MS Graph API đang hoạt động bình thường.
              </p>
            </div>
          </div>
        </div>

        {/* Middle Column: Email List (4 cols) */}
        <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full bg-white dark:bg-slate-900">
          <div className="p-3 border-b border-slate-200 dark:border-slate-800">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Tìm email, người gửi..."
                className="pl-8 h-8 text-xs rounded-full"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800">
            {filteredEmails.length === 0 ? (
              <div className="p-8 text-center text-xs text-muted-foreground">
                Không có thư nào trong thư mục này.
              </div>
            ) : (
              filteredEmails.map((mail) => {
                const isSelected = mail.id === selectedMailId;
                return (
                  <div
                    key={mail.id}
                    onClick={() => {
                      setSelectedMailId(mail.id);
                      mail.unread = false;
                    }}
                    className={`p-3.5 cursor-pointer transition-colors space-y-1.5 ${
                      isSelected
                        ? "bg-sky-50/80 dark:bg-sky-950/30 border-l-4 border-sky-600"
                        : mail.unread
                        ? "bg-slate-50/50 font-semibold hover:bg-slate-100/60"
                        : "hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className={`truncate max-w-[170px] ${mail.unread ? "font-bold text-slate-900 dark:text-slate-100" : "text-slate-700"}`}>
                        {mail.fromName}
                      </span>
                      <div className="flex items-center gap-1">
                        <span className="text-[10px] text-muted-foreground">{mail.date}</span>
                        <button onClick={(e) => toggleStar(mail.id, e)} className="text-slate-400 hover:text-amber-500">
                          <Star className={`w-3 h-3 ${mail.starred ? "fill-amber-400 text-amber-400" : ""}`} />
                        </button>
                      </div>
                    </div>

                    <h2 className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate">
                      {mail.subject}
                    </h2>
                    <p className="text-[11px] text-muted-foreground line-clamp-1">{mail.preview}</p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Email Content Pane (6 cols) */}
        <div className="md:col-span-6 flex flex-col h-full bg-white dark:bg-slate-900 p-6 overflow-y-auto">
          {activeEmail ? (
            <div className="space-y-6">
              {/* Header */}
              <div className="space-y-3 border-b pb-4">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-snug">
                    {activeEmail.subject}
                  </h2>
                  <Badge variant="outline" className="font-mono text-xs shrink-0">
                    {activeEmail.date}
                  </Badge>
                </div>

                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div>
                    Từ: <strong className="text-slate-800 dark:text-slate-200">{activeEmail.fromName}</strong> ({activeEmail.from})
                    <br />
                    Đến: <span>{activeEmail.to}</span>
                  </div>
                </div>
              </div>

              {/* Attachments */}
              {activeEmail.attachments && activeEmail.attachments.length > 0 && (
                <div className="rounded-2xl border border-slate-200 p-3 bg-slate-50/60 text-xs space-y-1.5">
                  <span className="font-bold text-slate-700 block">Tệp đính kèm ({activeEmail.attachments.length})</span>
                  <div className="flex flex-wrap gap-2">
                    {activeEmail.attachments.map((att) => (
                      <span
                        key={att}
                        className="inline-flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-sky-700 font-mono text-[11px] shadow-sm"
                      >
                        <Paperclip className="w-3 h-3" /> {att}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Body */}
              <div className="text-sm text-slate-800 dark:text-slate-200 whitespace-pre-line leading-relaxed font-sans">
                {activeEmail.body}
              </div>

              {/* Quick Action Footer */}
              <div className="border-t pt-4 flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs"
                  onClick={() => {
                    setToEmail(activeEmail.from);
                    setSubject(`Re: ${activeEmail.subject}`);
                    setShowCompose(true);
                  }}
                >
                  <Reply className="w-3.5 h-3.5 mr-1" /> Trả lời
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="rounded-full text-xs"
                  onClick={() => {
                    setSubject(`Fwd: ${activeEmail.subject}`);
                    setBodyText(`\n\n--- Thư chuyển tiếp ---\nTừ: ${activeEmail.from}\nNội dung: ${activeEmail.body}`);
                    setShowCompose(true);
                  }}
                >
                  <Forward className="w-3.5 h-3.5 mr-1" /> Chuyển tiếp
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
              Chọn một email để đọc chi tiết
            </div>
          )}
        </div>
      </div>

      {/* Compose Email Modal */}
      {showCompose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <form
            onSubmit={handleSendMail}
            className="w-full max-w-2xl rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95"
          >
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Mail className="w-5 h-5 text-sky-500" /> Soạn thư gửi qua {provider === "gmail" ? "Gmail" : "Outlook"}
              </h2>
              <button
                type="button"
                onClick={() => setShowCompose(false)}
                className="text-slate-400 hover:text-slate-700 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Đến (Email người nhận) *
                </label>
                <Input
                  type="email"
                  value={toEmail}
                  onChange={(e) => setToEmail(e.target.value)}
                  placeholder="VD: daily.haiphong@gmail.com"
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Tiêu đề email *
                </label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="VD: Báo giá sỉ thực phẩm đông lạnh Sơn Khang..."
                  required
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Nội dung thư
                </label>
                <textarea
                  value={bodyText}
                  onChange={(e) => setBodyText(e.target.value)}
                  placeholder="Kính gửi quý khách hàng, Công ty Thực phẩm Sơn Khang xin gửi thông tin..."
                  rows={8}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-transparent p-3 text-sm outline-none focus:border-sky-500 font-sans"
                />
              </div>
            </div>

            <div className="flex items-center justify-between border-t pt-3">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Paperclip className="w-4 h-4" /> Có thể đính kèm bảng giá sỉ & VietQR
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="ghost" onClick={() => setShowCompose(false)}>
                  Hủy
                </Button>
                <Button type="submit" className="rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold">
                  <Send className="w-4 h-4 mr-1.5" /> Gửi email ngay
                </Button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
