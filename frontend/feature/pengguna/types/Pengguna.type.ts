export type Pengguna = {
  id: number;
  nama: string;
  email: string;
  role: string;
  foto: string | null;
};

export type PenggunaRequest = {
  nama: string;
  email: string;
  password?: string;
  role: string;
  foto?: string | File | null;
};