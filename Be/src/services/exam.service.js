const ExamsRepo = require("../models/repos/exams.repo");
const throwError = require("../res/throwError");
const { convert2ObjectId } = require("../utils");

const ExamService = {
  createExam: async (exam) => {
    try {
      if (!exam.courseId) throwError("Course ID bắt buộc");
      if (!exam.title) throwError("Title bắt buộc");
      if (!exam.level) throwError("Level bắt buộc");
      if (!exam.time_limit || typeof exam.time_limit !== "number") {
        throwError("Time limit phải là số");
      }

      // Convert courseId to ObjectId
      exam.courseId = convert2ObjectId(exam.courseId);

      return await ExamsRepo.create(exam);
    } catch (error) {
      console.error("Error in createExam:", error);
      throwError(error.message, error.statusCode || 500);
    }
  },

  getExamsByTag: async ({ tags, level }) => {
    const result = await ExamsRepo.findByTagAndLevel(tags, level.toUpperCase());
    if (!result || result.length === 0)
      throwError("Không tìm thấy bài kiểm tra nào");
    return result;
  },

  getExamsById: async (exam_id) => {
    if (!exam_id) throwError("Exam ID bắt buộc");

    const examObjectId = convert2ObjectId(exam_id);
    const result = await ExamsRepo.findById(examObjectId);

    if (!result) throwError("Không tìm thấy bài kiểm tra nào");
    return result;
  },

  deleteExam: async (exam_id) => {
    if (!exam_id) throwError("Exam ID bắt buộc");

    const examObjectId = convert2ObjectId(exam_id);
    const existExam = await ExamsRepo.findById(examObjectId);
    if (!existExam) throwError("Exam không tìm thấy");

    return await ExamsRepo.delete(examObjectId);
  },

  listAvailableExams: async (filters = {}) => {
    const { level, tags, difficulty, searchTerm } = filters;

    const query = {};

    if (level) query.level = level.toUpperCase();
    if (tags) query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    if (difficulty) query.difficultyLevel = difficulty;
    if (searchTerm) query.title = { $regex: searchTerm, $options: "i" };

    const exams = await ExamsRepo.queryExams(query);
    return exams;
  },
};

module.exports = ExamService;
