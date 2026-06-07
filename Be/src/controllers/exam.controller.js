// src/controllers/exam.controller.js
const Exam = require("../models/Exam.model");
const ExamQuestion = require("../models/ExamQuestion.model");
const ExamResult = require("../models/ExamResult.model");
const Course = require("../models/Course.model");
const Enrollment = require("../models/Enrollment.model");
const ApiRes = require("../res/apiRes");
const asyncHandler = require("../middleware/asyncHandler");
const {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} = require("../res/AppError");

// ===================== HELPERS =====================
const isExamOpenNow = (exam) => {
  // student chỉ được vào exam đã publish
  if (exam.status !== "published") return false;

  const { scheduleStartAt, scheduleEndAt } = exam;

  // không set lịch => mở vĩnh viễn
  if (!scheduleStartAt || !scheduleEndAt) return true;

  const now = new Date();
  return now >= new Date(scheduleStartAt) && now <= new Date(scheduleEndAt);
};

// ==================== TEACHER APIs ====================

// Create exam
exports.createExam = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    level,
    skills,
    sections,
    timeLimitMinutes,
    passingScore,
    courseId,
  } = req.body;

  if (!courseId) throw new BadRequestError("courseId is required");

  const course = await Course.findById(courseId);
  if (!course) throw new NotFoundError("Course not found");

  if (course.assignedTeacher.toString() !== req.user.id) {
    throw new ForbiddenError("You are not the teacher of this course");
  }

  const exam = await Exam.create({
    title,
    description,
    level,
    skills,
    sections,
    timeLimitMinutes,
    passingScore: passingScore || 60,
    course: courseId,
    createdBy: req.user.id,
  });

  return ApiRes.success(res, "Exam created successfully", exam);
});

// Update exam
exports.updateExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const updates = req.body;

  const exam = await Exam.findById(examId);
  if (!exam) throw new NotFoundError("Exam not found");

  if (exam.createdBy.toString() !== req.user.id) {
    throw new ForbiddenError("You are not the owner of this exam");
  }

  // If changing course, verify new course
  if (updates.courseId && updates.courseId !== exam.course.toString()) {
    const course = await Course.findById(updates.courseId);
    if (!course) throw new NotFoundError("Course not found");
    if (course.assignedTeacher.toString() !== req.user.id) {
      throw new ForbiddenError("You are not the teacher of this course");
    }
    updates.course = updates.courseId;
    delete updates.courseId;
  }

  Object.assign(exam, updates);
  await exam.save();

  return ApiRes.success(res, "Exam updated successfully", exam);
});

// Delete exam
exports.deleteExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  const exam = await Exam.findById(examId);
  if (!exam) throw new NotFoundError("Exam not found");

  if (exam.createdBy.toString() !== req.user.id) {
    throw new ForbiddenError("You are not the owner of this exam");
  }

  // ✅ xoá câu hỏi rời
  await ExamQuestion.deleteMany({ exam: examId });

  await exam.deleteOne();

  return ApiRes.success(res, "Exam deleted successfully");
});

// Get exam by ID (with full questions for teacher)
exports.getExamById = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  const exam = await Exam.findById(examId)
    .populate("course", "title")
    .populate("createdBy", "name email");

  if (!exam) throw new NotFoundError("Exam not found");

  if (
    req.user.role === "teacher" &&
    exam.createdBy._id.toString() !== req.user.id
  ) {
    throw new ForbiddenError("You are not the owner of this exam");
  }

  // ✅ lấy câu hỏi từ ExamQuestion
  const questions = await ExamQuestion.find({ exam: examId })
    .sort({ orderNo: 1 })
    .lean();

  const examObj = exam.toObject();
  examObj.questions = questions;

  return ApiRes.success(res, "Exam retrieved successfully", examObj);
});

// Get all exams by teacher
exports.getMyExams = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, level, status, courseId } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const query = { createdBy: req.user.id };
  if (level) query.level = level;
  if (status) query.status = status;
  if (courseId) query.course = courseId;

  const [exams, total] = await Promise.all([
    Exam.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate("course", "title")
      .lean(),
    Exam.countDocuments(query),
  ]);

  return ApiRes.successWithMeta(res, "Exams retrieved successfully", exams, {
    page: pageNumber,
    limit: limitNumber,
    total,
    totalPages: Math.ceil(total / limitNumber),
  });
});

// Publish exam
exports.publishExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  const exam = await Exam.findById(examId);
  if (!exam) throw new NotFoundError("Exam not found");

  if (exam.createdBy.toString() !== req.user.id) {
    throw new ForbiddenError("You are not the owner of this exam");
  }

  exam.status = "published";
  await exam.save();

  return ApiRes.success(res, "Exam published successfully", exam);
});

