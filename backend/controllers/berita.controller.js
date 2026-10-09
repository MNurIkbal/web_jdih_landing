const beritaService = require("../services/berita.service");

/**
 * Helper untuk menghapus file upload
 */
const removeUploadedFile = (req) => {
  if (req.file) {
    beritaService.removeUploadedImage(req.file.filename);
  }
};

/**
 * Convert status ke boolean
 *
 * true:
 * - true
 * - "true"
 * - "1"
 * - 1
 *
 * false:
 * - false
 * - "false"
 * - "0"
 * - 0
 */
const parseStatus = (status, defaultValue = true) => {
  if (status === undefined || status === null || status === "") {
    return defaultValue;
  }

  return status === true || status === "true" || status === "1" || status === 1;
};

/**
 * GET ALL BERITA
 * SEARCH + PAGINATION
 */
const getAll = async (req, res) => {
  try {
    const { search = "", page = 1, size = 10 } = req.query;

    const result = await beritaService.getAll({
      search,
      page,
      size,
    });

    return res.status(200).json({
      success: true,

      message: "Data berita berhasil diambil",

      data: result.data,

      pagination: result.pagination,
    });
  } catch (error) {

    return res.status(500).json({
      success: false,

      message: "Gagal mengambil data berita",

      error: error.message,
    });
  }
};

/**
 * GET BERITA BY ID
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await beritaService.getById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data berita tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data berita berhasil diambil",
      data,
    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail berita",
      error: error.message,
    });
  }
};

/**
 * CREATE BERITA
 */
const create = async (req, res) => {
  try {
    const { judul, kategori, tanggal_berita, penulis, isi_berita, status } =
      req.body;

    // =========================
    // VALIDASI JUDUL
    // =========================

    if (!judul || judul.trim() === "") {
      removeUploadedFile(req);

      return res.status(400).json({
        success: false,
        message: "Judul wajib diisi",
      });
    }

    // =========================
    // VALIDASI KATEGORI
    // =========================

    if (!kategori || kategori.trim() === "") {
      removeUploadedFile(req);

      return res.status(400).json({
        success: false,
        message: "Kategori wajib diisi",
      });
    }

    // =========================
    // VALIDASI TANGGAL
    // =========================

    if (!tanggal_berita || tanggal_berita.trim() === "") {
      removeUploadedFile(req);

      return res.status(400).json({
        success: false,
        message: "Tanggal berita wajib diisi",
      });
    }

    // =========================
    // VALIDASI PENULIS
    // =========================

    if (!penulis || penulis.trim() === "") {
      removeUploadedFile(req);

      return res.status(400).json({
        success: false,
        message: "Penulis wajib diisi",
      });
    }

    // =========================
    // VALIDASI ISI BERITA
    // =========================

    if (!isi_berita || isi_berita.trim() === "") {
      removeUploadedFile(req);

      return res.status(400).json({
        success: false,
        message: "Isi berita wajib diisi",
      });
    }

    // =========================
    // VALIDASI GAMBAR
    // =========================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Gambar wajib diupload",
      });
    }

    // =========================
    // STATUS
    // =========================

    const statusValue = parseStatus(status, true);

    // =========================
    // CREATE
    // =========================

    const data = await beritaService.create({
      judul: judul.trim(),

      kategori: kategori.trim(),

      tanggal_berita: tanggal_berita.trim(),

      penulis: penulis.trim(),

      gambar: req.file.filename,

      isi_berita: isi_berita.trim(),

      status: statusValue,
    });

    return res.status(201).json({
      success: true,
      message: "Berita berhasil ditambahkan",
      data,
    });
  } catch (error) {

    // Hapus gambar jika proses gagal
    removeUploadedFile(req);

    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan berita",
      error: error.message,
    });
  }
};

