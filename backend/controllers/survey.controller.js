const surveyService = require("../services/survey.service");

// Admin: Ambil semua pertanyaan survey
const getAll = async (req, res) => {
  try {
    const { search = "", tipe = "layanan", page = 0, size = 10 } = req.query;
    const result = await surveyService.getAllPertanyaan({ search, tipe, page, size });
    return res.status(200).json({
      success: true,
      message: "Daftar pertanyaan survey berhasil diambil",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil daftar pertanyaan survey",
      error: error.message,
    });
  }
};

// Admin: Detail pertanyaan
const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await surveyService.getPertanyaanById(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Pertanyaan survey tidak ditemukan",
      });
    }
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail pertanyaan survey",
      error: error.message,
    });
  }
};

// Admin: Tambah pertanyaan survey
const create = async (req, res) => {
  try {
    const { pertanyaan, status = true, urutan = 0, tipe_survey = "layanan" } = req.body;
    if (!pertanyaan || !pertanyaan.trim()) {
      return res.status(400).json({
        success: false,
        message: "Pertanyaan survey wajib diisi",
      });
    }

    const data = await surveyService.createPertanyaan({ pertanyaan, status, urutan, tipe_survey });
    return res.status(201).json({
      success: true,
      message: "Pertanyaan survey berhasil ditambahkan",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan pertanyaan survey",
      error: error.message,
    });
  }
};

// Admin: Update pertanyaan survey
const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { pertanyaan, status, urutan, tipe_survey } = req.body;

    const data = await surveyService.updatePertanyaan(id, { pertanyaan, status, urutan, tipe_survey });
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Pertanyaan survey tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pertanyaan survey berhasil diperbarui",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui pertanyaan survey",
      error: error.message,
    });
  }
};

// Admin: Hapus pertanyaan survey
const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await surveyService.removePertanyaan(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Pertanyaan survey tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Pertanyaan survey berhasil dihapus",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus pertanyaan survey",
      error: error.message,
    });
  }
};

// Admin: Ambil data statistik dan grafik kepuasan user
const getStatistik = async (req, res) => {
  try {
    const { tipe = "layanan" } = req.query;
    const data = await surveyService.getStatistikGrafik(tipe);
    return res.status(200).json({
      success: true,
      message: "Statistik kepuasan layanan berhasil diambil",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil statistik survey",
      error: error.message,
    });
  }
};

// Public: Ambil pertanyaan aktif untuk modal survey di landing page
const getPublicPertanyaan = async (req, res) => {
  try {
    const { tipe = "layanan" } = req.query;
    const data = await surveyService.getActivePertanyaan(tipe);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil pertanyaan survey publik",
      error: error.message,
    });
  }
};

// Public: Simpan jawaban responden dari modal survey di landing page
const submitPublicJawaban = async (req, res) => {
  try {
    const { answers, dokumen_hukum_id = null } = req.body;

    const ip = req.headers["x-forwarded-for"] || req.socket.remoteAddress || "";
    const userAgent = req.headers["user-agent"] || "";

    if (Array.isArray(answers)) {
      for (const item of answers) {
        if (item.survey_pertanyaan_id && item.jawaban) {
          await surveyService.submitJawaban({
            survey_pertanyaan_id: item.survey_pertanyaan_id,
            jawaban: item.jawaban,
            dokumen_hukum_id: item.dokumen_hukum_id || dokumen_hukum_id || null,
            ip_address: ip,
            user_agent: userAgent,
          });
        }
      }
    } else if (req.body.survey_pertanyaan_id && req.body.jawaban) {
      await surveyService.submitJawaban({
        survey_pertanyaan_id: req.body.survey_pertanyaan_id,
        jawaban: req.body.jawaban,
        dokumen_hukum_id: req.body.dokumen_hukum_id || dokumen_hukum_id || null,
        ip_address: ip,
        user_agent: userAgent,
      });
    } else {
      return res.status(400).json({
        success: false,
        message: "Data jawaban survey tidak valid",
      });
    }

    return res.status(201).json({
      success: true,
      message: "Terima kasih atas partisipasi Anda dalam survey JDIH!",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menyimpan jawaban survey",
      error: error.message,
    });
  }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getStatistik,
  getPublicPertanyaan,
  submitPublicJawaban,
};