// Get exam results (for teacher)
exports.getExamResults = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const exam = await Exam.findById(examId);
  if (!exam) throw new NotFoundError("Exam not found");

  if (exam.createdBy.toString() !== req.user.id) {
    throw new ForbiddenError("You are not the owner of this exam");
  }

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [results, total] = await Promise.all([
    ExamResult.find({ exam: examId })
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("student", "name email")
      .lean(),
    ExamResult.countDocuments({ exam: examId }),
  ]);

  return ApiRes.success(res, "Exam results retrieved successfully", {
    results,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// Get all exam results in a course (for teacher)
exports.getCourseExamResults = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { page = 1, limit = 20, examId, studentId, status } = req.query;

  const course = await Course.findById(courseId);
  if (!course) throw new NotFoundError("Course not found");

  if (course.assignedTeacher.toString() !== req.user.id) {
    throw new ForbiddenError("You are not the teacher of this course");
  }

  const query = { course: courseId };
  if (examId) query.exam = examId;
  if (studentId) query.student = studentId;
  if (status) query.status = status;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [results, total] = await Promise.all([
    ExamResult.find(query)
      .sort({ submittedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("student", "name email avatar")
      .populate(
        "exam",
        "title level skills timeLimitMinutes totalPoints passingScore"
      )
      .lean(),
    ExamResult.countDocuments(query),
  ]);

  const stats = await ExamResult.aggregate([
    { $match: { course: course._id } },
    {
      $group: {
        _id: null,
        totalAttempts: { $sum: 1 },
        averageScore: { $avg: "$score.percentage" },
        passedCount: { $sum: { $cond: ["$score.passed", 1, 0] } },
        submittedCount: {
          $sum: { $cond: [{ $eq: ["$status", "submitted"] }, 1, 0] },
        },
        inProgressCount: {
          $sum: { $cond: [{ $eq: ["$status", "in_progress"] }, 1, 0] },
        },
      },
    },
  ]);

  const statistics =
    stats.length > 0
      ? {
          totalAttempts: stats[0].totalAttempts,
          averageScore: Math.round(stats[0].averageScore * 100) / 100,
          passedCount: stats[0].passedCount,
          passRate:
            stats[0].totalAttempts > 0
              ? Math.round(
                  (stats[0].passedCount / stats[0].totalAttempts) * 100
                )
              : 0,
          submittedCount: stats[0].submittedCount,
          inProgressCount: stats[0].inProgressCount,
        }
      : {
          totalAttempts: 0,
          averageScore: 0,
          passedCount: 0,
          passRate: 0,
          submittedCount: 0,
          inProgressCount: 0,
        };

  return ApiRes.success(res, "Course exam results retrieved successfully", {
    results,
    statistics,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// Get exams by course (teacher/student)
exports.getExamsByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { page = 1, limit = 20, level, status } = req.query;

  const course = await Course.findById(courseId);
  if (!course) throw new NotFoundError("Course not found");

  const query = { course: courseId };

  if (req.user.role === "teacher") {
    if (course.assignedTeacher.toString() !== req.user.id) {
      throw new ForbiddenError("You are not the teacher of this course");
    }
    if (status) query.status = status;
  } else {
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: courseId,
    });
    if (!enrollment) {
      throw new ForbiddenError("You are not enrolled in this course");
    }
    query.status = "published";
  }

  if (level) query.level = level;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [exams, total] = await Promise.all([
    Exam.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select(
        req.user.role === "student" ? "-sections.questions.correctAnswer" : ""
      )
      .lean(),
    Exam.countDocuments(query),
  ]);

  // ✅ map MULTI attempts cho student
  if (req.user.role === "student") {
    const examIds = exams.map((e) => e._id);

    const results = await ExamResult.find({
      student: req.user.id,
      exam: { $in: examIds },
    })
      .sort({ startedAt: -1, createdAt: -1 })
      .select("exam status score.passed startedAt submittedAt")
      .lean();

    // group theo exam
    const grouped = {};
    results.forEach((r) => {
      const key = r.exam.toString();
      if (!grouped[key]) grouped[key] = [];
      grouped[key].push(r);
    });

    exams.forEach((exam) => {
      const key = exam._id.toString();
      const list = grouped[key] || [];

      if (list.length === 0) {
        exam.myAttempt = { attempted: false, attemptCount: 0 };
        return;
      }

      const latest = list[0];
      exam.myAttempt = {
        attempted: true,
        attemptCount: list.length,
        passed: latest.score?.passed || false,
        status: latest.status,
        latestAttemptAt: latest.submittedAt || latest.startedAt,
      };
    });
  }

  return ApiRes.success(res, "Course exams retrieved successfully", {
    exams,
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// ==================== STUDENT ROUTES ====================

// Get available exams for student
// GET /api/exams/available/list
exports.getAvailableExams = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, level, courseId } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  // ==== 1. Lấy toàn bộ khoá học mà student đã enroll ====
  const enrollments = await Enrollment.find({ user: req.user.id })
    .select("course")
    .lean();

  const courseIds = enrollments.map((e) => e.course);

  // Nếu student chưa enroll khoá nào -> không có exam nào cả
  if (courseIds.length === 0) {
    return ApiRes.successWithMeta(res, "Exams retrieved successfully", [], {
      page: pageNumber,
      limit: limitNumber,
      total: 0,
      totalPages: 0,
    });
  }

  // ==== 2. Xây query cơ bản ====
  const query = { status: "published" };
  if (level) query.level = level;

  // ==== 3. Lọc theo course ====
  if (courseId) {
    // chỉ cho xem exam của khoá học mà user đang enroll
    const inMyCourses = courseIds.some(
      (id) => id.toString() === String(courseId)
    );

    if (!inMyCourses) {
      throw new ForbiddenError("You are not enrolled in this course");
    }

    query.course = courseId;
  } else {
    // không truyền courseId -> chỉ show exam thuộc các khoá user đang học
    query.course = { $in: courseIds };
  }

  // ==== 4. Query exam + filter isExamOpenNow ====
  const exams = await Exam.find(query)
    .select("-sections.questions.correctAnswer")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNumber)
    .populate("course", "title")
    .lean();

  const openExams = exams.filter(isExamOpenNow);

  return ApiRes.successWithMeta(
    res,
    "Exams retrieved successfully",
    openExams,
    {
      page: pageNumber,
      limit: limitNumber,
      total: openExams.length,
      totalPages: 1,
    }
  );
});

// Start exam (ALLOW MULTI ATTEMPTS)
exports.startExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  const exam = await Exam.findById(examId);
  if (!exam) throw new NotFoundError("Exam not found");

  if (exam.status !== "published") {
    throw new BadRequestError("Exam is not available");
  }
  if (!isExamOpenNow(exam)) {
    throw new BadRequestError("Exam is not open at this time");
  }

  // Nếu exam thuộc course => phải enrolled
  if (exam.course) {
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: exam.course,
    });
    if (!enrollment) {
      throw new ForbiddenError("You are not enrolled in this course");
    }
  }

  // ✅ ĐẾM attempt trước đó
  const prevAttempts = await ExamResult.countDocuments({
    exam: examId,
    student: req.user.id,
  });
  const attemptNo = prevAttempts + 1;

  const result = await ExamResult.create({
    exam: examId,
    student: req.user.id,
    course: exam.course,
    startedAt: new Date(),
    attemptCount: attemptNo,
    status: "in_progress",
    "score.maxPoints": exam.totalPoints,
    sectionResults: exam.sections.map((section) => ({
      sectionId: section._id,
      skill: section.skill,
      answers: section.questions.map((q) => ({
        questionId: q._id,
        answer: "",
        isCorrect: false,
        pointsEarned: 0,
      })),
      score: 0,
      maxScore: section.questions.reduce((sum, q) => sum + q.points, 0),
    })),
  });

  const examData = exam.toObject();
  examData.sections.forEach((section) => {
    section.questions.forEach((q) => delete q.correctAnswer);
  });

  return ApiRes.success(res, "Exam started successfully", {
    resultId: result._id,
    attemptCount: attemptNo,
    exam: examData,
    timeLimitMinutes: exam.timeLimitMinutes,
    startedAt: result.startedAt,
  });
});

