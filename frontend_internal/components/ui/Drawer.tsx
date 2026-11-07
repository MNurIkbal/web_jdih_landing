"use client";

import { X } from "lucide-react";
import { ReactNode } from "react";

interface SliderDrawerProps {
  open: boolean;
  mode: "create" | "edit";
  title?: string;
  subtitle?: string;

  width?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";

  /**
   * true  = content drawer bisa di-scroll
   * false = content tidak bisa di-scroll
   */
  scrollable?: boolean;

  children: ReactNode;

  onClose: () => void;
  onSubmit?: (e: React.FormEvent<HTMLFormElement>) => void;

  submitText?: string;
  cancelText?: string;

  loading?: boolean;
}

const WIDTH_CLASS = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  full: "max-w-2xl lg:max-w-3xl",
};

export default function Drawer({
  open,
  mode,
  title,
  subtitle,
  width = "xl",
  scrollable = true,
  children,
  onClose,
  onSubmit,
  submitText,
  cancelText = "Batal",
  loading = false,
}: SliderDrawerProps) {
  const defaultTitle =
    title ?? (mode === "create" ? "Tambah" : "Edit");

  return (
    <>
      {/* Overlay backdrop */}
      <div
        className={`
          fixed inset-0 z-[60]
          bg-slate-900/30
          backdrop-blur-[2px]
          transition-opacity
          duration-300
          ${
            open
              ? "pointer-events-auto opacity-100"
              : "pointer-events-none opacity-0"
          }
        `}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <aside
        className={`
          fixed right-0 top-0 z-[70]
          flex w-full flex-col
          ${WIDTH_CLASS[width]}
          bg-white
          shadow-[-20px_0_60px_rgba(15,23,42,0.18)]
          transition-transform
          duration-300
          ease-out
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
        style={{ height: "100dvh", maxHeight: "100dvh" }}
      >
        {/* ── Header ── */}
        <div className="flex h-[70px] shrink-0 items-center justify-between border-b border-slate-100 px-6">
          <div className="min-w-0 pr-2">
            <h2 className="truncate text-[17px] font-bold tracking-tight text-slate-800">
              {defaultTitle}
            </h2>
            {subtitle && (
              <p className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</p>
            )}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="ml-2 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
          >
            <X size={17} />
          </button>
        </div>

        {/* ── Body + Footer wrapped in form ── */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit?.(e);
          }}
          className="flex min-h-0 flex-1 flex-col overflow-hidden"
        >
          {/* Scrollable body */}
          <div
            className={`
              min-h-0 flex-1 px-6 py-5
              ${scrollable ? "overflow-y-auto custom-scrollbar" : "overflow-hidden"}
            `}
          >
            {children}
          </div>

          {/* ── Footer ── hanya tampil jika submitText diberikan */}
          {onSubmit && submitText && (
            <div className="shrink-0 border-t border-slate-100 bg-slate-50/80 px-6 py-4">
              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={loading}
                  className="rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 active:scale-95 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                      Menyimpan...
                    </>
                  ) : (
                    submitText
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </aside>
    </>
  );
}
