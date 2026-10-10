"use client";
import * as React from "react";
import { Settings, Database, ShieldCheck, PlugZap, Building2, QrCode, Store, FileText, Truck, Save, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { SystemSettings, SettingsTabId } from "@/packages/modules/settings/types";
import { SETTINGS_TABS } from "@/packages/modules/settings/types";

const fmtVnd = (n: number) => Number(n).toLocaleString("vi-VN") + " ₫";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-slate-700 dark:text-slate-200">{label}</label>
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const [settings, setSettings] = React.useState<SystemSettings | null>(null);
  const [draft, setDraft] = React.useState<SystemSettings | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState<SettingsTabId>("company");
  const [dirty, setDirty] = React.useState(false);

  const fetchSettings = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/settings");
      const data = await res.json();
      if (data.success && data.settings) {
        setSettings(data.settings);
        setDraft(data.settings);
        setDirty(false);
      }
    } catch (e) { console.error(e); } finally { setLoading(false); }
  }, []);

  React.useEffect(() => { fetchSettings(); }, [fetchSettings]);
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const patch = React.useCallback(
    (updater: (d: SystemSettings) => SystemSettings) => {
      setDraft((prev) => {
        if (!prev) return prev;
        const next = updater(structuredClone(prev));
        return next;
      });
      setDirty(true);
    },
    []
  );

  const handleSave = async () => {
    if (!draft) return;
    setSaving(true);
    try {
      const res = await fetch("/api/settings", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(draft) });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Lỗi lưu cấu hình");
      setSettings(data.settings);
      setDraft(data.settings);
      setDirty(false);
      setToast("Đã lưu cấu hình hệ thống");
    } catch (e: unknown) {
      setToast(e instanceof Error ? e.message : "Lỗi lưu cấu hình");
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
        <div className="h-64 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse" />
      </div>
    );
  }
  if (!draft || !settings) {
    return <div className="clay-card rounded-2xl p-10 text-center text-sm text-muted-foreground">Không tải được cấu hình — thử làm mới</div>;
  }

  const meta = draft.meta;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Settings className="w-5 h-5 text-violet-500" /> Cấu hình hệ thống & Tích hợp
          </h1>
          <p className="text-xs text-muted-foreground">Doanh nghiệp · VietQR · Sapo · MISA · Chính sách — cập nhật {meta.updated_at}</p>
        </div>
        <Button className="rounded-full bg-sky-600 hover:bg-sky-700 text-white shadow" onClick={handleSave} disabled={saving || !dirty}>
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : dirty ? <Save className="w-4 h-4" /> : <Check className="w-4 h-4" />}
          {saving ? "Đang lưu..." : "Lưu Cấu Hình"}
        </Button>
      </div>

      {/* 4 Clay-KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="clay-card rounded-2xl p-4 border-l-4 border-l-violet-500">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Settings className="w-3.5 h-3.5 text-violet-500" /> Phiên bản hệ thống</div>
          <div className="mt-1 text-lg font-bold">{meta.version}</div>
          <div className="text-[11px] text-muted-foreground">Build 10/10/2026 · Next.js 15</div>
        </div>
        <div className="clay-card rounded-2xl p-4 border-l-4 border-l-emerald-500">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><PlugZap className="w-3.5 h-3.5 text-emerald-500" /> Cổng tích hợp hoạt động</div>
          <div className="mt-1 text-2xl font-bold text-emerald-600">{meta.integrations_active}/{meta.integrations_total} <span className="text-xs font-semibold">Connected</span></div>
          <div className="text-[11px] text-muted-foreground">Sapo · MISA AMIS · meInvoice · VietQR</div>
        </div>
        <div className="clay-card rounded-2xl p-4 border-l-4 border-l-sky-500">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><Database className="w-3.5 h-3.5 text-sky-500" /> Database VPS</div>
          <div className="mt-1 flex items-center gap-2">
            <span className={`inline-flex h-2.5 w-2.5 rounded-full ${meta.db_status === "online" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"}`} />
            <span className="text-lg font-bold capitalize">{meta.db_status}</span>
            <Badge variant="outline" className="text-[11px] bg-emerald-50 text-emerald-700 border-emerald-200">PostgreSQL + Redis</Badge>
          </div>
          <div className="text-[11px] text-muted-foreground">Docker Compose · Nginx · Let&apos;s Encrypt</div>
        </div>
        <div className="clay-card rounded-2xl p-4 border-l-4 border-l-amber-500">
          <div className="flex items-center gap-2 text-xs text-muted-foreground"><ShieldCheck className="w-3.5 h-3.5 text-amber-500" /> Bảo mật RBAC</div>
          <div className="mt-1 text-lg font-bold flex items-center gap-2">
            {meta.rbac_status === "active" ? <Badge className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full">Active</Badge> : <Badge variant="outline">Inactive</Badge>}
            <span className="text-xs text-muted-foreground">Auth.js + RBAC</span>
          </div>
          <div className="text-[11px] text-muted-foreground">Phân quyền theo vai trò</div>
        </div>
      </div>

      {/* Main: sidebar tabs + form */}
      <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">
        {/* Sidebar tabs */}
        <div className="clay-card rounded-2xl p-2 h-fit lg:sticky lg:top-4">
          <div className="text-[11px] font-semibold tracking-widest uppercase text-muted-foreground px-3 py-2">Cài đặt</div>
          <div className="space-y-1">
            {SETTINGS_TABS.map((t) => {
              const active = tab === t.id;
              const Icon =
                t.id === "company" ? Building2 : t.id === "vietqr" ? QrCode : t.id === "sapo" ? Store : t.id === "misa" ? FileText : Truck;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  className={`w-full text-left rounded-xl px-3 py-2.5 border transition-all flex gap-3 ${active ? "bg-violet-600 text-white border-violet-600 shadow" : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-violet-300"}`}
                >
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${active ? "text-white" : "text-violet-500"}`} />
                  <span>
                    <span className={`block text-xs font-semibold leading-tight ${active ? "text-white" : ""}`}>{t.label}</span>
                    <span className={`block text-[11px] leading-tight ${active ? "text-violet-100" : "text-muted-foreground"}`}>{t.desc}</span>
                  </span>
                </button>
              );
            })}
          </div>
          {dirty && <p className="text-[11px] text-amber-600 px-3 pt-3">• Có thay đổi chưa lưu</p>}
        </div>

        {/* Form panel */}
        <div className="clay-card rounded-2xl p-5 space-y-6">
          {tab === "company" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold flex items-center gap-2"><Building2 className="w-4 h-4 text-violet-500" /> Doanh nghiệp & Kho bãi</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Tên pháp nhân">
                  <Input value={draft.company.legal_name} onChange={(e) => patch((d) => { d.company.legal_name = e.target.value; return d; })} className="h-9 rounded-xl" />
                </Field>
                <Field label="Tên rút gọn">
                  <Input value={draft.company.short_name} onChange={(e) => patch((d) => { d.company.short_name = e.target.value; return d; })} className="h-9 rounded-xl" />
                </Field>
                <Field label="Mã số thuế (MST)" hint="10 chữ số, ví dụ 0111252725">
                  <Input value={draft.company.mst} onChange={(e) => patch((d) => { d.company.mst = e.target.value; return d; })} className="h-9 rounded-xl font-mono" />
                </Field>
                <Field label="Đại diện pháp luật">
                  <Input value={draft.company.representative} onChange={(e) => patch((d) => { d.company.representative = e.target.value; return d; })} className="h-9 rounded-xl" />
                </Field>
                <Field label="Trụ sở chính" hint="Địa chỉ đăng ký kinh doanh">
                  <Input value={draft.company.address} onChange={(e) => patch((d) => { d.company.address = e.target.value; return d; })} className="h-9 rounded-xl" />
                </Field>
                <Field label="Tổng kho">
                  <Input value={draft.company.warehouse_address} onChange={(e) => patch((d) => { d.company.warehouse_address = e.target.value; return d; })} className="h-9 rounded-xl" />
                </Field>
                <Field label="Hotline">
                  <Input value={draft.company.hotline} onChange={(e) => patch((d) => { d.company.hotline = e.target.value; return d; })} className="h-9 rounded-xl" />
                </Field>
                <Field label="Điện thoại cố định">
                  <Input value={draft.company.tel} onChange={(e) => patch((d) => { d.company.tel = e.target.value; return d; })} className="h-9 rounded-xl" />
                </Field>
                <Field label="Email">
                  <Input value={draft.company.email} onChange={(e) => patch((d) => { d.company.email = e.target.value; return d; })} className="h-9 rounded-xl" />
                </Field>
                <Field label="Website">
                  <Input value={draft.company.website} onChange={(e) => patch((d) => { d.company.website = e.target.value; return d; })} className="h-9 rounded-xl" />
                </Field>
              </div>
            </div>
          )}

          {tab === "vietqr" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold flex items-center gap-2"><QrCode className="w-4 h-4 text-emerald-500" /> Thanh toán VietQR</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Ngân hàng">
                  <Input value={draft.vietqr.bank_name} onChange={(e) => patch((d) => { d.vietqr.bank_name = e.target.value; return d; })} className="h-9 rounded-xl" />
                </Field>
                <Field label="Mã ngân hàng">
                  <Input value={draft.vietqr.bank_code} onChange={(e) => patch((d) => { d.vietqr.bank_code = e.target.value; return d; })} className="h-9 rounded-xl font-mono" />
                </Field>
                <Field label="Số tài khoản">
                  <Input value={draft.vietqr.account_no} onChange={(e) => patch((d) => { d.vietqr.account_no = e.target.value; return d; })} className="h-9 rounded-xl font-mono" />
                </Field>
                <Field label="Chủ tài khoản">
                  <Input value={draft.vietqr.account_name} onChange={(e) => patch((d) => { d.vietqr.account_name = e.target.value; return d; })} className="h-9 rounded-xl" />
                </Field>
                <Field label="Template QR">
                  <select value={draft.vietqr.template} onChange={(e) => patch((d) => { d.vietqr.template = e.target.value; return d; })} className="h-9 w-full rounded-xl border bg-white dark:bg-slate-800 px-3 text-sm">
                    <option value="compact2">compact2</option>
                    <option value="compact">compact</option>
                    <option value="print">print</option>
                  </select>
                </Field>
                <Field label="Tiền tố nội dung CK" hint="Ví dụ SK — hệ thống sẽ ghép SK + mã đơn">
                  <Input value={draft.vietqr.transfer_content_prefix} onChange={(e) => patch((d) => { d.vietqr.transfer_content_prefix = e.target.value; return d; })} className="h-9 rounded-xl font-mono" />
                </Field>
              </div>
              <label className="flex items-center gap-2 text-xs">
                <input type="checkbox" checked={draft.vietqr.enabled} onChange={(e) => patch((d) => { d.vietqr.enabled = e.target.checked; return d; })} />
                Bật thanh toán VietQR
              </label>
              <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs leading-relaxed">
                <div className="font-semibold text-emerald-800">Techcombank · {draft.vietqr.account_no} · {draft.vietqr.account_name}</div>
                <div className="text-emerald-700">Cú pháp: {draft.vietqr.transfer_content_prefix}&#123;MA_DON&#125; — VD: {draft.vietqr.transfer_content_prefix}DH20261010</div>
              </div>
            </div>
          )}

          {tab === "sapo" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold flex items-center gap-2"><Store className="w-4 h-4 text-sky-500" /> Tích hợp Sapo API</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Store URL">
                  <Input value={draft.sapo.store_url} onChange={(e) => patch((d) => { d.sapo.store_url = e.target.value; return d; })} className="h-9 rounded-xl" placeholder="sonkhang.mysapo.net" />
                </Field>
                <Field label="API Key (masked)" hint="Để trống nếu không đổi key">
                  <Input value={draft.sapo.api_key_masked} onChange={(e) => patch((d) => { d.sapo.api_key_masked = e.target.value; return d; })} className="h-9 rounded-xl font-mono" />
                </Field>
                <Field label="Trạng thái">
                  <select value={draft.sapo.status} onChange={(e) => patch((d) => { d.sapo.status = e.target.value as SystemSettings["sapo"]["status"]; return d; })} className="h-9 w-full rounded-xl border bg-white dark:bg-slate-800 px-3 text-sm">
                    <option value="connected">Connected</option>
                    <option value="disconnected">Disconnected</option>
                    <option value="error">Error</option>
                  </select>
                </Field>
                <Field label="Đồng bộ lần cuối">
                  <Input value={draft.sapo.last_synced_at ?? ""} onChange={(e) => patch((d) => { d.sapo.last_synced_at = e.target.value; return d; })} className="h-9 rounded-xl" />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Ghi chú">
                    <Input value={draft.sapo.note ?? ""} onChange={(e) => patch((d) => { d.sapo.note = e.target.value; return d; })} className="h-9 rounded-xl" />
                  </Field>
                </div>
              </div>
              <div className={`rounded-xl border p-3 text-xs flex items-center gap-2 ${draft.sapo.status === "connected" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                <span className={`h-2 w-2 rounded-full ${draft.sapo.status === "connected" ? "bg-emerald-500" : "bg-amber-500"}`} />
                {draft.sapo.status === "connected" ? "Đã kết nối Sapo — đồng bộ đơn & tồn kho" : "Chưa kết nối / lỗi — kiểm tra API Key"}
                {draft.sapo.last_synced_at && <span className="ml-auto text-[11px]">Last sync: {draft.sapo.last_synced_at}</span>}
              </div>
            </div>
          )}

          {tab === "misa" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold flex items-center gap-2"><FileText className="w-4 h-4 text-blue-500" /> MISA AMIS & meInvoice</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="AMIS AppID">
                  <Input value={draft.misa.amis_app_id} onChange={(e) => patch((d) => { d.misa.amis_app_id = e.target.value; return d; })} className="h-9 rounded-xl font-mono" />
                </Field>
                <Field label="Trạng thái AMIS">
                  <select value={draft.misa.amis_status} onChange={(e) => patch((d) => { d.misa.amis_status = e.target.value as SystemSettings["misa"]["amis_status"]; return d; })} className="h-9 w-full rounded-xl border bg-white dark:bg-slate-800 px-3 text-sm">
                    <option value="connected">Connected</option>
                    <option value="disconnected">Disconnected</option>
                    <option value="error">Error</option>
                  </select>
                </Field>
                <Field label="meInvoice Serial">
                  <Input value={draft.misa.meinvoice_serial} onChange={(e) => patch((d) => { d.misa.meinvoice_serial = e.target.value; return d; })} className="h-9 rounded-xl font-mono" />
                </Field>
                <Field label="Mẫu số">
                  <Input value={draft.misa.meinvoice_template} onChange={(e) => patch((d) => { d.misa.meinvoice_template = e.target.value; return d; })} className="h-9 rounded-xl font-mono" />
                </Field>
                <Field label="Trạng thái meInvoice">
                  <select value={draft.misa.meinvoice_status} onChange={(e) => patch((d) => { d.misa.meinvoice_status = e.target.value as SystemSettings["misa"]["meinvoice_status"]; return d; })} className="h-9 w-full rounded-xl border bg-white dark:bg-slate-800 px-3 text-sm">
                    <option value="connected">Connected</option>
                    <option value="disconnected">Disconnected</option>
                    <option value="error">Error</option>
                  </select>
                </Field>
                <Field label="Đồng bộ lần cuối">
                  <Input value={draft.misa.last_synced_at ?? ""} onChange={(e) => patch((d) => { d.misa.last_synced_at = e.target.value; return d; })} className="h-9 rounded-xl" />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Ghi chú">
                    <Input value={draft.misa.note ?? ""} onChange={(e) => patch((d) => { d.misa.note = e.target.value; return d; })} className="h-9 rounded-xl" />
                  </Field>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className={`rounded-xl border p-3 text-xs flex items-center gap-2 ${draft.misa.amis_status === "connected" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                  <span className={`h-2 w-2 rounded-full ${draft.misa.amis_status === "connected" ? "bg-emerald-500" : "bg-amber-500"}`} /> AMIS {draft.misa.amis_status}
                </div>
                <div className={`rounded-xl border p-3 text-xs flex items-center gap-2 ${draft.misa.meinvoice_status === "connected" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700"}`}>
                  <span className={`h-2 w-2 rounded-full ${draft.misa.meinvoice_status === "connected" ? "bg-emerald-500" : "bg-amber-500"}`} /> meInvoice {draft.misa.meinvoice_status} · {draft.misa.meinvoice_serial} · {draft.misa.meinvoice_template}
                </div>
              </div>
            </div>
          )}

          {tab === "policy" && (
            <div className="space-y-4">
              <h2 className="text-sm font-bold flex items-center gap-2"><Truck className="w-4 h-4 text-amber-500" /> Chính sách bán hàng & Chành xe</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Field label="Giá trị đơn tối thiểu">
                  <Input type="number" value={String(draft.policy.min_order_value)} onChange={(e) => patch((d) => { d.policy.min_order_value = Number(e.target.value) || 0; return d; })} className="h-9 rounded-xl" />
                  <p className="text-[11px] text-muted-foreground">{fmtVnd(draft.policy.min_order_value)}</p>
                </Field>
                <Field label="Chiết khấu bốc kho (VNĐ/thùng)">
                  <Input type="number" value={String(draft.policy.pickup_discount_per_box)} onChange={(e) => patch((d) => { d.policy.pickup_discount_per_box = Number(e.target.value) || 0; return d; })} className="h-9 rounded-xl" />
                  <p className="text-[11px] text-muted-foreground">{fmtVnd(draft.policy.pickup_discount_per_box)}/thùng</p>
                </Field>
                <Field label={`Freeship < ${draft.policy.freeship_distance_1_km}km (VNĐ)`}>
                  <Input type="number" value={String(draft.policy.freeship_threshold_8km)} onChange={(e) => patch((d) => { d.policy.freeship_threshold_8km = Number(e.target.value) || 0; return d; })} className="h-9 rounded-xl" />
                  <p className="text-[11px] text-muted-foreground">Đơn từ {fmtVnd(draft.policy.freeship_threshold_8km)} freeship &lt;{draft.policy.freeship_distance_1_km}km</p>
                </Field>
                <Field label={`Freeship < ${draft.policy.freeship_distance_2_km}km (VNĐ)`}>
                  <Input type="number" value={String(draft.policy.freeship_threshold_12km)} onChange={(e) => patch((d) => { d.policy.freeship_threshold_12km = Number(e.target.value) || 0; return d; })} className="h-9 rounded-xl" />
                  <p className="text-[11px] text-muted-foreground">Đơn từ {fmtVnd(draft.policy.freeship_threshold_12km)} freeship &lt;{draft.policy.freeship_distance_2_km}km</p>
                </Field>
                <Field label="Khoảng cách freeship 1 (km)">
                  <Input type="number" value={String(draft.policy.freeship_distance_1_km)} onChange={(e) => patch((d) => { d.policy.freeship_distance_1_km = Number(e.target.value) || 0; return d; })} className="h-9 rounded-xl" />
                </Field>
                <Field label="Khoảng cách freeship 2 (km)">
                  <Input type="number" value={String(draft.policy.freeship_distance_2_km)} onChange={(e) => patch((d) => { d.policy.freeship_distance_2_km = Number(e.target.value) || 0; return d; })} className="h-9 rounded-xl" />
                </Field>
                <Field label="Số ngày cảnh báo công nợ quá hạn">
                  <Input type="number" value={String(draft.policy.ageing_days)} onChange={(e) => patch((d) => { d.policy.ageing_days = Number(e.target.value) || 0; return d; })} className="h-9 rounded-xl" />
                </Field>
                <div className="md:col-span-2">
                  <Field label="Ghi chú chành xe">
                    <Input value={draft.policy.chanh_xe_note} onChange={(e) => patch((d) => { d.policy.chanh_xe_note = e.target.value; return d; })} className="h-9 rounded-xl" />
                  </Field>
                </div>
              </div>
              <div className="rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs leading-relaxed text-amber-800">
                Đơn tối thiểu {fmtVnd(draft.policy.min_order_value)} · Freeship {fmtVnd(draft.policy.freeship_threshold_8km)} (&lt;{draft.policy.freeship_distance_1_km}km) / {fmtVnd(draft.policy.freeship_threshold_12km)} (&lt;{draft.policy.freeship_distance_2_km}km) · Bốc kho -{fmtVnd(draft.policy.pickup_discount_per_box)}/thùng · {draft.policy.chanh_xe_note}
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2 border-t">
            <Button className="rounded-full bg-sky-600 hover:bg-sky-700 text-white" onClick={handleSave} disabled={saving || !dirty}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? "Đang lưu..." : "Lưu Cấu Hình"}
            </Button>
          </div>
        </div>
      </div>

      {toast && <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 rounded-full bg-slate-900 text-white px-4 py-2.5 text-xs shadow-lg">{toast}</div>}
    </div>
  );
}
