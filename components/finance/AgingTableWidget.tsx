"use client";
import * as React from "react";
import { MessageCircle, Copy, CheckCircle2, QrCode, ExternalLink, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { CustomerB2B } from "@/packages/modules/customers/types";
import { CUSTOMER_TYPE_LABEL } from "@/packages/modules/customers/types";
import { RISK_LABEL, RISK_COLOR } from "@/packages/modules/customers/mockData";
import {
  AGING_LABEL,
  AGING_COLOR,
  type AgingBucket4,
  type CustomerGroup,
  calculateCustomerAging,
  generateAgingRemindMessage,
} from "@/packages/modules/finance/agingService";

const vnd = (n: number) => n.toLocaleString("vi-VN") + " ₫";

interface AgingTableWidgetProps {
  customers?: CustomerB2B[];
  compact?: boolean;
}

const GROUP_OPTS: { value: CustomerGroup; label: string }[] = [
  { value: "all", label: "Tất cả" },
  { value: "dai_ly", label: "Đại lý chành xe" },
  { value: "quan_an", label: "Quán ăn" },
  { value: "chanh_xe", label: "Chành xe" },
];

export function AgingTableWidget({ customers = [], compact = false }: AgingTableWidgetProps) {
  const [group, setGroup] = React.useState<CustomerGroup>("all");
  const [remindOpen, setRemindOpen] = React.useState(false);
  const [remindMsg, setRemindMsg] = React.useState("");
  const [remindCode, setRemindCode] = React.useState("");
  const [remindZaloUrl, setRemindZaloUrl] = React.useState("");
  const [remindQrUrl, setRemindQrUrl] = React.useState("");
  const [copied, setCopied] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = React.useMemo(() => {
    if (group === "all") return customers;
    if (group === "dai_ly") return customers.filter((c) => c.customer_type === "dai_ly_tinh");
    if (group === "quan_an") return customers.filter((c) => c.customer_type === "quan_an_hn");
    if (group === "chanh_xe") return customers.filter((c) => c.customer_type === "dai_ly_tinh");
    return customers;
  }, [customers, group]);

  const handleRemind = (c: CustomerB2B) => {
    const result = generateAgingRemindMessage(c);
    setRemindMsg(result.message);
    setRemindCode(c.code);
    setRemindZaloUrl(result.zaloUrl);
    setRemindQrUrl(result.vietQrUrl);
    setRemindOpen(true);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(remindMsg);
    setCopied(true);
    setToast("Đã copy nội dung nhắc nợ");
    setTimeout(() => setCopied(false), 2000);
  };

  const agingBuckets: AgingBucket4[] = ["trong_han_15", "chom_qua_han_15_30", "qua_han_30_60", "qua_han_60"];

  return (
    <>
      <div className="space-y-3">
        {/* Filter nhóm KH */}
        <div className="flex flex-wrap gap-1.5">
          {GROUP_OPTS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setGroup(opt.value)}
              className={`px-3 py-1.5 text-xs rounded-full font-semibold border transition-all ${
                group === opt.value
                  ? "bg-sky-600 text-white border-sky-600 shadow"
                  : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-sky-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* Bảng tuổi nợ 4 mốc */}
        <div className="overflow-x-auto rounded-2xl border bg-white dark:bg-slate-900">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-800">
                <th className="text-left px-3 py-2.5 font-semibold whitespace-nowrap sticky left-0 bg-slate-50 dark:bg-slate-800 z-10">
                  Khách hàng
                </th>
                {agingBuckets.map((bucket) => {
                  const color = AGING_COLOR[bucket];
                  return (
                    <th
                      key={bucket}
                      className="text-center px-3 py-2.5 font-semibold whitespace-nowrap"
                      style={{ color: color.text }}
                    >
                      <div className="flex flex-col items-center gap-0.5">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: color.bg }}
                        />
                        <span>{AGING_LABEL[bucket]}</span>
                      </div>
                    </th>
                  );
                })}
                <th className="text-center px-3 py-2.5 font-semibold whitespace-nowrap">Rủi ro</th>
                <th className="text-center px-3 py-2.5 font-semibold whitespace-nowrap">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-muted-foreground">
                    Không có khách hàng
                  </td>
                </tr>
              ) : (
                filtered.map((c) => {
                  const aging4 = calculateCustomerAging(c);
                  return (
                    <tr key={c.id} className="border-t hover:bg-sky-50/30 dark:hover:bg-slate-800/50">
                      <td className="px-3 py-2.5 sticky left-0 bg-white dark:bg-slate-900 border-r">
                        <div className="min-w-[180px]">
                          <div className="font-semibold text-sm leading-tight truncate">
                            {c.company_name}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                            <span className="font-mono text-[10px] text-sky-600 font-bold">
                              {c.code}
                            </span>
                            <Badge
                              variant="outline"
                              className="text-[10px] px-1.5 py-0 border bg-sky-50 text-sky-700 border-sky-200"
                            >
                              {CUSTOMER_TYPE_LABEL[c.customer_type]}
                            </Badge>
                          </div>
                          {!compact && (
                            <div className="text-[10px] text-muted-foreground mt-0.5">
                              {c.contact_name} · {c.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      {agingBuckets.map((bucket) => {
                        const amount = aging4[bucket];
                        const color = AGING_COLOR[bucket];
                        return (
                          <td key={bucket} className="px-3 py-2.5 text-center">
                            {amount === 0 ? (
                              <span className="text-muted-foreground">—</span>
                            ) : (
                              <div
                                className="inline-block px-2.5 py-1 rounded-lg font-mono font-semibold text-[11px]"
                                style={{
                                  backgroundColor: color.bg,
                                  color: color.text,
                                }}
                              >
                                {vnd(amount).replace(" ₫", "")}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-3 py-2.5 text-center">
                        <Badge variant="outline" className={`text-[10px] border ${RISK_COLOR[c.risk_level]}`}>
                          {RISK_LABEL[c.risk_level]}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-7 text-xs rounded-full"
                          onClick={() => handleRemind(c)}
                        >
                          <MessageCircle className="w-3 h-3 mr-1" /> Nhắc nợ
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Nhắc Nợ 1-Chạm */}
      <Dialog open={remindOpen} onOpenChange={setRemindOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-auto rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-sm flex items-center gap-2">
              <MessageCircle className="w-4 h-4 text-sky-500" /> Nhắc nợ Zalo — {remindCode}
            </DialogTitle>
          </DialogHeader>
          <pre className="whitespace-pre-wrap text-xs bg-muted/60 border rounded-xl p-3 font-mono leading-relaxed max-h-[360px] overflow-auto">
            {remindMsg}
          </pre>
          {remindQrUrl && (
            <div className="flex flex-col items-center gap-1.5 p-3 border rounded-xl bg-white">
              <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1">
                <QrCode className="w-3.5 h-3.5" /> VietQR — Techcombank 22226060
              </div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={remindQrUrl} alt="VietQR" className="w-48 h-48 object-contain" />
              <span className="text-[10px] text-muted-foreground">Quét để chuyển khoản nhanh</span>
            </div>
          )}
          <div className="flex justify-end gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              className="rounded-full"
              onClick={() => setRemindOpen(false)}
            >
              Đóng
            </Button>
            <Button size="sm" variant="outline" className="rounded-full" onClick={handleCopy}>
              {copied ? (
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              ) : (
                <Copy className="w-3.5 h-3.5 mr-1" />
              )}{" "}
              {copied ? "Đã copy" : "Copy văn bản"}
            </Button>
            {remindZaloUrl && (
              <Button
                size="sm"
                className="rounded-full bg-sky-600 text-white hover:bg-sky-700"
                asChild
              >
                <a href={remindZaloUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-3.5 h-3.5 mr-1" /> Mở Zalo
                </a>
              </Button>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-foreground text-background text-sm px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toast}
        </div>
      )}
    </>
  );
}
