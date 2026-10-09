const express = require("express");

const router = express.Router();

const uploadBerita =
    require("../middleware/uploadBerita");

const beritaController =
    require("../controllers/berita.controller");


/**
 * GET ALL
 */
router.get(
    "/",
    beritaController.getAll
);

router.get("/all", beritaController.getWebList);

router.get(
    "/pagination-berita",
    beritaController.getWebListController
);
/**
 * GET DETAIL
 */
router.get(
    "/:id",
    beritaController.getById
);


/**
 * CREATE
 */
router.post(
    "/",
    uploadBerita.single("gambar"),
    beritaController.create
);


/**
 * UPDATE
 */
router.put(
    "/:id",
    uploadBerita.single("gambar"),
    beritaController.update
);


/**
 * DELETE
 */
router.delete(
    "/:id",
    beritaController.remove
);


module.exports = router;