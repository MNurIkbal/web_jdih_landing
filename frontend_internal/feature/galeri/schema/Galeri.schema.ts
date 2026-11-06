import { z } from "zod";

export const GaleriSchema = z.object({
  galeri_id: z.number().optional(),
  media: z
    .union([z.instanceof(File), z.string()])
    .nullable()
    .optional()
    .superRefine((value, ctx) => {
      // 1. Validasi Wajib Diisi (gambar tidak boleh kosong baik create maupun edit)
      if (value === null || value === undefined || value === "") {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Foto dokumentasi wajib diisi",
        });
        return;
      }

      // Saat edit, jika foto lama tidak diganti (berupa URL / path string)
      if (typeof value === "string") {
        return;
      }

      // 2. Validasi Ukuran Maksimal 5 MB
      const maxSize = 5 * 1024 * 1024;
      if (value.size > maxSize) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ukuran foto maksimal 5 MB",
        });
      }

      // 3. Validasi Format Foto
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
      if (!allowedTypes.includes(value.type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Format foto harus JPG, JPEG, PNG, atau WEBP",
        });
      }
    }),

  // Judul: Wajib diisi
  judul: z.string().trim().min(1, "Judul foto wajib diisi"),

  // Keterangan: Opsional
  keterangan: z.string().optional(),

  // Status: Opsional (default true)
  status: z.boolean().optional().default(true),
});

export type GaleriFormValues = z.infer<typeof GaleriSchema>;
