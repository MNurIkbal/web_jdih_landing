"use client";

import { useEffect, useState } from "react";

import {
  useForm,
  type SubmitErrorHandler,
  type SubmitHandler,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import FormImageUpload from "@/components/ui/FormImageUpload";
import FormSwitch from "@/components/ui/FormSwitch";
import FormInput from "@/components/ui/FormInput";
import { Berita } from "../types/Berita.type";
import { useCreateBerita, useUpdateBerita } from "../hooks/Berita.hooks";
import { BeritaFormValues, BeritaSchema } from "../schema/Berita.schema";
import FormSelect2 from "@/components/ui/FormSelect2";
import { KATEGORI_BERITA } from "@/constanta/GlobalConstanta";
import CKEditorField from "@/components/ui/FormCKEditor";

interface BeritaFormProps {
  mode: "create" | "edit";
  data?: Berita | null;
  onSuccess?: () => void;
}

export default function BeritaForm({ mode, data, onSuccess }: BeritaFormProps) {
  const isEdit = mode === "edit";

  const createBerita = useCreateBerita();
  const updateBerita = useUpdateBerita();

  const [image, setImage] = useState<File | string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<BeritaFormValues>({
    resolver: zodResolver(BeritaSchema) as any,

    defaultValues: {
      berita_id: undefined,
      gambar: null,
      judul: "",
      kategori: "",
      tanggal_berita: "",
      penulis: "",
      isi_berita: "",
      status: true,
    },
  });

  useEffect(() => {
    if (isEdit && data) {
      const imageValue = data.gambar ?? null;

      reset({
        berita_id: data.berita_id,
        gambar: imageValue,
        judul: data.judul ?? "",
        kategori: data.kategori ?? "",
        tanggal_berita: formatDateInput(data.tanggal_berita) ?? "",
        penulis: data.penulis ?? "",
        isi_berita: data.isi_berita ?? "",
        status: data.status ?? true,
      });

      setImage(imageValue);

      return;
    }

    reset({
      berita_id: undefined,
      gambar: null,
      judul: "",
      kategori: "",
      tanggal_berita: "",
      penulis: "",
      isi_berita: "",
      status: true,
    });

    setImage(null);
  }, [isEdit, data, reset]);

  const handleImageChange = (file: File | null) => {
    setImage(file);

    setValue("gambar", file, {
      shouldValidate: true,
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const onSubmit: SubmitHandler<BeritaFormValues> = (values) => {
    const formData = new FormData();

    if (values.gambar instanceof File) {
      formData.append("gambar", values.gambar);
    }

    formData.append("judul", values.judul);

    formData.append("kategori", values.kategori);

    formData.append("tanggal_berita", values.tanggal_berita);

    formData.append("penulis", values.penulis);

    formData.append("isi_berita", values.isi_berita);

    formData.append("status", String(values.status));

    if (isEdit && values.berita_id !== undefined) {
      formData.append("berita_id", String(values.berita_id));
    }

    if (!isEdit) {
      createBerita.mutate(formData as any, {
        onSuccess: () => {
          reset({
            berita_id: undefined,
            gambar: null,
            judul: "",
            kategori: "",
            tanggal_berita: "",
            penulis: "",
            isi_berita: "",
            status: true,
          });

          setImage(null);

          onSuccess?.();
        },

        onError: (error) => {
          
        },
      });

      return;
    }

    if (!values.berita_id) {
      

      return;
    }

    updateBerita.mutate(
      {
        id: values.berita_id,
        data: formData,
      },
      {
        onSuccess: () => {
          onSuccess?.();
        },

        onError: (error) => {
          
        },
      },
    );
  };

  const onInvalid: SubmitErrorHandler<BeritaFormValues> = (formErrors) => {
    
  };

  const submitForm = () => {
    handleSubmit(onSubmit, onInvalid)();
  };

  const resetForm = () => {
    if (isEdit && data) {
      reset({
        berita_id: data.berita_id,
        gambar: data.gambar ?? null,
        judul: data.judul ?? "",
        kategori: data.kategori ?? "",
        tanggal_berita: data.tanggal_berita ?? "",
        penulis: data.penulis ?? "",
        isi_berita: data.isi_berita ?? "",
        status: data.status ?? true,
      });

      setImage(data.gambar ?? null);

      return;
    }

    reset({
      berita_id: undefined,
      gambar: null,
      judul: "",
      kategori: "",
      tanggal_berita: "",
      penulis: "",
      isi_berita: "",
      status: true,
    });

    setImage(null);
  };

  const isSubmitting = createBerita.isPending || updateBerita.isPending;
const formatDateInput = (value?: string | null) => {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().split("T")[0];
};
  return (
    <div className="space-y-5">
      <FormImageUpload
        label="Gambar Berita"
        required
        value={image}
        onChange={handleImageChange}
        error={errors.gambar?.message}
        maxSize={3}
        disabled={isSubmitting}
      />

      <FormInput
        type="text"
        label="Judul Berita"
        required
        placeholder="Masukkan judul berita"
        {...register("judul")}
        error={errors.judul?.message}
        disabled={isSubmitting}
      />

      <FormSelect2
        name="kategori"
        control={control}
        label="Kategori Berita"
        placeholder="Cari atau pilih kategori..."
        options={KATEGORI_BERITA}
        required
        disabled={isSubmitting}
        error={errors.kategori?.message}
      />
      <FormInput
        type="date"
        label="Tanggal Berita"
        required
        {...register("tanggal_berita")}
        error={errors.tanggal_berita?.message}
        disabled={isSubmitting}
      />

      <FormInput
        type="text"
        label="Penulis"
        required
        placeholder="Masukkan nama penulis"
        {...register("penulis")}
        error={errors.penulis?.message}
        disabled={isSubmitting}
      />

      <CKEditorField<BeritaFormValues>
        name="isi_berita"
        control={control}
        label="Isi Berita"
        required
        error={errors.isi_berita?.message}
      />

      <FormSwitch<BeritaFormValues>
        name="status"
        control={control}
        label="Status Berita"
        description="Aktifkan berita agar ditampilkan pada halaman utama."
        disabled={isSubmitting}
      />

      <div
        className="
          flex
          justify-end
          gap-3
          border-t
          border-slate-200
          pt-5
        "
      >
        <button
          type="button"
          disabled={isSubmitting}
          onClick={resetForm}
          className="
            cursor-pointer
            rounded-lg
            border
            border-slate-200
            bg-white
            px-5
            py-2.5
            text-sm
            font-medium
            text-slate-700
            transition
            hover:bg-slate-50
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          Reset
        </button>

        <button
          type="button"
          disabled={isSubmitting}
          onClick={submitForm}
          className="
            cursor-pointer
            rounded-lg
            bg-blue-600
            px-5
            py-2.5
            text-sm
            font-medium
            text-white
            transition
            hover:bg-blue-700
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          {isSubmitting ? "Menyimpan..." : isEdit ? "Update" : "Simpan"}
        </button>
      </div>
    </div>
  );
}
