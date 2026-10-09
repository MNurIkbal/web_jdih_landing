const express = require("express");

const router = express.Router();

const pengaturanController = require("../controllers/pengaturan.controller");

router.get("/", pengaturanController.getOne);

router.put("/:id", pengaturanController.update);
router.get( "/sumary", pengaturanController.getSummary );
router.get("/sumary-grafik", pengaturanController.getDokumenSummaryController );
module.exports = router;