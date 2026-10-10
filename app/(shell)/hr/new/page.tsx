"use client";
import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  Shield,
  Save,
  CheckCircle2,
  AlertTriangle,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type { HrRole } from "@/packages/modules/hr/types";
import { HR_ROLE_LABEL } from "@/packages/modules/hr/types";

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

export default function NewEmployeePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const [name, setName] = React.useState("");
  const [title, setTitle] = React.useState("Nhân viên vận hành");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [role, setRole] = React.useState<HrRole>("thukho");
  const [status, setStatus] = React.useState<"active" | "inactive">("active");
  const [contractType, setContractType] = React.useState("chinh_thuc");
  const [selectedApps, setSelectedApps] = React.useState<string[]>([
    "dashboard",
    "sales",
    "inventory",
    "feed",
    "tasks",
    "chat",
  ]);

  const toggleApp = (appId: string) => {
    setSelectedApps((prev) =>
      prev.includes(appId) ? prev.filter((a) => a !== appId) : [...prev, appId]
    );
  };

  const selectRolePreset = (r: HrRole) => {
    setRole(r);
    if (r === "admin") {
      setSelectedApps(ALL_AVAILABLE_APPS.map((a) => a.id));
      setTitle("Quản trị hệ thống");
    } else if (r === "ketoan") {
      setSelectedApps(["dashboard", "sales", "customers", "finance", "sapo2misa", "reports", "mail", "feed", "chat"]);
      setTitle("Kế toán bán hàng");
    } else if (r === "thukho") {
      setSelectedApps(["dashboard", "sales", "purchase", "inventory", "fleet", "feed", "tasks", "chat"]);
      setTitle("Thủ kho đông lạnh");
    } else if (r === "taixe") {
      setSelectedApps(["dashboard", "delivery", "fleet", "feed", "tasks", "chat"]);
      setTitle("Tài xế xe tải lạnh");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Vui lòng nhập tên nhân viên");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/hr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          title: title.trim(),
          email: email.trim() || `${name.trim().toLowerCase().replace(/\s+/g, ".")}@sonkhang.vn`,
          phone: phone.trim() || "0942 22 60 60",
          role,
          status,
          contractType,
          apps: selectedApps,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        throw new Error(data.error || "Không thể tạo hồ sơ nhân sự");
      }

      router.push("/hr");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Lỗi khi lưu nhân viên");
      setSubmitting(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <Link href="/hr">
          <Button variant="ghost" size="sm" className="rounded-full">
            <ArrowLeft className="mr-1.5 h-4 w-4" /> Quay lại danh sách nhân sự
          </Button>
        </Link>
        <Badge variant="outline" className="text-xs bg-sky-50 text-sky-700 border-sky-200">
          Tác vụ: Thêm nhân sự & Cấp quyền RBAC
        </Badge>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Info Card */}
        <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h1 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 border-b pb-3">
            <UserPlus className="w-5 h-5 text-sky-500" /> Tạo hồ sơ nhân viên mới
          </h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Họ và tên *
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="VD: Trần Văn Bình"
                required
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Chức danh / Vị trí
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="VD: Phụ kho lạnh Q7"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Số điện thoại liên hệ
              </label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="VD: 0987 654 321"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Email công việc
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="VD: binh.tv@sonkhang.vn"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Loại hợp đồng
              </label>
              <select
                value={contractType}
                onChange={(e) => setContractType(e.target.value)}
                className="w-full h-10 rounded-md border bg-white dark:bg-slate-950 px-3 text-xs"
              >
                <option value="chinh_thuc">Hợp đồng chính thức</option>
                <option value="thu_viec">Thử việc (2 tháng)</option>
                <option value="thoi_vu">Thời vụ / Khoán chuyến</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Trạng thái làm việc
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as "active" | "inactive")}
                className="w-full h-10 rounded-md border bg-white dark:bg-slate-950 px-3 text-xs"
              >
                <option value="active">Đang làm việc</option>
                <option value="inactive">Đã nghỉ việc</option>
              </select>
            </div>
          </div>
        </div>

        {/* Role & RBAC Permissions Card */}
        <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="border-b pb-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Shield className="w-4 h-4 text-emerald-500" /> Phân quyền vai trò & Ứng dụng được phép truy cập (RBAC)
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Chọn vai trò chính để thiết lập nhanh, sau đó tùy chỉnh chi tiết từng phân hệ
            </p>
          </div>

          {/* Role selector pills */}
          <div className="flex flex-wrap gap-2">
            {(["admin", "ketoan", "thukho", "taixe"] as HrRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => selectRolePreset(r)}
                className={`rounded-2xl border px-4 py-2 text-xs font-bold transition-all ${
                  role === r
                    ? "bg-sky-600 text-white border-sky-600 shadow-sm"
                    : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200"
                }`}
              >
                {HR_ROLE_LABEL[r]}
              </button>
            ))}
          </div>

          {/* Granular App Toggles */}
          <div className="space-y-2 pt-2">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
              Danh sách phân hệ được phép truy cập ({selectedApps.length}/{ALL_AVAILABLE_APPS.length}):
            </span>
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
        </div>

        {error && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0" /> {error}
          </div>
        )}

        {/* Action Button */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <Link href="/hr">
            <Button type="button" variant="outline" className="rounded-full">
              Hủy bỏ
            </Button>
          </Link>
          <Button
            type="submit"
            disabled={submitting}
            className="rounded-full bg-sky-600 hover:bg-sky-700 text-white font-bold px-8 shadow-md"
          >
            <Save className="mr-2 h-4 w-4" /> Lưu hồ sơ nhân sự
          </Button>
        </div>
      </form>
    </div>
  );
}
