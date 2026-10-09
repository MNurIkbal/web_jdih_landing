const pengaturanService = require("../services/pengaturan.service");

const getOne = async (req, res) => {
  try {
    const data = await pengaturanService.getOne();

    return res.status(200).json({
      success: true,
      message: "Data pengaturan berhasil diambil",
      data,
    });
  } catch (error) {
    

    return res.status(500).json({
      success: false,
      message: error.message || "Gagal mengambil data pengaturan",
      data: null,
    });
  }
};

const update = async (req, res) => {
  try {
    const { id } = req.params;

    if (!req.body || Object.keys(req.body).length === 0) {
      return res.status(400).json({
        success: false,
        message: "Request body tidak boleh kosong",
        data: null,
      });
    }

    const result = await pengaturanService.update(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Data pengaturan berhasil diperbarui",
      data: result,
    });
  } catch (error) {
    

    if (error.message === "ID pengaturan tidak valid") {
      return res.status(400).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    if (error.message === "Data pengaturan tidak ditemukan") {
      return res.status(404).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Gagal memperbarui data pengaturan",
      data: null,
    });
  }
};
const getSummary = async (req, res) => {
  try {
    const data = await pengaturanService.getSummary();
    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil summary pengaturan",
      data,
    });
  } catch (error) {
    
    return res.status(500).json({
      success: false,
      message: "Gagal mengambil summary pengaturan",
      data: null,
    });
  }
};

const getDokumenSummaryController = async (req, res) => {
  try {
    const data = await pengaturanService.getDokumenSummaryService();

    return res.status(200).json({
      success: true,
      message: "Berhasil mengambil summary dokumen",
      data,
    });
  } catch (error) {
    

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil summary dokumen",
      data: null,
    });
  }
};

module.exports = {
  getOne,
  update,
  getDokumenSummaryController,
  getSummary,
};
