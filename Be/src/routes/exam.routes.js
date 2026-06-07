const express = require("express");
const auth = require("../middleware/auth.middleware");
const { validateBody, validateQuery } = require("../middleware/validate");
const examController = require("../controllers/exam.controller");
const {
  createExamSchema,
  updateExamSchema,
  submitExamSchema,
  getExamsQuerySchema,
  gradeWritingSchema,
  updateExamScheduleSchema,
} = require("../validators/exam.validator");

const router = express.Router();

router.get(
  "/:examId/student/:studentId/result",
  auth(["teacher", "admin", "student"]),
  examController.getStudentResult
);

router.post(
  "/create-exam",
  auth(["teacher"]),
  validateBody(createExamSchema),
  examController.createExam
);

router.put(
  "/update-exam/:examId",
  auth(["teacher"]),
  validateBody(updateExamSchema),
  examController.updateExam
);

router.delete(
  "/delete-exam/:examId",
  auth(["teacher"]),
  examController.deleteExam
);

router.get("/get-exam/:examId", auth(["teacher"]), examController.getExamById);

router.get(
  "/my/list",
  auth(["teacher"]),
  validateQuery(getExamsQuerySchema),
  examController.getMyExams
);

router.post("/:examId/publish", auth(["teacher"]), examController.publishExam);

router.get(
  "/:examId/results",
  auth(["teacher"]),
  examController.getExamResults
);

router.get(
  "/course/:courseId/all-results",
  auth(["teacher"]),
  validateQuery(getExamsQuerySchema),
  examController.getCourseExamResults
);

router.post(
  "/result/:resultId/grade-writing",
  auth(["teacher"]),
  validateBody(gradeWritingSchema),
  examController.gradeWriting
);

router.put(
  "/:examId/schedule",
  auth(["teacher"]),
  validateBody(updateExamScheduleSchema),
  examController.updateExamSchedule
);

/* ===========================================================
                  HSK UPLOAD & EDIT QUESTIONS
=========================================================== */

router.post(
  "/:examId/questions",
  auth(["teacher"]),
  examController.saveExamQuestionsFromUpload
);

router.get(
  "/:examId/questions",
  auth(["teacher"]),
  examController.getExamQuestions
);

router.post(
  "/:examId/listening-audios",
  auth(["teacher"]),
  examController.attachListeningAudios
);

router.delete(
  "/:examId/listening-audios",
  auth(["teacher"]),
  examController.removeListeningAudio
);

router.put(
  "/:examId/questions/:questionId",
  auth(["teacher"]),
  examController.updateSingleExamQuestion
);

router.get(
  "/course/:courseId/list",
  auth(["teacher", "student"]),
  validateQuery(getExamsQuerySchema),
  examController.getExamsByCourse
);

router.get(
  "/available/list",
  auth(["student"]),
  validateQuery(getExamsQuerySchema),
  examController.getAvailableExams
);

router.get(
  "/info/:examId",
  auth(["teacher", "student"]),
  examController.getExamInfoById
);

router.post("/start-exam/:examId", auth(["student"]), examController.startExam);

router.post(
  "/result/:resultId/submit",
  auth(["student"]),
  validateBody(submitExamSchema),
  examController.submitExam
);

router.get("/take/:examId", auth(["student"]), examController.takeExam);

router.get(
  "/my/results",
  auth(["student"]),
  validateQuery(getExamsQuerySchema),
  examController.getMyResults
);

router.get(
  "/my-exam-history/:examId",
  auth(["student"]),
  validateQuery(getExamsQuerySchema),
  examController.getMyExamHistory
);

router.get(
  "/result/:resultId",
  auth(["teacher", "student"]),
  examController.getResultDetail
);

router.get(
  "/:examId/students",
  auth(["admin", "teacher"]),
  examController.getStudentsJoinedExam
);

router.get(
  "/:examId/teacher-stats",
  auth(["teacher", "admin"]),
  examController.getTeacherExamStats
);

module.exports = router;
