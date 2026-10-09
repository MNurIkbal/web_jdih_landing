const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");
const sliderController = require("../controllers/slider.controller");

router.get(
    "/",
    sliderController.getAll
);

router.get(
    "/all",
    sliderController.getResult
);

router.get(
    "/:id",
    sliderController.getById
);

router.post(
    "/",
    upload.single("gambar"),
    sliderController.create
);

router.put(
    "/:id",
    upload.single("gambar"),
    sliderController.update
);

router.delete(
    "/:id",
    sliderController.remove
);

module.exports = router;