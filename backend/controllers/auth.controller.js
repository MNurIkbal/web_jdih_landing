const authService = require("../services/auth.service");
const jwt = require("jsonwebtoken");


const loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email dan password wajib diisi",
      });
    }

    const user = await authService.loginService(email, password);

    const token = jwt.sign(
      {
        id: user.id,
        nama: user.nama,
        email: user.email,
        role: user.role,
        foto: user.foto,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "8h",
      }
    );

    res.cookie("access_token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 8,
      path: "/",
    });

    return res.status(200).json({
      success: true,
      message: "Login berhasil",
      data: user,
    });
  } catch (error) {
    

    if (error.message === "EMAIL_OR_PASSWORD_INVALID") {
      return res.status(401).json({
        success: false,
        message: "Email atau password salah",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Terjadi kesalahan pada server",
    });
  }
};



const sessionController = async (req, res) => {

  const user = await authService.getCurrentUserService(req.user.id);

  return res.status(200).json({
    success: true,
    message: "Session aktif",
    data: user,
  });
};

const logoutController = async (req, res) => {
  try {
    res.clearCookie("access_token", {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
    });

    return res.status(200).json({
      success: true,
      message: "Logout berhasil",
    });
  } catch (error) {
    

    return res.status(500).json({
      success: false,
      message: "Gagal logout",
    });
  }
};
module.exports = {
  loginController,
  sessionController,
  logoutController,
};
