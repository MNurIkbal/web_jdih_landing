/**
 * Role-Based Access Control (RBAC) Middleware
 * Mendukung role:
 * 1. superadmin -> akses penuh semua menu dan fitur
 * 2. admin      -> verifikator, dapat mengakses semua menu kecuali 'pengguna' dan 'pengaturan'
 * 3. pengguna   -> dapat membuat pengajuan dan mengakses menu pengajuan-peraturan & dokumen-hukum
 */
const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Sesi login tidak ditemukan",
      });
    }

    const userRole = (req.user.role || "").toLowerCase();

    // superadmin selalu diizinkan di semua endpoint
    if (userRole === "superadmin") {
      return next();
    }

    const isAllowed = allowedRoles.some(
      (role) => role.toLowerCase() === userRole
    );

    if (!isAllowed) {
      return res.status(403).json({
        success: false,
        message: `Akses ditolak: role '${req.user.role}' tidak memiliki izin untuk fitur ini.`,
      });
    }

    next();
  };
};

module.exports = {
  requireRole,
};

