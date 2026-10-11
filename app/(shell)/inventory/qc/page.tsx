"use client";
import * as React from "react";
import {
  ClipboardCheck,
  Package,
  Thermometer,
  Calendar,
  Camera,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Save,
  RefreshCw,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { StorageTempZone } from "@/packages/modules/inventory/types";

type QcConclusion = "dat_chuan" | "tu_choi" | "nhap_co_dieu_kien";

interface QcRecord {
  id: string;
  code: string;
  supplier: string;
  sku: string;
  productName: string;
  zone: StorageTempZone;
  packagingOk: boolean;
  labelViOk: boolean;
  productionDate: string;
  expiryDate: string;
  shelfLifePct: number;
  shelfLifePass: boolean;
  tempC: number | null;
  tempPass: boolean | null;
  tempWarning: string | null;
  photos: string[];
  conclusion: QcConclusion;
  signedBy: string;
  note?: string;
  createdAt: string;
}

const ZONE_LABELS: Record<StorageTempZone, string> = {
  dong_lanh: "Đông lạnh (≤-15°C)",
  kho_mat: "Kho mát (2-8°C)",
  kho_kho: "Kho khô (RT)",
};

const CONCLUSION_LABELS: Record<QcConclusion, string> = {
  dat_chuan: "Đạt chuẩn",
  tu_choi: "Từ chối",
  nhap_co_dieu_kien: "Nhập có điều kiện",
};

const CONCLUSION_COLORS: Record<QcConclusion, string> = {
  dat_chuan: "bg-emerald-100 text-emerald-700 border-emerald-200",
  tu_choi: "bg-rose-100 text-rose-700 border-rose-200",
  nhap_co_dieu_kien: "bg-amber-100 text-amber-700 border-amber-200",
};

export default function QcPage() {
  const [records, setRecords] = React.useState<QcRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  // Form state
  const [supplier, setSupplier] = React.useState("");
  const [sku, setSku] = React.useState("");
  const [productName, setProductName] = React.useState("");
  const [zone, setZone] = React.useState<StorageTempZone>("dong_lanh");
  const [packagingOk, setPackagingOk] = React.useState(true);
  const [labelViOk, setLabelViOk] = React.useState(true);
  const [productionDate, setProductionDate] = React.useState("");
  const [expiryDate, setExpiryDate] = React.useState("");
  const [tempC, setTempC] = React.useState<string>("");
  const [photos, setPhotos] = React.useState<string[]>([]);
  const [conclusion, setConclusion] = React.useState<QcConclusion>("dat_chuan");
  const [signedBy, setSignedBy] = React.useState("Trần Thị Ngọc Thúy");
  const [note, setNote] = React.useState("");

  // Detail modal
  const [detailRecord, setDetailRecord] = React.useState<QcRecord | null>(null);

  // Calculate shelf life %
  const shelfLifePct = React.useMemo(() => {
    if (!productionDate || !expiryDate) return null;
    const prod = new Date(productionDate);
    const exp = new Date(expiryDate);
    const now = new Date();
    const totalLife = exp.getTime() - prod.getTime();
    const remainingLife = exp.getTime() - now.getTime();
    if (totalLife <= 0) return 0;
    const pct = Math.round((remainingLife / totalLife) * 100);
    return Math.max(0, Math.min(100, pct));
  }, [productionDate, expiryDate]);

  const shelfLifePass = shelfLifePct !== null && shelfLifePct >= 70;

  // Temperature warning
  const tempWarning = React.useMemo(() => {
    if (tempC === "" || tempC === null) return null;
    const temp = Number(tempC);
    if (zone === "dong_lanh") {
      if (temp > -12) {
        return "KHÔNG ĐẠT HACCP — nhiệt độ thùng bảo ôn vượt ngưỡng!";
      }
      if (temp > -15) {
        return "Cảnh báo: nhiệt độ cao hơn mức tối ưu (-15°C)";
      }
    }
    return null;
  }, [tempC, zone]);

  const fetchRecords = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/inventory/qc");
      const data = await res.json();
      if (data.success) {
        setRecords(data.records || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotos((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const canSave =
    supplier.trim() &&
    sku.trim() &&
    productName.trim() &&
    productionDate &&
    expiryDate &&
    signedBy.trim();

  const handleSave = async () => {
    if (!canSave) {
      setToast("Vui lòng nhập đủ thông tin bắt buộc");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/inventory/qc", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier,
          sku,
          productName,
          zone,
          packagingOk,
          labelViOk,
          productionDate,
          expiryDate,
          tempC: tempC !== "" ? Number(tempC) : null,
          photos,
          conclusion,
          signedBy,
          note: note.trim() || undefined,
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Lỗi lưu biên bản KCS");

      // Reset form
      setSupplier("");
      setSku("");
      setProductName("");
      setZone("dong_lanh");
      setPackagingOk(true);
      setLabelViOk(true);
      setProductionDate("");
      setExpiryDate("");
      setTempC("");
      setPhotos([]);
      setConclusion("dat_chuan");
      setNote("");

      setToast(`Đã lưu biên bản KCS: ${data.record.code}`);
      fetchRecords();
    } catch (e: unknown) {
      setToast(e instanceof Error ? e.message : "Lỗi");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ClipboardCheck className="w-5 h-5 text-indigo-500" /> Biên bản KCS Hàng Về
          </h1>
          <p className="text-xs text-muted-foreground">
            Kiểm soát chất lượng tiếp nhận hàng tại Kho Định Công — HACCP & FEFO
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="rounded-full glossy-pill"
            onClick={fetchRecords}
            disabled={loading}
          >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin text-indigo-500" : ""}`}
            />
            Làm mới
          </Button>
        </div>
      </div>

      {/* Form nhập KCS */}
      <div className="clay-card p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/60">
          <Package className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold">Nhập Biên bản KCS mới</h2>
        </div>

        {/* Thông tin cơ bản */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-semibold">Nhà cung cấp *</label>
            <Input
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="VD: CP Việt Nam"
              className="h-9 text-xs mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Mã SKU *</label>
            <Input
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              placeholder="VD: HH053"
              className="h-9 text-xs font-mono mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-semibold">Vùng nhiệt độ *</label>
            <select
              value={zone}
              onChange={(e) => setZone(e.target.value as StorageTempZone)}
              className="w-full h-9 rounded-md border bg-white px-3 text-xs mt-1"
            >
              {Object.entries(ZONE_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold">Tên sản phẩm *</label>
          <Input
            value={productName}
            onChange={(e) => setProductName(e.target.value)}
            placeholder="VD: Gà Viên Chiên Popcorn CP Túi 1kg"
            className="h-9 text-xs mt-1"
          />
        </div>

        {/* 3 Tiêu chí KCS */}
        <div className="bg-indigo-50/50 rounded-xl border border-indigo-200 p-4 space-y-3">
          <h3 className="text-xs font-bold text-indigo-700 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" /> 3 Tiêu chí KCS
          </h3>

          {/* 1. Cảm quan bao bì */}
          <div className="space-y-2">
            <label className="text-xs font-semibold block">1. Cảm quan bao bì & nhãn</label>
            <div className="flex flex-wrap gap-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={packagingOk}
                  onChange={(e) => setPackagingOk(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-xs">Bao bì nguyên vẹn</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={labelViOk}
                  onChange={(e) => setLabelViOk(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300"
                />
                <span className="text-xs">Nhãn Tiếng Việt đầy đủ</span>
              </label>
            </div>
          </div>

          {/* 2. Ngày sản xuất & hạn dùng */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold">2. Ngày sản xuất *</label>
              <Input
                type="date"
                value={productionDate}
                onChange={(e) => setProductionDate(e.target.value)}
                className="h-9 text-xs mt-1"
              />
            </div>
            <div>
              <label className="text-xs font-semibold">Hạn sử dụng *</label>
              <Input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="h-9 text-xs mt-1"
              />
            </div>
          </div>

          {shelfLifePct !== null && (
            <div
              className={`rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-2 ${
                shelfLifePass
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-rose-50 text-rose-700 border border-rose-200"
              }`}
            >
              {shelfLifePass ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span>
                Shelf-life còn lại: <strong>{shelfLifePct}%</strong> — {shelfLifePass ? "✅ ĐẠT (≥70%)" : "❌ KHÔNG ĐẠT (<70%)"}
              </span>
            </div>
          )}

          {/* 3. Nhiệt độ */}
          <div>
            <label className="text-xs font-semibold flex items-center gap-1.5">
              <Thermometer className="w-3.5 h-3.5" />
              3. Nhiệt độ thùng bảo ôn (°C) {zone !== "dong_lanh" && "(tùy chọn)"}
            </label>
            <Input
              type="number"
              step="0.1"
              value={tempC}
              onChange={(e) => setTempC(e.target.value)}
              placeholder="VD: -18"
              className="h-9 text-xs font-mono mt-1"
            />
            {tempWarning && (
              <div
                className={`mt-2 rounded-lg px-3 py-2 text-xs font-semibold flex items-center gap-2 ${
                  tempWarning.includes("KHÔNG ĐẠT")
                    ? "bg-rose-50 text-rose-700 border border-rose-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                <AlertTriangle className="w-4 h-4" />
                {tempWarning}
              </div>
            )}
          </div>
        </div>

        {/* Upload ảnh */}
        <div>
          <label className="text-xs font-semibold flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" />
            Ảnh chụp thực tế (tùy chọn)
          </label>
          <Input
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileChange}
            className="h-9 text-xs mt-1"
          />
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {photos.map((photo, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={photo}
                    alt={`KCS ${idx + 1}`}
                    className="w-20 h-20 object-cover rounded-lg border shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-rose-500 text-white text-xs flex items-center justify-center"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Kết luận & Ký duyệt */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold">Kết luận KCS *</label>
            <select
              value={conclusion}
              onChange={(e) => setConclusion(e.target.value as QcConclusion)}
              className="w-full h-9 rounded-md border bg-white px-3 text-xs mt-1"
            >
              {Object.entries(CONCLUSION_LABELS).map(([key, label]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold">Ký duyệt Thủ kho *</label>
            <Input
              value={signedBy}
              onChange={(e) => setSignedBy(e.target.value)}
              placeholder="VD: Trần Thị Ngọc Thúy"
              className="h-9 text-xs mt-1"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold">Ghi chú</label>
          <Input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ghi chú bổ sung (tùy chọn)..."
            className="h-9 text-xs mt-1"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button
            size="sm"
            className="rounded-full bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50"
            onClick={handleSave}
            disabled={!canSave || saving}
          >
            <Save className="w-3.5 h-3.5 mr-1.5" />
            {saving ? "Đang lưu..." : "Lưu Biên bản KCS"}
          </Button>
        </div>
      </div>

      {/* Lịch sử records */}
      <div className="clay-card p-5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/60">
          <Calendar className="w-4 h-4 text-indigo-600" />
          <h2 className="text-sm font-bold">Lịch sử Biên bản KCS</h2>
          <Badge variant="outline" className="ml-auto text-xs font-mono">
            {records.length} biên bản
          </Badge>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-24 bg-muted/50 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : records.length === 0 ? (
          <div className="text-center py-8 text-xs text-muted-foreground">
            Chưa có biên bản KCS nào
          </div>
        ) : (
          <div className="space-y-2">
            {records.map((rec) => (
              <div
                key={rec.id}
                className="rounded-xl border bg-white/70 p-3 flex items-start justify-between gap-3 hover:shadow-md transition-shadow"
              >
                <div className="min-w-0 flex-1 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold">{rec.code}</span>
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold ${
                        CONCLUSION_COLORS[rec.conclusion]
                      }`}
                    >
                      {CONCLUSION_LABELS[rec.conclusion]}
                    </span>
                    {!rec.shelfLifePass && (
                      <Badge variant="outline" className="text-[10px] border-rose-300 text-rose-700 bg-rose-50">
                        Shelf-life {rec.shelfLifePct}%
                      </Badge>
                    )}
                    {rec.tempWarning && (
                      <Badge variant="outline" className="text-[10px] border-amber-300 text-amber-700 bg-amber-50">
                        ⚠️ Nhiệt độ
                      </Badge>
                    )}
                  </div>
                  <div className="text-xs font-semibold truncate">{rec.productName}</div>
                  <div className="text-[11px] text-muted-foreground">
                    {rec.supplier} · {rec.sku} · {ZONE_LABELS[rec.zone]}
                    {rec.tempC !== null && ` · ${rec.tempC}°C`}
                  </div>
                  <div className="text-[11px] text-muted-foreground">
                    Ký duyệt: {rec.signedBy} · {new Date(rec.createdAt).toLocaleString("vi-VN")}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs rounded-full shrink-0"
                  onClick={() => setDetailRecord(rec)}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Chi tiết
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <Dialog
        open={!!detailRecord}
        onOpenChange={(v) => {
          if (!v) setDetailRecord(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-auto">
          {detailRecord && (
            <>
              <DialogHeader>
                <DialogTitle className="text-sm flex items-center gap-2">
                  <ClipboardCheck className="w-4 h-4 text-indigo-600" />
                  <span className="font-mono">{detailRecord.code}</span>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs ${
                      CONCLUSION_COLORS[detailRecord.conclusion]
                    }`}
                  >
                    {CONCLUSION_LABELS[detailRecord.conclusion]}
                  </span>
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-3 pt-2 text-xs">
                <div className="bg-indigo-50/50 rounded-xl border border-indigo-200 p-3">
                  <div className="font-semibold">{detailRecord.productName}</div>
                  <div className="text-muted-foreground mt-1">
                    NCC: {detailRecord.supplier} · SKU: {detailRecord.sku}
                  </div>
                  <div className="text-muted-foreground">
                    Vùng: {ZONE_LABELS[detailRecord.zone]}
                    {detailRecord.tempC !== null && ` · Nhiệt độ: ${detailRecord.tempC}°C`}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="font-semibold">Kết quả KCS:</div>
                  <div className="grid grid-cols-2 gap-2">
                    <div
                      className={`rounded-lg px-3 py-2 border ${
                        detailRecord.packagingOk
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      <div className="font-semibold">Bao bì</div>
                      <div>{detailRecord.packagingOk ? "✅ Nguyên vẹn" : "❌ Hư hỏng"}</div>
                    </div>
                    <div
                      className={`rounded-lg px-3 py-2 border ${
                        detailRecord.labelViOk
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }`}
                    >
                      <div className="font-semibold">Nhãn Tiếng Việt</div>
                      <div>{detailRecord.labelViOk ? "✅ Đầy đủ" : "❌ Thiếu"}</div>
                    </div>
                  </div>

                  <div
                    className={`rounded-lg px-3 py-2 border ${
                      detailRecord.shelfLifePass
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-rose-50 text-rose-700 border-rose-200"
                    }`}
                  >
                    <div className="font-semibold">Shelf-life</div>
                    <div>
                      NSX: {new Date(detailRecord.productionDate).toLocaleDateString("vi-VN")} →
                      HSD: {new Date(detailRecord.expiryDate).toLocaleDateString("vi-VN")}
                    </div>
                    <div className="font-bold mt-1">
                      Còn lại: {detailRecord.shelfLifePct}% — {detailRecord.shelfLifePass ? "✅ ĐẠT" : "❌ KHÔNG ĐẠT"}
                    </div>
                  </div>

                  {detailRecord.tempWarning && (
                    <div className="rounded-lg px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200">
                      <div className="font-semibold">⚠️ Cảnh báo nhiệt độ</div>
                      <div>{detailRecord.tempWarning}</div>
                    </div>
                  )}
                </div>

                {detailRecord.photos.length > 0 && (
                  <div>
                    <div className="font-semibold mb-2">Ảnh chụp:</div>
                    <div className="flex flex-wrap gap-2">
                      {detailRecord.photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt={`KCS ${idx + 1}`}
                          className="w-24 h-24 object-cover rounded-lg border shadow-sm"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {detailRecord.note && (
                  <div className="bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                    <div className="font-semibold text-amber-700">Ghi chú:</div>
                    <div className="text-amber-700 mt-1">{detailRecord.note}</div>
                  </div>
                )}

                <div className="border-t pt-3 text-muted-foreground">
                  <div>Ký duyệt: <strong>{detailRecord.signedBy}</strong></div>
                  <div>Thời gian: {new Date(detailRecord.createdAt).toLocaleString("vi-VN")}</div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50 bg-foreground text-background text-sm px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" /> {toast}
        </div>
      )}
    </div>
  );
}
