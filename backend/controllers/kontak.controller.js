const kontakService = require("../services/kontak.service");

const create = async (req, res) => {
  try {
    const data = await kontakService.createKontak(req.body);

    return res.status(201).json({
      success: true,
      message: "Pesan berhasil dikirim",
      data,
    });
  } catch (error) {
    

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

const findAll = async (req, res) => {
  try {
    const {
      search = "",
      page = 1,
      size = 10,
    } = req.query;

    const result = await kontakService.getAllKontak({
      search,
      page,
      size,
    });

    return res.status(200).json({
      success: true,
      message: "Data kontak berhasil diambil",
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    

    return res.status(500).json({
      success: false,
      message: "Gagal mengambil data kontak",
      error: error.message,
    });
  }
};

const removeById = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await kontakService.removeById(id);

    return res.status(200).json({
      success: true,
      message: "Kontak berhasil dihapus",
      data: result,
    });
  } catch (error) {
    console.error("DELETE KONTAK ERROR:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  create,
  findAll,
  removeById
};