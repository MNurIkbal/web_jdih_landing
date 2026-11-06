export interface ProdukHukum {
  id: string
  tipe: string
  nomor: string
  tentang: string
  judul: string
  bidang: string
  tanggal: string
  views: number
  downloads: number
}

export const produkHukum: ProdukHukum[] = [
  {
    id: 'uu-17-2011',
    tipe: 'Undang-Undang',
    nomor: 'UU No. 17 Tahun 2011',
    tentang: 'Intelijen Negara',
    judul: 'Dasar hukum penyelenggaraan intelijen negara di wilayah NKRI',
    bidang: 'Pertahanan & Keamanan',
    tanggal: '2011-10-26',
    views: 15230,
    downloads: 4310,
  },
  {
    id: 'perpres-90-2021',
    tipe: 'Peraturan Presiden',
    nomor: 'Perpres No. 90 Tahun 2021',
    tentang: 'Perubahan atas Organisasi BIN',
    judul: 'Penataan struktur kelembagaan Badan Intelijen Negara',
    bidang: 'Kelembagaan',
    tanggal: '2021-10-01',
    views: 9840,
    downloads: 2670,
  },
  {
    id: 'uu-14-2008',
    tipe: 'Undang-Undang',
    nomor: 'UU No. 14 Tahun 2008',
    tentang: 'Keterbukaan Informasi Publik',
    judul: 'Hak akses informasi publik bagi masyarakat',
    bidang: 'Administrasi Negara',
    tanggal: '2008-04-30',
    views: 21110,
    downloads: 6042,
  },
  {
    id: 'perka-3-2020',
    tipe: 'Peraturan Kepala BIN',
    nomor: 'Perka No. 3 Tahun 2020',
    tentang: 'Organisasi dan Tata Kerja',
    judul: 'Susunan unit kerja internal Badan Intelijen Negara',
    bidang: 'Kelembagaan',
    tanggal: '2020-02-14',
    views: 5310,
    downloads: 1280,
  },
  {
    id: 'uu-30-2014',
    tipe: 'Undang-Undang',
    nomor: 'UU No. 30 Tahun 2014',
    tentang: 'Administrasi Pemerintahan',
    judul: 'Tata kelola keputusan dan tindakan administratif pemerintahan',
    bidang: 'Administrasi Negara',
    tanggal: '2014-10-17',
    views: 12870,
    downloads: 3190,
  },
  {
    id: 'perpres-67-2001',
    tipe: 'Peraturan Presiden',
    nomor: 'Perpres No. 67 Tahun 2001',
    tentang: 'Badan Intelijen Negara',
    judul: 'Pembentukan dan kedudukan kelembagaan BIN',
    bidang: 'Kelembagaan',
    tanggal: '2001-08-23',
    views: 7420,
    downloads: 1890,
  },
]