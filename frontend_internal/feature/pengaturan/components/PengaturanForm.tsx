
"use client";

import { useEffect, useState } from "react";

import {
  useForm,
  type SubmitErrorHandler,
  type SubmitHandler,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { RotateCcw, Save, Settings } from "lucide-react";

import Toast from "@/components/ui/Toast";

import {
  PengaturanSchema,
  type PengaturanFormValues,
} from "../schema/Pengaturan.schema";

import {
  usePengaturanList,
  useUpdatePengaturan,
} from "../hooks/Pengaturan.hooks";

import FormInput from "@/components/ui/FormInput";
import CKEditorField from "@/components/ui/FormCKEditor";
import FormTextarea from "@/components/ui/FormTextarea";

export default function PengaturanForm() {
  // ============================================================
  // GET DATA
  // ============================================================

  const { data, isLoading, isError } = usePengaturanList();

  const result = (data as any)?.data;

  const updatePengaturan = useUpdatePengaturan();

  // ============================================================
  // TOAST
  // ============================================================

  const [toast, setToast] = useState({
    open: false,
    type: "success" as "success" | "error" | "info",
    title: "",
    message: "",
  });

  // ============================================================
  // FORM
  // ============================================================

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PengaturanFormValues>({
    resolver: zodResolver(PengaturanSchema) as any,

    defaultValues: {
      id: undefined,
      struktur_organisasi: "",
      tentang: "",
      sejarah: "",
      dasar_hukum: "",
      jdih_perwakilan: "",
      alamat: "",
      no_hp: "",
      email: "",
    },
  });

  // ============================================================
  // SET DATA KE FORM
  // ============================================================

  useEffect(() => {
    if (!result) {
      return;
    }

    reset({
      id:
        result.id !== undefined && result.id !== null
          ? Number(result.id)
          : undefined,

      struktur_organisasi: result.struktur_organisasi ?? "",
      tentang: result.tentang ?? "",
      sejarah: result.sejarah ?? "",
      dasar_hukum: result.dasar_hukum ?? "",
      jdih_perwakilan: result.jdih_perwakilan ?? "",
      alamat: result.alamat ?? "",
      no_hp: result.no_hp ?? "",
      email: result.email ?? "",
    });
  }, [result, reset]);

  // ============================================================
  // SUBMIT
  // ============================================================

  const onSubmit: SubmitHandler<PengaturanFormValues> = async (values) => {
    const id = Number(values.id);

    // ----------------------------------------------------------
    // VALIDASI ID
    // ----------------------------------------------------------

    if (!Number.isInteger(id) || id <= 0) {
      setToast({
        open: true,
        type: "error",
        title: "Gagal",
        message: "ID Pengaturan tidak valid.",
      });

      return;
    }

    // ----------------------------------------------------------
    // PAYLOAD
    // ----------------------------------------------------------

    const payload = {
      struktur_organisasi: values.struktur_organisasi?.trim() ?? "",
      tentang: values.tentang?.trim() ?? "",
      sejarah: values.sejarah?.trim() ?? "",
      dasar_hukum: values.dasar_hukum?.trim() ?? "",
      jdih_perwakilan: values.jdih_perwakilan?.trim() ?? "",
      alamat: values.alamat?.trim() ?? "",
      no_hp: values.no_hp?.trim() ?? "",
      email: values.email?.trim() ?? "",
    };

    // ----------------------------------------------------------
    // UPDATE
    // ----------------------------------------------------------

    updatePengaturan.mutate(
      {
        id,
        data: payload,
      },
      {
        // ======================================================
        // BERHASIL
        // ======================================================

        onSuccess: (response) => {

          // Tampilkan toast berhasil
          setToast({
            open: true,
            type: "success",
            title: "Berhasil",
            message: "Pengaturan berhasil diperbarui.",
          });

          // Update nilai form berdasarkan data terbaru
          reset({
            id,
            struktur_organisasi: payload.struktur_organisasi,
            tentang: payload.tentang,
            sejarah: payload.sejarah,
            dasar_hukum: payload.dasar_hukum,
            jdih_perwakilan: payload.jdih_perwakilan,
            alamat: payload.alamat,
            no_hp: payload.no_hp,
            email: payload.email,
          });
        },

        // ======================================================
        // GAGAL
        // ======================================================

        onError: (error: any) => {
          

          const message =
            error?.response?.data?.message ??
            error?.response?.data?.error ??
            error?.message ??
            "Gagal memperbarui data pengaturan.";

          setToast({
            open: true,
            type: "error",
            title: "Gagal",
            message,
          });
        },
      }
    );
  };

  // ============================================================
  // VALIDATION ERROR
  // ============================================================

  const onInvalid: SubmitErrorHandler<PengaturanFormValues> = (
    formErrors
  ) => {
    const firstError = Object.values(formErrors)[0];

    if (firstError?.message) {
      setToast({
        open: true,
        type: "error",
        title: "Validasi Gagal",
        message: String(firstError.message),
      });
    }
  };

  // ============================================================
  // SUBMIT BUTTON
  // ============================================================

  const submitForm = () => {
    handleSubmit(onSubmit, onInvalid)();
  };

  // ============================================================
  // RESET FORM
  // ============================================================

  const resetForm = () => {
    if (!result) {
      return;
    }

    reset({
      id:
        result.id !== undefined && result.id !== null
          ? Number(result.id)
          : undefined,

      struktur_organisasi: result.struktur_organisasi ?? "",
      tentang: result.tentang ?? "",
      sejarah: result.sejarah ?? "",
      dasar_hukum: result.dasar_hukum ?? "",
      jdih_perwakilan: result.jdih_perwakilan ?? "",
      alamat: result.alamat ?? "",
      no_hp: result.no_hp ?? "",
      email: result.email ?? "",
    });

    // Optional: tampilkan notifikasi reset
    setToast({
      open: true,
      type: "info",
      title: "Form Direset",
      message: "Perubahan form telah dikembalikan ke data sebelumnya.",
    });
  };

  const isSubmitting = updatePengaturan.isPending;

  // ============================================================
  // LOADING
  // ============================================================

  if (isLoading) {
    return (
      <div
        className="
          m-5
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-8
          text-center
          shadow-sm
        "
      >
        <Settings
          size={40}
          className="
            mx-auto
            mb-3
            animate-pulse
            text-blue-500
          "
        />

        <p
          className="
            text-sm
            font-medium
            text-slate-600
          "
        >
          Memuat data pengaturan...
        </p>
      </div>
    );
  }

  // ============================================================
  // ERROR
  // ============================================================

  if (isError) {
    return (
      <div
        className="
          m-5
          rounded-2xl
          border
          border-red-200
          bg-red-50
          p-8
          text-center
        "
      >
        <Settings
          size={40}
          className="
            mx-auto
            mb-3
            text-red-400
          "
        />

        <p
          className="
            text-sm
            font-medium
            text-red-600
          "
        >
          Gagal mengambil data pengaturan.
        </p>
      </div>
    );
  }

  // ============================================================
  // DATA KOSONG
  // ============================================================

  if (!data) {
    return (
      <div
        className="
          rounded-2xl
          border
          border-slate-200
          bg-white
          p-8
          text-center
          shadow-sm
        "
      >
        <Settings
          size={40}
          className="
            mx-auto
            mb-3
            text-slate-300
          "
        />

        <p
          className="
            text-sm
            font-medium
            text-slate-600
          "
        >
          Data pengaturan belum tersedia.
        </p>
      </div>
    );
  }

  // ============================================================
  // FORM
  // ============================================================

  return (
    <>
      <div className="m-5 space-y-6">

        {/* ======================================================
            HEADER
        ====================================================== */}

        <div
          className="
            flex
            items-center
            gap-4
            rounded-2xl
            border
            border-slate-200
            bg-gradient-to-r
            from-slate-50
            to-white
            p-5
          "
        >
          <div
            className="
              flex
              h-12
              w-12
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-blue-600
              text-white
              shadow-sm
            "
          >
            <Settings size={24} />
          </div>

          <div>
            <h2
              className="
                text-lg
                font-bold
                text-slate-800
              "
            >
              Pengaturan Website
            </h2>

            <p
              className="
                mt-0.5
                text-sm
                text-slate-500
              "
            >
              Kelola informasi organisasi, JDIH, dan informasi kontak.
            </p>
          </div>
        </div>

        {/* ======================================================
            01 - STRUKTUR ORGANISASI
        ====================================================== */}

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            sm:p-6
          "
        >
          <div className="mb-5 flex items-center gap-3">
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-blue-50
                text-sm
                font-bold
                text-blue-600
              "
            >
              01
            </div>

            <div>
              <h3 className="font-semibold text-slate-800">
                Informasi Organisasi
              </h3>

              <p className="text-xs text-slate-400">
                Informasi umum organisasi
              </p>
            </div>
          </div>

          <CKEditorField
            name="struktur_organisasi"
            control={control}
            label="Struktur Organisasi"
            required
            error={errors.struktur_organisasi?.message}
          />
        </div>

        {/* ======================================================
            02 - TENTANG JDIH
        ====================================================== */}

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            sm:p-6
          "
        >
          <div className="mb-5 flex items-center gap-3">
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-blue-50
                text-sm
                font-bold
                text-blue-600
              "
            >
              02
            </div>

            <div>
              <h3 className="font-semibold text-slate-800">
                Informasi Tentang JDIH
              </h3>

              <p className="text-xs text-slate-400">
                Informasi menu tentang JDIH
              </p>
            </div>
          </div>

          <CKEditorField
            name="tentang"
            control={control}
            label="Tentang JDIH"
            required
            placeholder="Masukkan data tentang"
            error={errors.tentang?.message}
          />
        </div>

        {/* ======================================================
            03 - SEJARAH
        ====================================================== */}

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            sm:p-6
          "
        >
          <div className="mb-5 flex items-center gap-3">
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-blue-50
                text-sm
                font-bold
                text-blue-600
              "
            >
              03
            </div>

            <div>
              <h3 className="font-semibold text-slate-800">
                Informasi Sejarah
              </h3>

              <p className="text-xs text-slate-400">
                Informasi menu sejarah
              </p>
            </div>
          </div>

          <CKEditorField
            name="sejarah"
            control={control}
            label="Sejarah"
            required
            placeholder="Masukkan data sejarah"
            error={errors.sejarah?.message}
          />
        </div>

        {/* ======================================================
            04 - DASAR HUKUM
        ====================================================== */}

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            sm:p-6
          "
        >
          <div className="mb-5 flex items-center gap-3">
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-indigo-50
                text-sm
                font-bold
                text-indigo-600
              "
            >
              04
            </div>

            <div>
              <h3 className="font-semibold text-slate-800">
                Informasi Hukum
              </h3>

              <p className="text-xs text-slate-400">
                Informasi menu dasar hukum
              </p>
            </div>
          </div>

          <CKEditorField
            name="dasar_hukum"
            control={control}
            label="Dasar Hukum"
            required
            placeholder="Masukkan data dasar hukum"
            error={errors.dasar_hukum?.message}
          />
        </div>

        {/* ======================================================
            05 - JDIH PERWAKILAN
        ====================================================== */}

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            sm:p-6
          "
        >
          <div className="mb-5 flex items-center gap-3">
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-indigo-50
                text-sm
                font-bold
                text-indigo-600
              "
            >
              05
            </div>

            <div>
              <h3 className="font-semibold text-slate-800">
                Informasi JDIH Perwakilan
              </h3>

              <p className="text-xs text-slate-400">
                Informasi menu JDIH perwakilan
              </p>
            </div>
          </div>

          <CKEditorField
            name="jdih_perwakilan"
            control={control}
            label="JDIH Perwakilan"
            required
            placeholder="Masukkan data JDIH perwakilan"
            error={errors.jdih_perwakilan?.message}
          />
        </div>

        {/* ======================================================
            06 - KONTAK
        ====================================================== */}

        <div
          className="
            rounded-2xl
            border
            border-slate-200
            bg-white
            p-5
            shadow-sm
            sm:p-6
          "
        >
          <div className="mb-5 flex items-center gap-3">
            <div
              className="
                flex
                h-9
                w-9
                items-center
                justify-center
                rounded-lg
                bg-emerald-50
                text-sm
                font-bold
                text-emerald-600
              "
            >
              06
            </div>

            <div>
              <h3 className="font-semibold text-slate-800">
                Informasi Kontak
              </h3>

              <p className="text-xs text-slate-400">
                Alamat dan informasi kontak
              </p>
            </div>
          </div>

          <div
            className="
              grid
              grid-cols-1
              gap-x-6
              gap-y-5
              md:grid-cols-2
            "
          >
            {/* ALAMAT */}

            <div className="md:col-span-2">
              <FormTextarea
                label="Alamat"
                required
                placeholder="Masukkan alamat"
                {...register("alamat")}
                error={errors.alamat?.message}
                disabled={isSubmitting}
              />
            </div>

            {/* NO HP */}

            <FormInput
              type="text"
              label="No. HP"
              required
              placeholder="Masukkan nomor HP"
              {...register("no_hp")}
              error={errors.no_hp?.message}
              disabled={isSubmitting}
            />

            {/* EMAIL */}

            <FormInput
              type="email"
              label="Email"
              required
              placeholder="Masukkan email"
              {...register("email")}
              error={errors.email?.message}
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* ======================================================
            ACTION
        ====================================================== */}

        <div
          className="
            flex
            flex-col-reverse
            gap-3
            border-t
            border-slate-200
            pt-5
            sm:flex-row
            sm:justify-end
          "
        >
          {/* RESET */}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={resetForm}
            className="
              inline-flex
              cursor-pointer
              items-center
              justify-center
              gap-2
              rounded-xl
              border
              border-slate-200
              bg-white
              px-5
              py-2.5
              text-sm
              font-semibold
              text-slate-600
              transition
              hover:bg-slate-50
              hover:text-slate-800
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <RotateCcw size={16} />
            Reset
          </button>

          {/* SAVE */}

          <button
            type="button"
            disabled={isSubmitting}
            onClick={submitForm}
            className="
              inline-flex
              cursor-pointer
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-blue-600
              px-6
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-blue-700
              hover:shadow
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            <Save size={16} />

            {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
          </button>
        </div>
      </div>

      {/* ========================================================
          TOAST NOTIFICATION
      ======================================================== */}

      <Toast
        open={toast.open}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() =>
          setToast((prev) => ({
            ...prev,
            open: false,
          }))
        }
      />
    </>
  );
}
