"use client";
import { useState } from "react";

export function QrViewport() {
  const [openCam, setOpenCam] = useState(false);
  return (
    <div className="space-y-2">
      <div className="qr-viewport relative grid aspect-square max-h-[240px] place-items-center overflow-hidden rounded-[14px] bg-slate-900">
        {/* overlay */}
        <div className="pointer-events-none absolute inset-0 bg-slate-900/45" />
        {/* corners */}
        <span className="qr-corner pointer-events-none absolute left-3 top-3 h-7 w-7 rounded-tl-lg border-l-[3px] border-t-[3px] border-white" />
        <span className="qr-corner pointer-events-none absolute right-3 top-3 h-7 w-7 rounded-tr-lg border-r-[3px] border-t-[3px] border-white" />
        <span className="qr-corner pointer-events-none absolute bottom-3 left-3 h-7 w-7 rounded-bl-lg border-b-[3px] border-l-[3px] border-white" />
        <span className="qr-corner pointer-events-none absolute bottom-3 right-3 h-7 w-7 rounded-br-lg border-b-[3px] border-r-[3px] border-white" />
        {/* scanline */}
        <span className="qr-scanline pointer-events-none absolute inset-x-3 h-0.5 bg-sky-400 shadow-[0_0_8px_#0EA5E9]" style={{ top: "50%", animation: "qrScan 2s ease-in-out infinite" }} />
        <div className="relative z-10 grid h-20 w-20 place-items-center rounded-lg bg-white text-center font-mono text-[9px] leading-tight text-slate-800">
          QR
          <br />
          VietQR
        </div>
        <span className="absolute bottom-2 left-1/2 z-10 -translate-x-1/2 font-mono text-[10px] text-white/80">Đưa mã vào khung</span>
      </div>
      <style>{`@keyframes qrScan{0%,100%{transform:translateY(-40px)}50%{transform:translateY(40px)}}`}</style>
      <div className="flex gap-2">
        <button
          onClick={() => setOpenCam((v) => !v)}
          className="tap-target flex min-h-[44px] flex-1 items-center justify-center rounded-full bg-slate-900 px-4 font-mono text-xs font-bold text-white dark:bg-white dark:text-slate-900"
        >
          {openCam ? "Tắt camera" : "Bật camera"}
        </button>
        <label className="tap-target flex min-h-[44px] flex-1 cursor-pointer items-center justify-center rounded-full border bg-card px-4 font-mono text-xs font-bold">
          Tải ảnh QR
          <input type="file" accept="image/*" className="hidden" />
        </label>
      </div>
      {openCam && <p className="font-mono text-[11px] text-muted-foreground">Camera API — mock (getUserMedia sẽ cấu hình sau).</p>}
    </div>
  );
}
