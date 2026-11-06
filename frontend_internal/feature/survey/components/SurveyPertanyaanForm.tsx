"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import {
  useCreateSurveyPertanyaan,
  useUpdateSurveyPertanyaan,
} from "../hooks/Survey.hooks";
import { SurveyPertanyaan } from "../types/Survey.type";
import FormTextarea from "@/components/ui/FormTextarea";
import FormInput from "@/components/ui/FormInput";
import FormSwitch from "@/components/ui/FormSwitch";

interface SurveyPertanyaanFormProps {
  mode: "create" | "edit";
  data?: SurveyPertanyaan | null;
  onSuccess?: () => void;
}

interface FormValues {
  pertanyaan: string;
  urutan: number;
  status: boolean;
}

export default function SurveyPertanyaanForm({
  mode,
  data,
  onSuccess,
}: SurveyPertanyaanFormProps) {
  const isEdit = mode === "edit";
  const createMutation = useCreateSurveyPertanyaan();
  const updateMutation = useUpdateSurveyPertanyaan();

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    defaultValues: {
      pertanyaan: "",
      urutan: 0,
      status: true,
    },
  });

  useEffect(() => {
    if (data) {
      reset({
        pertanyaan: data.pertanyaan || "",
        urutan: data.urutan ?? 0,
        status: data.status ?? true,
      });
    } else {
      reset({
        pertanyaan: "",
        urutan: 0,
        status: true,
      });
    }
  }, [data, reset]);

  const onSubmit = async (values: FormValues) => {
    if (!values.pertanyaan || !values.pertanyaan.trim()) {
      toast.error("Pertanyaan survey wajib diisi.");
      return;
    }

    try {
      if (isEdit && data?.survey_pertanyaan_id) {
        await updateMutation.mutateAsync({
          id: data.survey_pertanyaan_id,
          data: {
            pertanyaan: values.pertanyaan.trim(),
            urutan: Number(values.urutan) || 0,
            status: values.status,
          },
        });
      } else {
        await createMutation.mutateAsync({
          pertanyaan: values.pertanyaan.trim(),
          urutan: Number(values.urutan) || 0,
          status: values.status,
        });
      }

      onSuccess?.();
    } catch (err: any) {
      console.error("Gagal simpan pertanyaan survey:", err);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-5">
      {/* 1. Teks Pertanyaan */}
      <FormTextarea
        label="Pertanyaan Survey"
        required
        placeholder="Contoh: Bagaimana penilaian Anda terhadap kemudahan pencarian dokumen hukum pada website JDIH?"
        rows={4}
        {...register("pertanyaan", {
          required: "Pertanyaan survey wajib diisi",
        })}
        error={errors.pertanyaan?.message}
        disabled={isSubmitting}
      />

      {/* 2. Urutan Tampilan */}
      <FormInput
        type="number"
        label="Urutan Pertanyaan"
        placeholder="0"
        {...register("urutan", { valueAsNumber: true })}
        disabled={isSubmitting}
      />
      <p className="-mt-3 text-xs text-slate-400">
        *Semakin kecil angkanya, semakin awal pertanyaan ini muncul pada popup survey.
      </p>

      {/* 3. Status Aktif */}
      <FormSwitch
        name="status"
        control={control}
        label="Aktifkan Pertanyaan Ini"
        description="Pertanyaan yang aktif akan langsung muncul di modal popup survey pengunjung."
        disabled={isSubmitting}
      />

      {/* Tombol Simpan */}
      <div className="pt-2">
        <button
          type="button"
          disabled={isSubmitting}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleSubmit(onSubmit)();
          }}
          className="w-full rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-blue-500/25 transition hover:bg-blue-700 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
        >
          {isSubmitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              <span>Menyimpan...</span>
            </>
          ) : isEdit ? (
            "Simpan Perubahan"
          ) : (
            "Tambah Pertanyaan"
          )}
        </button>
      </div>
    </div>
  );
}
