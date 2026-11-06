"use client";

import {
  AlertTriangle,
  Loader2,
  Trash2,
  X,
} from "lucide-react";

interface ConfirmDeleteModalProps {
  open: boolean;
  title?: string;
  description?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function ConfirmDeleteModal({
  open,
  title = "Hapus Data",
  description = "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.",
  loading = false,
  onClose,
  onConfirm,
}: ConfirmDeleteModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      className="
        fixed
        inset-0
        z-[100]
        flex
        items-center
        justify-center
        bg-slate-950/40
        px-4
        backdrop-blur-sm
        animate-in
        fade-in
        duration-200
      "
      onClick={() => {
        if (!loading) {
          onClose();
        }
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="
          w-full
          max-w-[430px]
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-[0_25px_80px_rgba(15,23,42,0.22)]
          animate-in
          zoom-in-95
          slide-in-from-bottom-2
          duration-200
        "
      >
        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div
          className="
            flex
            items-center
            justify-between
            border-b
            border-slate-100
            px-6
            py-4
          "
        >
          <span
            className="
              text-xs
              font-bold
              uppercase
              tracking-[0.14em]
              text-slate-400
            "
          >
            Konfirmasi
          </span>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              flex
              h-9
              w-9
              cursor-pointer
              items-center
              justify-center
              rounded-xl
              text-slate-400
              transition-all
              duration-200
              hover:bg-slate-100
              hover:text-slate-600
              hover:rotate-90
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <X size={18} />
          </button>
        </div>

        {/* ================================================= */}
        {/* CONTENT */}
        {/* ================================================= */}

        <div
          className="
            px-7
            py-8
            text-center
          "
        >
          {/* ICON */}

          <div
            className="
              relative
              mx-auto
              mb-5
              flex
              h-16
              w-16
              items-center
              justify-center
            "
          >
            {/* Glow */}

            <div
              className="
                absolute
                inset-0
                rounded-2xl
                bg-red-100
                animate-pulse
              "
            />

            {/* Icon */}

            <div
              className="
                relative
                flex
                h-14
                w-14
                items-center
                justify-center
                rounded-2xl
                bg-red-50
                text-red-500
                ring-1
                ring-red-100
              "
            >
              <AlertTriangle
                size={25}
                strokeWidth={2}
              />
            </div>
          </div>

          {/* TITLE */}

          <h3
            className="
              text-lg
              font-bold
              tracking-tight
              text-slate-800
            "
          >
            {title}
          </h3>

          {/* DESCRIPTION */}

          <p
            className="
              mx-auto
              mt-2
              max-w-[340px]
              text-sm
              leading-6
              text-slate-500
            "
          >
            {description}
          </p>
        </div>

        {/* ================================================= */}
        {/* FOOTER */}
        {/* ================================================= */}

        <div
          className="
            flex
            gap-3
            border-t
            border-slate-100
            bg-slate-50/70
            px-6
            py-4
          "
        >
          {/* BATAL */}

          <button
            type="button"
            disabled={loading}
            onClick={onClose}
            className="
              h-11
              flex-1
              rounded-xl
              border
              border-slate-200
              bg-white
              text-sm
              font-semibold
              text-slate-600
              cursor-pointer
              transition-all
              duration-200
              hover:border-slate-300
              hover:bg-slate-50
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Batal
          </button>

          {/* HAPUS */}

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="
              flex
              h-11
              flex-1
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-red-500
              cursor-pointer
              text-sm
              font-semibold
              text-white
              shadow-[0_8px_20px_rgba(239,68,68,0.20)]
              transition-all
              duration-200
              hover:bg-red-600
              hover:shadow-[0_10px_25px_rgba(239,68,68,0.28)]
              active:scale-[0.98]
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading ? (
              <>
                <Loader2
                  size={16}
                  className="animate-spin"
                />

                <span>
                  Menghapus...
                </span>
              </>
            ) : (
              <>
                <Trash2 size={16} />

                <span>
                  Ya, Hapus
                </span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
