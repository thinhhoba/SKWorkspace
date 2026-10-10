"use client";
import * as React from "react";
import {
  FileText,
  ShieldCheck,
  FileSignature,
  HardDrive,
  Search,
  Eye,
  Download,
  Building2,
  CalendarDays,
  Tag as TagIcon,
  X,
  File as FilePdfIcon,
  FileSpreadsheet,
  FileType,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { DocCategory, DocRecord, DocFileType } from "@/packages/modules/docs/types";
import { DOC_CATEGORY_COLOR, DOC_CATEGORY_LABEL, DOC_CATEGORY_TAB, DOC_FILE_TYPE_LABEL } from "@/packages/modules/docs/types";
import { COMPANY_LEGAL_PROFILE } from "@/packages/modules/docs/mockData";

const fmtSize = (kb: number) => {
  if (kb >= 1024) return `${(kb / 1024).toFixed(kb % 1024 === 0 ? 0 : 1)} MB`;
  return `${kb} KB`;
};

function FileTypeBadge({ t }: { t: DocFileType }) {
  const cls =
    t === "pdf"
      ? "bg-rose-50 text-rose-700 border-rose-200"
      : t === "docx"
        ? "bg-sky-50 text-sky-700 border-sky-200"
        : "bg-emerald-50 text-emerald-700 border-emerald-200";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide ${cls}`}>
      {t === "pdf" ? <FilePdfIcon className="w-3 h-3" /> : t === "xlsx" ? <FileSpreadsheet className="w-3 h-3" /> : <FileType className="w-3 h-3" />}
      {DOC_FILE_TYPE_LABEL[t]}
    </span>
  );
}

function DocCard({
  doc,
  onView,
}: {
  doc: DocRecord;
  onView: (d: DocRecord) => void;
}) {
  return (
    <div className="clay-card p-4 flex flex-col gap-2.5">
      <div className="flex items-start justify-between gap-2">
        <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${DOC_CATEGORY_COLOR[doc.category]}`}>
          {DOC_CATEGORY_LABEL[doc.category]}
        </span>
        <FileTypeBadge t={doc.file_type} />
      </div>
      <div className="flex items-start gap-2.5">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-slate-600 to-slate-800 text-white shadow-sm border border-white/80">
          {doc.file_type === "pdf" ? <FilePdfIcon className="w-4.5 h-4.5" /> : doc.file_type === "xlsx" ? <FileSpreadsheet className="w-4 h-4" /> : <FileType className="w-4 h-4" />}
        </span>
        <div className="min-w-0 flex-1">
          <div className="text-sm font-bold leading-tight line-clamp-2">{doc.title}</div>
          <div className="font-mono text-[11px] text-muted-foreground truncate">{doc.file_name}</div>
        </div>
      </div>
      <div className="space-y-1 text-[11px] text-muted-foreground">
        <div className="flex items-center gap-1.5 truncate">
          <Building2 className="w-3 h-3 shrink-0" />
          <span className="truncate">{doc.issuer}</span>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="inline-flex items-center gap-1">
            <CalendarDays className="w-3 h-3" /> {doc.issue_date}
          </span>
          <span className="font-mono">{fmtSize(doc.file_size_kb)}</span>
          <span className="font-mono text-[10px] bg-white/70 border rounded-full px-1.5 py-0.5">{doc.code}</span>
        </div>
      </div>
      {doc.description && <div className="text-[11px] text-muted-foreground bg-white/60 rounded-xl px-2.5 py-1.5 border line-clamp-2">{doc.description}</div>}
      {doc.tags && doc.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {doc.tags.map((t) => (
            <span key={t} className="inline-flex items-center gap-1 rounded-full bg-slate-100 border border-slate-200 px-1.5 py-0.5 text-[10px] text-slate-600">
              <TagIcon className="w-2.5 h-2.5" /> {t}
            </span>
          ))}
        </div>
      )}
      <div className="flex gap-1.5 pt-1 border-t border-white/60 mt-1">
        <Button size="sm" variant="outline" className="h-7 text-xs rounded-full glossy-pill flex-1" onClick={() => onView(doc)}>
          <Eye className="w-3.5 h-3.5 mr-1" /> Xem chi tiết
        </Button>
        <Button size="sm" variant="outline" className="h-7 text-xs rounded-full flex-1" onClick={() => onView(doc)}>
          <Download className="w-3.5 h-3.5 mr-1" /> Tải về
        </Button>
      </div>
    </div>
  );
}

