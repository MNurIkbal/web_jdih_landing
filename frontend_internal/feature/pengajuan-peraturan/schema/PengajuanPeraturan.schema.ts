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
  status: z.enum(["Disetujui", "Ditolak"]),
  catatan: z.string().optional(),
}).superRefine((data, ctx) => {
  if (data.status === "Ditolak" && (!data.catatan || !data.catatan.trim())) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["catatan"],
      message: "Catatan penolakan wajib diisi jika permohonan ditolak",
    });
  }
});

export type VerifikasiPengajuanFormValues = z.infer<typeof VerifikasiPengajuanSchema>;

export const PembahasanRapatSchema = z.object({
  judul_rapat: z
    .string()
    .trim()
    .min(1, "Judul rapat / agenda wajib diisi")
    .max(255, "Judul rapat maksimal 255 karakter"),
  tanggal_rapat: z
    .string()
    .min(1, "Tanggal rapat wajib diisi"),
  lokasi: z.string().trim().max(255, "Lokasi maksimal 255 karakter").optional(),
  keterangan: z.string().trim().optional(),
  file_notulensi: z
    .any()
    .refine((file) => file !== null && file !== undefined, "File notulensi / berita acara wajib diunggah")
    .refine((file) => !(file instanceof File) || file.size <= 30 * 1024 * 1024, "Ukuran file notulensi maksimal 30 MB")
    .refine(
      (file) => !(file instanceof File) || file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf"),
      "Format file notulensi harus berformat PDF"
    ),
});

export type PembahasanRapatFormValues = z.infer<typeof PembahasanRapatSchema>;

export const UploadRevisedDraftPdfSchema = z.object({
  file_draft: z
    .custom<File>((file) => file instanceof File, {
      message: "Berkas PDF perbaikan wajib dipilih",
    })
    .refine(
      (file) =>
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf"),
      {
        message: "Format berkas harus berformat PDF (.pdf)",
      }
    )
    .refine(
      (file) => file.size <= 30 * 1024 * 1024,
      {
        message: "Ukuran berkas PDF maksimal 30 MB",
      }
    ),
});

export type UploadRevisedDraftPdfFormValues = z.infer<typeof UploadRevisedDraftPdfSchema>;

export const PenunjukanPejabatSchema = z.object({
  user_id: z
    .string()
    .trim()
    .min(1, "Pilih pejabat / admin terlebih dahulu"),
  nama_pejabat: z.string().trim().optional(),
  jabatan: z.string().trim().optional(),
});

export type PenunjukanPejabatFormValues = z.infer<typeof PenunjukanPejabatSchema>;

export const PenetapanPublikasiSchema = z.object({
  nomor_penetapan: z
    .string()
    .trim()
    .min(1, "Nomor peraturan resmi wajib diisi")
    .max(100, "Nomor peraturan resmi maksimal 100 karakter"),
  tanggal_penetapan: z
    .string()
    .trim()
    .min(1, "Tanggal penetapan wajib diisi"),
  tempat_penetapan: z
    .string()
    .trim()
    .min(1, "Tempat penetapan wajib diisi")
    .max(255, "Tempat penetapan maksimal 255 karakter"),
});

export type PenetapanPublikasiFormValues = z.infer<typeof PenetapanPublikasiSchema>;


