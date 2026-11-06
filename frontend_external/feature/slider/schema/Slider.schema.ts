import { z } from "zod";

export const SliderSchema = z.object({
  slider_id: z.number().optional(),
  gambar: z
    .union([z.instanceof(File), z.string()])
    .nullable()
    .optional()
    .superRefine((value, ctx) => {
      // Tidak ada gambar
      if (value === null || value === undefined || value === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Gambar slider wajib diisi",
        });

        return;
      }

      // Saat edit, gambar lama berupa URL/string
      if (typeof value === "string") {
        return;
      }

      // Validasi ukuran
      const maxSize = 3 * 1024 * 1024;

      if (value.size > maxSize) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ukuran gambar maksimal 3 MB",
        });
      }

      // Validasi format
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

      if (!allowedTypes.includes(value.type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Format gambar harus JPG, JPEG, atau PNG",
        });
      }
    }),

  judul: z.string().trim().min(1, "Judul slider wajib diisi"),

  keterangan: z.string().trim().min(1, "Keterangan slider wajib diisi"),

  status: z.boolean(),
});

export type SliderFormValues = z.infer<typeof SliderSchema>;
