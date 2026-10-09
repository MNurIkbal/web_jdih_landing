const express = require("express");

const router = express.Router();

const userController = require("../controllers/user.controller");

const userUpload = require("../middleware/userUpload");

router.get(
  "/",
  userController.getAll
);

router.put(
  "/:id/password",
  userController.updatePassword
);

router.get(
  "/:id",
  userController.getById
);

router.post(
  "/",
  userUpload.single("foto"),
  userController.create
);

router.put(
  "/:id",
  userUpload.single("foto"),
  userController.update
);

router.delete(
  "/:id",
  userController.remove
);

module.exports = router;