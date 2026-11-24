const express = require("express");
const userAuth = require("../middleware/userAuth");
const { askQuestion } = require("../controllers/chatController");

const router = express.Router();

// Protected chat endpoint
router.post("/ask", userAuth, askQuestion);

module.exports = router;
