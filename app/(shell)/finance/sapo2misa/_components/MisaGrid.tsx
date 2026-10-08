"use client";
import * as React from "react";
import { useVirtualizer } from "@tanstack/react-virtual";
import { MISA_COLS, VISIBLE_DEFAULT } from "@/constants/misaColumns";
import { cn } from "@/lib/utils";

export type MisaRow = Record<string, string | number> & {
  external_id: string;
};

function mockRows(count = 48): MisaRow[] {
  const base: Partial<MisaRow>[] = [
    { so_ct: "SP-0841", ten_kh: "An Thinh Mart", mst: "0301234567", ma_hang: "HEO-XAY-500", so_luong: 40, don_gia: 82000, thue_suat: "8%", kho: "Q7" },
    { so_ct: "SP-0840", ten_kh: "Minh Khang Food", mst: "0312345678", ma_hang: "BO-VIEN-1K", so_luong: 20, don_gia: 185000, thue_suat: "5%", kho: "Q12" },
    { so_ct: "SP-0839", ten_kh: "SaiGon Fresh", mst: "", ma_hang: "CHA-LUA-500", so_luong: 0, don_gia: 95000, thue_suat: "8%", kho: "Q7" },
    { so_ct: "SP-0838", ten_kh: "Kho Si Q7", mst: "0309990001", ma_hang: "UNKNOWN-SKU", so_luong: 12, don_gia: 120000, thue_suat: "10%", kho: "Q12" },
  ];
  const rows: MisaRow[] = [];
  for (let i = 0; i < count; i++) {
    const b = base[i % base.length] as Record<string, string | number>;
    const idx = String(i + 1).padStart(4, "0");
    const soCt = i < base.length ? (b.so_ct as string) : `SP-${String(840 - i).padStart(4, "0")}`;
    rows.push({
      ngay_ht: `08/10/2026`,
      ngay_ct: `08/10/2026`,
      so_ct: soCt,
      mst: (b.mst as string) ?? "0301000000",
      ten_kh: (b.ten_kh as string) ?? `KH ${idx}`,
      dia_chi: "Q7, TP.HCM",
      dien_giai: "Bán sỉ thực phẩm",
      ma_kh: `KH-${idx}`,
      nhom_kh: "B2B",
      chi_nhanh: i % 2 === 0 ? "Q7" : "Q12",
      ma_hang: (b.ma_hang as string) ?? "HEO-XAY-500",
      ten_hang: "Heo xay 500g",
      dvt: "kg",
      so_luong: (b.so_luong as number) ?? 10 + (i % 7),
      don_gia: (b.don_gia as number) ?? 85000,
      thanh_tien: ((b.so_luong as number) ?? 10) * ((b.don_gia as number) ?? 85000),
      thue_suat: (b.thue_suat as string) ?? "8%",
      tien_thue: 0,
      tk_no: "131",
      tk_co: "5111",
      kho: (b.kho as string) ?? "Q7",
      so_lo: `L${idx}`,
      han_sd: "08/04/2027",
      ck_ty_le: "0%",
      ck_tien: 0,
      ngoai_te: "VND",
      ty_gia: 1,
      thanh_tien_qd: 0,
      tien_thue_qd: 0,
      tk_no_qd: "131",
      tk_co_qd: "5111",
      ghi_chu_dong: "",
      ma_ct_lq: "",
      cp_dong: 0,
      phi_khac: 0,
      tong_hang: 0,
      tong_thue: 0,
      tong_tt: 0,
      tong_ck: 0,
      tong_cp: 0,
      hinh_thuc: "Chuyển khoản",
      han_tt: "08/11/2026",
      ck_hd_ty_le: "0%",
      ck_hd_tien: 0,
      con_phai_thu: 0,
      chiet_khau: 0,
      cp_vc: 0,
      lo_han: `L${idx}·08/04/2027`,
      ghi_chu: "",
      nv_ban: "NV Q7",
      kenh: "Sapo",
      ma_nv: "NV001",
      bo_phan: "Kinh doanh",
      du_an: "",
      hop_dong: "",
      ngay_giao: "09/10/2026",
      dia_giao: "Q7",
      ghi_chu_giao: "",
      trang_thai: i % 5 === 0 ? "Chờ duyệt" : "Sẵn sàng",
      nguon: "Sapo",
      external_id: i === 6 ? "SP-0841" : `EXT-${idx}`,
      last_synced: "08/10 08:14",
      tich_hop: "Sapo→MISA",
    } as MisaRow);
    // fill derived money
    const r = rows[rows.length - 1];
    const sl = Number(r.so_luong) || 0;
    const dg = Number(r.don_gia) || 0;
    const tt = sl * dg;
    const rate = parseInt(String(r.thue_suat).replace("%", "")) || 0;
    r.thanh_tien = tt;
    r.tien_thue = Math.round((tt * rate) / 100);
    r.thanh_tien_qd = tt;
    r.tien_thue_qd = r.tien_thue;
    r.tong_hang = tt;
    r.tong_thue = r.tien_thue as number;
    r.tong_tt = (tt as number) + (r.tien_thue as number);
  }
  return rows;
}

