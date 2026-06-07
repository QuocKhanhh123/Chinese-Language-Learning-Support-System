const asyncHandler = require("../middleware/asyncHandler");
const Quiz = require("../models/Quiz.model");
const QuizResult = require("../models/QuizResult.model");
const QuizAttempt = require("../models/QuizAttempt.model");
const Class = require("../models/Class.model");
const ApiRes = require("../res/ApiRes");
const { NotFoundError, BadRequestError, ForbiddenError, ConflictError } = require("../res/AppError");
const { createQuizSchema, submitQuizSchema } = require("../validators/quiz.validator");

const SUBMIT_AFTER_EXPIRY_SLACK_MS = 120_000;

function quizOpensAt(quiz) {
  return quiz.opensAt ? new Date(quiz.opensAt) : null;
}

function assertQuizOpenForStudent(quiz) {
  const opensAt = quizOpensAt(quiz);
  if (opensAt && opensAt > new Date()) {
    throw new ForbiddenError(
      `Bài kiểm tra mở vào ${opensAt.toLocaleString("vi-VN")}`
    );
  }
}

// Giáo viên tạo bài quiz (draft)
exports.createQuiz = asyncHandler(async (req, res) => {
  const data = createQuizSchema.parse(req.body);

  const cls = await Class.findById(data.classId);
  if (!cls) throw new NotFoundError("Lớp học không tồn tại");

  if (cls.teacher.toString() !== req.user.id)
    throw new ForbiddenError("Bạn không phụ trách lớp này");

  const quiz = await Quiz.create({
    title:             data.title,
    class:             data.classId,
    createdBy:         req.user.id,
    questions:         data.questions,
    opensAt:           data.opensAt,
    durationMinutes:   data.durationMinutes,
  });

  return ApiRes.created(res, "Tạo bài kiểm tra thành công", quiz);
});

// Giáo viên xuất bản quiz
exports.publishQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw new NotFoundError("Bài kiểm tra không tồn tại");

  if (quiz.createdBy.toString() !== req.user.id)
    throw new ForbiddenError("Bạn không có quyền xuất bản bài kiểm tra này");

  if (quiz.questions.length === 0)
    throw new BadRequestError("Bài kiểm tra phải có ít nhất 1 câu hỏi");

  if (!quiz.durationMinutes || quiz.durationMinutes < 1)
    throw new BadRequestError("Thời gian làm bài (phút) không hợp lệ");

  quiz.status = "published";
  await quiz.save();

  return ApiRes.success(res, "Xuất bản bài kiểm tra thành công", quiz);
});

// Lấy danh sách quiz theo lớp
exports.getQuizzesByClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { role, id: userId } = req.user;

  const cls = await Class.findById(classId);
  if (!cls) throw new NotFoundError("Lớp học không tồn tại");

  // Student phải trong lớp
  if (role === "student" && !cls.studentIds.map(String).includes(userId))
    throw new ForbiddenError("Bạn không thuộc lớp này");

  const filter = { class: classId };
  // Student chỉ thấy quiz đã publish
  if (role === "student") filter.status = "published";

  const quizzes = await Quiz.find(filter)
    .select("-questions.correctIndex") // ẩn đáp án với student (xử lý sau khi fetch)
    .sort({ createdAt: -1 });

  // Teacher thấy correctIndex, student không
  const result =
    role === "teacher"
      ? await Quiz.find(filter).sort({ createdAt: -1 })
      : quizzes;

  return ApiRes.success(res, "Lấy danh sách bài kiểm tra thành công", result);
});

// Lấy chi tiết quiz
exports.getQuizDetail = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const { role, id: userId } = req.user;

  let query = Quiz.findById(quizId);
  const quiz = await query;
  if (!quiz) throw new NotFoundError("Bài kiểm tra không tồn tại");

  const cls = await Class.findById(quiz.class);
  if (!cls) throw new NotFoundError("Lớp học không tồn tại");

  if (role === "student") {
    if (!cls.studentIds.map(String).includes(userId))
      throw new ForbiddenError("Bạn không thuộc lớp này");
    if (quiz.status !== "published")
      throw new ForbiddenError("Bài kiểm tra chưa được xuất bản");

    assertQuizOpenForStudent(quiz);

    // Ẩn correctIndex với student
    const quizObj = quiz.toObject();
    quizObj.questions = quizObj.questions.map(({ correctIndex: _removed, ...q }) => q);
    return ApiRes.success(res, "Lấy bài kiểm tra thành công", quizObj);
  }

  // Teacher thấy tất cả
  if (role === "teacher" && cls.teacher.toString() !== userId)
    throw new ForbiddenError("Bạn không phụ trách lớp này");

  return ApiRes.success(res, "Lấy bài kiểm tra thành công", quiz);
});

/** Học viên bắt đầu phiên làm bài — cố định expiresAt trên server theo durationMinutes */
exports.startQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw new NotFoundError("Bài kiểm tra không tồn tại");
  if (quiz.status !== "published")
    throw new BadRequestError("Bài kiểm tra chưa được xuất bản");

  const cls = await Class.findById(quiz.class);
  if (!cls.studentIds.map(String).includes(req.user.id))
    throw new ForbiddenError("Bạn không thuộc lớp này");

  assertQuizOpenForStudent(quiz);

  const existingResult = await QuizResult.findOne({ quiz: quizId, student: req.user.id });
  if (existingResult) throw new ConflictError("Bạn đã nộp bài kiểm tra này rồi");

  const durationMinutes = quiz.durationMinutes || 15;
  let attempt = await QuizAttempt.findOne({ quiz: quizId, student: req.user.id });
  const now = new Date();

  if (attempt) {
    if (now < attempt.expiresAt) {
      return ApiRes.success(res, "Đang trong phiên làm bài", {
        expiresAt: attempt.expiresAt,
        serverNow: now,
        durationMinutes,
        expired: false,
      });
    }
    return ApiRes.success(res, "Phiên làm bài đã hết giờ — vui lòng nộp bài ngay", {
      expiresAt: attempt.expiresAt,
      serverNow: now,
      durationMinutes,
      expired: true,
    });
  }

  const expiresAt = new Date(now.getTime() + durationMinutes * 60 * 1000);
  attempt = await QuizAttempt.create({
    quiz: quizId,
    student: req.user.id,
    startedAt: now,
    expiresAt,
  });

  return ApiRes.success(res, "Bắt đầu làm bài", {
    expiresAt: attempt.expiresAt,
    serverNow: now,
    durationMinutes,
    expired: false,
  });
});

