/**
 * Fallback response generator untuk fitur AI Chat JDIH jika backend ACS mengalami kendala/error/offline.
 * Jawaban dipetakan secara cerdas berdasarkan pertanyaan pengguna agar selalu nyambung dan kontekstual.
 */

interface FallbackRule {
  keywords: string[];
  // function to generate response with markdown formatting matching JDIH theme
  answer: string;
}

const fallbackRules: FallbackRule[] = [
  // 1. Dasar hukum / Kewenangan BIN
  {
    keywords: [
      "dasar hukum",
      "kewenangan bin",
      "tugas bin",
      "fungsi bin",
      "tugas pokok",
      "peran bin",
      "kedudukan bin",
    ],
    answer: `Berdasarkan ketentuan hukum yang berlaku di Indonesia, dasar hukum utama mengenai kedudukan, tugas, dan kewenangan **Badan Intelijen Negara (BIN)** adalah:

1. **Undang-Undang Nomor 17 Tahun 2011 tentang Intelijen Negara**
   - Menetapkan BIN sebagai alat negara yang menyelenggarakan fungsi intelijen negara di dalam maupun luar negeri.
   - Mengatur wewenang BIN sebagai koordinator penyelenggara intelijen negara (intelijen kementerian, TNI, Polri, dan kejaksaan).

2. **Peraturan Presiden Nomor 90 Tahun 2012** (beserta perubahannya)
   - Mengatur susunan organisasi, tata kerja, serta kedudukan Badan Intelijen Negara yang berada langsung di bawah dan bertanggung jawab kepada Presiden.

3. **Peraturan perundang-undangan operasional BIN** terkait administrasi kepegawaian, pengamanan intelijen, serta penyelenggaraan pendidikan kedinasan.`,
  },

  // 2. UU No 17 Tahun 2011 / UU Intelijen Negara
  {
    keywords: [
      "uu 17",
      "uu no 17",
      "uu intelijen",
      "undang-undang intelijen",
      "17 tahun 2011",
      "undang-undang nomor 17",
    ],
    answer: `**Undang-Undang Nomor 17 Tahun 2011 tentang Intelijen Negara** merupakan regulasi payung hukum tertinggi bagi aktivitas intelijen di Indonesia.

Poin-poin penting dalam UU No. 17 Tahun 2011:
- **Tujuan Intelijen Negara**: Mendeteksi, mengidentifikasi, menilai, menganalisis, serta menyajikan intelijen sebagai peringatan dini (*early warning*) guna menjaga keamanan dan kedaulatan NKRI.
- **Kedudukan BIN**: Badan Intelijen Negara diposisikan sebagai lini terdepan (*first line of defense*) dan koordinator komunitas intelijen nasional.
- **Ruang Lingkup Kegiatan**: Penyelidikan, pengamanan, dan penggalangan intelijen dengan menjunjung tinggi norma hukum dan hak asasi manusia.
- **Kode Etik & Pengawasan**: Diatur mekanisme pengawasan internal dan pengawasan eksternal oleh Dewan Perwakilan Rakyat (DPR RI).`,
  },

  // 3. Perpres 90 Tahun 2012
  {
    keywords: [
      "perpres 90",
      "perpres no 90",
      "90 tahun 2012",
      "peraturan presiden nomor 90",
    ],
    answer: `**Peraturan Presiden Nomor 90 Tahun 2012 tentang Badan Intelijen Negara**:

- **Status & Kedudukan**: Mengatur bahwa BIN dipimpin oleh seorang Kepala BIN yang berkedudukan di bawah dan bertanggung jawab langsung kepada Presiden.
- **Tugas Pokok**: Melaksanakan tugas pemerintahan di bidang intelijen sesuai dengan ketentuan peraturan perundang-undangan.
- **Struktur Organisasi**: Menetapkan struktur deputi-deputi bidang (antara lain Luar Negeri, Dalam Negeri, Kontra Intelijen, Intelijen Ekonomi, Intelijen Teknologi, Intelijen Siber, dan Pengolahan Informasi).`,
  },

  // 4. STIN (Sekolah Tinggi Intelijen Negara)
  {
    keywords: [
      "stin",
      "statuta stin",
      "sekolah tinggi intelijen",
      "otk stin",
      "taruna stin",
      "pendidikan stin",
    ],
    answer: `Terkait **Sekolah Tinggi Intelijen Negara (STIN)**, terdapat sejumlah regulasi utama yang tercatat di JDIH:

1. **PerBIN No. 01 Tahun 2020 tentang Statuta STIN**
   - Menjadi pedoman dasar penyelenggaraan Tridharma Perguruan Tinggi (pendidikan, penelitian, dan pengabdian kepada masyarakat) di lingkungan STIN.
   - Mengatur sistem akademik, kebebasan mimbar akademik, dan tata kelola perguruan tinggi kedinasan intelijen.

2. **PerBIN No. 02 Tahun 2020 tentang Organisasi dan Tata Kerja (OTK) STIN**
   - Mengatur struktur kepemimpinan, unit pelaksana akademik, pembinaan taruna, serta tata kerja penyelenggaraan pendidikan intelijen negara.`,
  },

  // 5. Informasi tentang JDIH BIN / Apa itu JDIH
  {
    keywords: [
      "apa itu jdih",
      "tentang jdih",
      "layanan jdih",
      "fungsi jdih",
      "portal jdih",
      "jdih bin",
      "jaringan dokumentasi",
    ],
    answer: `**JDIH (Jaringan Dokumentasi dan Informasi Hukum) BIN** adalah wadah resmi pendataan, dokumentasi, dan penyebarluasan peraturan perundang-undangan serta informasi hukum di lingkungan Badan Intelijen Negara.

Melalui portal JDIH ini, Anda dapat:
- Mencari dan mengunduh peraturan perundang-undangan (Undang-Undang, Perpres, Peraturan BIN / PerBIN).
- Mengetahui status keberlakuan suatu peraturan (Berlaku / Dicabut / Mengubah).
- Membaca abstrak, ringkasan, dan relasi peraturan terkait.
- Mengakses informasi hukum intelijen secara transparan dan akuntabel sesuai peraturan keterbukaan informasi.`,
  },

  // 6. Pertahanan dan Keamanan Negara / Keamanan Nasional
  {
    keywords: [
      "pertahanan",
      "keamanan nasional",
      "kamnas",
      "sistem pertahanan",
      "ancaman",
      "peringatan dini",
      "early warning",
    ],
    answer: `Dalam sistem pertahanan dan keamanan nasional, Intelijen Negara berperan sebagai **lini terdepan pertahanan nasional (*the first line of defense*)**:

- **Fungsi Peringatan Dini**: Memberikan masukan intelijen yang cepat, akurat, dan terpercaya kepada Presiden selaku pengambil keputusan tertinggi guna menangkal ancaman non-militer maupun militer.
- **Deteksi Dini (*Early Detection*)**: Mengidentifikasi potensi ancaman terhadap ideologi, politik, ekonomi, sosial, budaya, pertahanan, serta keamanan nasional.
- **Sinergi Antar Lembaga**: Mengoordinasikan seluruh intelijen kementerian/lembaga negara untuk menjaga keutuhan Negara Kesatuan Republik Indonesia (NKRI).`,
  },

  // 7. Pengunduhan / Cara mencari dokumen hukum
  {
    keywords: [
      "cara unduh",
      "cara download",
      "mencari peraturan",
      "cari dokumen",
      "download peraturan",
      "dokumen hukum",
    ],
    answer: `Untuk mencari dan mengunduh produk hukum di portal JDIH:

1. Kunjungi menu **Produk Hukum / Dokumen Hukum** pada navigasi utama.
2. Gunakan kolom pencarian dengan memasukkan kata kunci judul, nomor, atau tahun peraturan.
3. Anda dapat memfilter berdasarkan jenis peraturan (seperti *Peraturan BIN*, *Peraturan Presiden*, atau *Undang-Undang*).
4. Klik pada judul peraturan untuk melihat detail metadata, abstrak, dan klik tombol **Unduh Dokumen** untuk mengunduh naskah resmi dalam format PDF.`,
  },

  // 8. Pasal / Ketentuan / Sanksi / Kerahasiaan
  {
    keywords: [
      "rahasia",
      "kerahasiaan",
      "sanksi",
      "pasal",
      "larangan",
      "pembocoran",
    ],
    answer: `Berdasarkan ketentuan **UU No. 17 Tahun 2011 tentang Intelijen Negara**:

- **Prinsip Kerahasiaan**: Informasi intelijen merupakan rahasia negara yang dilindungi undang-undang untuk menjaga kepentingan pertahanan dan keamanan nasional.
- **Kewajiban Personel**: Setiap personel intelijen diwajibkan menjaga kerahasiaan informasi intelijen yang diperolehnya bahkan setelah purnatugas.
- **Ketentuan Pidana**: Setiap orang atau pihak yang secara melawan hukum membocorkan rahasia intelijen dapat dikenakan sanksi pidana penjara dan denda sebagaimana diatur dalam Bab Ketentuan Pidana UU No. 17 Tahun 2011.`,
  },
];

