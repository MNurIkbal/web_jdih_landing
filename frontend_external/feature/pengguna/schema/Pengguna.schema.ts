import { z } from "zod";

export const PenggunaSchema = (isEdit: boolean) =>
  z.object({
    id: z.number().optional(),

    nama: z
      .string()
      .min(1, "Nama wajib diisi")
      .max(100, "Nama maksimal 100 karakter"),

    email: z
      .string()
      .min(1, "Email wajib diisi")
      .email("Format email tidak valid"),

    password: isEdit
      ? z.string().optional()
      : z
          .string()
          .min(1, "Password wajib diisi"),

    foto: z
      .union([
        z.instanceof(File),
        z.string(),
      ])
      .nullable()
      .optional()
      .superRefine((value, ctx) => {
        // Tidak ada foto
        if (
          value === null ||
          value === undefined ||
          value === ""
        ) {
          return;
        }

        // Foto lama
        if (typeof value === "string") {
          return;
        }

        // Maksimal 3 MB
        if (value.size > 3 * 1024 * 1024) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: "Ukuran foto maksimal 3 MB",
          });
        }

        // Format foto
        const allowedTypes = [
          "image/jpeg",
          "image/jpg",
          "image/png",
        ];

        if (!allowedTypes.includes(value.type)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message:
              "Format foto harus JPG, JPEG, atau PNG",
          });
        }
      }),
  });

export type PenggunaFormValues = z.infer<
  ReturnType<typeof PenggunaSchema>
>;