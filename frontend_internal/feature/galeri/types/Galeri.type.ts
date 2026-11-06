export interface Galeri {
  galeri_id: number;
  judul: string;
  tipe: "foto" | "video";
  kategori?: string;
  keterangan?: string;
  media_url?: string;
  media_full_url?: string;
  video_url?: string;
  thumbnail?: string;
  status: boolean;
  tanggal?: string;
  created_at?: string;
  updated_at?: string;
}

export interface GaleriRequest {
  judul: string;
  tipe?: "foto" | "video";
  kategori?: string;
  keterangan?: string;
  video_url?: string;
  status?: boolean | string;
  tanggal?: string;
  media?: File | string | null;
}