/**
 * Menghasilkan jawaban fallback cerdas yang relevan dengan pertanyaan user
 */
export function getSmartFallbackResponse(userMessage: string): string {
  const normalized = userMessage.toLowerCase().trim();

  // 1. Cari kecocokan rule berdasarkan kata kunci terbanyak atau paling relevan
  let bestMatch: { rule: FallbackRule; score: number } | null = null;

  for (const rule of fallbackRules) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (normalized.includes(kw)) {
        score += kw.length; // Bobot lebih tinggi untuk kata kunci yang lebih spesifik/panjang
      }
    }

    if (score > 0 && (!bestMatch || score > bestMatch.score)) {
      bestMatch = { rule, score };
    }
  }

  if (bestMatch) {
    return bestMatch.rule.answer;
  }

  // 2. Jika tidak ada keyword spesifik di atas tapi konteksnya pertanyaan hukum/peraturan umum
  if (
    normalized.includes("peraturan") ||
    normalized.includes("regulasi") ||
    normalized.includes("aturan") ||
    normalized.includes("hukum")
  ) {
    return `Terkait pertanyaan mengenai regulasi dan hukum di lingkungan **Badan Intelijen Negara**:

Dokumen hukum yang dihimpun pada sistem JDIH ini meliputi:
- **Undang-Undang Nomor 17 Tahun 2011 tentang Intelijen Negara**
- **Peraturan Presiden Nomor 90 Tahun 2012** tentang BIN
- **Peraturan Badan Intelijen Negara (PerBIN)** seperti Statuta dan OTK STIN, serta ketentuan teknis kelembagaan lainnya.

Anda dapat menanyakan nomor peraturan, tahun pengundangan, atau subjek spesifik yang ingin ditelusuri lebih lanjut.`;
  }

  // 3. Jawaban umum yang tetap profesional, formal, dan nyambung dengan domain JDIH
  return `Terima kasih atas pertanyaan Anda seputar regulasi dan informasi hukum di **JDIH Badan Intelijen Negara**.

Sistem saat ini merekomendasikan referensi hukum berikut yang dapat Anda telaah:
1. **UU No. 17 Tahun 2011 tentang Intelijen Negara** — Dasar hukum penyelenggaraan intelijen, wewenang, dan kode etik.
2. **Perpres No. 90 Tahun 2012 tentang BIN** — Kedudukan, tugas, fungsi, dan susunan organisasi Badan Intelijen Negara.
3. **Peraturan BIN (PerBIN)** — Regulasi operasional, kepegawaian, dan akademik (STIN).

Silakan ajukan pertanyaan yang lebih spesifik mengenai nomor peraturan, tahun, atau topik yang Anda perlukan.`;
}
