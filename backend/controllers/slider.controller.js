const sliderService = require("../services/slider.service");

/**
 * GET ALL
 */
/**
 * GET ALL
 * SEARCH + PAGINATION
 */
const getAll = async (req, res) => {
  try {
    const { search = "", page = 1, size = 10 } = req.query;

    const result = await sliderService.getAll({
      search,
      page,
      size,
    });

    return res.status(200).json({
      success: true,
      message: "Data slider berhasil diambil",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data slider",
      error: error.message,
    });
  }
};

/**
 * GET BY ID
 */
const getById = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await sliderService.getById(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data slider tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Data slider berhasil diambil",
      data,
    });
  } catch (error) {
    

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail slider",
      error: error.message,
    });
  }
};

/**
 * CREATE
 */
const create = async (req, res) => {
  try {
    const { judul, keterangan, status } = req.body;


    if (!judul || judul.trim() === "") {
      if (req.file) {
        sliderService.removeUploadedImage(req.file.filename);
      }

      return res.status(400).json({
        success: false,
        message: "Judul wajib diisi",
      });
    }

    // ==========================================
    // VALIDASI KETERANGAN
    // ==========================================

    if (!keterangan || keterangan.trim() === "") {
      if (req.file) {
        sliderService.removeUploadedImage(req.file.filename);
      }

      return res.status(400).json({
        success: false,
        message: "Keterangan wajib diisi",
      });
    }

    // ==========================================
    // VALIDASI GAMBAR
    // ==========================================

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "Gambar wajib diupload",
      });
    }

    // ==========================================
    // CREATE
    // ==========================================

    const data = await sliderService.create({
      judul,
      keterangan,
      status: status === "true" || status === true,
      gambar: req.file.filename,
    });

    return res.status(201).json({
      success: true,
      message: "Slider berhasil ditambahkan",
      data,
    });
  } catch (error) {
    

    // ==========================================
    // HAPUS FILE JIKA DATABASE GAGAL
    // ==========================================

    if (req.file) {
      sliderService.removeUploadedImage(req.file.filename);
    }

    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan slider",
      error: error.message,
    });
  }
};

/**
 * UPDATE
 */
const update = async (req, res) => {
  try {
    const { id } = req.params;

    const { judul, keterangan, status } = req.body;

    // Validasi judul
    if (!judul || judul.trim() === "") {
      if (req.file) {
        sliderService.removeUploadedImage(req.file.filename);
      }

      return res.status(400).json({
        success: false,
        message: "Judul wajib diisi",
      });
    }

    // Validasi keterangan
    if (!keterangan || keterangan.trim() === "") {
      if (req.file) {
        sliderService.removeUploadedImage(req.file.filename);
      }

      return res.status(400).json({
        success: false,
        message: "Keterangan wajib diisi",
      });
    }

    const data = await sliderService.update(id, {
      judul,
      keterangan,
      status,
      gambar: req.file ? req.file.filename : null,
    });

    if (!data) {
      if (req.file) {
        sliderService.removeUploadedImage(req.file.filename);
      }

      return res.status(404).json({
        success: false,
        message: "Data slider tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Slider berhasil diperbarui",
      data,
    });
  } catch (error) {

    if (req.file) {
      sliderService.removeUploadedImage(req.file.filename);
    }

    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui slider",
      error: error.message,
    });
  }
};

/**
 * DELETE
 */
const remove = async (req, res) => {
  try {
    const { id } = req.params;

    const data = await sliderService.remove(id);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data slider tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Slider berhasil dihapus",
    });
  } catch (error) {
    

    return res.status(500).json({
      success: false,
      message: "Gagal menghapus slider",
      error: error.message,
    });
  }
};

const getResult = async (req, res) => {
  try {
    const data = await sliderService.getRessult();

    return res.status(200).json({
      success: true,
      message: "Data slider berhasil diambil",
      data,
    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data slider",
      error: error.message,
    });
  }
};



module.exports = {
  getAll,
  getById,
  create,
  update,
  getResult,
  remove,
};
