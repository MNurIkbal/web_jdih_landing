"use client";

import { useEffect } from "react";

import {
  Form,
  useForm,
  type SubmitErrorHandler,
  type SubmitHandler,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  FileText,
  Upload,
  FileCheck,
  RotateCcw,
  Save,
  ChevronDown,
} from "lucide-react";

import FormInput from "@/components/ui/FormInput";

import { DokumenHukum } from "../types/DokumenHukum.type";

import {
  DokumenHukumFormValues,
  DokumenHukumSchema,
} from "../schema/DokumenHukum.schema";

import {
  useCreateDokumenHukum,
  useUpdateDokumenHukum,
} from "../hooks/DokumenHukum.hooks";
import FormSelect2 from "@/components/ui/FormSelect2";
import { bidangOptions, kategoriOptions, statusOptions, subjectOptions, tahunOptions, tipeDokumenOptions } from "@/constanta/GlobalConstanta";

interface DokumenHukumFormProps {
  mode: "create" | "edit";
  data?: DokumenHukum | null;
  onSuccess?: () => void;
}

export default function DokumenHukumForm({
  mode,
  data,
  onSuccess,
}: DokumenHukumFormProps) {
  const isEdit = mode === "edit";
  const formatDateInput = (value?: string | null) => {
    if (!value) return "";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return "";
    }

    return date.toISOString().split("T")[0];
  };

  const createDokumenHukum = useCreateDokumenHukum();

  const updateDokumenHukum = useUpdateDokumenHukum();


  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    control,
    formState: { errors },
  } = useForm<DokumenHukumFormValues>({
    resolver: zodResolver(DokumenHukumSchema) as any,

    defaultValues: {
      id: undefined,

      judul: "",
      kategori: "",
      nomor: "",
      tahun: "",
      bidang: "",
      tipe_dokumen: "",

      tempat_penetapan: "",
      tanggal_penetapan: "",
      tanggal_pengundangan: "",
      tanggal_berlaku: "",

      sumber: "",
      subject: "",

      status: "",

      file_abstrak: null,
      file_dokumen: null,
    },
  });

  const getDefaultValues = (): DokumenHukumFormValues => ({
    id: undefined,

    judul: "",
    kategori: "",
    nomor: "",
    tahun: "",
    bidang: "",
    tipe_dokumen: "",

    tempat_penetapan: "",
    tanggal_penetapan: "",
    tanggal_pengundangan: "",
    tanggal_berlaku: "",

    sumber: "",
    subject: "",

    status: "",

    file_abstrak: null,
    file_dokumen: null,
  });

  const getEditValues = (data: DokumenHukum): DokumenHukumFormValues => ({
    id: data.id !== undefined && data.id !== null ? Number(data.id) : undefined,

    judul: data.judul ?? "",

    kategori:
      data.kategori !== undefined && data.kategori !== null
        ? String(data.kategori)
        : "",

    nomor: data.nomor ?? "",
    tahun:
      data.tahun !== undefined && data.tahun !== null
        ? String(data.tahun)
        : "",
    bidang: data.bidang ?? "",

    tipe_dokumen:
      data.tipe_dokumen !== undefined && data.tipe_dokumen !== null
        ? String(data.tipe_dokumen)
        : "",

    tempat_penetapan: data.tempat_penetapan ?? "",

    tanggal_penetapan: formatDateInput(data.tanggal_penetapan) ?? "",

    tanggal_pengundangan: formatDateInput(data.tanggal_pengundangan) ?? "",

    tanggal_berlaku: formatDateInput(data.tanggal_berlaku) ?? "",

    sumber: data.sumber ?? "",

    subject: (data as any).subjek ?? "",

    status: data.status ?? "",

    file_abstrak: data.file_abstrak ?? null,

    file_dokumen: data.file_dokumen ?? null,
  });

  useEffect(() => {
    if (isEdit && data) {
      reset(getEditValues(data));
      return;
    }

    reset(getDefaultValues());
  }, [isEdit, data, reset]);

  const getErrorMessage = (error: any): string => {
    return (
      error?.response?.data?.message ??
      error?.data?.message ??
      error?.message ??
      "Terjadi kesalahan"
    );
  };

  const onSubmit: SubmitHandler<DokumenHukumFormValues> = (values) => {
    const formData = new FormData();

    formData.append("judul", values.judul.trim());

    formData.append("kategori", values.kategori);

    formData.append("nomor", values.nomor.trim());

    formData.append("tahun", String(values.tahun));

    formData.append("bidang", values.bidang);

    formData.append("tipe_dokumen", values.tipe_dokumen ?? "");

    formData.append("tempat_penetapan", values.tempat_penetapan?.trim() ?? "");
    formData.append("tanggal_penetapan", values.tanggal_penetapan);

    formData.append("tanggal_pengundangan", values.tanggal_pengundangan);

    formData.append("tanggal_berlaku", values.tanggal_berlaku);

    formData.append("sumber", values.sumber?.trim() ?? "");

    formData.append("subject", values.subject ?? "");

    formData.append("status", values.status);

    if (values.file_abstrak instanceof File) {
      formData.append("file_abstrak", values.file_abstrak);
    }

    if (values.file_dokumen instanceof File) {
      formData.append("file_dokumen", values.file_dokumen);
    }



    formData.forEach((value, key) => {

    });

    if (!isEdit) {
      createDokumenHukum.mutate(formData as any, {
        onSuccess: (response: any) => {
          toast.success(response?.message ?? "Dokumen hukum berhasil dibuat");

          reset(getDefaultValues());

          onSuccess?.();
        },

        onError: (error: any) => {
          const message = getErrorMessage(error);

          toast.error(message);


        },
      });

      return;
    }

    const dokumenId = Number(values.id);

    if (!Number.isInteger(dokumenId) || dokumenId <= 0) {
      toast.error("ID DokumenHukum tidak valid");

      return;
    }

    updateDokumenHukum.mutate(
      {
        id: dokumenId,
        data: formData,
      },
      {
        onSuccess: (response: any) => {
          toast.success(
            response?.message ?? "Dokumen hukum berhasil diperbarui",
          );

          onSuccess?.();
        },

        onError: (error: any) => {
          const message = getErrorMessage(error);

          toast.error(message);


        },
      },
    );
  };

  const onInvalid: SubmitErrorHandler<DokumenHukumFormValues> = (
    formErrors,
  ) => {


    const firstError = Object.values(formErrors)[0];

    if (firstError?.message) {
      toast.error(String(firstError.message));
    }
  };

  const submitForm = () => {
    handleSubmit(onSubmit, onInvalid)();
  };

  const resetForm = () => {
    if (isEdit && data) {
      reset(getEditValues(data));
      return;
    }

    reset(getDefaultValues());
  };
  const isSubmitting =
    createDokumenHukum.isPending || updateDokumenHukum.isPending;

  const fileAbstrak = watch("file_abstrak");

  const fileDokumen = watch("file_dokumen");

  const getFileName = (file: File | string | null | undefined) => {
    if (!file) {
      return "";
    }

    if (file instanceof File) {
      return file.name;
    }

    return file.split("/").pop() ?? file;
  };

  const FileUpload = ({
    name,
    label,
    value,
    error,
    required,
  }: {
    name: "file_abstrak" | "file_dokumen";

    label: string;

    value: File | string | null | undefined;

    error?: string;

    required?: boolean;
  }) => {
    return (
      <div className="space-y-2.5">
        <label
          className="
          block
          text-sm
          font-semibold
          text-slate-700
        "
        >
          {label}

          {required && <span className="ml-1 text-red-500">*</span>}
        </label>

        <label
          className={`
            group
            relative
            flex
            min-h-[155px]
            cursor-pointer
            flex-col
            items-center
            justify-center
            rounded-2xl
            border-2
            border-dashed
            px-5
            py-6
            text-center
            transition-all
            ${error
              ? `
                  border-red-300
                  bg-red-50/40
                `
              : `
                  border-slate-200
                  bg-slate-50/70
                  hover:border-blue-400
                  hover:bg-blue-50/40
                `
            }
            ${isSubmitting
              ? `
                  cursor-not-allowed
                  opacity-60
                `
              : ""
            }
          `}
        >
          <input
            type="file"
            accept="application/pdf,.pdf"
            disabled={isSubmitting}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;

              setValue(name, file, {
                shouldValidate: true,
                shouldDirty: true,
                shouldTouch: true,
              });
            }}
          />

          {value ? (
            <>
              <div
                className="
                mb-3
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                bg-blue-100
                text-blue-600
              "
              >
                <FileCheck size={24} />
              </div>

              <p
                className="
                max-w-full
                truncate
                px-4
                text-sm
                font-semibold
                text-slate-700
              "
              >
                {getFileName(value)}
              </p>

              <p
                className="
                mt-1
                text-xs
                font-medium
                text-emerald-600
              "
              >
                File PDF siap digunakan
              </p>

              <p
                className="
                mt-2
                text-xs
                text-slate-400
              "
              >
                Klik untuk mengganti file
              </p>
            </>
          ) : (
            <>
              <div
                className="
                mb-3
                flex
                h-12
                w-12
                items-center
                justify-center
                rounded-xl
                bg-slate-100
                text-slate-500
                transition
                group-hover:bg-blue-100
                group-hover:text-blue-600
              "
              >
                <Upload size={23} />
              </div>

              <p
                className="
                text-sm
                font-semibold
                text-slate-700
              "
              >
                Pilih file PDF
              </p>

              <p
                className="
                mt-1
                text-xs
                text-slate-400
              "
              >
                Klik untuk memilih file
              </p>
            </>
          )}
        </label>

        {error && (
          <p
            className="
            text-xs
            font-medium
            text-red-500
          "
          >
            {error}
          </p>
        )}

        <div
          className="
          flex
          items-center
          gap-1.5
          text-xs
          text-slate-400
        "
        >
          <FileText size={13} />

          <span>PDF • Maksimal 30 MB</span>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
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
        shadow-sm
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
          <FileText size={24} />
        </div>

        <div>
          <h2
            className="
            text-lg
            font-bold
            text-slate-800
          "
          >
            {isEdit ? "Edit Dokumen Hukum" : "Tambah Dokumen Hukum"}
          </h2>

          <p
            className="
            mt-0.5
            text-sm
            text-slate-500
          "
          >
            Lengkapi informasi dokumen hukum dan upload berkas PDF.
          </p>
        </div>
      </div>

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
        <div
          className="
          mb-6
          flex
          items-center
          gap-3
        "
        >
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
            <h3
              className="
              font-semibold
              text-slate-800
            "
            >
              Informasi Dokumen
            </h3>

            <p
              className="
              text-xs
              text-slate-400
            "
            >
              Informasi dasar dokumen hukum
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
          {/* JUDUL */}

          <div className="md:col-span-2">
            <FormInput
              type="text"
              label="Judul"
              required
              placeholder="Masukkan judul dokumen hukum"
              {...register("judul")}
              error={errors.judul?.message}
              disabled={isSubmitting}
            />
          </div>

          {/* KATEGORI */}

          <FormSelect2
            name="kategori"
            control={control}
            label="Kategori"
            required
            placeholder="Pilih kategori..."
            options={kategoriOptions}
            error={errors.kategori?.message}
            disabled={isSubmitting}
            isSearchable
            isClearable
          />

          <FormSelect2
            name="tipe_dokumen"
            control={control}
            label="Tipe Dokumen"
            placeholder="Pilih tipe dokumen..."
            options={tipeDokumenOptions}
            error={errors.tipe_dokumen?.message}
            disabled={isSubmitting}
            isSearchable
            isClearable
          />

          {/* NOMOR */}

          <FormInput
            type="text"
            label="Nomor"
            required
            placeholder="Masukkan nomor dokumen"
            {...register("nomor")}
            error={errors.nomor?.message}
            disabled={isSubmitting}
          />

          <FormSelect2
            name="tahun"
            control={control}
            label="Tahun"
            required
            placeholder="Pilih tahun..."
            options={tahunOptions}
            error={errors.tahun?.message}
            disabled={isSubmitting}
            isSearchable
            isClearable
          />

          <FormSelect2
            name="bidang"
            control={control}
            label="Bidang"
            required
            placeholder="Pilih bidang..."
            options={bidangOptions}
            error={errors.bidang?.message}
            disabled={isSubmitting}
            isSearchable
            isClearable
          />



          <FormInput
            type="text"
            label="Tempat Penetapan"
            required
            placeholder="Contoh Jakarta,Surabaya"
            {...register("tempat_penetapan")}
            error={errors.tempat_penetapan?.message}
            disabled={isSubmitting}
          />
        </div>
      </div>

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
        <div
          className="
          mb-6
          flex
          items-center
          gap-3
        "
        >
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
            02
          </div>

          <div>
            <h3
              className="
              font-semibold
              text-slate-800
            "
            >
              Detail Penetapan
            </h3>

            <p
              className="
              text-xs
              text-slate-400
            "
            >
              Informasi tanggal dan klasifikasi dokumen
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
          {/* TANGGAL PENETAPAN */}

          <FormInput
            type="date"
            label="Tanggal Penetapan"
            required
            {...register("tanggal_penetapan")}
            error={errors.tanggal_penetapan?.message}
            disabled={isSubmitting}
          />

          {/* TANGGAL PENGUNDANGAN */}

          <FormInput
            type="date"
            label="Tanggal Pengundangan"
            required
            {...register("tanggal_pengundangan")}
            error={errors.tanggal_pengundangan?.message}
            disabled={isSubmitting}
          />

          {/* TANGGAL BERLAKU */}

          <FormInput
            type="date"
            label="Tanggal Berlaku"
            required
            {...register("tanggal_berlaku")}
            error={errors.tanggal_berlaku?.message}
            disabled={isSubmitting}
          />

          {/* SUMBER */}

          <FormInput
            type="text"
            label="Sumber"
            required
            placeholder="Masukkan sumber"
            {...register("sumber")}
            error={errors.sumber?.message}
            disabled={isSubmitting}
          />


          <FormSelect2
            name="subject"
            control={control}
            label="Subject"
            required
            placeholder="Pilih subject..."
            options={subjectOptions}
            error={errors.subject?.message}
            disabled={isSubmitting}
            isSearchable
            isClearable
          />

          <FormSelect2
            name="status"
            control={control}
            label="Status"
            required
            placeholder="Pilih status..."
            options={statusOptions}
            error={errors.status?.message}
            disabled={isSubmitting}
            isSearchable
            isClearable
          />
        </div>
      </div>

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
        <div
          className="
          mb-6
          flex
          items-center
          gap-3
        "
        >
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
            03
          </div>

          <div>
            <h3
              className="
              font-semibold
              text-slate-800
            "
            >
              Berkas Dokumen
            </h3>

            <p
              className="
              text-xs
              text-slate-400
            "
            >
              Upload dokumen dalam format PDF
            </p>
          </div>
        </div>

        <div
          className="
          grid
          grid-cols-1
          gap-6
          md:grid-cols-2
        "
        >
          <FileUpload
            name="file_abstrak"
            label="File Abstrak"
            value={fileAbstrak}
            error={errors.file_abstrak?.message}
            required={!isEdit}
          />

          <FileUpload
            name="file_dokumen"
            label="File Dokumen"
            value={fileDokumen}
            error={errors.file_dokumen?.message}
            required={!isEdit}
          />
        </div>
      </div>

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

          {isSubmitting
            ? "Menyimpan..."
            : isEdit
              ? "Update Dokumen"
              : "Simpan Dokumen"}
        </button>
      </div>
    </div>
  );
}
