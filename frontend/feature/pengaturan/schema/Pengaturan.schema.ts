import { z } from "zod";

export const PengaturanSchema = z.object({
  id: z.number().optional(),

  struktur_organisasi: z
    .string()
    .trim()
    .min(1, "Struktur organisasi wajib diisi"),

  tentang: z
    .string()
    .trim()
    .min(1, "Tentang wajib diisi"),

  sejarah: z
    .string()
    .trim()
    .min(1, "Sejarah wajib diisi"),

  dasar_hukum: z
    .string()
    .trim()
    .min(1, "Dasar hukum wajib diisi"),

  jdih_perwakilan: z
    .string()
    .trim()
    .min(1, "JDIH Perwakilan wajib diisi"),

  alamat: z
    .string()
    .trim()
    .min(1, "Alamat wajib diisi"),

  no_hp: z
    .string()
    .trim()
    .min(1, "Nomor HP wajib diisi")
    .max(30, "Nomor HP maksimal 30 karakter"),

  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi")
    .email("Format email tidak valid")
    .max(150, "Email maksimal 150 karakter"),
});

export type PengaturanFormValues =
  z.infer<typeof PengaturanSchema>;