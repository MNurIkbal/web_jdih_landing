const galeriService = require("../services/galeri.service");

const getAll = async (req, res) => {
  try {
    const { search = "", page = 1, size = 10 } = req.query;
    const result = await galeriService.getAll({ search, page, size });
    return res.status(200).json({
      success: true,
      message: "Data galeri berhasil diambil",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data galeri",
      error: error.message,
    });
  }
};

const getPublished = async (req, res) => {
  try {
    const { page = 0, size = 10, limit, search = "" } = req.query;
    const result = await galeriService.getPublished({
      page,
      size: size || limit || 10,
      limit,
      search,
    });
    return res.status(200).json({
      success: true,
      message: "Data galeri publik berhasil diambil",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil galeri publik",
      error: error.message,
    });
  }
};

const getById = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await galeriService.getById(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data galeri tidak ditemukan",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Data galeri berhasil diambil",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil detail galeri",
      error: error.message,
    });
  }
};

const create = async (req, res) => {
  try {
    const { judul = "", keterangan = "", status = true } = req.body;

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "File foto wajib diunggah",
      });
    }

    const data = await galeriService.create({
      judul,
      keterangan,
      media_url: req.file.filename,
      status,
    });

    return res.status(201).json({
      success: true,
      message: "Foto galeri berhasil ditambahkan",
      data,
    });
  } catch (error) {
    if (req.file) galeriService.deleteFile(req.file.filename);
    return res.status(500).json({
      success: false,
      message: "Gagal menambahkan foto galeri",
      error: error.message,
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { judul, keterangan, status } = req.body;

    const data = await galeriService.update(id, {
      judul,
      keterangan,
      media_url: req.file ? req.file.filename : undefined,
      status,
    });

    if (!data) {
      if (req.file) galeriService.deleteFile(req.file.filename);
      return res.status(404).json({
        success: false,
        message: "Data galeri tidak ditemukan",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Foto galeri berhasil diperbarui",
      data,
    });
  } catch (error) {
    if (req.file) galeriService.deleteFile(req.file.filename);
    return res.status(500).json({
      success: false,
      message: "Gagal memperbarui galeri",
      error: error.message,
    });
  }
};

const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await galeriService.remove(id);
    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Data galeri tidak ditemukan",
      });
    }
    return res.status(200).json({
      success: true,
      message: "Foto galeri berhasil dihapus",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Gagal menghapus galeri",
      error: error.message,
    });
  }
};

module.exports = {
  getAll,
  getPublished,
  getById,
  create,
  update,
  remove,
};
