"use client";
import * as React from "react";
import {
  MessageSquare,
  Send,
  Hash,
  Users,
  Search,
  Paperclip,
  CheckCheck,
  Circle,
  Truck,
  Warehouse,
  Wallet,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  id: string;
  channelId: string;
  sender: string;
  senderRole: string;
  avatarText: string;
  avatarBg: string;
  text: string;
  timestamp: string;
  isMe?: boolean;
}

interface Channel {
  id: string;
  name: string;
  desc: string;
  icon: string;
  unread: number;
}

const CHANNELS: Channel[] = [
  { id: "chung", name: "chung", desc: "Toàn bộ nhân sự Sơn Khang", icon: "Hash", unread: 0 },
  { id: "dieu-xe", name: "dieu-xe-29c-88260", desc: "Tài xế Tân & Điều vận bến bãi", icon: "Truck", unread: 0 },
  { id: "kho-lanh", name: "kho-dong-lanh-dinh-cong", desc: "Thủ kho kiểm kê & FEFO", icon: "Warehouse", unread: 0 },
  { id: "kinh-doanh", name: "kinh-doanh-si-b2b", desc: "Báo giá sỉ & Đơn đặt chành xe", icon: "Hash", unread: 0 },
  { id: "ke-toan", name: "ke-toan-vietqr-misa", desc: "Thu tiền COD & Đối soát ngân hàng", icon: "Wallet", unread: 0 },
];

const INITIAL_MESSAGES: ChatMessage[] = [];

export default function ChatPage() {
  const [activeChannelId, setActiveChannelId] = React.useState<string>("chung");
  const [messages, setMessages] = React.useState<ChatMessage[]>(INITIAL_MESSAGES);
  const [inputText, setInputText] = React.useState("");
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  const activeChannel = CHANNELS.find((c) => c.id === activeChannelId) || CHANNELS[0];
  const channelMessages = messages.filter((m) => m.channelId === activeChannelId);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [channelMessages.length]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      channelId: activeChannelId,
      sender: "Tôi (Admin Điều Hành)",
      senderRole: "Quản lý hệ thống",
      avatarText: "ME",
      avatarBg: "bg-sky-600",
      text: inputText.trim(),
      timestamp: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }),
      isMe: true,
    };

    setMessages((prev) => [...prev, newMsg]);
    setInputText("");
  };

  return (
    <div className="mx-auto max-w-5xl space-y-4 pb-8">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-sky-500" /> Kênh Chat Nội Bộ Sơn Khang
        </h1>
        <p className="text-xs text-muted-foreground">
          Trao đổi tác vụ trực tiếp giữa Ban điều hành, Thủ kho Q7/Q12 và Tài xế xe lạnh 29C-882.60
        </p>
      </div>

      {/* Main Chat Layout */}
      <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 shadow-sm overflow-hidden grid grid-cols-1 md:grid-cols-4 h-[650px]">
        {/* Left Sidebar: Channels */}
        <div className="border-r border-slate-200 dark:border-slate-800 p-4 space-y-4 bg-slate-50/60 dark:bg-slate-900/40 flex flex-col justify-between">
          <div className="space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block px-2">
              Kênh thảo luận ({CHANNELS.length})
            </span>
            <div className="space-y-1">
              {CHANNELS.map((ch) => {
                const isActive = ch.id === activeChannelId;
                return (
                  <button
                    key={ch.id}
                    onClick={() => setActiveChannelId(ch.id)}
                    className={`w-full text-left rounded-2xl px-3 py-2.5 transition-all flex items-center justify-between text-xs ${
                      isActive
                        ? "bg-sky-600 text-white font-bold shadow-sm"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-200/60 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Hash className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-sky-500"}`} />
                      <span className="truncate">{ch.name}</span>
                    </div>
                    {ch.unread > 0 && !isActive && (
                      <span className="bg-rose-500 text-white rounded-full text-[10px] font-bold px-1.5 py-0.2">
                        {ch.unread}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Online members indicator */}
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3 text-xs space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
              Trực ca online (4)
            </span>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-[11px]">
                <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                <span className="font-semibold">Hồ Bá Thịnh</span>
                <span className="text-muted-foreground text-[10px]">(Giám đốc)</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                <span className="font-semibold">Hoàng Thị Nho</span>
                <span className="text-muted-foreground text-[10px]">(Kế toán trưởng)</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                <span className="font-semibold">Trần Thị Ngọc Thúy</span>
                <span className="text-muted-foreground text-[10px]">(Thủ kho Định Công)</span>
              </div>
              <div className="flex items-center gap-2 text-[11px]">
                <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
                <span className="font-semibold">Ngô Văn Tân</span>
                <span className="text-muted-foreground text-[10px]">(Xe 29C-882.60)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Main Area: Chat Window */}
        <div className="md:col-span-3 flex flex-col justify-between h-full bg-white dark:bg-slate-900">
          {/* Channel Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-slate-100">
                <Hash className="w-4 h-4 text-sky-500" />
                <span>{activeChannel.name}</span>
              </div>
              <p className="text-xs text-muted-foreground">{activeChannel.desc}</p>
            </div>
            <Badge variant="outline" className="text-xs font-mono bg-sky-50 text-sky-700 border-sky-200">
              Đồng bộ nội bộ
            </Badge>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col">
            {channelMessages.length === 0 ? (
              <div className="m-auto flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-sky-500 mb-3">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 text-sm">Chưa có tin nhắn trong #{activeChannel.name}</h3>
                <p className="text-xs text-muted-foreground max-w-sm mt-1">
                  Bắt đầu cuộc trao đổi nội bộ giữa ban giám đốc, kế toán, thủ kho và tài xế bằng ô nhập bên dưới.
                </p>
              </div>
            ) : (
              channelMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex gap-3 ${msg.isMe ? "flex-row-reverse" : "flex-row"}`}
                >
                  {!msg.isMe && (
                    <div className={`h-8 w-8 rounded-full ${msg.avatarBg} text-white flex items-center justify-center text-xs font-bold shrink-0`}>
                      {msg.avatarText}
                    </div>
                  )}

                  <div className={`space-y-1 max-w-[75%] ${msg.isMe ? "items-end text-right" : "items-start"}`}>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <span className="font-bold text-slate-900 dark:text-slate-200">{msg.sender}</span>
                      <span className="text-[10px]">({msg.senderRole})</span>
                      <span className="text-[10px] font-mono">{msg.timestamp}</span>
                    </div>

                    <div
                      className={`rounded-2xl px-4 py-2.5 text-xs leading-relaxed ${
                        msg.isMe
                          ? "bg-sky-600 text-white rounded-tr-none shadow-sm"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input Box */}
          <form onSubmit={handleSend} className="p-3 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Nhắn tin vào #${activeChannel.name}... (nhập mã đơn hoặc trao đổi)`}
              className="text-xs h-10 rounded-full"
            />
            <Button type="submit" size="sm" className="rounded-full bg-sky-600 hover:bg-sky-700 text-white h-10 px-4 font-semibold shrink-0">
              <Send className="w-4 h-4 mr-1" /> Gửi
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
