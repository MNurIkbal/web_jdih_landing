export type StatusRelasi = {
  aksi: string
  label: string
  href?: string
}

export type ProdukHukum = {
  /* ==========================================================
     DATA UTAMA
  ========================================================== */

  id: number

  jenis: string
  nomor: string
  tahun: string

  judul: string
  tentang: string

  tanggal: string

  deskripsi: string

  /* ==========================================================
     FILE
  ========================================================== */

  /**
   * File utama / file peraturan
   */
  file: string

  /**
   * File abstrak
   */
  fileAbstrak?: string

  /* ==========================================================
     STATISTIK
  ========================================================== */

  views: number
  downloads: number

  /* ==========================================================
     METADATA DOKUMEN
  ========================================================== */

  tipeDokumen?: string

  teu?: string

  bentuk?: string

  bentukSingkat?: string

  tempatPenetapan?: string

  tanggalPenetapan?: string

  tanggalPengundangan?: string

  tanggalBerlaku?: string

  sumber?: string

  subjek?: string

  status?: string

  bahasa?: string

  lokasi?: string

  bidang?: string

  terjemahan?: string

  /* ==========================================================
     ABSTRAK
  ========================================================== */

  abstrak?: string[]

  catatan?: string[]

  /* ==========================================================
     RELASI PERATURAN
  ========================================================== */

  statusRelasi?: StatusRelasi[]

  peraturanTerkait?: StatusRelasi[]

  peraturanPelaksanaan?: StatusRelasi[]

  hasilUjiMateri?: StatusRelasi[]
}


/* ============================================================
   DATA PRODUK HUKUM
============================================================ */

