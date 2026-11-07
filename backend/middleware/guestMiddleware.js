const jwt = require("jsonwebtoken");

const guestMiddleware = (req, res, next) => {
  let token = req.cookies?.access_token;

  if (!token && req.headers?.authorization) {
    const parts = req.headers.authorization.split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
  }

  if (token) {
    try {
      jwt.verify(token, process.env.JWT_SECRET);
      return res.status(403).json({
        success: false,
        message: "Anda sudah login.",
      });
    } catch (e) {
      // Token expired atau tidak valid, izinkan guest lanjut
    }
  }

  next();
};

module.exports = guestMiddleware;