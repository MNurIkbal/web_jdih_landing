export const APP_BASE_URL = process.env.NEXT_PUBLIC_APP_BASE_URL ?? "https://jdih-be.asiasistem.com";

export const DOKUMEN_ENDPOINT = "/dokumen";
export const MAX_FILE_SIZE = 3 * 1024 * 1024; // 3 MB

export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png"];
export const KATEGORI_BERITA = [
  {
    value: "Berita Terkini",
    label: "Berita Terkini",
  },
  {
    value: "Kegiatan",
    label: "Kegiatan",
  },
  {
    value: "Agenda",
    label: "Agenda",
  },
  {
    value: "Informasi",
    label: "Informasi",
  },
  {
    value: "Sosialisasi",
    label: "Sosialisasi",
  },
  {
    value: "Prestasi",
    label: "Prestasi",
  },
  {
    value: "Pengumuman",
    label: "Pengumuman",
  },
];

export const kategoriOptions = [
  {
    value: "",
    label: "Pilih kategori",
  },
  {
    value: "Peraturan",
    label: "Peraturan",
  },
  {
    value: "Keputusan",
    label: "Keputusan",
  },
  {
    value: "Instruksi",
    label: "Instruksi",
  },
  {
    value: "Perundang-Undangan",
    label: "Perundang-Undangan",
  },
  {
    value: "Monografi Hukum",
    label: "Monografi Hukum",
  },
  {
    value: "Artikel Hukum",
    label: "Artikel Hukum",
  },
  {
    value: "Putusan Pengadilan",
    label: "Putusan Pengadilan",
  },
  {
    value: "Dokumen Langka",
    label: "Dokumen Langka",
  },
  {
    value: "Uji Publik Rancangan",
    label: "Uji Publik Rancangan",
  },
  {
    value: "Program Penyusunan PUU",
    label: "Program Penyusunan PUU",
  },
];

export const tipeDokumenOptions = [
  {
    value: "Undang-Undang",
    label: "Undang-Undang",
  },
  {
    value: "Peraturan Pemerintah",
    label: "Peraturan Pemerintah",
  },
  {
    value: "Peraturan Presiden",
    label: "Peraturan Presiden",
  },
  {
    value: "Peraturan Menteri",
    label: "Peraturan Menteri",
  },
  {
    value: "Peraturan Lembaga",
    label: "Peraturan Lembaga",
  },
  {
    value: "Peraturan Kepala BIN",
    label: "Peraturan Kepala BIN",
  },
  {
    value: "Keputusan Kepala BIN",
    label: "Keputusan Kepala BIN",
  },
  {
    value: "Instruksi Kepala BIN",
    label: "Instruksi Kepala BIN",
  },
  {
    value: "Surat Edaran",
    label: "Surat Edaran",
  },
  {
    value: "Perjanjian Kerja Sama",
    label: "Perjanjian Kerja Sama",
  },
  {
    value: "Putusan Pengadilan",
    label: "Putusan Pengadilan",
  },
  {
    value: "Yurisprudensi",
    label: "Yurisprudensi",
  },
  {
    value: "Naskah Akademik",
    label: "Naskah Akademik",
  },
  {
    value: "Monografi Hukum",
    label: "Monografi Hukum",
  },
  {
    value: "Artikel Hukum",
    label: "Artikel Hukum",
  },
];

export const bidangOptions = [
  {
    value: "Hukum Tata Negara",
    label: "Hukum Tata Negara",
  },
  {
    value: "Hukum Administrasi Negara",
    label: "Hukum Administrasi Negara",
  },
  {
    value: "Hukum Pidana",
    label: "Hukum Pidana",
  },
  {
    value: "Hukum Acara Pidana",
    label: "Hukum Acara Pidana",
  },
  {
    value: "Hukum Perdata",
    label: "Hukum Perdata",
  },
  {
    value: "Hukum Acara Perdata",
    label: "Hukum Acara Perdata",
  },
  {
    value: "Hukum Internasional",
    label: "Hukum Internasional",
  },
  {
    value: "Hukum Administrasi Pemerintahan",
    label: "Hukum Administrasi Pemerintahan",
  },
  {
    value: "Hukum Kepegawaian",
    label: "Hukum Kepegawaian",
  },
  {
    value: "Hukum Keuangan Negara",
    label: "Hukum Keuangan Negara",
  },
  {
    value: "Hukum Perjanjian",
    label: "Hukum Perjanjian",
  },
  {
    value: "Hukum Siber",
    label: "Hukum Siber",
  },
  {
    value: "Hukum Perlindungan Data",
    label: "Hukum Perlindungan Data",
  },
  {
    value: "Hukum Hak Asasi Manusia",
    label: "Hukum Hak Asasi Manusia",
  },
  {
    value: "Hukum Pengadaan Barang dan Jasa",
    label: "Hukum Pengadaan Barang dan Jasa",
  }
];

export const subjectOptions = [
  {
    value: "Intelijen Negara",
    label: "Intelijen Negara",
  },
  {
    value: "Penyelenggaraan Intelijen Negara",
    label: "Penyelenggaraan Intelijen Negara",
  },
  {
    value: "Kelembagaan BIN",
    label: "Kelembagaan BIN",
  },
  {
    value: "Organisasi dan Tata Kerja",
    label: "Organisasi dan Tata Kerja",
  },
  {
    value: "Tugas dan Fungsi",
    label: "Tugas dan Fungsi",
  },
  {
    value: "Sumber Daya Manusia",
    label: "Sumber Daya Manusia",
  },
  {
    value: "Kepegawaian",
    label: "Kepegawaian",
  },
  {
    value: "Kode Etik",
    label: "Kode Etik",
  },
  {
    value: "Disiplin Pegawai",
    label: "Disiplin Pegawai",
  },
  {
    value: "Pengadaan Barang dan Jasa",
    label: "Pengadaan Barang dan Jasa",
  },
  {
    value: "Keuangan Negara",
    label: "Keuangan Negara",
  },
  {
    value: "Barang Milik Negara",
    label: "Barang Milik Negara",
  },
  {
    value: "Kerja Sama Dalam Negeri",
    label: "Kerja Sama Dalam Negeri",
  },
  {
    value: "Kerja Sama Internasional",
    label: "Kerja Sama Internasional",
  },
  {
    value: "Keamanan Nasional",
    label: "Keamanan Nasional",
  },
  {
    value: "Pertahanan dan Keamanan",
    label: "Pertahanan dan Keamanan",
  },
  {
    value: "Keamanan Siber",
    label: "Keamanan Siber",
  },
  {
    value: "Teknologi Informasi",
    label: "Teknologi Informasi",
  },
  {
    value: "Pelindungan Data",
    label: "Pelindungan Data",
  },
  {
    value: "Informasi dan Dokumentasi",
    label: "Informasi dan Dokumentasi",
  },
  {
    value: "Keterbukaan Informasi Publik",
    label: "Keterbukaan Informasi Publik",
  }
];
export const statusOptions = [
  {
    value: "",
    label: "Pilih status",
  },
  {
    value: "Berlaku",
    label: "Berlaku",
  },
  {
    value: "Tidak Berlaku",
    label: "Tidak Berlaku",
  },
];

export const getTahunOptions = () => {
  const options: { value: string; label: string }[] = [
    {
      value: "",
      label: "Pilih tahun",
    },
  ];

  for (let tahun = 2026; tahun >= 1970; tahun--) {
    const tahunStr = String(tahun);

    options.push({
      value: tahunStr,
      label: tahunStr,
    });
  }

  return options;
};

export const tahunOptions: { value: string; label: string }[] =
  getTahunOptions();