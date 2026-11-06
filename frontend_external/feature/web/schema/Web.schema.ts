import { z } from "zod";

export const KontakSchema = z.object({
  kontak_id: z.number().optional(),
  
  nama: z.string().trim().min(1, "Nama wajib diisi"),

  email: z.string().trim().min(1, "Email wajib diisi"),
  subject: z.string().trim().min(1, "Subject wajib diisi"),
  pesan: z.string().trim().min(1, "Pesan wajib diisi"),

});

export type KontakFormValues = z.infer<typeof KontakSchema>;
