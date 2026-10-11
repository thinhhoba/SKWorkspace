"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Hash } from "lucide-react";

type Channel = "tong-cong-ty" | "dieu-kho";
interface Msg {
  id: string;
  author: string;
  content: string;
  time: string;
  channel: Channel;
}

const MOCK: Msg[] = [
  { id: "1", author: "Thúy (Kho)", content: "Đã nhận 35 thùng hàng từ Isuzu, đang kiểm đếm FEFO", time: "08:42", channel: "dieu-kho" },
  { id: "2", author: "Thịnh (GĐ)", content: "Nhớ chụp ảnh biên bản giao nhận & nhiệt độ nhé", time: "08:45", channel: "dieu-kho" },
  { id: "3", author: "Nho (KT)", content: "Đã đối soát VietQR 8.2tr — khớp công nợ Sapo", time: "09:10", channel: "tong-cong-ty" },
  { id: "4", author: "Tân (Lái xe)", content: "Đang trên đường Giải Phóng, dự kiến 11:20 tới bến", time: "09:30", channel: "dieu-kho" },
];

export default function ChatMiniWidget() {
  const [channel, setChannel] = React.useState<Channel>("tong-cong-ty");
  const [input, setInput] = React.useState("");
  const [messages, setMessages] = React.useState<Msg[]>(MOCK);

  const filtered = messages.filter((m) => m.channel === channel);

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    const t = input.trim();
    if (!t) return;
    const now = new Date();
    setMessages((prev) => [
      ...prev,
      {
        id: String(Date.now()),
        author: "Bạn",
        content: t,
        time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`,
        channel,
      },
    ]);
    setInput("");
  }

  return (
    <div className="space-y-2.5">
      <div className="flex gap-1 p-1 rounded-full bg-slate-100 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => setChannel("tong-cong-ty")}
          className={`flex-1 text-[11px] font-bold py-1 rounded-full transition-colors ${
            channel === "tong-cong-ty"
              ? "bg-white dark:bg-slate-900 shadow-sm text-sky-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          #tổng-công-ty
        </button>
        <button
          type="button"
          onClick={() => setChannel("dieu-kho")}
          className={`flex-1 text-[11px] font-bold py-1 rounded-full transition-colors ${
            channel === "dieu-kho"
              ? "bg-white dark:bg-slate-900 shadow-sm text-sky-600"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          #điều-kho
        </button>
      </div>

      <div className="space-y-2 max-h-[160px] overflow-auto pr-1">
        {filtered.map((m) => (
          <div key={m.id} className="text-xs leading-snug p-1.5 rounded-lg bg-slate-50/70 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">{m.author}</span>
              <span className="text-[10px] text-muted-foreground">{m.time}</span>
            </div>
            <p className="text-slate-600 dark:text-slate-300 mt-0.5">{m.content}</p>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground text-center py-4">Chưa có tin nhắn trong kênh này</p>
        )}
      </div>

      <form onSubmit={handleSend} className="flex gap-1.5 pt-1">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Nhắn nhanh nội bộ..."
          className="h-8 text-xs rounded-full bg-white dark:bg-slate-800"
        />
        <Button type="submit" size="icon" className="h-8 w-8 rounded-full shrink-0 bg-sky-600 text-white">
          <Send className="w-3.5 h-3.5" />
        </Button>
      </form>
    </div>
  );
}
