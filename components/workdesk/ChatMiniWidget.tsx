"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Hash } from "lucide-react";

type Channel = "tong-cong-ty" | "dieu-kho";
interface Msg { id: string; author: string; content: string; time: string; channel: Channel; }

const MOCK: Msg[] = [
  { id: "1", author: "Thuy", content: "Da nhan 35 thung hang tu Isuzu, dang kiem dem FEFO", time: "08:42", channel: "dieu-kho" },
  { id: "2", author: "Thinh", content: "Nho chup anh bien ban giao nhan nhe", time: "08:45", channel: "dieu-kho" },
  { id: "3", author: "Nho", content: "Da doi soat VietQR 8.2tr - khop cong no Sapo", time: "09:10", channel: "tong-cong-ty" },
  { id: "4", author: "Tan", content: "Dang tren duong Giai Phong, du kien 11:20 toi ben", time: "09:30", channel: "dieu-kho" },
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
    setMessages((prev) => [...prev, { id: String(Date.now()), author: "Ban", content: t, time: `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`, channel }]);
    setInput("");
  }

  return (
    <div className="clay-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold flex items-center gap-1.5"><Hash className="w-3.5 h-3.5 text-sky-600" /> Chat noi bo</span>
      </div>
      <div className="flex gap-1 p-1 rounded-full bg-slate-100 dark:bg-slate-800">
        <button onClick={() => setChannel("tong-cong-ty")} className={`flex-1 text-[11px] font-bold py-1 rounded-full transition-colors ${channel === "tong-cong-ty" ? "bg-white dark:bg-slate-900 shadow-sm text-sky-600" : "text-muted-foreground"}`}>#tong-cong-ty</button>
        <button onClick={() => setChannel("dieu-kho")} className={`flex-1 text-[11px] font-bold py-1 rounded-full transition-colors ${channel === "dieu-kho" ? "bg-white dark:bg-slate-900 shadow-sm text-sky-600" : "text-muted-foreground"}`}>#dieu-kho</button>
      </div>
      <div className="space-y-2 max-h-[180px] overflow-auto pr-1">
        {filtered.map((m) => (
          <div key={m.id} className="text-xs leading-snug">
            <span className="font-bold text-slate-800 dark:text-slate-200">{m.author}</span>
            <span className="text-[10px] text-muted-foreground ml-1.5">{m.time}</span>
            <p className="text-muted-foreground">{m.content}</p>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">Chua co tin nhan</p>}
      </div>
      <form onSubmit={handleSend} className="flex gap-1.5">
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="Nhan nhanh..." className="h-8 text-xs rounded-full" />
        <Button type="submit" size="icon" className="h-8 w-8 rounded-full shrink-0"><Send className="w-3.5 h-3.5" /></Button>
      </form>
    </div>
  );
}
