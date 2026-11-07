import { z } from "zod";

export const PengajuanPeraturanSchema = z.object({
  // 01 Informasi Dokumen (identik DokumenHukum)
  judul: z
    .string()
    .min(1, "Judul rancangan peraturan wajib diisi")
    .max(500, "Judul maksimal 500 karakter"),

  kategori: z
    .string()
    .min(1, "Kategori dokumen wajib dipilih"),

  tipe_dokumen: z
    .string()
    .optional(),

  nomor_rancangan: z
    .string()
    .min(1, "Nomor rancangan wajib diisi")
    .max(100, "Nomor maksimal 100 karakter"),

  tahun: z
    .string()
    .min(1, "Tahun wajib diisi"),

  bidang: z
    .string()
    .min(1, "Bidang hukum wajib dipilih"),

  tempat_penetapan: z
    .string()
    .min(1, "Tempat penetapan wajib diisi"),

  // 02 Detail Penetapan & Pemrakarsa
  tanggal_penetapan: z
    .string()
    .min(1, "Tanggal penetapan / target wajib diisi"),

  tanggal_pengundangan: z
    .string()
    .min(1, "Tanggal pengundangan / pengajuan wajib diisi"),

  tanggal_berlaku: z
    .string()
    .min(1, "Tanggal berlaku wajib diisi"),

  sumber: z
    .string()
    .optional(),

  subject: z
    .string()
    .optional(),

  status: z
    .string()
    .default("Draft"),

  pemrakarsa: z
    .string()
    .min(1, "Unit pemrakarsa wajib diisi"),

  penanggung_jawab: z
    .string()
    .optional(),

  ringkasan: z
    .string()
    .optional(),

  // 03 Berkas Dokumen (PDF)
  file_draft: z
    .union([z.instanceof(File), z.string(), z.null()])
    .refine((val) => val !== null && val !== undefined && val !== "", {
      message: "File dokumen / draft naskah (PDF) wajib diunggah",
    })
    .refine(
      (val) => {
        if (val instanceof File) {
          return val.size <= 50 * 1024 * 1024;
        }
        return true;
      },
      { message: "Ukuran file draft maksimal 50 MB" }
    ),

  file_naskah_akademik: z
    .union([z.instanceof(File), z.string(), z.null()])
    .optional()
    .refine(
      (val) => {
        if (val instanceof File) {
          return val.size <= 50 * 1024 * 1024;
        }
        return true;
      },
      { message: "Ukuran file naskah akademik maksimal 50 MB" }
    ),
});

export type PengajuanPeraturanFormValues = z.infer<typeof PengajuanPeraturanSchema>;

export const VerifikasiPengajuanSchema = z.object({
  status: z.enum(["Disetujui", "Ditolak"], {
    errorMap: () => ({ message: "Pilih keputusan verifikasi" }),
  }),
  catatan: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.status === "Ditolak" && (!data.catatan || !data.catatan.trim())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["catatan"],
      message: "Catatan penolakan / revisi wajib diisi jika permohonan ditolak",
    });
  }
});

export type VerifikasiPengajuanFormValues = z.infer<typeof VerifikasiPengajuanSchema>;


