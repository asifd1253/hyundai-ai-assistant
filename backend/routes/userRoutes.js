const express = require("express");

const router = express.Router();

const userAuth = require("../middleware/userAuth");

const { getProfile } = require("../controllers/userController");

// Protected profile route
router.get("/profile", userAuth, getProfile);

module.exports = router;
