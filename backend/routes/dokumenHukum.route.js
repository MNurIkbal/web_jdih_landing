const express = require("express");

const router = express.Router();

const dokumenHukumController =
    require("../controllers/dokumenHukum.controller");

const dokumenHukumUpload =
    require("../middleware/dokumenHukumUpload");

router.get(
    "/",
    dokumenHukumController.getAll
);
router.get("/sumary", dokumenHukumController.getSummary);
router.get("/all", dokumenHukumController.getList);
router.get(
    "/web",
    dokumenHukumController.getAllWeb
);

router.get(
    "/:id",
    dokumenHukumController.getById
);

router.post(
    "/",
    dokumenHukumUpload.fields([
        {
            name: "file_abstrak",
            maxCount: 1,
        },
        {
            name: "file_dokumen",
            maxCount: 1,
        },
    ]),
    dokumenHukumController.create
);

router.put(
    "/:id",
    dokumenHukumUpload.fields([
        {
            name: "file_abstrak",
            maxCount: 1,
        },
        {
            name: "file_dokumen",
            maxCount: 1,
        },
    ]),
    dokumenHukumController.update
);

router.delete(
    "/:id",
    dokumenHukumController.remove
);




module.exports = router;