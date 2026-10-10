"use client";
import * as React from "react";
import {
  User,
  Shield,
  Key,
  Bell,
  Clock,
  Warehouse,
  CheckCircle2,
  Lock,
  Phone,
  Mail,
  Edit,
  Save,
  PenTool,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function ProfilePage() {
  const [name, setName] = React.useState("Hồ Bá Thịnh");
  const [email, setEmail] = React.useState("thinhhoba@sonkhang.vn");
  const [phone, setPhone] = React.useState("0942 22 60 60");
  const [role, setRole] = React.useState("Giám Đốc Điều Hành (Admin)");
  const [department, setDepartment] = React.useState("Ban Quản Trị & Vận Hành");
  const [warehouseShift, setWarehouseShift] = React.useState("Kho Q7 (Định Công) - Ca Toàn Thời Gian");

  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [toast, setToast] = React.useState<string | null>(null);

  const [signatureText, setSignatureText] = React.useState("Hồ Bá Thịnh — Quyết định xuất nhập kho");

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setToast("Đã lưu thông tin hồ sơ cá nhân thành công!");
    setTimeout(() => setToast(null), 3000);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      alert("Vui lòng nhập mật khẩu hiện tại");
      return;
    }
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu mới không trùng khớp");
      return;
    }
    if (newPassword.length < 6) {
      alert("Mật khẩu mới phải có ít nhất 6 ký tự");
      return;
    }
    setToast("Đã cập nhật mật khẩu mới an toàn!");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setTimeout(() => setToast(null), 3000);
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-16">
      {/* Top Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
          <User className="w-5 h-5 text-sky-500" /> Hồ Sơ Cá Nhân & Phân Quyền
        </h1>
        <p className="text-xs text-muted-foreground">
          Quản lý tài khoản nhân sự, ca trực kho lạnh, chữ ký số và bảo mật hệ thống Sơn Khang
        </p>
      </div>

      {toast && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-xs font-semibold text-emerald-700 flex items-center gap-2 shadow-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0" /> {toast}
        </div>
      )}

      {/* Profile Overview Banner */}
      <div className="rounded-3xl border border-sky-200/80 bg-gradient-to-r from-sky-500/10 via-cyan-500/5 to-transparent p-6 shadow-sm backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="h-20 w-20 rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg border-2 border-white">
            HBT
          </div>
          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-slate-100">{name}</h2>
              <Badge className="bg-sky-600 text-white font-mono">Mã NV: SK-001</Badge>
              <Badge variant="outline" className="border-emerald-300 text-emerald-700 bg-emerald-50">
                Toàn quyền ADMIN
              </Badge>
            </div>
            <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
              {role} • {department}
            </p>
            <p className="text-xs text-muted-foreground">
              Ca trực hiện tại: <strong className="text-sky-700 dark:text-sky-400">{warehouseShift}</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs / Two Columns Form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Personal Details Form */}
        <form onSubmit={handleSaveProfile} className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-3">
            <User className="w-4 h-4 text-sky-500" /> Thông tin liên hệ & chức danh
          </h2>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Họ và tên
              </label>
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Email doanh nghiệp
              </label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Số điện thoại liên hệ
              </label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Phòng ban trực thuộc
              </label>
              <Input value={department} onChange={(e) => setDepartment(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Ca làm việc & Kho phân công
              </label>
              <Input value={warehouseShift} onChange={(e) => setWarehouseShift(e.target.value)} />
            </div>
          </div>

          <div className="pt-2">
            <Button type="submit" className="rounded-full bg-sky-600 hover:bg-sky-700 text-white font-semibold">
              <Save className="w-4 h-4 mr-1.5" /> Lưu thông tin cá nhân
            </Button>
          </div>
        </form>

        {/* Security & Password Form */}
        <div className="space-y-6">
          <form onSubmit={handleChangePassword} className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-3">
              <Lock className="w-4 h-4 text-amber-500" /> Đổi mật khẩu đăng nhập
            </h2>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Mật khẩu hiện tại
                </label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Mật khẩu mới
                </label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Tối thiểu 6 ký tự"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Xác nhận mật khẩu mới
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>

            <div className="pt-2">
              <Button type="submit" variant="secondary" className="rounded-full font-semibold">
                <Key className="w-4 h-4 mr-1.5" /> Cập nhật mật khẩu
              </Button>
            </div>
          </form>

          {/* Digital Signature Card */}
          <div className="rounded-3xl border border-slate-200 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-3">
              <PenTool className="w-4 h-4 text-emerald-500" /> Chữ ký xác nhận kho điện tử
            </h2>
            <p className="text-xs text-muted-foreground">
              Chữ ký này tự động đính kèm khi ký duyệt phiếu xuất kho hoặc phiếu giao hàng chành xe
            </p>
            <Input
              value={signatureText}
              onChange={(e) => setSignatureText(e.target.value)}
              className="font-serif italic font-bold text-sky-800 dark:text-sky-300"
            />
            <Button
              size="sm"
              variant="outline"
              className="rounded-full text-xs"
              onClick={() => setToast("Đã cập nhật chữ ký điện tử!")}
            >
              Lưu chữ ký
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
