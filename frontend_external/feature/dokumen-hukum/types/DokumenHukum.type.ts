export type DokumenHukum = {
  id: number;
  judul: string;
  kategori: number;
  nomor: string;
  tahun: string;
  bidang: string;
  tipe_dokumen: number;
  tempat_penetapan: string;
  tanggal_penetapan: string;
  tanggal_pengundangan: string;
  tanggal_berlaku: string;
  sumber: string;
  subject: string;

  // sebelumnya boolean
  status: string;

  file_abstrak: string | null;
  file_dokumen: string | null;
};

export type DokumenHukumRequest = {
  judul: string;
  kategori: number;
  nomor: string;
  tahun: string;
  bidang: string;
  tipe_dokumen: number;
  tempat_penetapan: string;
  tanggal_penetapan: string;
  tanggal_pengundangan: string;
  tanggal_berlaku: string;
  sumber: string;
  subject: string;

  // sebelumnya boolean
  status: string;

  file_abstrak?: File | null;
  file_dokumen?: File | null;
};