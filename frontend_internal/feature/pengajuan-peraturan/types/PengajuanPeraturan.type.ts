export type TahapanPeraturan =
  | "Pengajuan"
  | "Pembahasan"
  | "Harmonisasi"
  | "Persetujuan"
  | "Penetapan";

export type StatusPeraturan =
  | "Draft"
  | "Submit Dokumen"
  | "Review"
  | "Pengajuan Ulang"
  | "Proses"
  | "Pembahasan"
  | "Harmonisasi"
  | "Perlu Perbaikan Harmonisasi"
  | "Persetujuan"
  | "Penetapan"
  | "Revisi"
  | "Disetujui"
  | "Ditolak"
  | "Ditetapkan";

export interface PembahasanItem {
  id: number;
  draft_id: number;
  judul_rapat: string;
  tanggal_rapat: string;
  file_notulensi?: string | null;
  keterangan?: string | null;
  created_at?: string;
}

export interface PersetujuanItem {
  id: number;
  draft_id: number;
  user_id?: number | string | null;
  nama_pejabat: string;
  jabatan: string;
  status: "Menunggu" | "Disetujui" | "Ditolak";
  catatan?: string | null;
  file_lampiran?: string | null;
  tanggal_persetujuan?: string | null;
  created_at?: string;
}

export interface PengajuanPeraturan {
  id: number;
  judul: string;
  kategori?: string;
  bidang?: string;
  tipe_dokumen?: string;
  tempat_penetapan?: string;
  status_dokumen?: string;
  nomor_rancangan?: string;
  tahun?: number;
  pemrakarsa?: string;
  penanggung_jawab?: string;
  tahapan: TahapanPeraturan;
  status: StatusPeraturan;
  tanggal_pengajuan?: string;
  target_penetapan?: string;
  tanggal_penetapan?: string;
  tanggal_pengundangan?: string;
  tanggal_berlaku?: string;
  ringkasan?: string;
  catatan_revisi?: string;
  file_draft?: string;
  file_naskah_akademik?: string;
  // Tahap 3 Harmonisasi
  status_harmonisasi?: string;
  catatan_harmonisasi?: string;
  file_harmonisasi?: string;
  tanggal_harmonisasi?: string;
  // Tahap 4 Persetujuan
  status_penunjukan_pejabat?: "Draft" | "Disimpan" | string;
  // Tahap 5 Penetapan
  nomor_penetapan?: string;
  tanggal_penetapan?: string;
  file_dokumen_final?: string;
  id_dokumen_hukum_terbit?: number;
  // Relasi
  pembahasan_list?: PembahasanItem[];
  persetujuan_list?: PersetujuanItem[];
  created_at?: string;
  updated_at?: string;
}

export interface PengajuanPeraturanRequest {
  judul: string;
  kategori?: string;
  nomor_rancangan?: string;
  tahun?: number | string;
  pemrakarsa?: string;
  penanggung_jawab?: string;
  tanggal_pengajuan?: string;
  target_penetapan?: string;
  tanggal_penetapan?: string;
  tanggal_pengundangan?: string;
  tanggal_berlaku?: string;
  ringkasan?: string;
  catatan_revisi?: string;
  file_draft?: File | null;
  file_naskah_akademik?: File | null;
}

