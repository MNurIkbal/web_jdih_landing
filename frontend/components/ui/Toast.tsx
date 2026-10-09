"use client";

import {
  CheckCircle2,
  XCircle,
  Info,
  X,
} from "lucide-react";

interface ToastProps {
  open: boolean;
  type?: "success" | "error" | "info";
  title?: string;
  message: string;
  onClose: () => void;
}

export default function Toast({
  open,
  type = "success",
  title,
  message,
  onClose,
}: ToastProps) {
  if (!open) return null;

  const config = {
    success: {
      icon: CheckCircle2,
      iconClass: "text-emerald-500",
      bgClass: "bg-emerald-50",
      titleClass: "text-emerald-700",
    },
    error: {
      icon: XCircle,
      iconClass: "text-red-500",
      bgClass: "bg-red-50",
      titleClass: "text-red-700",
    },
    info: {
      icon: Info,
      iconClass: "text-blue-500",
      bgClass: "bg-blue-50",
      titleClass: "text-blue-700",
    },
  };

  const current = config[type];
  const Icon = current.icon;

  return (
    <div
      className="
        fixed
        right-5
        top-5
        z-[9999]
        w-[360px]
        animate-in
        slide-in-from-right-5
        fade-in
        duration-300
      "
    >
      <div
        className="
          flex
          items-start
          gap-3
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-4
          shadow-[0_15px_50px_rgba(15,23,42,0.15)]
        "
      >
        <div
          className={`
            flex
            h-10
            w-10
            shrink-0
            items-center
            justify-center
            rounded-xl
            ${current.bgClass}
          `}
        >
          <Icon
            size={20}
            className={current.iconClass}
          />
        </div>

        <div className="min-w-0 flex-1">
          <p
            className={`
              text-sm
              font-bold
              ${current.titleClass}
            `}
          >
            {title ?? "Notifikasi"}
          </p>

          <p className="mt-1 text-xs leading-5 text-slate-500">
            {message}
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="
            flex
            h-7
            w-7
            shrink-0
            items-center
            justify-center
            rounded-lg
            text-slate-400
            transition
            hover:bg-slate-100
            hover:text-slate-600
          "
        >
          <X size={15} />
        </button>
      </div>
    </div>
  );
}
