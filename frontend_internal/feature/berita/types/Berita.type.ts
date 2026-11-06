export type Berita = {
  berita_id: number;
  judul: string;
  kategori: string;
  tanggal_berita: string;
  penulis: string;
  gambar: string;
  isi_berita: string;
  status: boolean;
};

export type BeritaRequest = {
  judul: string;
  kategori: string;
  tanggal_berita: string;
  penulis: string;
  gambar: string | File;
  isi_berita: string;
  status: boolean;
};