"use client";

import { useEffect, useState } from "react";
import { useForm, type SubmitHandler, type SubmitErrorHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { GaleriSchema, type GaleriFormValues } from "../schema/Galeri.schema";
import { useCreateGaleri, useUpdateGaleri } from "../hooks/Galeri.hooks";
import { Galeri } from "../types/Galeri.type";
import FormImageUpload from "@/components/ui/FormImageUpload";
import FormInput from "@/components/ui/FormInput";
import FormTextarea from "@/components/ui/FormTextarea";
import FormSwitch from "@/components/ui/FormSwitch";

interface GaleriFormProps {
  mode: "create" | "edit";
  data?: Galeri | null;
  onSuccess?: () => void;
}

export default function GaleriForm({ mode, data, onSuccess }: GaleriFormProps) {
  const isEdit = mode === "edit";
  const createGaleri = useCreateGaleri();
  const updateGaleri = useUpdateGaleri();

  const [image, setImage] = useState<File | string | null>(null);

  const {
    control,
    reset,
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<GaleriFormValues>({
    resolver: zodResolver(GaleriSchema) as any,
    defaultValues: {
      galeri_id: undefined,
      media: null,
      judul: "",
      keterangan: "",
      status: true,
    },
  });

  useEffect(() => {
    if (data) {
      const mediaValue = data.media_full_url || data.media_url || null;
      reset({
        galeri_id: data.galeri_id,
        media: mediaValue,
        judul: data.judul || "",
        keterangan: data.keterangan || "",
        status: data.status ?? true,
      });
      setImage(mediaValue);
    } else {
      reset({
        galeri_id: undefined,
        media: null,
        judul: "",
        keterangan: "",
        status: true,
      });
      setImage(null);
    }
  }, [data, reset]);

  const handleImageChange = (file: File | null) => {
    setImage(file);
    setValue("media", file, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const onSubmit: SubmitHandler<GaleriFormValues> = async (values) => {
    const formData = new FormData();
    formData.append("judul", values.judul.trim());
    formData.append("keterangan", values.keterangan ? values.keterangan.trim() : "");
    formData.append("status", String(values.status ?? true));

    if (values.media instanceof File) {
      formData.append("media", values.media);
    }

    try {
      if (isEdit && data?.galeri_id) {
        await updateGaleri.mutateAsync({
          id: data.galeri_id,
          data: formData,
        });
      } else {
        await createGaleri.mutateAsync(formData);
      }

      onSuccess?.();
    } catch (err: any) {
      console.error("Gagal simpan galeri:", err);
    }
  };

  const onInvalid: SubmitErrorHandler<GaleriFormValues> = (formErrors) => {
    const firstErrorMessage =
      formErrors.media?.message ||
      formErrors.judul?.message ||
      formErrors.keterangan?.message;
    if (firstErrorMessage) {
      toast.error(String(firstErrorMessage));
    }
  };

  const isSubmitting = createGaleri.isPending || updateGaleri.isPending;

  return (
    <div className="space-y-5">
      {/* 1. Upload Gambar (Wajib Diisi & Maksimal 5 MB) */}
      <div>
        <FormImageUpload
          label="Foto Dokumentasi (Maks. 5 MB)"
          required={true}
          value={image}
          onChange={handleImageChange}
          error={errors.media?.message as string | undefined}
          maxSize={5}
          disabled={isSubmitting}
        />
        <p className="mt-1.5 text-xs text-slate-400">
          *Foto wajib diunggah dengan format JPG, JPEG, PNG, atau WEBP (Maksimal 5 MB).
        </p>
      </div>

      {/* 2. Judul Foto (Wajib) */}
      <FormInput
        type="text"
        label="Judul Foto"
        required
        placeholder="Contoh: Rapat Koordinasi Regulasi Hukum..."
        {...register("judul")}
        error={errors.judul?.message}
        disabled={isSubmitting}
      />

      {/* 3. Keterangan (Opsional) */}
      <FormTextarea
        label="Keterangan (Opsional)"
        placeholder="Tuliskan keterangan detail dokumentasi ini..."
        rows={3}
        {...register("keterangan")}
        error={errors.keterangan?.message}
        disabled={isSubmitting}
      />

      {/* 4. Tampilkan di Galeri Publik Switch (Opsional) */}
      <FormSwitch
        name="status"
        control={control}
        label="Tampilkan di Galeri Publik (Opsional)"
        description="Bisa diaktifkan sekarang atau dinonaktifkan sebagai draft."
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
            handleSubmit(onSubmit, onInvalid)();
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
            "Upload ke Galeri"
          )}
        </button>
      </div>
    </div>
  );
}
