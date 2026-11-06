"use client";

import { useEffect, useState } from "react";

import {
  useForm,
  type SubmitErrorHandler,
  type SubmitHandler,
} from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import FormImageUpload from "@/components/ui/FormImageUpload";
import FormInput from "@/components/ui/FormInput";

import { Pengguna } from "../types/Pengguna.type";

import {
  PenggunaFormValues,
  PenggunaSchema,
} from "../schema/Pengguna.schema";

import {
  useCreatePengguna,
  useUpdatePengguna,
} from "../hooks/Pengguna.hooks";

interface PenggunaFormProps {
  mode: "create" | "edit";
  data?: Pengguna | null;
  onSuccess?: () => void;
}

export default function PenggunaForm({
  mode,
  data,
  onSuccess,
}: PenggunaFormProps) {
  const isEdit = mode === "edit";

  const createPengguna =
    useCreatePengguna();

  const updatePengguna =
    useUpdatePengguna();

  const [image, setImage] =
    useState<File | string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<PenggunaFormValues>({
    resolver: zodResolver(
      PenggunaSchema(isEdit)
    ) as any,

    defaultValues: {
      id: undefined,
      nama: "",
      email: "",
      password: "",
      foto: null,
    },
  });

  useEffect(() => {
    if (isEdit && data) {
      const fotoValue =
        data.foto ?? null;

      reset({
        id:
          data.id !== undefined &&
          data.id !== null
            ? Number(data.id)
            : undefined,

        nama:
          data.nama ?? "",

        email:
          data.email ?? "",

        password: "",

        foto:
          fotoValue,
      });

      setImage(fotoValue);

      return;
    }

    reset({
      id: undefined,
      nama: "",
      email: "",
      password: "",
      foto: null,
    });

    setImage(null);
  }, [
    isEdit,
    data,
    reset,
  ]);

  const handleImageChange = (
    file: File | null
  ) => {
    setImage(file);

    setValue(
      "foto",
      file,
      {
        shouldValidate: true,
        shouldDirty: true,
        shouldTouch: true,
      }
    );
  };

  const getErrorMessage = (
    error: any
  ): string => {
    return (
      error?.response?.data?.message ??
      error?.data?.message ??
      error?.message ??
      "Terjadi kesalahan"
    );
  };

  const onSubmit: SubmitHandler<
    PenggunaFormValues
  > = (values) => {
    const formData =
      new FormData();

    /*
     * ================================
     * DATA YANG DIKIRIM
     * ================================
     */

    formData.append(
      "nama",
      values.nama.trim()
    );

    formData.append(
      "email",
      values.email.trim()
    );

    /*
     * Password hanya CREATE
     */
    if (
      !isEdit &&
      values.password
    ) {
      formData.append(
        "password",
        values.password
      );
    }

    /*
     * Foto hanya dikirim
     * jika memilih file baru
     */
    if (
      values.foto instanceof File
    ) {
      formData.append(
        "foto",
        values.foto
      );
    }
    formData.forEach(
      (value, key) => {
        
      }
    );

    /*
     * ================================
     * CREATE
     * ================================
     */

    if (!isEdit) {
      createPengguna.mutate(
        formData as any,
        {
          onSuccess: (
            response: any
          ) => {
            toast.success(
              response?.message ??
                "User berhasil dibuat"
            );

            reset({
              id: undefined,
              nama: "",
              email: "",
              password: "",
              foto: null,
            });

            setImage(null);

            onSuccess?.();
          },

          onError: (
            error: any
          ) => {
            const message =
              getErrorMessage(
                error
              );

            toast.error(
              message
            );

          },
        }
      );

      return;
    }

    /*
     * ================================
     * EDIT
     * ================================
     */

    const userId =
      Number(values.id);

    if (
      !Number.isInteger(
        userId
      ) ||
      userId <= 0
    ) {
      toast.error(
        "ID Pengguna tidak valid"
      );

      return;
    }

    updatePengguna.mutate(
      {
        id: userId,
        data: formData,
      },
      {
        onSuccess: (
          response: any
        ) => {
          toast.success(
            response?.message ??
              "User berhasil diperbarui"
          );

          onSuccess?.();
        },

        onError: (
          error: any
        ) => {
          const message =
            getErrorMessage(
              error
            );

          toast.error(
            message
          );

        },
      }
    );
  };

  const onInvalid: SubmitErrorHandler<
    PenggunaFormValues
  > = (formErrors) => {
    

    const firstError =
      Object.values(
        formErrors
      )[0];

    if (
      firstError?.message
    ) {
      toast.error(
        String(
          firstError.message
        )
      );
    }
  };

  const submitForm = () => {
    handleSubmit(
      onSubmit,
      onInvalid
    )();
  };

  const resetForm = () => {
    if (
      isEdit &&
      data
    ) {
      const fotoValue =
        data.foto ?? null;

      reset({
        id:
          data.id !== undefined &&
          data.id !== null
            ? Number(data.id)
            : undefined,

        nama:
          data.nama ?? "",

        email:
          data.email ?? "",

        password: "",

        foto:
          fotoValue,
      });

      setImage(
        fotoValue
      );

      return;
    }

    reset({
      id: undefined,
      nama: "",
      email: "",
      password: "",
      foto: null,
    });

    setImage(null);
  };

  const isSubmitting =
    createPengguna.isPending ||
    updatePengguna.isPending;

  return (
    <div className="space-y-5">

      <FormImageUpload
        label="Foto Pengguna"
        required={!isEdit}
        value={image}
        onChange={
          handleImageChange
        }
        error={
          errors.foto?.message
        }
        maxSize={3}
        disabled={
          isSubmitting
        }
      />

      <FormInput
        type="text"
        label="Nama Lengkap"
        required
        placeholder="Masukkan nama pengguna"
        {...register("nama")}
        error={
          errors.nama?.message
        }
        disabled={
          isSubmitting
        }
      />

      <FormInput
        type="email"
        label="Email"
        required
        placeholder="Masukkan alamat email"
        {...register("email")}
        error={
          errors.email?.message
        }
        disabled={
          isSubmitting
        }
      />

      {!isEdit && (
        <FormInput
          type="password"
          label="Password"
          required
          placeholder="Masukkan password"
          {...register(
            "password"
          )}
          error={
            errors.password?.message
          }
          disabled={
            isSubmitting
          }
        />
      )}

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
          disabled={
            isSubmitting
          }
          onClick={
            resetForm
          }
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
          disabled={
            isSubmitting
          }
          onClick={
            submitForm
          }
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
          {isSubmitting
            ? "Menyimpan..."
            : isEdit
              ? "Update"
              : "Simpan"}
        </button>
      </div>
    </div>
  );
}
