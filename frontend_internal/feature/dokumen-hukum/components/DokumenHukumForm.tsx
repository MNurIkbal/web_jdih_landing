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
  Eye,
  X,
  Trash2,
  ExternalLink,
} from "lucide-react";

import FormInput from "@/components/ui/FormInput";
import FormDatePicker from "@/components/ui/FormDatePicker";
import FormSelectSearch, { type SelectSearchOption } from "@/components/ui/FormSelectSearch";

import { DokumenHukum } from "../types/DokumenHukum.type";

import {
  DokumenHukumFormValues,
  DokumenHukumSchema,
} from "../schema/DokumenHukum.schema";

import {
  useCreateDokumenHukum,
  useMasterOptions,
  useUpdateDokumenHukum,
} from "../hooks/DokumenHukum.hooks";
import { useCreatePengajuan, useUpdatePengajuan } from "@/feature/pengajuan-peraturan/hooks/PengajuanPeraturan.hooks";
import { fetchMasterOptions } from "../api/DokumenHukum.service";
import { bidangOptions, kategoriOptions, statusOptions, subjectOptions, tahunOptions, tipeDokumenOptions } from "@/constanta/GlobalConstanta";

interface DokumenHukumFormProps {
  mode: "create" | "edit";
  data?: DokumenHukum | null;
  onSuccess?: () => void;
  targetApi?: "dokumen-hukum" | "pengajuan-peraturan";
}
import { useState } from 'react';


