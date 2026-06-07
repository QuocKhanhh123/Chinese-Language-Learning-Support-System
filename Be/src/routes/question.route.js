const express = require("express");
const auth = require("../middleware/auth.middleware");
const { validateBody, validateQuery } = require("../middleware/validate");
const questionController = require("../controllers/question.controller");
const {
  createQuestionSchema,
  updateQuestionSchema,
  getQuestionsQuerySchema,
} = require("../validators/question.validator");

const router = express.Router();

// Tạo câu hỏi (question bank) – teacher
router.post(
  "/create",
  auth(["teacher"]),
  validateBody(createQuestionSchema),
  questionController.createQuestion
);

// Cập nhật câu hỏi
router.put(
  "/update/:questionId",
  auth(["teacher"]),
  validateBody(updateQuestionSchema),
  questionController.updateQuestion
);

// Xóa câu hỏi
router.delete(
  "/delete/:questionId",
  auth(["teacher"]),
  questionController.deleteQuestion
);

// Lấy list câu hỏi của giáo viên (question bank riêng từng người)
router.get(
  "/my/list",
  auth(["teacher"]),
  validateQuery(getQuestionsQuerySchema),
  questionController.getMyQuestions
);

// Lấy chi tiết 1 câu hỏi
router.get(
  "/:questionId",
  auth(["teacher"]),
  questionController.getQuestionById
);

module.exports = router;
