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
  full: "max-w-none",
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
      <div
        className={`
          fixed inset-0 z-[60]
          bg-slate-900/20
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

      <aside
        className={`
          fixed right-0 top-0 z-[70]
          flex h-screen w-full
          ${WIDTH_CLASS[width]}
          flex-col
          bg-white
          shadow-[-20px_0_60px_rgba(15,23,42,0.12)]
          transition-transform
          duration-300
          ease-out
          ${open ? "translate-x-0" : "translate-x-full"}
        `}
      >
        <div
          className="
            flex h-[76px]
            shrink-0
            items-center
            justify-between
            border-b
            border-slate-100
            px-6
          "
        >
          <div>
            <h2
              className="
                mt-1
                text-[17px]
                font-bold
                tracking-tight
                text-slate-800
              "
            >
              {defaultTitle}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="
              flex h-9 w-9
              items-center
              justify-center
              rounded-xl
              border
              border-slate-200
              text-slate-400
              transition
              hover:bg-slate-50
              hover:text-slate-700
            "
          >
            <X size={17} />
          </button>
        </div>

        <form
          onSubmit={onSubmit}
          className="
            flex
            min-h-0
            flex-1
            flex-col
          "
        >
          <div
            className={`
              min-h-0
              flex-1
              px-6
              py-6
              ${scrollable ? "overflow-y-auto" : "overflow-hidden"}
            `}
          >
            {children}
          </div>
        </form>
      </aside>
    </>
  );
}
