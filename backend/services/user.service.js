const bcrypt = require("bcrypt");

const userRepository = require("../repositories/user.repository");


// ============================================================
// GET ALL
// ============================================================


const getAll = async ({
    search = "",
    page = 1,
    size = 10,
} = {}) => {
    page = Number(page);
    size = Number(size);

    if (
        !Number.isInteger(page) ||
        page < 1
    ) {
        page = 1;
    }

    if (
        !Number.isInteger(size) ||
        size < 1
    ) {
        size = 10;
    }

    if (size > 100) {
        size = 100;
    }

    const result =
        await userRepository.findAll({
            search,
            page,
            size,
        });

    const backendUrl =
        process.env.APP_BACKEND_URL ||
        "https://jdih-be.asiasistem.com";

    const imageBaseUrl =
        `${backendUrl.replace(/\/$/, "")}/uploads/users`;

    const data = result.data.map(
        (item) => ({
            ...item,

            foto: item.foto
                ? `${imageBaseUrl}/${item.foto}`
                : null,
        })
    );

    const totalPages = Math.ceil(
        result.total / size
    );

    return {
        data,

        pagination: {
            page,
            size,
            total: result.total,
            totalPages,
        },
    };
};


// ============================================================
// GET BY ID
// ============================================================

const getById = async (id) => {

    const user = await userRepository.findById(id);

    if (!user) {
        throw new Error("User tidak ditemukan");
    }

    return user;
};


const create = async ({
    nama,
    email,
    password,
    role = "USER",
    foto = null,
}) => {

    if (!nama) {
        throw new Error("Nama wajib diisi");
    }

    if (!email) {
        throw new Error("Email wajib diisi");
    }

    if (!password) {
        throw new Error("Password wajib diisi");
    }

    const existingUser =
        await userRepository.findByEmail(email);

    if (existingUser) {
        throw new Error("Email sudah digunakan");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
        password,
        12
    );

    return await userRepository.create({
        nama,
        email,
        password: hashedPassword,
        role,
        foto,
    });
};



const update = async (
    id,
    {
        nama,
        email,
        foto,
    }
) => {
    const existingUser =
        await userRepository.findById(id);

    if (!existingUser) {
        throw new Error(
            "User tidak ditemukan"
        );
    }

    if (!nama || !nama.trim()) {
        throw new Error(
            "Nama wajib diisi"
        );
    }

    if (!email || !email.trim()) {
        throw new Error(
            "Email wajib diisi"
        );
    }

    const emailUser =
        await userRepository.findByEmail(
            email
        );

    if (
        emailUser &&
        Number(emailUser.id) !== Number(id)
    ) {
        throw new Error(
            "Email sudah digunakan oleh user lain"
        );
    }

    return await userRepository.update(
        id,
        {
            nama: nama.trim(),
            email: email.trim(),

            foto:
                foto ||
                existingUser.foto,
        }
    );
};


const remove = async (id) => {

    const user =
        await userRepository.findById(id);

    if (!user) {
        throw new Error("User tidak ditemukan");
    }

    await userRepository.softDelete(id);

    return {
        message: "User berhasil dihapus",
    };
};

const updatePassword = async (id, password) => {
  if (!id) {
    throw new Error("ID user wajib diisi");
  }

  if (!password || password.trim() === "") {
    throw new Error("Password wajib diisi");
  }

  if (password.length < 6) {
    throw new Error("Password minimal 6 karakter");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  return await userRepository.updatePassword(
    id,
    hashedPassword
  );
};


module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    updatePassword
};