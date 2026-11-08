
import { z } from "zod";

export const DokumenHukumSchema = z.object({
  id: z.number().optional(),

  judul: z
    .string()
    .min(1, "Judul wajib diisi")
    .max(255, "Judul maksimal 255 karakter"),

  kategori: z
    .string()
    .min(1, "Kategori wajib dipilih"),

  nomor: z
    .string()
    .min(1, "Nomor wajib diisi")
    .max(100, "Nomor maksimal 100 karakter"),

  tahun: z
    .string()
    .min(1, "Tahun wajib diisi"),

  bidang: z
    .string()
    .min(1, "Bidang wajib dipilih"),

  tipe_dokumen: z
    .string().optional(),
  tempat_penetapan: z
    .string().optional(),
  tanggal_penetapan: z
    .string()
    .min(1, "Tanggal penetapan wajib diisi"),

  tanggal_pengundangan: z
    .string()
    .min(1, "Tanggal pengundangan wajib diisi"),

  tanggal_berlaku: z
    .string()
    .min(1, "Tanggal berlaku wajib diisi"),

  sumber: z
    .string().optional(),

  pemrakarsa: z
    .string().optional(),

  penanggung_jawab: z
    .string().optional(),

  urgensi: z
    .string().optional(),

  dasar_hukum: z
    .string().optional(),

  subject: z
    .string().optional(),

  status: z
    .string()
    .min(1, "Status wajib dipilih"),

  dokumen_terkait_id: z
    .union([z.string(), z.number(), z.null()])
    .optional(),

  catatan_status_relasi: z
    .string().optional(),
  file_abstrak: z
    .union([
      z.instanceof(File),
      z.string(),
      z.null(),
    ])
    .optional()
    .refine(
      (value) => {
        if (
          value === undefined ||
          value === null ||
          value === ""
        ) {
          return true;
        }

        if (typeof value === "string") {
          return value.trim().length > 0;
        }

        return true;
      },
      {
        message: "File abstrak tidak valid",
      }
    )
    .refine(
      (value) => {
        if (
          value === undefined ||
          value === null ||
          typeof value === "string"
        ) {
          return true;
        }

        return value.size <= 30 * 1024 * 1024;
      },
      {
        message: "Ukuran file abstrak maksimal 30 MB",
      }
    )
    .refine(
      (value) => {
        if (
          value === undefined ||
          value === null ||
          typeof value === "string"
        ) {
          return true;
        }

        return value.type === "application/pdf";
      },
      {
        message: "File abstrak harus berformat PDF",
      }
    ),

  file_dokumen: z
    .union([
      z.instanceof(File),
      z.string(),
      z.null(),
    ])
    .refine(
      (value) => {
        // NULL = belum memilih file
        if (value === null) {
          return false;
        }

        // STRING = file lama dari database
        if (typeof value === "string") {
          return value.trim().length > 0;
        }

        // FILE = file baru
        return true;
      },
      {
        message: "File dokumen wajib diisi",
      }
    )
    .refine(
      (value) => {
        // Null dan file lama tidak perlu validasi ukuran
        if (
          value === null ||
          typeof value === "string"
        ) {
          return true;
        }

        return value.size <= 30 * 1024 * 1024;
      },
      {
        message:
          "Ukuran file dokumen maksimal 30 MB",
      }
    )
    .refine(
      (value) => {
        // Null dan file lama tidak perlu validasi tipe
        if (
          value === null ||
          typeof value === "string"
        ) {
          return true;
        }

        return value.type === "application/pdf";
      },
      {
        message:
          "File dokumen harus berformat PDF",
      }
    ),

})
.superRefine((data, ctx) => {
  const s = (data.status || "").toLowerCase().trim();
  const isSpecialStatus = s !== "berlaku" && s !== "tidak berlaku" && s !== "";
  if (isSpecialStatus && (!data.dokumen_terkait_id || String(data.dokumen_terkait_id).trim() === "")) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Dokumen hukum terkait wajib dipilih jika status bukan Berlaku / Tidak Berlaku",
      path: ["dokumen_terkait_id"],
    });
  }
});

export type DokumenHukumFormValues =
  z.infer<typeof DokumenHukumSchema>;