// Submit exam
exports.submitExam = asyncHandler(async (req, res) => {
  const { resultId } = req.params;
  const { answers = [] } = req.body || {};

  const result = await ExamResult.findById(resultId).populate("exam");
  if (!result) throw new NotFoundError("Exam result not found");

  if (result.student.toString() !== req.user.id) {
    throw new ForbiddenError("This is not your exam");
  }

  if (result.status !== "in_progress") {
    throw new BadRequestError("Exam already submitted");
  }

  const exam = result.exam;
  let totalPoints = 0;
  const skillScores = { listening: 0, reading: 0, writing: 0 };
  let hasWriting = false;

  const normalizeAnswer = (val) => {
    if (typeof val !== "string") return "";
    return val.trim().toLowerCase();
  };

  result.sectionResults.forEach((sectionResult) => {
    const section = exam.sections.find(
      (s) => s._id.toString() === sectionResult.sectionId.toString()
    );
    if (!section) return;

    let sectionScore = 0;

    sectionResult.answers.forEach((answerItem) => {
      const question = section.questions.find(
        (q) => q._id.toString() === answerItem.questionId.toString()
      );
      if (!question) return;

      const studentAnswer = answers.find(
        (a) => a.questionId === answerItem.questionId.toString()
      );
      if (!studentAnswer) return;

      // luôn lưu lại raw answer để xem lại
      answerItem.answer =
        typeof studentAnswer.answer === "string"
          ? studentAnswer.answer
          : String(studentAnswer.answer ?? "");

      if (section.skill === "writing") {
        hasWriting = true;
        answerItem.isCorrect = null;
        answerItem.pointsEarned = 0;
        return;
      }

      const studentNorm = normalizeAnswer(studentAnswer.answer);
      const correctNorm = normalizeAnswer(question.correctAnswer);

      if (correctNorm && studentNorm && studentNorm === correctNorm) {
        answerItem.isCorrect = true;
        answerItem.pointsEarned = question.points;
        sectionScore += question.points;
      } else {
        answerItem.isCorrect = false;
        answerItem.pointsEarned = 0;
      }
    });

    sectionResult.score = sectionScore;
    totalPoints += sectionScore;
    if (section.skill !== "writing") {
      skillScores[section.skill] += sectionScore;
    }
  });

  const timeSpentMinutes = Math.round((new Date() - result.startedAt) / 60000);

  result.score.totalPoints = totalPoints;
  result.score.percentage =
    result.score.maxPoints > 0
      ? Math.round((totalPoints / result.score.maxPoints) * 100)
      : 0;
  result.score.passed = result.score.percentage >= exam.passingScore;
  result.skillScores = skillScores;
  result.submittedAt = new Date();
  result.timeSpentMinutes = timeSpentMinutes;

  result.status = hasWriting ? "submitted" : "graded";
  await result.save();

  if (result.status === "graded") {
    exam.stats.attemptCount += 1;
    const avgScore =
      (exam.stats.averageScore * (exam.stats.attemptCount - 1) +
        result.score.percentage) /
      exam.stats.attemptCount;
    exam.stats.averageScore = Math.round(avgScore * 100) / 100;
    await exam.save();
  }

  return ApiRes.success(res, "Exam submitted successfully", {
    score: result.score,
    skillScores: result.skillScores,
    timeSpentMinutes: result.timeSpentMinutes,
    passed: result.score.passed,
    status: result.status,
    message: hasWriting
      ? "Writing section needs teacher grading"
      : "Exam fully graded",
  });
});

// Get my exam results (graded only)
exports.getMyResults = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;

  const query = { student: req.user.id, status: "graded" };
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [results, total] = await Promise.all([
    ExamResult.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate("exam", "title level timeLimitMinutes")
      .populate("course", "title")
      .select("-sectionResults.answers")
      .lean(),
    ExamResult.countDocuments(query),
  ]);

  return ApiRes.successWithMeta(
    res,
    "Results retrieved successfully",
    results,
    {
      page: parseInt(page),
      limit: parseInt(limit),
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
    }
  );
});

// Get result detail
exports.getResultDetail = asyncHandler(async (req, res) => {
  const { resultId } = req.params;

  const result = await ExamResult.findById(resultId)
    .populate("exam")
    .populate("course", "title");

  if (!result) throw new NotFoundError("Result not found");

  if (
    req.user.role === "student" &&
    result.student.toString() !== req.user.id
  ) {
    throw new ForbiddenError("You cannot view this result");
  }

  if (
    req.user.role === "teacher" &&
    result.exam.createdBy.toString() !== req.user.id
  ) {
    throw new ForbiddenError("You cannot view this result");
  }

  return ApiRes.success(res, "Result detail retrieved successfully", result);
});

// Get my exam history (all attempts)
exports.getMyExamHistory = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { page = 1, limit = 20 } = req.query;

  const exam = await Exam.findById(examId);
  if (!exam) throw new NotFoundError("Exam not found");

  if (exam.course) {
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: exam.course,
    });
    if (!enrollment) {
      throw new ForbiddenError("You are not enrolled in this course");
    }
  }

  const query = { exam: examId, student: req.user.id };
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [results, total] = await Promise.all([
    ExamResult.find(query)
      .sort({ submittedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .select(
        "score skillScores status startedAt submittedAt timeSpentMinutes gradedAt attemptCount"
      )
      .lean(),
    ExamResult.countDocuments(query),
  ]);

  const bestResult =
    results.length > 0
      ? results.reduce((best, current) => {
          return (current.score?.percentage || 0) >
            (best.score?.percentage || 0)
            ? current
            : best;
        })
      : null;

  return ApiRes.success(res, "Exam history retrieved successfully", {
    exam: {
      _id: exam._id,
      title: exam.title,
      level: exam.level,
      skills: exam.skills,
      timeLimitMinutes: exam.timeLimitMinutes,
      totalPoints: exam.totalPoints,
      passingScore: exam.passingScore,
    },
    attempts: results,
    statistics: {
      totalAttempts: total,
      bestScore: bestResult?.score?.percentage || 0,
      passed: bestResult?.score?.passed || false,
      averageScore:
        results.length > 0
          ? Math.round(
              (results.reduce((sum, r) => sum + (r.score?.percentage || 0), 0) /
                results.length) *
                100
            ) / 100
          : 0,
    },
    pagination: {
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
    },
  });
});

// ==================== TEACHER GRADING ====================

// Grade writing section (for teacher)
exports.gradeWriting = asyncHandler(async (req, res) => {
  const { resultId } = req.params;
  const { grades } = req.body;

  const result = await ExamResult.findById(resultId)
    .populate("exam")
    .populate("course");

  if (!result) throw new NotFoundError("Exam result not found");

  const exam = result.exam;
  if (exam.createdBy.toString() !== req.user.id) {
    throw new ForbiddenError("You are not the owner of this exam");
  }

  if (result.status === "graded") {
    throw new BadRequestError("This exam has already been fully graded");
  }

  let writingScore = 0;

  result.sectionResults.forEach((sectionResult) => {
    const section = exam.sections.find(
      (s) => s._id.toString() === sectionResult.sectionId.toString()
    );
    if (!section || section.skill !== "writing") return;

    sectionResult.answers.forEach((answerItem) => {
      const grade = grades.find(
        (g) => g.questionId === answerItem.questionId.toString()
      );
      if (!grade) return;

      const question = section.questions.find(
        (q) => q._id.toString() === answerItem.questionId.toString()
      );
      if (!question) return;

      const points = Math.min(Math.max(0, grade.pointsEarned), question.points);

      answerItem.pointsEarned = points;
      answerItem.isCorrect = points === question.points;
      answerItem.feedback = grade.feedback || "";
      writingScore += points;
    });

    sectionResult.score = writingScore;
  });

  let totalPoints = 0;
  const skillScores = { listening: 0, reading: 0, writing: 0 };

  result.sectionResults.forEach((sectionResult) => {
    const section = exam.sections.find(
      (s) => s._id.toString() === sectionResult.sectionId.toString()
    );
    if (!section) return;

    totalPoints += sectionResult.score;
    skillScores[section.skill] = sectionResult.score;
  });

  result.score.totalPoints = totalPoints;
  result.score.percentage =
    result.score.maxPoints > 0
      ? Math.round((totalPoints / result.score.maxPoints) * 100)
      : 0;
  result.score.passed = result.score.percentage >= exam.passingScore;
  result.skillScores = skillScores;
  result.status = "graded";
  result.gradedAt = new Date();
  result.gradedBy = req.user.id;

  await result.save();

  exam.stats.attemptCount += 1;
  const avgScore =
    (exam.stats.averageScore * (exam.stats.attemptCount - 1) +
      result.score.percentage) /
    exam.stats.attemptCount;
  exam.stats.averageScore = Math.round(avgScore * 100) / 100;
  await exam.save();

  return ApiRes.success(res, "Writing section graded successfully", {
    score: result.score,
    skillScores: result.skillScores,
    passed: result.score.passed,
  });
});

