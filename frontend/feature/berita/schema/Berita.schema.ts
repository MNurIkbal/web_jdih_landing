import { z } from "zod";

export const BeritaSchema = z.object({
  berita_id: z.number().optional(),

  judul: z
    .string()
    .min(1, "Judul berita wajib diisi"),

  kategori: z
    .string()
    .min(1, "Kategori berita wajib diisi"),

  tanggal_berita: z
    .string()
    .min(1, "Tanggal berita wajib diisi"),

  penulis: z
    .string()
    .min(1, "Penulis wajib diisi"),

  gambar: z
    .union([
      z.instanceof(File),
      z.string(),
    ])
    .nullable()
    .optional()
    .superRefine((value, ctx) => {
      if (
        value === null ||
        value === undefined ||
        value === ""
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Gambar berita wajib diisi",
        });

        return;
      }

      if (typeof value === "string") {
        return;
      }

      if (value.size > 3 * 1024 * 1024) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ukuran gambar maksimal 3 MB",
        });
      }

      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
      ];

      if (!allowedTypes.includes(value.type)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            "Format gambar harus JPG, JPEG, atau PNG",
        });
      }
    }),

  isi_berita: z
    .string()
    .min(1, "Isi berita wajib diisi"),

  status: z
    .boolean()
    .default(true),
});

export type BeritaFormValues =
  z.infer<typeof BeritaSchema>;