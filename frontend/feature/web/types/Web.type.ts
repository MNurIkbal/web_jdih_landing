export interface Sumary {
  produk_hukum: number
  peraturan: number
  perundang_undangan: number
  keputusan: number
}

export interface SumaryResponse {
  success: boolean
  message: string
  data: Sumary
}

export type Berita = {
  berita_id?: number;
  beritaId?: number;
  judul?: string;
  title?: string;
  slug?: string;
  gambar?: string;
  image?: string;
  thumbnail?: string;
  tanggal?: string;
  tanggal_berita?: string;
  kategori?: string;
  isi?: string;
  isi_berita?: string;
};
export type BeritaPagination = {
  content: Berita[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
};
export type BeritaWebResponse = {
  success: boolean;
  message: string;
  data: BeritaPagination;
};
export type FetchWebBeritaParams = { page?: number; size?: number };