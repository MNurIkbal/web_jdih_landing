"use client";

import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Upload,
  X,
} from "lucide-react";

interface FormImageUploadProps {
  label?: string;
  required?: boolean;
  error?: string;

  value?: File | string | null;

  onChange: (
    file: File | null
  ) => void;

  accept?: string;
  maxSize?: number;
  disabled?: boolean;
}

export default function FormImageUpload({
  label,
  required = false,
  error,
  value,
  onChange,
  accept = "image/*",
  maxSize = 5,
  disabled = false,
}: FormImageUploadProps) {
  const inputRef =
    useRef<HTMLInputElement>(null);

  const [preview, setPreview] =
    useState<string | null>(null);

  const [fileError, setFileError] =
    useState("");

  // ============================================================
  // PREVIEW
  // ============================================================

  useEffect(() => {
    if (!value) {
      setPreview(null);
      return;
    }

    // Gambar lama dari backend
    if (typeof value === "string") {
      setPreview(value);
      return;
    }

    // File baru
    const objectUrl =
      URL.createObjectURL(value);

    setPreview(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [value]);

  // ============================================================
  // HANDLE FILE
  // ============================================================

  const handleFile = (
    file?: File
  ) => {
    if (!file) {
      return;
    }

    setFileError("");

    // Validasi type
    if (!file.type.startsWith("image/")) {
      setFileError(
        "File harus berupa gambar"
      );

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      return;
    }

    // Validasi size
    const maxBytes =
      maxSize * 1024 * 1024;

    if (file.size > maxBytes) {
      setFileError(
        `Ukuran gambar maksimal ${maxSize} MB`
      );

      if (inputRef.current) {
        inputRef.current.value = "";
      }

      return;
    }


    // Kirim File ke parent
    onChange(file);
  };

  // ============================================================
  // REMOVE
  // ============================================================

  const removeImage = () => {
    setFileError("");

    onChange(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }

    setPreview(null);
  };

  const displayError =
    error || fileError;

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="w-full space-y-1.5">

      {/* LABEL */}

      {label && (
        <label className="
          block
          text-sm
          font-medium
          text-slate-700
        ">
          {label}

          {required && (
            <span className="
              ml-1
              text-red-500
            ">
              *
            </span>
          )}
        </label>
      )}

      {/* UPLOAD AREA */}

      <div
        onClick={() => {
          if (!disabled) {
            inputRef.current?.click();
          }
        }}
        className={`
          relative
          flex
          min-h-[180px]
          w-full
          cursor-pointer
          items-center
          justify-center
          overflow-hidden
          rounded-xl
          border-2
          border-dashed
          bg-slate-50
          transition

          ${
            displayError
              ? "border-red-300"
              : "border-slate-200 hover:border-blue-400 hover:bg-blue-50/30"
          }

          ${
            disabled
              ? "cursor-not-allowed opacity-60"
              : ""
          }
        `}
      >

        {/* PREVIEW */}

        {preview ? (
          <>
            <img
              src={preview}
              alt="Preview gambar"
              className="
                h-full
                max-h-[250px]
                w-full
                object-contain
              "
            />

            {!disabled && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  removeImage();
                }}
                className="
                  absolute
                  right-3
                  top-3
                  flex
                  h-8
                  w-8
                  items-center
                  justify-center
                  rounded-full
                  bg-red-500
                  text-white
                  shadow
                  transition
                  hover:bg-red-600
                "
              >
                <X size={15} />
              </button>
            )}
          </>
        ) : (
          <div className="
            flex
            flex-col
            items-center
            justify-center
            gap-2
            text-center
          ">

            <div className="
              flex
              h-12
              w-12
              items-center
              justify-center
              rounded-full
              bg-blue-50
              text-blue-500
            ">
              <Upload size={20} />
            </div>

            <div>
              <p className="
                text-sm
                font-medium
                text-slate-600
              ">
                Klik untuk upload gambar
              </p>

              <p className="
                mt-1
                text-xs
                text-slate-400
              ">
                PNG, JPG, JPEG maksimal{" "}
                {maxSize} MB
              </p>
            </div>
          </div>
        )}

        {/* INPUT */}

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          disabled={disabled}
          className="hidden"
          onChange={(e) => {
            handleFile(
              e.target.files?.[0]
            );
          }}
        />

      </div>

      {/* ERROR */}

      {displayError && (
        <p className="
          text-xs
          font-medium
          text-red-500
        ">
          {displayError}
        </p>
      )}
    </div>
  );
}