export const produkHukum: ProdukHukum[] = [
  {
    id: 1,

    jenis: 'Peraturan BIN',
    nomor: '01',
    tahun: '2012',

    judul:
      'Peraturan Presiden Nomor 90 Tahun 2012',

    tentang:
      'Peraturan Presiden Nomor 90 Tahun 2012',

    tanggal:
      '2022-09-14',

    deskripsi:
      'Tentang Peraturan Presiden Nomor 90 Tahun 2012',

    /* ========================================================
       FILE
    ======================================================== */

    file:
      'peraturan.pdf',

    fileAbstrak:
      'peraturan.pdf',

    /* ========================================================
       STATISTIK
    ======================================================== */

    views: 70,

    downloads: 55,

    /* ========================================================
       METADATA
    ======================================================== */

    tipeDokumen:
      'Peraturan',

    teu:
      'Badan Intelijen Negara',

    bentuk:
      'Peraturan',

    bentukSingkat:
      'PerBIN',

    tempatPenetapan:
      'Jakarta',

    tanggalPenetapan:
      '2012-09-14',

    tanggalPengundangan:
      '2012-09-20',

    tanggalBerlaku:
      '2012-09-20',

    sumber:
      'BN RI Tahun 2012',

    subjek:
      'Badan Intelijen Negara',

    status:
      'Berlaku',

    bahasa:
      'Indonesia',

    lokasi:
      'Jakarta',

    bidang:
      'Kelembagaan',

    terjemahan:
      'Tidak tersedia',

    /* ========================================================
       ABSTRAK
    ======================================================== */

    abstrak: [
      'Peraturan ini mengatur mengenai kedudukan, tugas, fungsi, dan kewenangan Badan Intelijen Negara.',
      'Ketentuan dalam peraturan ini menjadi dasar penyelenggaraan kelembagaan dan pelaksanaan tugas intelijen negara.',
    ],

    catatan: [
      'Peraturan ini merupakan salah satu dasar pengaturan kelembagaan Badan Intelijen Negara.',
      'Perlu memperhatikan ketentuan peraturan perundang-undangan yang lebih baru.',
    ],

    /* ========================================================
       STATUS
    ======================================================== */

    statusRelasi: [
      {
        aksi: 'STATUS',
        label: 'Berlaku',
      },
    ],

    /* ========================================================
       PERATURAN TERKAIT
    ======================================================== */

    peraturanTerkait: [
      {
        aksi: 'TERKAIT',
        label:
          'Undang-Undang Nomor 17 Tahun 2011 tentang Intelijen Negara',
        href: '/produk-hukum/4',
      },
    ],

    /* ========================================================
       PERATURAN PELAKSANAAN
    ======================================================== */

    peraturanPelaksanaan: [
      {
        aksi: 'PELAKSANAAN',
        label:
          'Peraturan BIN mengenai pelaksanaan tugas dan fungsi kelembagaan',
      },
    ],

    /* ========================================================
       HASIL UJI MATERI
    ======================================================== */

    hasilUjiMateri: [],
  },

  /* ==========================================================
     DATA 2
  ========================================================== */

  {
    id: 2,

    jenis: 'Peraturan BIN',
    nomor: '02',
    tahun: '2020',

    judul:
      'PerBIN No 01 Tahun 2020 Tentang Statuta STIN',

    tentang:
      'PerBIN No 01 Tahun 2020 Tentang Statuta STIN',

    tanggal:
      '2022-09-14',

    deskripsi:
      'Tentang PerBIN No 01 Tahun 2020 Tentang Statuta STIN',

    file:
      '/PerBIN No 01 Tahun 2020 Tentang Statuta STIN.pdf',

    fileAbstrak:
      '/PerBIN No 01 Tahun 2020 Tentang Statuta STIN-abstrak.pdf',

    views: 13,

    downloads: 11,

    tipeDokumen:
      'Peraturan',

    teu:
      'Badan Intelijen Negara',

    bentuk:
      'Peraturan',

    bentukSingkat:
      'PerBIN',

    tempatPenetapan:
      'Jakarta',

    tanggalPenetapan:
      '2020-01-10',

    tanggalPengundangan:
      '2020-01-15',

    tanggalBerlaku:
      '2020-01-15',

    sumber:
      'Badan Intelijen Negara',

    subjek:
      'Statuta Sekolah Tinggi Intelijen Negara',

    status:
      'Berlaku',

    bahasa:
      'Indonesia',

    lokasi:
      'Jakarta',

    bidang:
      'Pendidikan',

    terjemahan:
      'Tidak tersedia',

    abstrak: [
      'Peraturan ini mengatur Statuta Sekolah Tinggi Intelijen Negara.',
      'Statuta menjadi pedoman dasar dalam penyelenggaraan pendidikan, penelitian, dan pengabdian kepada masyarakat di lingkungan STIN.',
    ],

    catatan: [
      'Statuta STIN menjadi dasar penyelenggaraan kegiatan akademik dan kelembagaan.',
    ],

    statusRelasi: [
      {
        aksi: 'STATUS',
        label: 'Berlaku',
      },
    ],

    peraturanTerkait: [
      {
        aksi: 'TERKAIT',
        label:
          'PerBIN No 02 Tahun 2020 tentang OTK STIN',
        href: '/produk-hukum/3',
      },
    ],

    peraturanPelaksanaan: [
      {
        aksi: 'PELAKSANAAN',
        label:
          'Peraturan internal STIN mengenai penyelenggaraan pendidikan',
      },
    ],

    hasilUjiMateri: [],
  },

  /* ==========================================================
     DATA 3
  ========================================================== */

  {
    id: 3,

    jenis: 'Peraturan BIN',
    nomor: '03',
    tahun: '2020',

    judul:
      'PerBIN No 02 Tahun 2020 tentang OTK STIN',

    tentang:
      'PerBIN No 02 Tahun 2020 tentang OTK STIN',

    tanggal:
      '2022-09-14',

    deskripsi:
      'Tentang PerBIN No 02 Tahun 2020 tentang OTK STIN',

    file:
      '/PerBIN No 02 Tahun 2020 tentang OTK STIN.pdf',

    fileAbstrak:
      '/PerBIN No 02 Tahun 2020 tentang OTK STIN-abstrak.pdf',

    views: 32,

    downloads: 32,

    tipeDokumen:
      'Peraturan',

    teu:
      'Badan Intelijen Negara',

    bentuk:
      'Peraturan',

    bentukSingkat:
      'PerBIN',

    tempatPenetapan:
      'Jakarta',

    tanggalPenetapan:
      '2020-02-10',

    tanggalPengundangan:
      '2020-02-15',

    tanggalBerlaku:
      '2020-02-15',

    sumber:
      'Badan Intelijen Negara',

    subjek:
      'Organisasi dan Tata Kerja STIN',

    status:
      'Berlaku',

    bahasa:
      'Indonesia',

    lokasi:
      'Jakarta',

    bidang:
      'Organisasi',

    terjemahan:
      'Tidak tersedia',

    abstrak: [
      'Peraturan ini mengatur organisasi dan tata kerja Sekolah Tinggi Intelijen Negara.',
      'Pengaturan meliputi susunan organisasi, kedudukan, tugas, fungsi, serta tata kerja unsur organisasi di lingkungan STIN.',
    ],

    catatan: [
      'Ketentuan mengenai organisasi dan tata kerja dilaksanakan sesuai dengan peraturan yang berlaku.',
    ],

    statusRelasi: [
      {
        aksi: 'STATUS',
        label: 'Berlaku',
      },
    ],

    peraturanTerkait: [
      {
        aksi: 'TERKAIT',
        label:
          'PerBIN No 01 Tahun 2020 Tentang Statuta STIN',
        href: '/produk-hukum/2',
      },
    ],

    peraturanPelaksanaan: [
      {
        aksi: 'PELAKSANAAN',
        label:
          'Ketentuan teknis mengenai pelaksanaan organisasi dan tata kerja STIN',
      },
    ],

    hasilUjiMateri: [],
  },

  /* ==========================================================
     DATA 4
  ========================================================== */

  {
    id: 4,

    jenis: 'Peraturan BIN',
    nomor: '04',
    tahun: '2011',

    judul:
      'Undang-Undang Nomor 17 Tahun 2011',

    tentang:
      'Undang-Undang Nomor 17 Tahun 2011',

    tanggal:
      '2022-09-14',

    deskripsi:
      'Tentang Undang-Undang Nomor 17 Tahun 2011',

    file:
      '/Undang-Undang Nomor 17 Tahun 2011.pdf',

    fileAbstrak:
      '/Undang-Undang Nomor 17 Tahun 2011-abstrak.pdf',

    views: 41,

    downloads: 20,

    tipeDokumen:
      'Undang-Undang',

    teu:
      'Republik Indonesia',

    bentuk:
      'Undang-Undang',

    bentukSingkat:
      'UU',

    tempatPenetapan:
      'Jakarta',

    tanggalPenetapan:
      '2011-10-31',

    tanggalPengundangan:
      '2011-10-31',

    tanggalBerlaku:
      '2011-10-31',

    sumber:
      'LN RI Tahun 2011 Nomor 105',

    subjek:
      'Intelijen Negara',

    status:
      'Berlaku',

    bahasa:
      'Indonesia',

    lokasi:
      'Jakarta',

    bidang:
      'Intelijen',

    terjemahan:
      'Tidak tersedia',

    abstrak: [
      'Undang-Undang ini mengatur mengenai penyelenggaraan intelijen negara.',
      'Pengaturan mencakup penyelenggaraan intelijen, kelembagaan intelijen, koordinasi, serta pengawasan terhadap penyelenggaraan intelijen negara.',
    ],

    catatan: [
      'Undang-Undang ini menjadi salah satu dasar hukum utama dalam penyelenggaraan intelijen negara.',
    ],

    statusRelasi: [
      {
        aksi: 'STATUS',
        label: 'Berlaku',
      },
    ],

    peraturanTerkait: [
      {
        aksi: 'TERKAIT',
        label:
          'PerBIN No 01 Tahun 2020 Tentang Statuta STIN',
        href: '/produk-hukum/2',
      },
      {
        aksi: 'TERKAIT',
        label:
          'PerBIN No 02 Tahun 2020 tentang OTK STIN',
        href: '/produk-hukum/3',
      },
    ],

    peraturanPelaksanaan: [
      {
        aksi: 'PELAKSANAAN',
        label:
          'Peraturan Pemerintah mengenai penyelenggaraan intelijen negara',
      },
    ],

    hasilUjiMateri: [
      {
        aksi: 'PUTUSAN',
        label:
          'Putusan Mahkamah Konstitusi terkait pengujian Undang-Undang Intelijen Negara',
      },
    ],
  },
]

/* ============================================================
   GET PRODUK HUKUM
============================================================ */

export function getProdukHukumById(
  id: number
): ProdukHukum | undefined {
  return produkHukum.find(
    (produk) => produk.id === id
  )
}