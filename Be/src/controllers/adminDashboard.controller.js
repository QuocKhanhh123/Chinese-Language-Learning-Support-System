const User = require("../models/User.model");
const Course = require("../models/Course.model");
const Enrollment = require("../models/Enrollment.model");
const Order = require("../models/Order.model");
const Exam = require("../models/Exam.model");
const ExamResult = require("../models/ExamResult.model");
const Vocabulary = require("../models/Vocabulary.model");
const Grammar = require("../models/Grammar.model");
const Lesson = require("../models/Lesson.model");
const FlashCard = require("../models/FlashCard.model");
const ApiRes = require("../res/apiRes");

exports.getDashboardOverview = async (req, res) => {
  try {
    const [
      totalUsers,
      students,
      teachers,
      admins,
      activeStudents,
      activeTeachers,

      totalCourses,
      activeCourses,
      draftCourses,
      archivedCourses,

      totalEnrollments,

      levels,

      totalExams,
      publishedExams,
      examAttempts,

      vocabularyCount,
      grammarCount,
      lessonCount,
      flashCardCount,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "student" }),
      User.countDocuments({ role: "teacher" }),
      User.countDocuments({ role: "admin" }),
      User.countDocuments({ role: "student", status: "active" }),
      User.countDocuments({ role: "teacher", status: "active" }),

      Course.countDocuments(),
      Course.countDocuments({ status: "active" }),
      Course.countDocuments({ status: "draft" }),
      Course.countDocuments({ status: "archived" }),

      Enrollment.countDocuments(),

      Course.aggregate([
        { $group: { _id: "$targetLevel", count: { $sum: 1 } } },
      ]),

      Exam.countDocuments(),
      Exam.countDocuments({ status: "published" }),
      ExamResult.countDocuments(),

      Vocabulary.countDocuments(),
      Grammar.countDocuments(),
      Lesson.countDocuments(),
      FlashCard.countDocuments(),
    ]);

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          students,
          teachers,
          admins,
          active: {
            students: activeStudents,
            teachers: activeTeachers,
          },
        },
        courses: {
          total: totalCourses,
          active: activeCourses,
          draft: draftCourses,
          archived: archivedCourses,
        },
        enrollments: {
          total: totalEnrollments,
        },
        learningLevels: levels.map((l) => ({
          level: l._id,
          count: l.count,
        })),
        exams: {
          total: totalExams,
          published: publishedExams,
          attempts: examAttempts,
        },
        content: {
          vocabulary: vocabularyCount,
          grammar: grammarCount,
          lessons: lessonCount,
          flashcards: flashCardCount,
        },
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({
      success: false,
      message: "Dashboard overview failed",
    });
  }
};

// Danh sách học viên đã thanh toán/ghi danh (Order paid)
exports.getPaidStudents = async (req, res) => {
  try {
    const paidStudentIds = await Order.distinct("student", { status: "paid" });
    const students = await User.find({
      _id: { $in: paidStudentIds },
      role: "student",
    })
      .select("-password")
      .lean();

    return ApiRes.success(res, "Lấy danh sách học viên đã thanh toán thành công", {
      apiVersion: 2,
      paidStudentIds,
      total: students.length,
      students,
    });
  } catch (error) {
    console.error("getPaidStudents error:", error);
    return ApiRes.serverError(res, "Không thể lấy danh sách học viên đã thanh toán", error);
  }
};
