"use client";

import { useEffect, useState } from "react";

import {
  useForm,
  type SubmitHandler,
  type SubmitErrorHandler,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { SliderSchema, type SliderFormValues } from "../schema/Slider.schema";

import { useCreateSlider, useUpdateSlider } from "../hooks/Slider.hooks";

import FormImageUpload from "@/components/ui/FormImageUpload";
import FormTextarea from "@/components/ui/FormTextarea";
import FormSwitch from "@/components/ui/FormSwitch";
import FormInput from "@/components/ui/FormInput";

export interface SliderFormData {
  slider_id?: number;
  gambar?: string | File | null;
  judul?: string | null;
  keterangan?: string | null;
  status?: boolean | null;
}

interface SliderFormProps {
  mode: "create" | "edit";
  data?: SliderFormData | null;
  onSuccess?: () => void;
}

export default function SliderForm({ mode, data, onSuccess }: SliderFormProps) {
  const isEdit = mode === "edit";

  const createSlider = useCreateSlider();
  const updateSlider = useUpdateSlider();

  const [image, setImage] = useState<File | string | null>(null);

  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<SliderFormValues>({
    resolver: zodResolver(SliderSchema) as any,

    defaultValues: {
      slider_id: undefined,
      gambar: null,
      judul: "",
      keterangan: "",
      status: true,
    },
  });
useEffect(() => {

  if (isEdit && data) {

    const imageValue = data.gambar ?? null;

    reset({
      slider_id: data.slider_id as any,
      gambar: imageValue,
      judul: data.judul ?? "",
      keterangan: data.keterangan ?? "",
      status: data.status ?? true,
    });

    setImage(imageValue);

    return;
  }

  reset({
    slider_id: undefined,
    gambar: null,
    judul: "",
    keterangan: "",
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

  const onSubmit: SubmitHandler<SliderFormValues> = (values) => {

    const formData = new FormData();

    // Gambar
    if (values.gambar instanceof File) {
      formData.append("gambar", values.gambar);
    }

    // Judul
    formData.append("judul", values.judul ?? "");

    // Keterangan
    formData.append("keterangan", values.keterangan ?? "");

    // Status
    formData.append("status", String(values.status ?? false));

    // ID untuk edit
    if (isEdit && values.slider_id !== undefined) {
      formData.append("id", String(values.slider_id));
    }
    
    // DEBUG
  
    for (const [key, value] of formData.entries()) {
      
    }

    // CREATE
    if (!isEdit) {
      createSlider.mutate(formData as any, {
        onSuccess: () => {
          reset({
            slider_id: undefined,
            gambar: null,
            judul: "",
            keterangan: "",
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

    // UPDATE
    
    if (!values.slider_id) {
      

      return;
    }

    updateSlider.mutate(
      {
        id: values.slider_id,
        data: formData,
      } as any,
      {
        onSuccess: () => {
          onSuccess?.();
        },

        onError: (error) => {
          
        },
      },
    );
  };
  const onInvalid: SubmitErrorHandler<SliderFormValues> = (formErrors) => {
    
  };

  const submitForm = () => {
    handleSubmit(onSubmit, onInvalid)();
  };

  const isSubmitting = createSlider.isPending || updateSlider.isPending;
  return (
    <div className="space-y-5">
      <FormImageUpload
        label="Gambar Slider"
        required
        value={image}
        onChange={handleImageChange}
        error={errors.gambar?.message}
        maxSize={3}
        disabled={isSubmitting}
      />

      <FormInput
        type="text"
        label="Judul Slider"
        required
        placeholder="Masukkan judul slider"
        {...register("judul")}
        error={errors.judul?.message}
        disabled={isSubmitting}
      />

      <FormTextarea
        label="Keterangan"
        required
        placeholder="Masukkan keterangan slider"
        {...register("keterangan")}
        error={errors.keterangan?.message}
        disabled={isSubmitting}
      />

      <FormSwitch<SliderFormValues>
        name="status"
        control={control}
        label="Status Slider"
        description="Aktifkan slider agar ditampilkan pada halaman utama."
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
          onClick={() => {
            if (isEdit && data) {
              reset({
                slider_id: data.slider_id,
                gambar: data.gambar ?? null,
                judul: data.judul ?? "",
                keterangan: data.keterangan ?? "",
                status: data.status ?? true,
              });

              setImage(data.gambar ?? null);

              return;
            }

            reset({
              slider_id: undefined,
              gambar: null,
              judul: "",
              keterangan: "",
              status: true,
            });

            setImage(null);
          }}
          className="
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
            cursor-pointer
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
            rounded-lg
            bg-blue-600
            px-5
            py-2.5
            text-sm
            font-medium
            text-white
            transition
            cursor-pointer
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