// ==================== HSK UPLOAD – ExamQuestion ====================

// POST /api/exams/:examId/questions
exports.saveExamQuestionsFromUpload = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  // ===================== 1) UNWRAP + NORMALIZE BODY =====================
  let {
    newQuestions,
    reading1Images,
    reading2WordBank,
    reading4BankFirst,
    reading4BankSecond,
  } = req.body || {};

  // Case FE gửi nhầm dạng: { newQuestions: { newQuestions:[...], reading1Images... } }
  if (
    newQuestions &&
    !Array.isArray(newQuestions) &&
    Array.isArray(newQuestions.newQuestions)
  ) {
    const wrapper = newQuestions;
    newQuestions = wrapper.newQuestions;
    reading1Images = reading1Images ?? wrapper.reading1Images;
    reading2WordBank = reading2WordBank ?? wrapper.reading2WordBank;
    reading4BankFirst = reading4BankFirst ?? wrapper.reading4BankFirst;
    reading4BankSecond = reading4BankSecond ?? wrapper.reading4BankSecond;
  }

  if (!examId) throw new BadRequestError("examId is required");
  if (!Array.isArray(newQuestions) || newQuestions.length === 0) {
    throw new BadRequestError("newQuestions must be a non-empty array");
  }

  const exam = await Exam.findById(examId);
  if (!exam) throw new NotFoundError("Exam not found");

  if (exam.createdBy.toString() !== req.user.id) {
    throw new ForbiddenError("You are not the owner of this exam");
  }

  // ✅ xoá old questions trong collection
  await ExamQuestion.deleteMany({ exam: examId });

  const docsToInsert = [];

  const sectionsMap = {
    listening: {
      skill: "listening",
      title: "听力",
      instructions: "",
      audioUrl: "",
      questions: [],
    },
    reading: {
      skill: "reading",
      title: "阅读",
      instructions: "",
      audioUrl: "",
      questions: [],
    },
    writing: {
      skill: "writing",
      title: "写作",
      instructions: "",
      audioUrl: "",
      questions: [],
    },
  };

  // ===================== 2) BUILD QUESTIONS (FIX) =====================
  const TOTAL_HSK2 = 80; // 1–35 nghe, 36–70 đọc, 71–80 viết

  const detectOrderNo = (parent, fallback) => {
    if (typeof parent?.orderNo === "number") return parent.orderNo;

    const s = parent?.parentQuestion || "";
    const m = s.match(/Câu\s*(\d{1,2})/i);
    if (m) return parseInt(m[1], 10);

    return fallback;
  };

  const sanitizeChild = (c, fallbackNo) => {
    const rawContent = typeof c?.content === "string" ? c.content.trim() : "";

    const safeContent =
      rawContent.length > 0 ? rawContent : `[EMPTY CONTENT ${fallbackNo}]`;

    const safeOptions = Array.isArray(c?.options)
      ? c.options
          .filter(
            (o) =>
              o &&
              typeof o.id === "string" &&
              o.id.trim() &&
              typeof o.text === "string" &&
              o.text.trim()
          )
          .map((o) => ({
            id: o.id.trim().toLowerCase(),
            text: o.text.trim(),
          }))
      : [];

    return {
      content: safeContent,
      type: c?.type || "multiple_choice",
      correctAnswer: c?.correctAnswer || "",
      options: safeOptions,
    };
  };

  const parentByNo = {};
  newQuestions.forEach((parent, index) => {
    const orderNo = detectOrderNo(parent, index + 1);
    if (!orderNo || orderNo < 1 || orderNo > TOTAL_HSK2) return;
    parentByNo[orderNo] = parent;
  });

  for (let no = 1; no <= TOTAL_HSK2; no++) {
    const parent = parentByNo[no] || {
      parentQuestion:
        no <= 35
          ? `HSK 2 - 听力 - Câu ${no}`
          : no <= 70
          ? `HSK 2 - 阅读 - Câu ${no}`
          : `HSK 2 - 写作 - Câu ${no}`,
      paragraph: "",
      imgUrl: "",
      audioUrl: "",
      childQuestions: [
        {
          content: `[EMPTY CONTENT ${no}]`,
          type: "multiple_choice",
          correctAnswer: "",
          options: [],
        },
      ],
    };

    const rawChildren = Array.isArray(parent.childQuestions)
      ? parent.childQuestions
      : [];

    const childQuestions =
      rawChildren.length > 0
        ? rawChildren.map((c) => sanitizeChild(c, no))
        : [
            sanitizeChild(
              { content: `[EMPTY CONTENT ${no}]`, options: [] },
              no
            ),
          ];

    let sectionType = null;
    if (typeof parent.parentQuestion === "string") {
      if (parent.parentQuestion.includes("听力")) sectionType = "listening";
      if (parent.parentQuestion.includes("阅读")) sectionType = "reading";
      if (parent.parentQuestion.includes("写作")) sectionType = "writing";
    }

    // fallback: 1–35 listening, 36–70 reading, 71–80 writing
    if (!sectionType) {
      if (no >= 1 && no <= 35) sectionType = "listening";
      else if (no >= 36 && no <= 70) sectionType = "reading";
      else sectionType = "writing";
    }

    const imgUrls = Array.isArray(parent.imgUrls)
      ? parent.imgUrls.filter(Boolean)
      : [];

    if (parent.imgUrl && !imgUrls.includes(parent.imgUrl)) {
      imgUrls.unshift(parent.imgUrl);
    }

    const legacyImgUrl = imgUrls[0] || parent.imgUrl || "";

    docsToInsert.push({
      exam: examId,
      parentQuestion: parent.parentQuestion || "",
      paragraph: parent.paragraph || "",
      imgUrl: legacyImgUrl,
      imgUrls,
      audioUrl: parent.audioUrl || "",
      childQuestions,
      orderNo: no,
      sectionType,
    });

    const embeddedQs = childQuestions.map((cq) => ({
      content: cq.content,
      options: (cq.options || []).map((o) => `${o.id}. ${o.text}`),
      correctAnswer: cq.correctAnswer || "",
      audioUrl: parent.audioUrl || "",
      imageUrl: legacyImgUrl,
      imageUrls: imgUrls,
      points: 1,
    }));

    if (sectionType && sectionsMap[sectionType]) {
      sectionsMap[sectionType].questions.push(...embeddedQs);
    }
  }

  if (docsToInsert.length !== TOTAL_HSK2) {
    throw new BadRequestError(
      `HSK2 must have exactly ${TOTAL_HSK2} questions, got ${docsToInsert.length}`
    );
  }

  let created = [];
  try {
    created = await ExamQuestion.insertMany(docsToInsert, { ordered: true });
  } catch (e) {
    console.error("INSERT MANY ERROR:", e);
    throw new BadRequestError(e.message);
  }

  const newSections = Object.values(sectionsMap).filter(
    (s) => s.questions.length > 0
  );

  // ===================== 3) SAVE INTO EXAM =====================
  exam.sections = newSections;
  exam.skills = newSections.map((s) => s.skill);

  if (Array.isArray(reading1Images)) exam.reading1Images = reading1Images;
  if (Array.isArray(reading2WordBank)) exam.reading2WordBank = reading2WordBank;
  if (Array.isArray(reading4BankFirst))
    exam.reading4BankFirst = reading4BankFirst;
  if (Array.isArray(reading4BankSecond))
    exam.reading4BankSecond = reading4BankSecond;

  await exam.save();

  return ApiRes.success(res, "Exam questions imported successfully", {
    inserted: created.length,
    sections: exam.sections,
    totalPoints: exam.totalPoints,
    reading1Images: exam.reading1Images,
    reading2WordBank: exam.reading2WordBank,
    reading4BankFirst: exam.reading4BankFirst,
    reading4BankSecond: exam.reading4BankSecond,
  });
});

