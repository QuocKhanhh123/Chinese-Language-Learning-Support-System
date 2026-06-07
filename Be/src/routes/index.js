const express = require("express");
const authRoutes = require("./auth.route");
const courseRouter = require("./course.routes");
const lessonRouter = require("./lesson.routes");
const userRoutes = require("./users.route");
const flashcardRoutes = require("./flashcard.routes");
const grammarRoutes = require("./grammar.routes");
const vocabularyRoutes = require("./vocabulary.routes");
const examRoutes = require("./exam.routes");
const uploadRoutes = require("./upload.routes");
const adminRoutes = require("./admin.route");
const languageRoutes = require("./language.route");
const notificationRoutes = require("./notification.routes");
const chatbotRoutes = require("./chatbot.route");
const classRoutes = require("./class.routes");
const orderRoutes = require("./order.routes");
const quizRoutes = require("./quiz.routes");
const orderController = require("../controllers/order.controller");

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/courses", courseRouter);
router.use("/lessons", lessonRouter);
router.use("/users", userRoutes);
router.use("/flashcards", flashcardRoutes);
router.use("/grammars", grammarRoutes);
router.use("/vocabularies", vocabularyRoutes);
router.use("/exams", examRoutes); // HSK exam system
router.use("/upload", uploadRoutes); // Upload audio/images
router.use("/admin", adminRoutes);
router.use("/language", languageRoutes);
router.use("/notifications", notificationRoutes); // Notification system
router.use("/chatbot", chatbotRoutes); // AI Chinese teacher chatbot
router.use("/classes", classRoutes);  // Class management
router.post("/payment/zalopay/callback", orderController.zalopayCallback); // callback alias
router.use("/orders", orderRoutes);  // Order & enrollment
router.use("/quizzes", quizRoutes);   // Teacher quizzes

module.exports = router;
