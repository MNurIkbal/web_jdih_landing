const kontakRepository = require("../repositories/kontak.repository");

const createKontak = async (data) => {
  const { nama, email, subject, pesan } = data;

  if (!nama) {
    throw new Error("Nama wajib diisi");
  }

  if (!email) {
    throw new Error("Email wajib diisi");
  }

  if (!subject) {
    throw new Error("Subject wajib diisi");
  }

  if (!pesan) {
    throw new Error("Pesan wajib diisi");
  }

  return await kontakRepository.create({
    nama,
    email,
    subject,
    pesan,
  });
};

const getAllKontak = async ({
  search = "",
  page = 1,
  size = 10,
}) => {
  // Konversi ke number
  page = Number(page);
  size = Number(size);

  // Validasi page
  if (!Number.isInteger(page) || page < 1) {
    page = 1;
  }

  // Validasi size
  if (!Number.isInteger(size) || size < 1) {
    size = 10;
  }

  // Batasi maksimal size
  if (size > 100) {
    size = 100;
  }

  // Bersihkan search
  search = String(search || "").trim();

  const result = await kontakRepository.findAll({
    search,
    page,
    size,
  });

  const total = result.total;

  const totalPages = total > 0
    ? Math.ceil(total / size)
    : 0;

  return {
    data: result.data,

    pagination: {
      page,
      size,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrevious: page > 1 && totalPages > 0,
    },
  };
};

const removeById = async (id) => {
  if (!id) {
    throw new Error("ID kontak wajib diisi");
  }

  const kontak = await kontakRepository.removeById(id);

  if (!kontak) {
    throw new Error("Kontak tidak ditemukan");
  }

  return kontak;
};
module.exports = {
  createKontak,
  getAllKontak,
  removeById
};