// GET /api/exams/:examId/questions
// Dùng cho màn EditListQuestion – cập nhật lại parentQuestion, childQuestions, options, imgUrl, audioUrl
exports.updateExamQuestionsFromEdit = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  let {
    questions,
    reading1Images,
    reading2WordBank,
    reading4BankFirst,
    reading4BankSecond,
  } = req.body || {};

  if (!examId) throw new BadRequestError("examId is required");
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new BadRequestError("questions must be a non-empty array");
  }

  const exam = await Exam.findById(examId);
  if (!exam) throw new NotFoundError("Exam not found");

  if (exam.createdBy.toString() !== req.user.id) {
    throw new ForbiddenError("You are not the owner of this exam");
  }

  // === helper ===
  const sanitizeChild = (c, fallbackNo) => {
    const rawContent = typeof c?.content === "string" ? c.content.trim() : "";
    const safeContent =
      rawContent.length > 0 ? rawContent : `[EMPTY CONTENT ${fallbackNo}]`;

    const safeOptions = Array.isArray(c?.options)
      ? c.options
          .filter(
            (o) =>
              o &&
              typeof o.id === "string" &&
              o.id.trim() &&
              typeof o.text === "string" &&
              o.text.trim()
          )
          .map((o) => ({
            id: o.id.trim().toLowerCase(),
            text: o.text.trim(),
          }))
      : [];

    return {
      content: safeContent,
      type: c?.type || "multiple_choice",
      correctAnswer: (c?.correctAnswer || "").toLowerCase(),
      options: safeOptions,
    };
  };

  const inferSectionType = (q, orderNo) => {
    if (q.sectionType) return q.sectionType; // FE có gửi thì dùng luôn

    const p = q.parentQuestion || "";
    if (p.includes("听力")) return "listening";
    if (p.includes("阅读")) return "reading";
    if (p.includes("写作")) return "writing";

    // fallback theo số câu HSK2
    if (orderNo >= 1 && orderNo <= 35) return "listening";
    if (orderNo >= 36 && orderNo <= 70) return "reading";
    return "writing";
  };

  const sectionsMap = {
    listening: {
      skill: "listening",
      title: "听力",
      instructions: "",
      audioUrl: "",
      questions: [],
    },
    reading: {
      skill: "reading",
      title: "阅读",
      instructions: "",
      audioUrl: "",
      questions: [],
    },
    writing: {
      skill: "writing",
      title: "写作",
      instructions: "",
      audioUrl: "",
      questions: [],
    },
  };

  // === 1. Xoá toàn bộ câu hỏi cũ của exam ===
  await ExamQuestion.deleteMany({ exam: examId });

  // === 2. Build docs mới từ list questions FE gửi lên ===
  const docsToInsert = [];

  // sort theo orderNo để embed vào sections đúng thứ tự
  const sorted = [...questions].sort(
    (a, b) => (a.orderNo || 0) - (b.orderNo || 0)
  );

  sorted.forEach((q, index) => {
    const orderNo =
      typeof q.orderNo === "number" && q.orderNo > 0 ? q.orderNo : index + 1;

    const rawChildren = Array.isArray(q.childQuestions) ? q.childQuestions : [];

    const childQuestions =
      rawChildren.length > 0
        ? rawChildren.map((c) => sanitizeChild(c, orderNo))
        : [
            sanitizeChild(
              { content: `[EMPTY CONTENT ${orderNo}]`, options: [] },
              orderNo
            ),
          ];

    const sectionType = inferSectionType(q, orderNo);

    const imgUrls = Array.isArray(q.imgUrls) ? q.imgUrls.filter(Boolean) : [];
    if (q.imgUrl && !imgUrls.includes(q.imgUrl)) {
      imgUrls.unshift(q.imgUrl);
    }
    const legacyImgUrl = imgUrls[0] || q.imgUrl || "";

    docsToInsert.push({
      exam: examId,
      parentQuestion: q.parentQuestion || "",
      paragraph: q.paragraph || "",
      imgUrl: legacyImgUrl,
      imgUrls,
      audioUrl: q.audioUrl || "",
      childQuestions,
      orderNo,
      sectionType,
    });

    // embed sang sections của Exam
    const embeddedQs = childQuestions.map((cq) => ({
      content: cq.content,
      options: (cq.options || []).map((o) => `${o.id}. ${o.text}`),
      correctAnswer: cq.correctAnswer || "",
      audioUrl: q.audioUrl || "",
      imageUrl: legacyImgUrl,
      imageUrls: imgUrls,
      points: 1,
    }));

    if (sectionType && sectionsMap[sectionType]) {
      sectionsMap[sectionType].questions.push(...embeddedQs);
    }
  });

  const created = await ExamQuestion.insertMany(docsToInsert, {
    ordered: true,
  });

  const newSections = Object.values(sectionsMap).filter(
    (s) => s.questions.length > 0
  );

  // === 3. Lưu ngược lại vào Exam ===
  exam.sections = newSections;
  exam.skills = newSections.map((s) => s.skill);

  if (Array.isArray(reading1Images)) exam.reading1Images = reading1Images;
  if (Array.isArray(reading2WordBank)) exam.reading2WordBank = reading2WordBank;
  if (Array.isArray(reading4BankFirst))
    exam.reading4BankFirst = reading4BankFirst;
  if (Array.isArray(reading4BankSecond))
    exam.reading4BankSecond = reading4BankSecond;

  await exam.save();

  return ApiRes.success(res, "Exam questions updated successfully", {
    updated: created.length,
    sections: exam.sections,
    totalPoints: exam.totalPoints,
    reading1Images: exam.reading1Images,
    reading2WordBank: exam.reading2WordBank,
    reading4BankFirst: exam.reading4BankFirst,
    reading4BankSecond: exam.reading4BankSecond,
  });
});

