export interface Berita {
  id: string
  tag: string
  judul: string
  ringkasan: string
  tanggal: string
  gambar: string
}

export const beritaUtama: Berita = {
  id: 'tanggapan-djoko-tjandra',
  tag: 'Siaran Pers',
  judul: 'Tanggapan BIN Atas Siaran Pers ICW Terkait Kasus Djoko Tjandra',
  ringkasan:
    'Badan Intelijen Negara (BIN) tidak mempunyai kewenangan dalam melakukan intervensi terkait masalah Djoko Tjandra. BIN senantiasa menjalankan tugas dan fungsinya sesuai koridor hukum dan peraturan perundang-undangan yang berlaku di Republik Indonesia.',
  tanggal: '2020-08-04',
  gambar: 'https://picsum.photos/seed/jdih-pers/1200/760',
}

export const beritaLain: Berita[] = [
  {
    id: 'sosialisasi-keterbukaan-informasi',
    tag: 'Kegiatan',
    judul: 'Sosialisasi Keterbukaan Informasi Publik di Lingkungan BIN',
    ringkasan:
      'Kegiatan pembekalan pemahaman regulasi keterbukaan informasi bagi pejabat pengelola informasi dan dokumentasi.',
    tanggal: '2026-07-18',
    gambar: 'https://picsum.photos/seed/jdih-b1/800/600',
  },
  {
    id: 'basis-data-jdih-nasional',
    tag: 'Pengumuman',
    judul: 'Peluncuran Basis Data Peraturan Terintegrasi JDIH Nasional',
    ringkasan:
      'Integrasi sistem pendokumentasian produk hukum lintas instansi untuk mempermudah akses publik.',
    tanggal: '2026-06-02',
    gambar: 'https://picsum.photos/seed/jdih-b2/800/600',
  },
  {
    id: 'rakor-penataan-produk-hukum',
    tag: 'Kegiatan',
    judul: 'Rapat Koordinasi Penataan Produk Hukum Antarinstansi',
    ringkasan:
      'Penyelarasan tata kelola dokumentasi hukum antara pengelola JDIH pusat dan instansi terkait.',
    tanggal: '2026-05-21',
    gambar: 'https://picsum.photos/seed/jdih-b3/800/600',
  },
  {
    id: 'bimtek-naskah-akademik',
    tag: 'Pelatihan',
    judul: 'Bimbingan Teknis Penyusunan Naskah Akademik',
    ringkasan:
      'Peningkatan kapasitas perancang peraturan dalam menyusun naskah akademik yang berkualitas.',
    tanggal: '2026-05-09',
    gambar: 'https://picsum.photos/seed/jdih-b4/800/600',
  },
  {
    id: 'evaluasi-produk-hukum-triwulan',
    tag: 'Evaluasi',
    judul: 'Evaluasi Triwulan Kepatuhan Pendokumentasian Produk Hukum',
    ringkasan:
      'Tinjauan berkala atas kelengkapan dan akurasi metadata produk hukum yang telah diinventarisasi.',
    tanggal: '2026-04-14',
    gambar: 'https://picsum.photos/seed/jdih-b5/800/600',
  },
  {
    id: 'forum-jdih-daerah',
    tag: 'Kegiatan',
    judul: 'Forum Koordinasi JDIH Daerah Wilayah Barat',
    ringkasan:
      'Diskusi teknis pengelolaan dokumentasi hukum bersama pengelola JDIH di tingkat daerah.',
    tanggal: '2026-03-27',
    gambar: 'https://picsum.photos/seed/jdih-b6/800/600',
  },
]