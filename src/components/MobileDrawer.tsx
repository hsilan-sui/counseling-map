"use client";
import { useEffect } from "react";
import type { ReactNode } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
};

export default function MobileDrawer({ open, onClose, children, title }: Props) {
  // 鎖背景卷動 + ESC 關閉
  useEffect(() => {
    if (!open) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // 鎖定 body 捲動（保留原本樣式）
    const { overflow, position, width } = document.body.style;
    // 若本來就有滾動條，避免鎖捲後版面抖動：補上捲軸寬（可選）
    const scrollbarGap = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarGap > 0) {
      document.body.style.width = `calc(100% - ${scrollbarGap}px)`;
    }
    document.body.style.overflow = "hidden";
    document.body.style.position = "relative";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      document.body.style.position = position;
      document.body.style.width = width;
    };
  }, [open, onClose]);

  return (
    <div
      className={`fixed inset-0 z-[3000] lg:hidden transition ${
        open ? "pointer-events-auto" : "pointer-events-none"
      }`}
      {...(!open ? { "aria-hidden": true } : {})}
    >
      {/* 背景遮罩 */}
      <button
        type="button"
        onClick={onClose}
        aria-label="關閉抽屜"
        className={`absolute inset-0 bg-black/40 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
      />

      {/* Bottom Sheet */}
      <div
        className={`absolute left-0 right-0 bottom-0 rounded-t-2xl bg-white shadow-xl
                    max-h-[85svh] pb-[calc(8px+env(safe-area-inset-bottom))]
                    transition-all duration-200
                    ${open ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? "清單"}
      >
        <div className="flex items-center justify-between p-3 border-b">
          <div className="font-semibold text-slate-700 text-sm">{title ?? "清單"}</div>
          <button
            className="px-2 py-1 text-slate-600 hover:text-slate-800"
            onClick={onClose}
            aria-label="關閉清單"
            title="關閉"
          >
            關閉
          </button>
        </div>

        <div
          className="overflow-auto overscroll-contain"
          style={{ maxHeight: "calc(85svh - 44px)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
