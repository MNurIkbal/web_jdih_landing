const express = require("express");
const router = express.Router();
const uploadGaleri = require("../middleware/uploadGaleri");
const galeriController = require("../controllers/galeri.controller");

router.get("/", galeriController.getAll);
router.get("/:id", galeriController.getById);
router.post("/", uploadGaleri.single("media"), galeriController.create);
router.put("/:id", uploadGaleri.single("media"), galeriController.update);
router.delete("/:id", galeriController.remove);

module.exports = router;