// Học viên nộp bài
exports.submitQuiz = asyncHandler(async (req, res) => {
  const { quizId } = req.params;
  const data = submitQuizSchema.parse(req.body);

  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw new NotFoundError("Bài kiểm tra không tồn tại");
  if (quiz.status !== "published")
    throw new BadRequestError("Bài kiểm tra chưa được xuất bản");

  const cls = await Class.findById(quiz.class);
  if (!cls.studentIds.map(String).includes(req.user.id))
    throw new ForbiddenError("Bạn không thuộc lớp này");

  assertQuizOpenForStudent(quiz);

  // Kiểm tra đã nộp chưa
  const existing = await QuizResult.findOne({ quiz: quizId, student: req.user.id });
  if (existing) throw new ConflictError("Bạn đã nộp bài kiểm tra này rồi");

  const attempt = await QuizAttempt.findOne({ quiz: quizId, student: req.user.id });
  if (!attempt) throw new BadRequestError("Vui lòng bấm « Bắt đầu làm bài » trước khi nộp.");

  const deadline = attempt.expiresAt.getTime() + SUBMIT_AFTER_EXPIRY_SLACK_MS;
  if (Date.now() > deadline) {
    await QuizAttempt.deleteOne({ _id: attempt._id });
    throw new BadRequestError(
      "Đã quá thời gian nộp bài sau khi hết giờ làm bài."
    );
  }

  // Auto-grade (selectedIndex === -1: chưa chọn / hết giờ)
  let score = 0;
  const answers = data.answers.map(({ questionId, selectedIndex }) => {
    const q = quiz.questions.id(questionId);
    if (!q) throw new BadRequestError(`Câu hỏi ${questionId} không tồn tại`);
    const isCorrect =
      selectedIndex >= 0 && q.correctIndex === selectedIndex;
    if (isCorrect) score++;
    return { questionId, selectedIndex, isCorrect };
  });

  const percentage = Math.round((score / quiz.questions.length) * 100);

  const result = await QuizResult.create({
    quiz:           quizId,
    student:        req.user.id,
    class:          quiz.class,
    answers,
    score,
    totalQuestions: quiz.questions.length,
    percentage,
  });

  await QuizAttempt.deleteOne({ _id: attempt._id }).catch(() => {});

  // Cập nhật stats
  const allResults = await QuizResult.find({ quiz: quizId });
  const avgScore =
    allResults.reduce((sum, r) => sum + r.percentage, 0) / allResults.length;
  await Quiz.findByIdAndUpdate(quizId, {
    "stats.attemptCount": allResults.length,
    "stats.averageScore": Math.round(avgScore),
  });

  // Trả kết quả có correctIndex để student thấy đáp án đúng
  const resultWithAnswers = result.toObject();
  resultWithAnswers.questions = quiz.questions.map((q) => ({
    _id:            q._id,
    chineseText:    q.chineseText,
    vietnameseText: q.vietnameseText,
    options:        q.options,
    correctIndex:   q.correctIndex,
  }));

  return ApiRes.created(res, "Nộp bài thành công", {
    score,
    totalQuestions: quiz.questions.length,
    percentage,
    answers: resultWithAnswers.answers,
    questions: resultWithAnswers.questions,
  });
});

// Giáo viên xem kết quả toàn lớp
exports.getQuizResults = asyncHandler(async (req, res) => {
  const { quizId } = req.params;

  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw new NotFoundError("Bài kiểm tra không tồn tại");

  const cls = await Class.findById(quiz.class).populate("studentIds", "name email");
  if (cls.teacher.toString() !== req.user.id)
    throw new ForbiddenError("Bạn không phụ trách lớp này");

  const results = await QuizResult.find({ quiz: quizId })
    .populate("student", "name email avatar")
    .sort({ percentage: -1 });

  const submittedStudentIds = results.map((r) => r.student._id.toString());
  const notSubmitted = cls.studentIds.filter(
    (s) => !submittedStudentIds.includes(s._id.toString())
  );

  return ApiRes.success(res, "Lấy kết quả thành công", {
    quizTitle:    quiz.title,
    totalStudents: cls.studentIds.length,
    submittedCount: results.length,
    results,
    notSubmitted,
  });
});

// Học viên xem lịch sử kết quả trong 1 lớp
exports.getMyQuizResults = asyncHandler(async (req, res) => {
  const { classId } = req.params;

  const cls = await Class.findById(classId);
  if (!cls) throw new NotFoundError("Lớp học không tồn tại");

  if (!cls.studentIds.map(String).includes(req.user.id))
    throw new ForbiddenError("Bạn không thuộc lớp này");

  const results = await QuizResult.find({
    class:   classId,
    student: req.user.id,
  })
    .populate("quiz", "title status stats")
    .sort({ submittedAt: -1 });

  return ApiRes.success(res, "Lấy lịch sử bài kiểm tra thành công", results);
});
