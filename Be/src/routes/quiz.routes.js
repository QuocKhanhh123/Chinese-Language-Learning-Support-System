const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const quizController = require("../controllers/quiz.controller");

// Routes cụ thể TRƯỚC /:quizId
router.get("/by-class/:classId",  auth(["teacher","student"]), quizController.getQuizzesByClass);
router.get("/my-results/:classId",auth(["student"]),           quizController.getMyQuizResults);

router.post  ("/create",                auth(["teacher"]),           quizController.createQuiz);
router.patch ("/:quizId/publish",       auth(["teacher"]),           quizController.publishQuiz);
router.post  ("/:quizId/start",          auth(["student"]),           quizController.startQuiz);
router.get   ("/:quizId",               auth(["teacher","student"]), quizController.getQuizDetail);
router.post  ("/:quizId/submit",        auth(["student"]),           quizController.submitQuiz);
router.get   ("/:quizId/results",       auth(["teacher"]),           quizController.getQuizResults);

module.exports = router;
