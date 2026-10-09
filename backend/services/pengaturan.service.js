const pengaturanRepository = require("../repositories/pengaturan.repository");

const getOne = async () => {
  const data = await pengaturanRepository.getOne();

  if (!data) {
    throw new Error("Data pengaturan tidak ditemukan");
  }

  return data;
};

const update = async (id, data) => {
  const parsedId = Number(id);

  if (!Number.isInteger(parsedId) || parsedId <= 0) {
    throw new Error("ID pengaturan tidak valid");
  }

  const result = await pengaturanRepository.update(parsedId, {
    struktur_organisasi: data.struktur_organisasi,
    tentang: data.tentang,
    sejarah: data.sejarah,
    dasar_hukum: data.dasar_hukum,
    jdih_perwakilan: data.jdih_perwakilan,
    alamat: data.alamat,
    no_hp: data.no_hp,
    email: data.email,
  });

  if (!result) {
    throw new Error("Data pengaturan tidak ditemukan");
  }

  return result;
};

const getSummary = async () => {
  const result = await pengaturanRepository.getSummary();
  return {
    dokumen: {
      total: Number(result.dokumen.total) || 0,
      keputusan: Number(result.dokumen.keputusan) || 0,
      peraturan: Number(result.dokumen.peraturan) || 0,
      perundang_undangan: Number(result.dokumen.perundang_undangan) || 0,
    },
    berita: { total: Number(result.berita.total) || 0 },
  };
};

const getDokumenSummaryService = async () => {
  const data = await pengaturanRepository.getDokumenSummaryKategori();

  const total = data.reduce(
    (sum, item) => sum + Number(item.total),
    0
  );

  return {
    total,
    tahun: data.map((item) => ({
      tahun: item.tahun,
      total: Number(item.total),
    })),
  };
};
module.exports = {
  getOne,
  update,
  getDokumenSummaryService,
  getSummary,
};