// PUT /api/exams/:examId/schedule
exports.updateExamSchedule = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { startAt, endAt, timezone } = req.body || {};

  const exam = await Exam.findById(examId);
  if (!exam) throw new NotFoundError("Exam not found");

  if (exam.createdBy.toString() !== req.user.id) {
    throw new ForbiddenError("You are not the owner of this exam");
  }

  // CASE 1: clear schedule -> mở vĩnh viễn
  if (!startAt && !endAt) {
    exam.scheduleStartAt = null;
    exam.scheduleEndAt = null;
    if (timezone) exam.scheduleTimezone = timezone;

    await exam.save();
    return ApiRes.success(res, "Schedule cleared (open forever)", exam);
  }

  // CASE 2: set schedule (phải đủ cả 2)
  if (!startAt || !endAt) {
    throw new BadRequestError("startAt and endAt are required together");
  }

  const startDate = new Date(startAt);
  const endDate = new Date(endAt);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    throw new BadRequestError("startAt/endAt must be valid datetime");
  }

  if (endDate <= startDate) {
    throw new BadRequestError("endAt must be greater than startAt");
  }

  exam.scheduleStartAt = startDate;
  exam.scheduleEndAt = endDate;
  if (timezone) exam.scheduleTimezone = timezone;

  await exam.save();

  return ApiRes.success(res, "Schedule updated", exam);
});

// GET /api/exams/info/:examId  (lightweight metadata only)
exports.getExamInfoById = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  if (!examId) throw new BadRequestError("examId is required");

  const exam = await Exam.findById(examId)
    .select(
      [
        "title",
        "description",
        "level",
        "skills",
        "timeLimitMinutes",
        "scheduleStartAt",
        "scheduleEndAt",
        "scheduleTimezone",
        "totalPoints",
        "passingScore",
        "course",
        "createdBy",
        "status",
        "listeningAudios",
        "stats",
        "createdAt",
        "updatedAt",
      ].join(" ")
    )
    .populate("course", "title assignedTeacher")
    .lean();

  if (!exam) throw new NotFoundError("Exam not found");

  // ===================== PERMISSION =====================
  if (req.user.role === "teacher") {
    if (exam.createdBy.toString() !== req.user.id) {
      throw new ForbiddenError("You cannot view this exam");
    }
  } else {
    if (exam.status !== "published") {
      throw new ForbiddenError("Exam is not available");
    }

    if (exam.course) {
      const enrollment = await Enrollment.findOne({
        user: req.user.id,
        course: exam.course,
      });
      if (!enrollment) {
        throw new ForbiddenError("You are not enrolled in this course");
      }
    }
  }

  const questionCount = await ExamQuestion.countDocuments({ exam: examId });

  // ✅ MULTI attempts: trả tổng lần + latest attempt
  let myAttempt = { attempted: false, attemptCount: 0 };
  if (req.user.role === "student") {
    const [attemptTotal, latestAttempt] = await Promise.all([
      ExamResult.countDocuments({ exam: examId, student: req.user.id }),
      ExamResult.findOne({ exam: examId, student: req.user.id })
        .sort({ startedAt: -1, createdAt: -1 })
        .select("status score.passed startedAt submittedAt")
        .lean(),
    ]);

    if (attemptTotal > 0 && latestAttempt) {
      myAttempt = {
        attempted: true,
        attemptCount: attemptTotal,
        passed: latestAttempt.score?.passed || false,
        status: latestAttempt.status,
        latestAttemptAt: latestAttempt.submittedAt || latestAttempt.startedAt,
      };
    }
  }

  return ApiRes.success(res, "Exam info retrieved successfully", {
    ...exam,
    questionCount,
    hasQuestions: questionCount > 0,
    isOpenNow: isExamOpenNow(exam),
    myAttempt,
  });
});

// Lấy đề để làm bài từ một attempt cụ thể
// GET /api/exams/take/:examId?attemptId=...
exports.takeExam = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { attemptId } = req.query;

  if (!attemptId) {
    throw new BadRequestError(
      "attemptId is required (please start exam first)"
    );
  }

  const exam = await Exam.findById(examId);
  if (!exam) throw new NotFoundError("Exam not found");

  // chỉ cho thi exam đã publish + đang mở
  if (exam.status !== "published") {
    throw new BadRequestError("Exam is not available");
  }
  if (!isExamOpenNow(exam)) {
    throw new BadRequestError("Exam is not open at this time");
  }

  // nếu exam thuộc course thì phải enrolled
  if (exam.course) {
    const enrollment = await Enrollment.findOne({
      user: req.user.id,
      course: exam.course,
    });
    if (!enrollment) {
      throw new ForbiddenError("You are not enrolled in this course");
    }
  }

  // lấy attempt từ start-exam
  const result = await ExamResult.findById(attemptId);
  if (!result) throw new NotFoundError("Exam attempt not found");

  if (result.exam.toString() !== examId) {
    throw new BadRequestError("This attempt does not belong to this exam");
  }
  if (result.student.toString() !== req.user.id) {
    throw new ForbiddenError("This is not your attempt");
  }

  // nếu attempt đã submit/graded thì không cho vào làm nữa
  if (result.status !== "in_progress") {
    throw new BadRequestError("This exam attempt is not in progress");
  }

  // xoá đáp án đúng trước khi trả về FE
  const examData = exam.toObject();
  examData.sections.forEach((section) => {
    section.questions.forEach((q) => {
      delete q.correctAnswer;
    });
  });

  return ApiRes.success(res, "Exam data retrieved successfully", {
    exam: examData,
    attemptId: result._id,
    attemptCount: result.attemptCount || 1,
    timeLimitMinutes: exam.timeLimitMinutes,
    startedAt: result.startedAt,
    status: result.status,
  });
});
// POST /api/exams/:examId/listening-audios
exports.attachListeningAudios = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { audios } = req.body || {};

  if (!examId) throw new BadRequestError("examId is required");

  if (!Array.isArray(audios) || audios.length === 0) {
    throw new BadRequestError("audios must be a non-empty array");
  }

  const exam = await Exam.findById(examId);
  if (!exam) throw new NotFoundError("Exam not found");

  if (exam.createdBy.toString() !== req.user.id) {
    throw new ForbiddenError("You are not the owner of this exam");
  }

  const normalized = audios
    .filter((a) => a && a.url)
    .map((a) => ({
      url: a.url,
      name: a.name || a.url,
      provider: "firebase",
      createdAt: new Date(),
    }));

  if (normalized.length === 0) {
    throw new BadRequestError(
      "audios array must contain at least one valid url"
    );
  }

  exam.listeningAudios = [...(exam.listeningAudios || []), ...normalized];
  await exam.save();

  return ApiRes.success(res, "Listening audios attached successfully", {
    listeningAudios: exam.listeningAudios,
  });
});