export default function DocsPage() {
  const [docs, setDocs] = React.useState<DocRecord[]>([]);
  const [stats, setStats] = React.useState<{ legalCount: number; certCount: number; contractCount: number; totalCount: number; totalSizeKb: number } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [tab, setTab] = React.useState<DocCategory | "ALL">("ALL");
  const [search, setSearch] = React.useState("");
  const [debounced, setDebounced] = React.useState("");
  const [detail, setDetail] = React.useState<DocRecord | null>(null);
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  React.useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 300);
    return () => clearTimeout(t);
  }, [search]);

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams();
      if (tab !== "ALL") q.set("category", tab);
      if (debounced.trim()) q.set("search", debounced.trim());
      const res = await fetch(`/api/docs?${q.toString()}`);
      const data = await res.json();
      if (data.success) {
        setDocs(data.docs || []);
        if (data.stats) setStats(data.stats);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [tab, debounced]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <FileText className="w-5 h-5 text-sky-600" /> Văn thư — Hồ sơ pháp lý & Hợp đồng B2B
          </h1>
          <p className="text-xs text-muted-foreground">Lưu trữ ĐKKD · VSATTP · Kiểm dịch · Hợp đồng nguyên tắc B2B & biểu mẫu — MST {COMPANY_LEGAL_PROFILE.mst}</p>
        </div>
        <Button size="sm" className="rounded-full bg-sky-600 hover:bg-sky-700 text-white" onClick={() => setDrawerOpen(true)}>
          <Building2 className="w-3.5 h-3.5 mr-1.5" /> Hồ sơ pháp lý
        </Button>
      </div>

      {/* 4 Clay KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="clay-kpi clay-kpi--sky border-l-4 border-l-sky-500 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-muted-foreground">HỒ SƠ PHÁP LÝ</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-sky-400 to-sky-600 text-white border border-white/80 shadow-[0_4px_12px_rgba(14,165,233,0.35),inset_0_1px_1px_rgba(255,255,255,0.9)]">
              <ShieldCheck className="h-4 w-4" />
            </span>
          </div>
          <p className="text-xl font-extrabold tracking-tight text-sky-700">{stats ? stats.legalCount : loading ? "—" : "0"} <span className="text-xs font-semibold text-muted-foreground">tài liệu</span></p>
          <p className="text-xs text-muted-foreground">ĐKKD · ĐĐKD · Thuế</p>
        </div>

        <div className="clay-kpi border-l-4 border-l-emerald-500 p-4 space-y-1" style={{ boxShadow: "0 14px 28px -6px rgba(16,185,129,0.18), inset 0 2px 3px rgba(255,255,255,0.95)" }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-muted-foreground">VSATTP & KIỂM DỊCH</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white border border-white/80 shadow-[0_4px_12px_rgba(16,185,129,0.3),inset_0_1px_1px_rgba(255,255,255,0.9)]">
              <FileSignature className="h-4 w-4" />
            </span>
          </div>
          <p className="text-xl font-extrabold tracking-tight text-emerald-600">{stats ? stats.certCount : loading ? "—" : "0"} <span className="text-xs font-semibold text-muted-foreground">chứng nhận</span></p>
          <p className="text-xs text-muted-foreground">VSATTP · Thú y lô hàng</p>
        </div>

        <div className="clay-kpi clay-kpi--warning border-l-4 border-l-amber-500 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-muted-foreground">HỢP ĐỒNG B2B</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white border border-white/80 shadow-[0_4px_12px_rgba(217,119,6,0.35),inset_0_1px_1px_rgba(255,255,255,0.9)]">
              <FileText className="h-4 w-4" />
            </span>
          </div>
          <p className="text-xl font-extrabold tracking-tight text-amber-600">{stats ? stats.contractCount : loading ? "—" : "0"} <span className="text-xs font-semibold text-muted-foreground">biểu mẫu</span></p>
          <p className="text-xs text-muted-foreground">HĐNT · Biên bản · Ủy quyền</p>
        </div>

        <div className="clay-kpi clay-kpi--danger border-l-4 border-l-rose-500 p-4 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-muted-foreground">TỔNG DUNG LƯỢNG</span>
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-400 to-rose-600 text-white border border-white/80 shadow-[0_4px_12px_rgba(225,29,72,0.35),inset_0_1px_1px_rgba(255,255,255,0.9)]">
              <HardDrive className="h-4 w-4" />
            </span>
          </div>
          <p className="text-lg font-extrabold tracking-tight font-mono text-rose-600">{stats ? fmtSize(stats.totalSizeKb) : loading ? "—" : "0 KB"}</p>
          <p className="text-xs text-muted-foreground">{stats ? `${stats.totalCount} tệp` : "—"} · docs/legal/</p>
        </div>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 p-1 rounded-full border bg-white/80 backdrop-blur-sm shadow-sm flex-wrap">
          {DOC_CATEGORY_TAB.map((t) => (
            <button
              key={t.value}
              onClick={() => setTab(t.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${tab === t.value ? "bg-sky-600 text-white shadow-md" : "text-muted-foreground hover:bg-white hover:text-foreground"}`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="relative min-w-[220px] flex-1 max-w-sm ml-auto">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Tìm tên tài liệu / mã / cơ quan ban hành..." className="pl-8 h-9 text-xs rounded-full border-white/80 bg-white/90 glossy-pill" />
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="clay-card p-4 animate-pulse h-[220px] bg-muted/50" />
          ))}
        </div>
      ) : docs.length === 0 ? (
        <div className="clay-card p-10 text-center">
          <p className="text-sm text-muted-foreground">Không tìm thấy tài liệu phù hợp bộ lọc.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {docs.map((d) => (
            <DocCard key={d.id} doc={d} onView={setDetail} />
          ))}
        </div>
      )}

      {/* Detail dialog */}
      <Dialog open={!!detail} onOpenChange={(v) => { if (!v) setDetail(null); }}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-auto">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="text-sm flex items-center gap-2 pr-6">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[11px] ${DOC_CATEGORY_COLOR[detail.category]}`}>{DOC_CATEGORY_LABEL[detail.category]}</span>
                  <FileTypeBadge t={detail.file_type} />
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2 text-xs">
                <div>
                  <div className="font-bold text-sm leading-tight">{detail.title}</div>
                  <div className="font-mono text-[11px] text-muted-foreground mt-1">{detail.file_name} · {fmtSize(detail.file_size_kb)} · {detail.code}</div>
                  <div className="text-muted-foreground mt-1 flex items-center gap-1.5"><Building2 className="w-3 h-3" /> {detail.issuer} · <CalendarDays className="w-3 h-3" /> {detail.issue_date}</div>
                </div>
                {detail.description && <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-amber-800">{detail.description}</div>}
                <div className="rounded-xl border bg-white/60 px-3 py-2 space-y-1">
                  <div className="font-semibold text-xs">Đường dẫn lưu trữ</div>
                  <div className="font-mono text-[11px] text-muted-foreground break-all">{detail.storage_path}</div>
                  {detail.tags && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {detail.tags.map((t) => (
                        <Badge key={t} variant="outline" className="text-[11px] rounded-full">{t}</Badge>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" className="flex-1 rounded-full bg-sky-600 hover:bg-sky-700 text-white" onClick={() => setDetail(null)}>
                    <Eye className="w-3.5 h-3.5 mr-1" /> Xem tài liệu
                  </Button>
                  <Button size="sm" variant="outline" className="flex-1 rounded-full" onClick={() => setDetail(null)}>
                    <Download className="w-3.5 h-3.5 mr-1" /> Tải về
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Drawer — Hồ sơ pháp lý Sơn Khang */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px]" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full max-w-md bg-white shadow-2xl overflow-auto animate-in slide-in-from-right duration-200 flex flex-col">
            <div className="sticky top-0 bg-white border-b px-5 py-4 flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-bold flex items-center gap-2"><Building2 className="w-4 h-4 text-sky-600" /> Hồ sơ pháp lý</div>
                <div className="text-xs text-muted-foreground mt-0.5">{COMPANY_LEGAL_PROFILE.ten_doanh_nghiep}</div>
                <div className="font-mono text-[11px] text-muted-foreground">MST {COMPANY_LEGAL_PROFILE.mst} · Cấp {COMPANY_LEGAL_PROFILE.ngay_cap_lan_dau}</div>
              </div>
              <button onClick={() => setDrawerOpen(false)} className="h-8 w-8 inline-flex items-center justify-center rounded-full border bg-white hover:bg-muted">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-5 space-y-4 text-xs">
              <div className="rounded-2xl border bg-sky-50/70 p-4 space-y-2">
                <div className="font-bold text-sm text-sky-800">{COMPANY_LEGAL_PROFILE.ten_doanh_nghiep}</div>
                <div className="text-muted-foreground">{COMPANY_LEGAL_PROFILE.ten_tieng_anh} · {COMPANY_LEGAL_PROFILE.ten_viet_tat}</div>
                <div className="grid grid-cols-2 gap-2 pt-2 text-[11px]">
                  <div><span className="font-semibold">MST</span><div className="font-mono font-bold">{COMPANY_LEGAL_PROFILE.mst}</div><div className="text-muted-foreground">Sở Tài chính Hà Nội</div></div>
                  <div><span className="font-semibold">Vốn điều lệ</span><div className="font-mono font-bold">{COMPANY_LEGAL_PROFILE.von_dieu_le}</div><div className="text-muted-foreground">{COMPANY_LEGAL_PROFILE.loai_hinh}</div></div>
                </div>
                <div className="pt-1"><span className="font-semibold">Trụ sở</span><div className="text-muted-foreground">{COMPANY_LEGAL_PROFILE.dia_chi_tru_so}</div></div>
                <div><span className="font-semibold">ĐĐKD {COMPANY_LEGAL_PROFILE.ma_dia_diem_kd}</span><div className="text-muted-foreground">{COMPANY_LEGAL_PROFILE.dia_chi_kinh_doanh}</div></div>
              </div>

              <div className="rounded-2xl border bg-white p-4 space-y-2">
                <div className="font-semibold">Người đại diện & Chủ sở hữu</div>
                <div className="flex items-center gap-3">
                  <span className="h-10 w-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white inline-flex items-center justify-center font-bold text-sm">TH</span>
                  <div>
                    <div className="font-bold">{COMPANY_LEGAL_PROFILE.nguoi_dai_dien} — {COMPANY_LEGAL_PROFILE.chuc_danh}</div>
                    <div className="text-muted-foreground font-mono text-[11px]">CCCD {COMPANY_LEGAL_PROFILE.cccd}</div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-4 space-y-2">
                <div className="font-semibold">Thuế & Tài khoản</div>
                <div className="space-y-1.5">
                  <div className="flex justify-between"><span className="text-muted-foreground">Cơ quan thuế</span><span className="font-semibold">{COMPANY_LEGAL_PROFILE.co_quan_thue}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Kế toán thuế</span><span className="font-semibold">{COMPANY_LEGAL_PROFILE.ke_toan_thue} · {COMPANY_LEGAL_PROFILE.sdt_ke_toan}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Ngân hàng</span><span className="font-mono font-semibold">{COMPANY_LEGAL_PROFILE.ngan_hang}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Email / ĐT</span><span className="font-mono">{COMPANY_LEGAL_PROFILE.email}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Website</span><span className="font-mono">{COMPANY_LEGAL_PROFILE.website}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Điện thoại</span><span className="font-mono">{COMPANY_LEGAL_PROFILE.dien_thoai}</span></div>
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-4 space-y-2">
                <div className="font-semibold">Danh mục hồ sơ (docs/legal/)</div>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>01_GCN_DKKD_SON_KHANG.pdf — 16/10/2025</li>
                  <li>02_GCN_DKD_00001.pdf — 24/10/2025</li>
                  <li>03_GIAY_XAC_NHAN_DDKD.pdf — 02/10/2026</li>
                  <li>04_THONG_BAO_THUE.pdf — 24/10/2025</li>
                  <li>05_DKKD_DIA_DIEM_KINH_DOANH.pdf — 02/10/2026</li>
                </ul>
              </div>

              <Button className="w-full rounded-full bg-sky-600 hover:bg-sky-700 text-white" onClick={() => setDrawerOpen(false)}>Đóng</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
