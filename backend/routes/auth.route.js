const express = require("express");

const {
  loginController,
  sessionController,
  logoutController,
} = require("../controllers/auth.controller");

const authMiddleware = require("../middleware/authMiddleware");
const guestMiddleware = require("../middleware/guestMiddleware");

const router = express.Router();

router.post("/", guestMiddleware, loginController);

router.get("/session", authMiddleware, sessionController);

router.post("/logout", authMiddleware, logoutController);

module.exports = router;