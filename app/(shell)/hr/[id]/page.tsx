"use client";
import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Save,
  Trash2,
  Shield,
  User,
  Clock,
  Phone,
  Mail,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { HrEmployee, HrRole } from "@/packages/modules/hr/types";
import { HR_ROLE_LABEL, HR_ROLE_COLOR } from "@/packages/modules/hr/types";

const ALL_AVAILABLE_APPS = [
  { id: "dashboard", label: "Bản làm việc (Dashboard)" },
  { id: "sales", label: "Bán hàng & Soạn kho" },
  { id: "customers", label: "Khách hàng B2B" },
  { id: "pricing", label: "Bảng giá 4 cấp" },
  { id: "purchase", label: "Mua hàng & Nhập kho" },
  { id: "inventory", label: "Kho lạnh Q7 / Q12" },
  { id: "delivery", label: "Giao vận & Điều xe" },
  { id: "fleet", label: "Quản lý xe tải lạnh 29C-882.60" },
  { id: "finance", label: "Dòng tiền & VietQR" },
  { id: "sapo2misa", label: "Sapo2Misa 63 cột" },
  { id: "reports", label: "Báo cáo doanh thu" },
  { id: "hr", label: "Nhân sự & Phân quyền" },
  { id: "feed", label: "Bảng tin nội bộ" },
  { id: "tasks", label: "Quản lý công việc" },
  { id: "notes", label: "Sổ tay ghi chú" },
  { id: "chat", label: "Chat nội bộ" },
  { id: "mail", label: "Hộp thư Gmail & Outlook" },
  { id: "pos", label: "Kênh POS Bán hàng" },
  { id: "dathang", label: "Web Order Đặt hàng nhanh" },
];

export default function EmployeeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [employee, setEmployee] = React.useState<HrEmployee | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Edit fields
  const [name, setName] = React.useState("");
  const [title, setTitle] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<HrRole>("thukho");
  const [status, setStatus] = React.useState<"active" | "inactive" | "on_leave">("active");
  const [selectedApps, setSelectedApps] = React.useState<string[]>([]);

  const fetchEmployee = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/hr/${id}`);
      const data = await res.json();
      if (!data.success || !data.employee) {
        throw new Error(data.error || "Không tìm thấy nhân viên");
      }
      const e: HrEmployee = data.employee;
      setEmployee(e);
      setName(e.name);
      setTitle(e.title);
      setPhone(e.phone);
      setEmail(e.email);
      setRole(e.role);
      setStatus(e.status);
      setSelectedApps(e.apps || []);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi tải thông tin nhân sự");
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchEmployee();
  }, [fetchEmployee]);

  const toggleApp = (appId: string) => {
    setSelectedApps((prev) =>
      prev.includes(appId) ? prev.filter((a) => a !== appId) : [...prev, appId]
    );
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/hr/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          title,
          phone,
          email,
          role,
          status,
          apps: selectedApps,
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Lỗi lưu nhân sự");
      setEmployee(data.employee);
      setToast("Đã lưu cập nhật hồ sơ và quyền RBAC thành công!");
      setTimeout(() => setToast(null), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi khi lưu");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`Bạn có chắc chắn muốn xóa nhân sự ${employee?.name}?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/hr/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Lỗi xóa nhân sự");
      router.push("/hr");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi khi xóa");
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <RefreshCw className="h-7 w-7 animate-spin text-sky-500" />
      </div>
    );
  }

  if (error && !employee) {
    return (
      <div className="p-8 text-center space-y-4">
        <AlertTriangle className="mx-auto h-12 w-12 text-rose-500" />
        <h2 className="text-lg font-bold text-rose-600">{error}</h2>
        <Button variant="outline" onClick={() => router.push("/hr")}>Quay lại danh sách</Button>
      </div>
    );
  }

  if (!employee) return null;

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/hr">
          <Button variant="ghost" size="sm" className="rounded-full">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Quay lại danh sách nhân sự
          </Button>
        </Link>
        <div className="flex items-center gap-2">
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={deleting}
            className="rounded-full"
          >
            <Trash2 className="w-3.5 h-3.5 mr-1" /> Xóa nhân viên
          </Button>
        </div>
      </div>

      {toast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {toast}
        </div>
      )}

      {/* Header Banner */}
      <div className="rounded-3xl border border-sky-200/80 bg-gradient-to-r from-sky-500/10 via-cyan-500/5 to-transparent p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-sky-600 text-white font-bold text-xl flex items-center justify-center shadow-md">
              {employee.avatar}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-slate-100">{employee.name}</h1>
                <Badge variant="outline" className="font-mono text-xs">{employee.id}</Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{employee.title} • {employee.phone}</p>
            </div>
          </div>
          <Badge className={`font-semibold ${HR_ROLE_COLOR[employee.role]}`}>
            {HR_ROLE_LABEL[employee.role]}
          </Badge>
        </div>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSave} className="space-y-6">
        <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-3">
            <User className="w-4 h-4 text-sky-500" /> Chỉnh sửa thông tin hồ sơ
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Họ và tên *
              </label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Chức danh công việc
              </label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Số điện thoại liên hệ
              </label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Email doanh nghiệp
              </label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Vai trò chính
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as HrRole)}
                className="w-full h-10 rounded-md border bg-white dark:bg-slate-950 px-3 text-xs"
              >
                <option value="admin">Quản trị viên (ADMIN)</option>
                <option value="ketoan">Kế toán bán hàng & Tài chính</option>
                <option value="thukho">Thủ kho đông lạnh Q7/Q12</option>
                <option value="taixe">Tài xế xe tải lạnh 29C-882.60</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Trạng thái làm việc
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full h-10 rounded-md border bg-white dark:bg-slate-950 px-3 text-xs"
              >
                <option value="active">Đang làm việc</option>
                <option value="on_leave">Nghỉ phép</option>
                <option value="inactive">Đã nghỉ việc</option>
              </select>
            </div>
          </div>
        </div>

        {/* RBAC App Permissions */}
        <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="border-b pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" /> Tùy chỉnh phân quyền ứng dụng (RBAC)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Đánh dấu các phân hệ mà nhân viên này được phép xem và thao tác trên thanh menu hệ thống
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5">
            {ALL_AVAILABLE_APPS.map((app) => {
              const isChecked = selectedApps.includes(app.id);
              return (
                <label
                  key={app.id}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border cursor-pointer transition-colors text-xs ${
                    isChecked
                      ? "bg-sky-50/80 border-sky-300 dark:bg-sky-950/20 font-semibold text-sky-900 dark:text-sky-200"
                      : "bg-white dark:bg-slate-950 border-slate-200 text-muted-foreground hover:bg-slate-50"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleApp(app.id)}
                    className="h-4 w-4 rounded accent-sky-600"
                  />
                  <span>{app.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/hr">
            <Button type="button" variant="outline" className="rounded-full">Hủy bỏ</Button>
          </Link>
          <Button
            type="submit"
            disabled={saving}
            className="rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold px-8 shadow-md"
          >
            {saving ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Lưu thay đổi hồ sơ & Quyền
          </Button>
        </div>
      </form>
    </div>
  );
}