export default function DokumenHukumForm({
  mode,
  data,
  onSuccess,
  targetApi = "dokumen-hukum",
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
  const createPengajuan = useCreatePengajuan();
  const updateDokumenHukum = useUpdateDokumenHukum();
  const updatePengajuan = useUpdatePengajuan();

  // Dynamic API Master Options
  const { data: apiKategori } = useMasterOptions("kategori");
  const { data: apiTipeDokumen } = useMasterOptions("tipe_dokumen");
  const { data: apiBidang } = useMasterOptions("bidang");
  const { data: apiSubject } = useMasterOptions("subject");
  const { data: apiStatus } = useMasterOptions("status");
  const { data: apiTahun } = useMasterOptions("tahun");

  // State for preview PDF modal
  const [previewPdfUrl, setPreviewPdfUrl] = useState<string | null>(null);
  const [previewPdfTitle, setPreviewPdfTitle] = useState<string>("");

  useEffect(() => {
    return () => {
      if (previewPdfUrl) URL.revokeObjectURL(previewPdfUrl);
    };
  }, [previewPdfUrl]);

  const handleOpenPdfPreview = (file: File | string | null | undefined, title: string) => {
    if (!file) return;
    if (file instanceof File) {
      if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
        toast.info("Pratinjau langsung hanya tersedia untuk format PDF.");
        return;
      }
      const url = URL.createObjectURL(file);
      setPreviewPdfUrl(url);
      setPreviewPdfTitle(title);
    } else if (typeof file === "string") {
      const backendUrl = process.env.NEXT_PUBLIC_APP_BACKEND_URL || "http://localhost:8080";
      const fullUrl = file.startsWith("http") ? file : `${backendUrl}/uploads/dokumen-hukum/${file}`;
      setPreviewPdfUrl(fullUrl);
      setPreviewPdfTitle(title);
    }
  };


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
      pemrakarsa: "",
      penanggung_jawab: "",
      urgensi: "",
      dasar_hukum: "",
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
    pemrakarsa: "",
    penanggung_jawab: "",
    urgensi: "",
    dasar_hukum: "",
    subject: "",

    status: "",

    file_abstrak: null,
    file_dokumen: null,
  });

  const getEditValues = (data: DokumenHukum): DokumenHukumFormValues => {
    const rawData = data as any;
    let extractedUrgensi = rawData.urgensi ?? "";
    let extractedDasarHukum = rawData.dasar_hukum ?? "";
    let extractedSumber = data.sumber ?? rawData.sumber ?? "";

    // Parse ringkasan jika menyimpan format [URGENSI] ... [DASAR HUKUM] ... [SUMBER/CATATAN] ...
    if (rawData.ringkasan && (!extractedUrgensi || !extractedSumber)) {
      const ringkasanText = String(rawData.ringkasan);
      const matchUrgensi = ringkasanText.match(/\[URGENSI\]\s*([\s\S]*?)(?=\n\n\[DASAR HUKUM\]|$)/i);
      const matchDasar = ringkasanText.match(/\[DASAR HUKUM\]\s*([\s\S]*?)(?=\n\n\[SUMBER\/CATATAN\]|$)/i);
      const matchSumber = ringkasanText.match(/\[SUMBER\/CATATAN\]\s*([\s\S]*?)$/i);

      if (matchUrgensi && !extractedUrgensi) extractedUrgensi = matchUrgensi[1].trim();
      if (matchDasar && !extractedDasarHukum) extractedDasarHukum = matchDasar[1].trim();
      if (matchSumber && !extractedSumber) extractedSumber = matchSumber[1].trim();
      if (!matchUrgensi && !matchSumber && !extractedSumber) {
        extractedSumber = ringkasanText;
      }
    }

    return {
      id: data.id !== undefined && data.id !== null ? Number(data.id) : undefined,

      judul: data.judul ?? "",

      kategori:
        data.kategori !== undefined && data.kategori !== null
          ? String(data.kategori)
          : "",

      nomor: data.nomor ?? rawData.nomor_rancangan ?? "",
      tahun:
        data.tahun !== undefined && data.tahun !== null
          ? String(data.tahun)
          : "",
      bidang: data.bidang ?? rawData.bidang ?? "",

      tipe_dokumen:
        data.tipe_dokumen !== undefined && data.tipe_dokumen !== null
          ? String(data.tipe_dokumen)
          : rawData.tipe_dokumen ?? "",

      tempat_penetapan: data.tempat_penetapan ?? rawData.tempat_penetapan ?? rawData.pemrakarsa ?? "",

      tanggal_penetapan: formatDateInput(data.tanggal_penetapan || rawData.tanggal_pengajuan) ?? "",

      tanggal_pengundangan: formatDateInput(data.tanggal_pengundangan || rawData.tanggal_pengajuan) ?? "",

      tanggal_berlaku: formatDateInput(data.tanggal_berlaku || rawData.target_penetapan) ?? "",

      sumber: extractedSumber,
      pemrakarsa: rawData.pemrakarsa ?? "",
      penanggung_jawab: rawData.penanggung_jawab ?? "",
      urgensi: extractedUrgensi,
      dasar_hukum: extractedDasarHukum,

      subject: rawData.subject ?? rawData.subjek ?? "",

      status: rawData.status_dokumen ?? (rawData.status === "Berlaku" || rawData.status === "Tidak Berlaku" || rawData.status === "Dicabut" || rawData.status === "Diubah" ? rawData.status : "Berlaku"),

      file_abstrak: data.file_abstrak ?? rawData.file_naskah_akademik ?? null,

      file_dokumen: data.file_dokumen ?? rawData.file_draft ?? null,
    };
  };

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
      if (targetApi === "pengajuan-peraturan") {
        const pengajuanFormData = new FormData();
        pengajuanFormData.append("judul", values.judul.trim());
        pengajuanFormData.append("kategori", values.kategori);
        pengajuanFormData.append("bidang", values.bidang || "");
        pengajuanFormData.append("tipe_dokumen", values.tipe_dokumen || "");
        pengajuanFormData.append("status_dokumen", values.status || "Berlaku");
        pengajuanFormData.append("tempat_penetapan", values.tempat_penetapan?.trim() || "");
        pengajuanFormData.append("subject", values.subject?.trim() || "");
        pengajuanFormData.append("sumber", values.sumber?.trim() || "");
        pengajuanFormData.append("urgensi", values.urgensi?.trim() || "");
        pengajuanFormData.append("dasar_hukum", values.dasar_hukum?.trim() || "");
        pengajuanFormData.append("nomor_rancangan", values.nomor.trim());
        pengajuanFormData.append("tahun", String(values.tahun));
        pengajuanFormData.append("pemrakarsa", values.pemrakarsa?.trim() || values.tempat_penetapan?.trim() || "Biro Hukum");
        pengajuanFormData.append("penanggung_jawab", values.penanggung_jawab?.trim() || "Biro Hukum");
        pengajuanFormData.append("tanggal_pengajuan", values.tanggal_pengundangan || values.tanggal_penetapan || new Date().toISOString().split("T")[0]);
        pengajuanFormData.append("target_penetapan", values.tanggal_berlaku || values.tanggal_penetapan || new Date().toISOString().split("T")[0]);
        pengajuanFormData.append(
          "ringkasan",
          values.urgensi?.trim()
            ? `[URGENSI]\n${values.urgensi.trim()}\n\n[DASAR HUKUM]\n${values.dasar_hukum?.trim() || "-"}\n\n[SUMBER/CATATAN]\n${values.sumber?.trim() || "-"}`
            : values.sumber?.trim() || values.judul.trim()
        );

        if (values.file_dokumen instanceof File) {
          pengajuanFormData.append("file_draft", values.file_dokumen);
          pengajuanFormData.append("file_dokumen", values.file_dokumen);
        }
        if (values.file_abstrak instanceof File) {
          pengajuanFormData.append("file_naskah_akademik", values.file_abstrak);
          pengajuanFormData.append("file_abstrak", values.file_abstrak);
        }

        createPengajuan.mutate(pengajuanFormData, {
          onSuccess: (response: any) => {
            toast.success(response?.message ?? "Pengajuan peraturan berhasil disimpan");
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
      toast.error("ID Dokumen / Pengajuan tidak valid");
      return;
    }

    if (targetApi === "pengajuan-peraturan") {
      const pengajuanFormData = new FormData();
      pengajuanFormData.append("judul", values.judul.trim());
      pengajuanFormData.append("kategori", values.kategori);
      pengajuanFormData.append("bidang", values.bidang || "");
      pengajuanFormData.append("tipe_dokumen", values.tipe_dokumen || "");
      pengajuanFormData.append("status_dokumen", values.status || "Berlaku");
      pengajuanFormData.append("tempat_penetapan", values.tempat_penetapan?.trim() || "");
      pengajuanFormData.append("subject", values.subject?.trim() || "");
      pengajuanFormData.append("sumber", values.sumber?.trim() || "");
      pengajuanFormData.append("urgensi", values.urgensi?.trim() || "");
      pengajuanFormData.append("dasar_hukum", values.dasar_hukum?.trim() || "");
      pengajuanFormData.append("nomor_rancangan", values.nomor.trim());
      pengajuanFormData.append("tahun", String(values.tahun));
      pengajuanFormData.append("pemrakarsa", values.pemrakarsa?.trim() || values.tempat_penetapan?.trim() || "Biro Hukum");
      pengajuanFormData.append("penanggung_jawab", values.penanggung_jawab?.trim() || "Biro Hukum");
      pengajuanFormData.append("tanggal_pengajuan", values.tanggal_pengundangan || values.tanggal_penetapan || new Date().toISOString().split("T")[0]);
      pengajuanFormData.append("target_penetapan", values.tanggal_berlaku || values.tanggal_penetapan || new Date().toISOString().split("T")[0]);
      pengajuanFormData.append(
        "ringkasan",
        values.urgensi?.trim()
          ? `[URGENSI]\n${values.urgensi.trim()}\n\n[DASAR HUKUM]\n${values.dasar_hukum?.trim() || "-"}\n\n[SUMBER/CATATAN]\n${values.sumber?.trim() || "-"}`
          : values.sumber?.trim() || values.judul.trim()
      );

      if (values.file_dokumen instanceof File) {
        pengajuanFormData.append("file_draft", values.file_dokumen);
        pengajuanFormData.append("file_dokumen", values.file_dokumen);
      }
      if (values.file_abstrak instanceof File) {
        pengajuanFormData.append("file_naskah_akademik", values.file_abstrak);
        pengajuanFormData.append("file_abstrak", values.file_abstrak);
      }

      updatePengajuan.mutate(
        { id: dokumenId, formData: pengajuanFormData },
        {
          onSuccess: (response: any) => {
            toast.success(response?.message ?? "Pengajuan peraturan berhasil diperbarui");
            onSuccess?.();
          },
          onError: (error: any) => {
            const message = getErrorMessage(error);
            toast.error(message);
          },
        }
      );
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

              {/* Action buttons preview & delete */}
              <div className="mt-3 flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleOpenPdfPreview(value, `Pratinjau: ${getFileName(value)}`);
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
                >
                  <Eye size={13} />
                  <span>Pratinjau PDF</span>
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setValue(name, null, {
                      shouldValidate: true,
                      shouldDirty: true,
                      shouldTouch: true,
                    });
                  }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-rose-700 transition cursor-pointer"
                >
                  <Trash2 size={13} />
                  <span>Hapus</span>
                </button>
              </div>
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
          <FormSelectSearch
            label="Kategori"
            required
            value={watch("kategori")}
            onChange={(val) => {
              setValue("kategori", val, { shouldValidate: true, shouldDirty: true });
            }}
            options={apiKategori && apiKategori.length > 0 ? apiKategori : kategoriOptions.filter((o) => o.value).map((o) => ({ value: o.value, label: o.label }))}
            onSearchApi={(q) => fetchMasterOptions("kategori", q)}
            placeholder="Pilih kategori..."
            searchPlaceholder="Cari kategori..."
            error={errors.kategori?.message}
            disabled={isSubmitting}
          />

          {/* TIPE DOKUMEN */}
          <FormSelectSearch
            label="Tipe Dokumen"
            value={watch("tipe_dokumen") || ""}
            onChange={(val) => {
              setValue("tipe_dokumen", val, { shouldValidate: true, shouldDirty: true });
            }}
            options={apiTipeDokumen && apiTipeDokumen.length > 0 ? apiTipeDokumen : tipeDokumenOptions.filter((o) => o.value).map((o) => ({ value: o.value, label: o.label }))}
            onSearchApi={(q) => fetchMasterOptions("tipe_dokumen", q)}
            placeholder="Pilih tipe dokumen..."
            searchPlaceholder="Cari tipe dokumen..."
            error={errors.tipe_dokumen?.message}
            disabled={isSubmitting}
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

          {/* TAHUN */}
          <FormSelectSearch
            label="Tahun"
            required
            value={watch("tahun") ? String(watch("tahun")) : ""}
            onChange={(val) => {
              setValue("tahun", val, { shouldValidate: true, shouldDirty: true });
            }}
            options={apiTahun && apiTahun.length > 0 ? apiTahun : tahunOptions.filter((o) => o.value).map((o) => ({ value: o.value, label: o.label }))}
            onSearchApi={(q) => fetchMasterOptions("tahun", q)}
            placeholder="Pilih tahun..."
            searchPlaceholder="Cari tahun..."
            error={errors.tahun?.message}
            disabled={isSubmitting}
          />

          {/* BIDANG */}
          <FormSelectSearch
            label="Bidang"
            required
            value={watch("bidang")}
            onChange={(val) => {
              setValue("bidang", val, { shouldValidate: true, shouldDirty: true });
            }}
            options={apiBidang && apiBidang.length > 0 ? apiBidang : bidangOptions.filter((o) => o.value).map((o) => ({ value: o.value, label: o.label }))}
            onSearchApi={(q) => fetchMasterOptions("bidang", q)}
            placeholder="Pilih bidang..."
            searchPlaceholder="Cari bidang..."
            error={errors.bidang?.message}
            disabled={isSubmitting}
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

          {targetApi === "pengajuan-peraturan" && (
            <>
              <FormInput
                type="text"
                label="Unit Kerja / Eselon Pemrakarsa"
                placeholder="Contoh: Direktorat Regulasi / Biro Hukum"
                {...register("pemrakarsa")}
                error={errors.pemrakarsa?.message}
                disabled={isSubmitting}
              />

              <FormInput
                type="text"
                label="Penanggung Jawab Substansi"
                placeholder="Contoh: Tim Pokja Regulasi / Nama Pejabat Terkait"
                {...register("penanggung_jawab")}
                error={errors.penanggung_jawab?.message}
                disabled={isSubmitting}
              />

              <div className="md:col-span-2">
                <FormInput
                  type="text"
                  label="Dasar Kewenangan Pembentukan Peraturan"
                  placeholder="Contoh: UU No. 12 Tahun 2011, Permen/Keputusan Mandat..."
                  {...register("dasar_hukum")}
                  error={errors.dasar_hukum?.message}
                  disabled={isSubmitting}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                  Urgensi & Latar Belakang Perumusan Regulasi
                </label>
                <textarea
                  rows={3}
                  placeholder="Uraikan urgensi kebutuhan pembentukan peraturan, isu strategis, dan dampak regulasi..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none placeholder:text-slate-400"
                  {...register("urgensi")}
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}
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
          <FormDatePicker
            label="Tanggal Penetapan"
            required
            value={watch("tanggal_penetapan")}
            onChange={(d) => {
              setValue("tanggal_penetapan", d, { shouldValidate: true, shouldDirty: true });
            }}
            error={errors.tanggal_penetapan?.message}
            disabled={isSubmitting}
            placeholder="Pilih tanggal penetapan..."
          />

          {/* TANGGAL PENGUNDANGAN */}
          <FormDatePicker
            label="Tanggal Pengundangan"
            required
            value={watch("tanggal_pengundangan")}
            onChange={(d) => {
              setValue("tanggal_pengundangan", d, { shouldValidate: true, shouldDirty: true });
            }}
            error={errors.tanggal_pengundangan?.message}
            disabled={isSubmitting}
            placeholder="Pilih tanggal pengundangan..."
          />

          {/* TANGGAL BERLAKU */}
          <FormDatePicker
            label="Tanggal Berlaku"
            required
            value={watch("tanggal_berlaku")}
            onChange={(d) => {
              setValue("tanggal_berlaku", d, { shouldValidate: true, shouldDirty: true });
            }}
            error={errors.tanggal_berlaku?.message}
            disabled={isSubmitting}
            placeholder="Pilih tanggal berlaku..."
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

          {/* SUBJECT */}
          <FormSelectSearch
            label="Subject"
            required
            value={watch("subject")}
            onChange={(val) => {
              setValue("subject", val, { shouldValidate: true, shouldDirty: true });
            }}
            options={apiSubject && apiSubject.length > 0 ? apiSubject : subjectOptions.filter((o) => o.value).map((o) => ({ value: o.value, label: o.label }))}
            onSearchApi={(q) => fetchMasterOptions("subject", q)}
            placeholder="Pilih subject..."
            searchPlaceholder="Cari subject..."
            error={errors.subject?.message}
            disabled={isSubmitting}
          />

          {/* STATUS */}
          <FormSelectSearch
            label="Status Dokumen"
            required
            value={watch("status")}
            onChange={(val) => {
              setValue("status", val, { shouldValidate: true, shouldDirty: true });
            }}
            options={(apiStatus && apiStatus.length > 0 ? apiStatus : statusOptions)
              .filter((o) => o.value && o.value.toLowerCase() !== "draft")
              .map((o) => ({ value: o.value, label: o.label }))}
            onSearchApi={(q) => fetchMasterOptions("status", q)}
            placeholder="Pilih status..."
            searchPlaceholder="Cari status..."
            error={errors.status?.message}
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
            label="File Dokumen Peraturan"
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

      {/* Modal Preview PDF Instan */}
      {previewPdfUrl && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 sm:p-6 lg:p-10 animate-in fade-in duration-200">
          <div className="flex flex-col h-full w-full max-w-5xl rounded-3xl bg-white shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-6 py-4">
              <div className="flex items-center gap-2.5">
                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600 text-white">
                  <FileText size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900 truncate max-w-lg">
                    {previewPdfTitle}
                  </h4>
                  <p className="text-[11px] text-slate-500">Pratinjau berkas dokumen PDF</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewPdfUrl(null)}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 w-full bg-slate-100">
              <iframe
                src={previewPdfUrl}
                className="w-full h-full border-none"
                title="Preview PDF"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
