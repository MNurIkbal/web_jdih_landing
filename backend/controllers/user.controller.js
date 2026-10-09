const userService = require("../services/user.service");

const getAll = async (req, res) => {

    try {

        const result =
            await userService.getAll({
                search: req.query.search || "",
                page: req.query.page || 1,
                size: req.query.size || 10,
            });

        return res.status(200).json({
            success: true,
            message: "Data user berhasil diambil",
            ...result,
        });

    } catch (error) {

        

        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getById = async (req, res) => {

    try {

        const result =
            await userService.getById(
                req.params.id
            );

        return res.status(200).json({
            success: true,
            message: "Data user berhasil diambil",
            data: result,
        });

    } catch (error) {

        return res.status(404).json({
            success: false,
            message: error.message,
        });
    }
};




const create = async (req, res) => {
    try {
        

        const {
            nama,
            email,
            password,
        } = req.body || {};

        if (!nama || !String(nama).trim()) {
            return res.status(400).json({
                success: false,
                message: "Nama wajib diisi",
            });
        }

        if (!email || !String(email).trim()) {
            return res.status(400).json({
                success: false,
                message: "Email wajib diisi",
            });
        }

        if (!password || !String(password).trim()) {
            return res.status(400).json({
                success: false,
                message: "Password wajib diisi",
            });
        }

        const foto = req.file?.filename || null;

        const role = "Admin";

        const result = await userService.create({
            nama: String(nama).trim(),
            email: String(email).trim(),
            password,
            role,
            foto,
        });

        return res.status(201).json({
            success: true,
            message: "User berhasil dibuat",
            data: result,
        });

    } catch (error) {
        

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


const update = async (req, res) => {
    try {
        

        const { id } = req.params;

        const {
            nama,
            email,
        } = req.body || {};

        if (!nama || !nama.trim()) {
            return res.status(400).json({
                success: false,
                message: "Nama wajib diisi",
            });
        }

        if (!email || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "Email wajib diisi",
            });
        }

        const foto =
            req.file?.filename || null;

        const result =
            await userService.update(
                id,
                {
                    nama: nama.trim(),
                    email: email.trim(),
                    foto,
                }
            );

        return res.status(200).json({
            success: true,
            message: "User berhasil diperbarui",
            data: result,
        });

    } catch (error) {
        

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};

const remove = async (req, res) => {

    try {

        const result =
            await userService.remove(
                req.params.id
            );

        return res.status(200).json({
            success: true,
            ...result,
        });

    } catch (error) {

        return res.status(400).json({
            success: false,
            message: error.message,
        });
    }
};


const updatePassword = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { password } = req.body;
    

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({
        success: false,
        message: "ID user tidak valid",
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password wajib diisi",
      });
    }

    const result = await userService.updatePassword(
      id,
      password
    );

    return res.status(200).json({
      success: true,
      message: "Password berhasil diperbarui",
      data: result,
    });
  } catch (error) {
    

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Gagal memperbarui password",
    });
  }
};

module.exports = {
    getAll,
    getById,
    create,
    update,
    remove,
    updatePassword
};