const express = require("express");
const router = express.Router();
const { chat } = require("../controllers/chatbot.controller");
const auth = require("../middleware/auth.middleware");

// POST /api/chatbot — cần đăng nhập
router.post("/", auth(), chat);

module.exports = router;