/**
 * UPDATE BERITA
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;

    const { judul, kategori, tanggal_berita, penulis, isi_berita, status } =
      req.body;

    // =========================
    // VALIDASI JUDUL
    // =========================

    if (!judul || judul.trim() === "") {
      removeUploadedFile(req);

      return res.status(400).json({
        success: false,
        message: "Judul wajib diisi",
      });
    }

    // =========================
    // VALIDASI KATEGORI
    // =========================

    if (!kategori || kategori.trim() === "") {
      removeUploadedFile(req);

      return res.status(400).json({
        success: false,
        message: "Kategori wajib diisi",
      });
    }

    // =========================
    // VALIDASI TANGGAL
    // =========================

    if (!tanggal_berita || tanggal_berita.trim() === "") {
      removeUploadedFile(req);

      return res.status(400).json({
        success: false,
        message: "Tanggal berita wajib diisi",
      });
    }

    // =========================
    // VALIDASI PENULIS
    // =========================

    if (!penulis || penulis.trim() === "") {
      removeUploadedFile(req);

      return res.status(400).json({
        success: false,
        message: "Penulis wajib diisi",
      });
    }

    // =========================
    // VALIDASI ISI BERITA
    // =========================

    if (!isi_berita || isi_berita.trim() === "") {
      removeUploadedFile(req);

      return res.status(400).json({
        success: false,
        message: "Isi berita wajib diisi",
      });
    }

    // =========================
    // STATUS
    // =========================

    const statusValue = parseStatus(status, true);

    // =========================
    // UPDATE
    // =========================
    const updateData = {
      judul: judul.trim(),
      kategori: kategori.trim(),
      tanggal_berita: tanggal_berita.trim(),
      penulis: penulis.trim(),
      isi_berita: isi_berita.trim(),
      status: statusValue,
    };

    // Hanya kirim gambar jika user upload gambar baru
    if (req.file) {
      updateData.gambar = req.file.filename;
    }
    const data = await beritaService.update(id, updateData);

    if (!data) {
      removeUploadedFile(req);

      return res.status(404).json({
        success: false,
        message: "Data berita tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Berita berhasil diperbarui",
      data,
    });
  } catch (error) {

    // Hapus gambar baru jika update gagal
    removeUploadedFile(req);

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui berita",
      error: error.message,
    });
  }
};

/**
 * DELETE BERITA
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await beritaService.remove(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data berita tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Berita berhasil dihapus",
    });
  } catch (error) {
    

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus berita",
      error: error.message,
    });
  }
};
const getWebList = async (req, res) => {
  try {
    const data = await beritaService.getWebList();

    return res.status(200).json({
      success: true,
      message: "Data berita berhasil diambil",
      data,
    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data berita",
      error: error.message,
    });
  }
};

const getWebListController = async (req, res) => {
  try {
    const { page = 1, size = 10 } = req.query;

    const result = await beritaService.getWebListPaginationService({
      page,
      size,
    });

    return res.status(200).json({
      success: true,
      message: "Data berita berhasil diambil",
      data: result,
    });
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

const getLatest = async (req, res) => {
    try {
        const data = await beritaService.getLatestBerita();

        return res.status(200).json({
            success: true,
            message: "Data berita berhasil diambil",
            data,
        });
    } catch (error) {
        console.error("GET LATEST BERITA ERROR:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Terjadi kesalahan pada server",
        });
    }
};

const incrementViews = async (req, res) => {
    try {
        const { id } = req.params;

        const cookieName = `berita_viewed_${id}`;

        if (req.cookies && req.cookies[cookieName]) {
            return res.status(200).json({
                success: true,
                updated: false,
                message: "Views sudah dihitung sebelumnya",
            });
        }

        const result = await beritaService.incrementViews(id);

        if (!result) {
            return res.status(404).json({
                success: false,
                message: "Berita tidak ditemukan",
            });
        }

        // Cookie 5 jam
        res.cookie(cookieName, "1", {
            maxAge: 5 * 60 * 60 * 1000,
            httpOnly: true,
            sameSite: "lax",
            secure: false, // localhost
        });

        return res.status(200).json({
            success: true,
            updated: true,
            data: result,
        });

    } catch (error) {
        console.error("UPDATE VIEWS ERROR:", error);

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getOtherBerita = async (req, res) => {
    try {
        const { id } = req.params;

        const data = await beritaService.getOtherBerita(id);

        return res.status(200).json({
            success: true,
            message: "5 berita lainnya berhasil diambil",
            data,
        });

    } catch (error) {
        console.error("GET OTHER BERITA ERROR:", error);

        return res.status(error.statusCode || 500).json({
            success: false,
            message: error.message || "Gagal mengambil berita lainnya",
        });
    }
};

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  getWebList,
  getWebListController,
  getLatest,
  incrementViews,
  getOtherBerita
};