// DELETE /api/exams/:examId/listening-audios
exports.removeListeningAudio = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { url } = req.body || {};

  if (!examId || !url) {
    throw new BadRequestError("examId and url are required");
  }

  const exam = await Exam.findById(examId);
  if (!exam) throw new NotFoundError("Exam not found");

  if (exam.createdBy.toString() !== req.user.id) {
    throw new ForbiddenError("You are not the owner of this exam");
  }

  exam.listeningAudios = (exam.listeningAudios || []).filter(
    (a) => a.url !== url
  );

  await exam.save();

  return ApiRes.success(res, "Listening audio removed", {
    listeningAudios: exam.listeningAudios,
  });
});
// PUT /api/exams/:examId/questions/:questionId
// Update 1 parent question HSK (kèm childQuestions, đáp án, ảnh, audio)
exports.updateSingleExamQuestion = asyncHandler(async (req, res) => {
  const { examId, questionId } = req.params;
  const payload = req.body || {};

  if (!examId || !questionId) {
    throw new BadRequestError("examId and questionId are required");
  }

  const exam = await Exam.findById(examId);
  if (!exam) throw new NotFoundError("Exam not found");

  if (exam.createdBy.toString() !== req.user.id) {
    throw new ForbiddenError("You are not the owner of this exam");
  }

  const doc = await ExamQuestion.findOne({ _id: questionId, exam: examId });
  if (!doc) throw new NotFoundError("Exam question not found");

  // -------- helper: chuẩn hoá child question ----------
  const sanitizeChild = (c, fallbackNo) => {
    const rawContent = typeof c?.content === "string" ? c.content.trim() : "";
    const safeContent =
      rawContent.length > 0 ? rawContent : `[EMPTY CONTENT ${fallbackNo}]`;

    const safeOptions = Array.isArray(c?.options)
      ? c.options
          .filter(
            (o) =>
              o &&
              typeof o.id === "string" &&
              o.id.trim() &&
              typeof o.text === "string" &&
              o.text.trim()
          )
          .map((o) => ({
            id: o.id.trim().toLowerCase(),
            text: o.text.trim(),
          }))
      : [];

    return {
      content: safeContent,
      type: c?.type || "multiple_choice",
      correctAnswer: (c?.correctAnswer || "").toLowerCase(),
      options: safeOptions,
    };
  };

  // -------- update parent fields ----------
  if (typeof payload.parentQuestion === "string") {
    doc.parentQuestion = payload.parentQuestion;
  }
  if (typeof payload.paragraph === "string") {
    doc.paragraph = payload.paragraph;
  }
  if (typeof payload.audioUrl === "string") {
    doc.audioUrl = payload.audioUrl;
  }

  // ảnh: imgUrl (legacy) + imgUrls (array)
  let imgUrls = Array.isArray(payload.imgUrls)
    ? payload.imgUrls.filter(Boolean)
    : Array.isArray(doc.imgUrls)
    ? doc.imgUrls.filter(Boolean)
    : [];

  if (payload.imgUrl) {
    doc.imgUrl = payload.imgUrl;
    if (!imgUrls.includes(payload.imgUrl)) imgUrls.unshift(payload.imgUrl);
  }
  doc.imgUrls = imgUrls;

  // childQuestions
  if (Array.isArray(payload.childQuestions)) {
    const baseNo = doc.orderNo || 1;
    doc.childQuestions = payload.childQuestions.map((c, idx) =>
      sanitizeChild(c, baseNo + idx)
    );
  }

  // nếu FE cho phép đổi sectionType thì nhận luôn, không thì giữ cũ
  if (
    payload.sectionType &&
    ["listening", "reading", "writing"].includes(payload.sectionType)
  ) {
    doc.sectionType = payload.sectionType;
  }

  await doc.save();

  // -------- Rebuild exam.sections từ toàn bộ ExamQuestion của exam ----------
  const allDocs = await ExamQuestion.find({ exam: examId })
    .sort({ orderNo: 1 })
    .lean();

  const sectionsMap = {
    listening: {
      skill: "listening",
      title: "听力",
      instructions: "",
      audioUrl: "",
      questions: [],
    },
    reading: {
      skill: "reading",
      title: "阅读",
      instructions: "",
      audioUrl: "",
      questions: [],
    },
    writing: {
      skill: "writing",
      title: "写作",
      instructions: "",
      audioUrl: "",
      questions: [],
    },
  };

  allDocs.forEach((qDoc) => {
    const sectionType =
      qDoc.sectionType || (qDoc.parentQuestion || "").includes("听力")
        ? "listening"
        : (qDoc.parentQuestion || "").includes("阅读")
        ? "reading"
        : (qDoc.parentQuestion || "").includes("写作")
        ? "writing"
        : null;

    if (!sectionType || !sectionsMap[sectionType]) return;

    const imgs = Array.isArray(qDoc.imgUrls)
      ? qDoc.imgUrls.filter(Boolean)
      : [];
    const legacyImgUrl = qDoc.imgUrl || imgs[0] || "";

    const embeddedQs = (qDoc.childQuestions || []).map((cq) => ({
      content: cq.content,
      options: (cq.options || []).map((o) => `${o.id}. ${o.text}`),
      correctAnswer: cq.correctAnswer || "",
      audioUrl: qDoc.audioUrl || "",
      imageUrl: legacyImgUrl,
      imageUrls: imgs,
      points: cq.points || 1,
    }));

    sectionsMap[sectionType].questions.push(...embeddedQs);
  });

  const newSections = Object.values(sectionsMap).filter(
    (s) => s.questions.length > 0
  );

  exam.sections = newSections;
  exam.skills = newSections.map((s) => s.skill);
  await exam.save();

  return ApiRes.success(res, "Exam question updated successfully", {
    question: doc,
    sections: exam.sections,
  });
});
// GET /api/exams/:examId/questions
// Lấy toàn bộ parentQuestion + childQuestions để màn Edit dùng
exports.getExamQuestions = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  if (!examId) throw new BadRequestError("examId is required");

  const exam = await Exam.findById(examId);
  if (!exam) throw new NotFoundError("Exam not found");

  // chỉ cho owner xem/sửa
  if (exam.createdBy.toString() !== req.user.id) {
    throw new ForbiddenError("You are not the owner of this exam");
  }

  const questions = await ExamQuestion.find({ exam: examId })
    .sort({ orderNo: 1 })
    .lean();

  return ApiRes.success(res, "Exam questions retrieved successfully", {
    examId,
    questions,
    reading1Images: exam.reading1Images,
    reading2WordBank: exam.reading2WordBank,
    reading4BankFirst: exam.reading4BankFirst,
    reading4BankSecond: exam.reading4BankSecond,
  });
});
exports.getTeacherExamStats = async (req, res) => {
  const { examId } = req.params;

  const attempts = await ExamResult.find({ exam: examId })
    .populate("student", "name email avatar")
    .lean();

  // Basic numbers
  const submitted = attempts.filter((a) => a.status === "submitted");
  const inProgress = attempts.filter((a) => a.status === "in_progress");

  const totalAttempts = attempts.length;
  const submittedCount = submitted.length;

  // Scores
  const scores = submitted.map((a) => a.score.totalPercentage);
  const averageScore =
    scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

  const highestScore = Math.max(...scores, 0);
  const lowestScore = Math.min(...scores, 100);

  // Pass rate
  const passCount = submitted.filter((a) => a.score.passed).length;
  const passRate =
    submittedCount === 0 ? 0 : (passCount / submittedCount) * 100;

  // Score distribution
  const scoreDistribution = {
    "0-50": scores.filter((s) => s <= 50).length,
    "50-70": scores.filter((s) => s > 50 && s <= 70).length,
    "70-85": scores.filter((s) => s > 70 && s <= 85).length,
    "85-100": scores.filter((s) => s > 85).length,
  };

  // Skill breakdown (if exists)
  const skillBreakdown = {
    listening: {
      avg: average(submitted.map((a) => a.score.skills?.listening ?? 0)),
      max: Math.max(...submitted.map((a) => a.score.skills?.listening ?? 0)),
    },
    reading: {
      avg: average(submitted.map((a) => a.score.skills?.reading ?? 0)),
      max: Math.max(...submitted.map((a) => a.score.skills?.reading ?? 0)),
    },
    writing: {
      avg: average(submitted.map((a) => a.score.skills?.writing ?? 0)),
      max: Math.max(...submitted.map((a) => a.score.skills?.writing ?? 0)),
    },
  };

  // Ranking
  const ranking = submitted
    .map((a) => ({
      name: a.student.name,
      email: a.student.email,
      avatar: a.student.avatar,
      score: a.score.totalPercentage,
    }))
    .sort((a, b) => b.score - a.score)
    .map((r, i) => ({ ...r, rank: i + 1 }));

  return ApiRes.success(res, "Teacher exam statistics", {
    statistics: {
      totalAttempts,
      submittedCount,
      inProgressCount: inProgress.length,
      averageScore,
      highestScore,
      lowestScore,
      passRate,
    },
    scoreDistribution,
    skillBreakdown,
    ranking,
    attempts,
  });
};

