export type DokumenHukum = {
  id: number;
  judul: string;
  kategori: any;
  nomor: string;
  nomor_rancangan?: string;
  tahun: string | number;
  bidang: string;
  tipe_dokumen: any;
  tempat_penetapan: string;
  tanggal_penetapan: string;
  tanggal_pengundangan: string;
  tanggal_berlaku: string;
  sumber: string;
  subject?: string;
  subjek?: string;
  pemrakarsa?: string;
  penanggung_jawab?: string;
  urgensi?: string;
  dasar_hukum?: string;
  ringkasan?: string;
  draft_id?: number;
  dokumen_terkait_id?: number | string | null;
  dokumen_terkait_judul?: string | null;
  dokumen_terkait_nomor?: string | null;
  dokumen_terkait_tahun?: string | number | null;
  dokumen_terkait_kategori?: string | null;
  catatan_status_relasi?: string | null;

  // sebelumnya boolean
  status: string;

  file_abstrak: string | null;
  file_dokumen: string | null;
};

export type DokumenHukumRequest = {
  judul: string;
  kategori: any;
  nomor: string;
  tahun: string;
  bidang: string;
  tipe_dokumen: any;
  tempat_penetapan: string;
  tanggal_penetapan: string;
  tanggal_pengundangan: string;
  tanggal_berlaku: string;
  sumber: string;
  subject: string;
  dokumen_terkait_id?: any;
  catatan_status_relasi?: string | null;

  // sebelumnya boolean
  status: string;

  file_abstrak?: File | null;
  file_dokumen?: File | null;
};