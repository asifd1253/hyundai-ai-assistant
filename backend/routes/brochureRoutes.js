const express = require("express");

const {
  uploadBrochure,
  getBrochures,
  deleteBrochure,
} = require("../controllers/brochureController");

const userAuth = require("../middleware/userAuth");
const upload = require("../middleware/upload");

const router = express.Router();

router.post("/upload", userAuth, upload.single("brochure"), uploadBrochure);

router.get("/", userAuth, getBrochures);

router.delete("/:brochureId", userAuth, deleteBrochure);

module.exports = router;