const average = (arr) =>
  arr.length === 0 ? 0 : arr.reduce((a, b) => a + b) / arr.length;
exports.getStudentsJoinedExam = async (req, res) => {
  try {
    const { examId } = req.params;

    const submissions = await ExamResult.find({ exam: examId })
      .populate("student", "name email avatar") // 🔥 FIXED
      .lean();

    const list = submissions.map((s) => ({
      userId: s.student._id, // 🔥 đổi s.user => s.student
      name: s.student.name,
      email: s.student.email,
      avatar: s.student.avatar,
      totalScore: s.score?.totalPoints ?? 0, // dùng field thật trong ExamResult
      timeSpent: s.timeSpentMinutes ?? 0,
      isPassed: s.score?.passed ?? false,
    }));

    return ApiRes.success(
      res,
      "Lấy danh sách học viên tham gia bài thi thành công",
      list
    );
  } catch (err) {
    console.error(err);
    return ApiRes.error(res, "Lỗi server", 500);
  }
};
exports.getStudentResult = async (req, res) => {
  try {
    const { examId, studentId } = req.params;

    // Lấy kết quả bài thi
    const result = await ExamResult.findOne({
      exam: examId,
      student: studentId,
      status: { $in: ["submitted", "graded"] },
    })
      .populate("student", "name email avatar")
      .populate("exam")
      .lean();

    if (!result) {
      return ApiRes.error(res, "Không tìm thấy kết quả bài thi", 404);
    }

    const exam = result.exam;

    // ============================================
    // 1) Flatten all questions from exam.sections
    // ============================================
    let allQuestions = [];

    exam.sections.forEach((sec) => {
      sec.questions.forEach((q) => {
        allQuestions.push({
          ...q,
          section: sec.skill, // listening / reading / writing
        });
      });
    });

    // ============================================
    // 2) Base response
    // ============================================
    const response = {
      resultId: result._id,
      user: {
        name: result.student.name,
        email: result.student.email,
        avatar: result.student.avatar,
      },
      exam: {
        title: exam.title,
        level: exam.level,
        skills: exam.skills,
        timeLimitMinutes: exam.timeLimitMinutes,
      },
      score: {
        totalPoints: result.score.totalPoints,
        maxPoints: result.score.maxPoints,
        percentage: result.score.percentage,
        passed: result.score.passed,
      },
      timeSpentMinutes: result.timeSpentMinutes,
      answers: [],
    };

    // ============================================
    // 3) Build each section with childAnswers
    // ============================================
    result.sectionResults.forEach((sec) => {
      const block = {
        section: sec.skill,
        sectionTitle:
          sec.skill === "listening"
            ? "Nghe hiểu"
            : sec.skill === "reading"
            ? "Đọc hiểu"
            : "Viết",
        childAnswers: [],
      };

      sec.answers.forEach((ans) => {
        // ============================================
        // ❗ MATCH CÂU HỎI THEO NỘI DUNG – KHÔNG DÙNG _id
        // ============================================
        const q = allQuestions.find((qq) => {
          return (
            qq.section === sec.skill &&
            qq.correctAnswer === ans.correctAnswer &&
            qq.options?.length === ans.options?.length
          );
        });

        // Nếu không match -> skip
        if (!q) return;

        // Chuẩn hóa options từ dạng "a. text"
        const parsedOptions = (q.options || []).map((opt) => {
          const [id, ...rest] = opt.split(".");
          return {
            id: id.trim(),
            text: rest.join(".").trim(),
          };
        });

        block.childAnswers.push({
          questionId: ans.questionId, // dữ nguyên cho FE
          content: q.content,
          options: parsedOptions,
          answer: ans.answer, // đáp án học viên
          correctAnswer: q.correctAnswer,
          isCorrect: ans.isCorrect,
          pointsEarned: ans.pointsEarned,
          imageUrl: q.imageUrl || null,
          audioUrl: q.audioUrl || null,
        });
      });

      response.answers.push(block);
    });

    return ApiRes.success(res, "Lấy kết quả chi tiết thành công", response);
  } catch (err) {
    console.error(err);
    return ApiRes.error(res, "Lỗi server", 500);
  }
};
