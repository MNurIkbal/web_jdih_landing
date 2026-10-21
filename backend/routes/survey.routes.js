const express = require("express");
const router = express.Router();
const surveyController = require("../controllers/survey.controller");

// Route CRUD Pertanyaan Survey (Admin)
router.get("/pertanyaan", surveyController.getAll);
router.get("/pertanyaan/:id", surveyController.getById);
router.post("/pertanyaan", surveyController.create);
router.put("/pertanyaan/:id", surveyController.update);
router.delete("/pertanyaan/:id", surveyController.remove);

// Route Statistik & Grafik Kepuasan
router.get("/statistik", surveyController.getStatistik);

module.exports = router;