const MONO_KEYS = new Set(["so_ct", "mst", "ma_hang", "so_luong", "don_gia", "thanh_tien", "tien_thue", "external_id", "last_synced"]);

function isInvalid(row: MisaRow, key: string): boolean {
  if (key === "mst" && !String(row.mst ?? "").trim()) return true;
  if (key === "ma_hang" && String(row.ma_hang) === "UNKNOWN-SKU") return true;
  if (key === "so_luong" && Number(row.so_luong) <= 0) return true;
  return false;
}

export default function MisaGrid({
  showAllCols,
  filterText,
  rows: rowsProp,
}: {
  showAllCols: boolean;
  filterText: string;
  rows?: MisaRow[];
}) {
  const allRows = React.useMemo(() => rowsProp ?? mockRows(48), [rowsProp]);
  const visibleKeys = React.useMemo(
    () => (showAllCols ? MISA_COLS.map((c) => c.key) : VISIBLE_DEFAULT),
    [showAllCols]
  );
  const cols = React.useMemo(() => MISA_COLS.filter((c) => visibleKeys.includes(c.key)), [visibleKeys]);

  const filtered = React.useMemo(() => {
    const q = filterText.trim().toLowerCase();
    if (!q) return allRows;
    return allRows.filter((r) => Object.values(r).join(" ").toLowerCase().includes(q));
  }, [allRows, filterText]);

  // external_id duplicate check
  const dupIds = React.useMemo(() => {
    const seen = new Map<string, number>();
    for (const r of allRows) seen.set(r.external_id, (seen.get(r.external_id) ?? 0) + 1);
    const dups = new Set<string>();
    seen.forEach((v, k) => { if (v > 1) dups.add(k); });
    return dups;
  }, [allRows]);

  const parentRef = React.useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: filtered.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 36,
    overscan: 10,
  });

  const totalWidth = cols.length * 140;
  const virtualRows = rowVirtualizer.getVirtualItems();

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b bg-muted/40">
        <span className="text-xs font-semibold">
          {filtered.length} dòng · {cols.length}/{MISA_COLS.length} cột
        </span>
        <span className="text-[11px] text-muted-foreground">Ghim 2 cột đầu · sticky header · virtualized</span>
      </div>

      <div ref={parentRef} className="overflow-auto max-h-[420px] relative" style={{ contain: "strict" }}>
        <div style={{ width: totalWidth, minWidth: "100%" }}>
          {/* header */}
          <div className="sticky top-0 z-10 flex bg-muted border-b shadow-sm">
            {cols.map((c, idx) => {
              const frozen = idx < 2;
              return (
                <div
                  key={c.key}
                  className={cn(
                    "shrink-0 px-2 py-2 text-[11px] font-bold tracking-wide border-r bg-muted text-muted-foreground",
                    frozen && "sticky z-[11] bg-muted"
                  )}
                  style={{
                    width: 140,
                    left: frozen ? (idx === 0 ? 0 : 140) : undefined,
                    borderColor: "var(--border)",
                  }}
                  title={c.label}
                >
                  {c.label}
                </div>
              );
            })}
          </div>

          {/* virtualized body */}
          <div style={{ height: rowVirtualizer.getTotalSize(), position: "relative" }}>
            {virtualRows.map((vr) => {
              const row = filtered[vr.index];
              const isDup = dupIds.has(row.external_id);
              return (
                <div
                  key={vr.key}
                  className={cn("absolute left-0 right-0 flex border-b hover:bg-muted/50", isDup && "bg-destructive/5")}
                  style={{ transform: `translateY(${vr.start}px)`, height: 36 }}
                >
                  {cols.map((c, colIdx) => {
                    const frozen = colIdx < 2;
                    const val = row[c.key];
                    const invalid = isInvalid(row, c.key) || (c.key === "external_id" && isDup);
                    const mono = MONO_KEYS.has(c.key);
                    return (
                      <div
                        key={c.key}
                        className={cn(
                          "shrink-0 px-2 py-1.5 text-xs border-r truncate flex items-center",
                          frozen && "sticky z-[1] bg-card",
                          invalid && "bg-destructive/10 text-destructive ring-1 ring-inset ring-destructive/20",
                          mono && "mono"
                        )}
                        style={{
                          width: 140,
                          left: frozen ? (colIdx === 0 ? 0 : 140) : undefined,
                        }}
                        title={invalid ? (c.key === "mst" ? "MST rỗng" : c.key === "ma_hang" ? "SKU chưa map" : c.key === "so_luong" ? "SL ≤ 0" : "Trùng external_id") : String(val ?? "")}
                      >
                        {String(val ?? "")}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
