const guestMiddleware = (req, res, next) => {
  if (req.session && req.session.userId) {
    return res.status(403).json({
      success: false,
      message: "Anda sudah login.",
    });
  }

  next();
};

module.exports = guestMiddleware;