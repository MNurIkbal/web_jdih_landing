export type Pengaturan = {
  id: number;

  struktur_organisasi: string;
  tentang: string;
  sejarah: string;
  dasar_hukum: string;
  jdih_perwakilan: string;

  alamat: string;
  no_hp: string;
  email: string;
};

export type PengaturanRequest = {
  struktur_organisasi: string;
  tentang: string;
  sejarah: string;
  dasar_hukum: string;
  jdih_perwakilan: string;

  alamat: string;
  no_hp: string;
  email: string;
};