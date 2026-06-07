const Question = require("../models/Question.model");
const Course = require("../models/Course.model");
const ApiRes = require("../res/apiRes");
const asyncHandler = require("../middleware/asyncHandler");
const {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
} = require("../res/AppError");

// Create question (teacher)
exports.createQuestion = asyncHandler(async (req, res) => {
  const {
    content,
    options,
    correctAnswer,
    audioUrl,
    imageUrl,
    points,
    skill,
    level,
    courseId,
    tags,
    explanation,
  } = req.body;

  // nếu có courseId thì check teacher có quyền dạy course đó
  let course = null;
  if (courseId) {
    course = await Course.findById(courseId);
    if (!course) {
      throw new NotFoundError("Course not found");
    }
    if (course.assignedTeacher.toString() !== req.user.id) {
      throw new ForbiddenError("You are not the teacher of this course");
    }
  }

  const question = await Question.create({
    content,
    options,
    correctAnswer,
    audioUrl,
    imageUrl,
    points,
    skill,
    level,
    course: course ? course._id : undefined,
    tags,
    explanation,
    createdBy: req.user.id,
  });

  return ApiRes.success(res, "Question created successfully", question);
});

// Update question
exports.updateQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;
  const updates = { ...req.body };

  const question = await Question.findById(questionId);
  if (!question) {
    throw new NotFoundError("Question not found");
  }

  // chỉ giáo viên tạo mới được sửa
  if (question.createdBy.toString() !== req.user.id) {
    throw new ForbiddenError("You are not the owner of this question");
  }

  // nếu đổi courseId thì check quyền
  if (
    updates.courseId &&
    (!question.course || updates.courseId !== question.course.toString())
  ) {
    const course = await Course.findById(updates.courseId);
    if (!course) {
      throw new NotFoundError("Course not found");
    }
    if (course.assignedTeacher.toString() !== req.user.id) {
      throw new ForbiddenError("You are not the teacher of this course");
    }
    updates.course = updates.courseId;
    delete updates.courseId;
  }

  Object.assign(question, updates);
  await question.save();

  return ApiRes.success(res, "Question updated successfully", question);
});

// Delete question
exports.deleteQuestion = asyncHandler(async (req, res) => {
  const { questionId } = req.params;

  const question = await Question.findById(questionId);
  if (!question) {
    throw new NotFoundError("Question not found");
  }

  if (question.createdBy.toString() !== req.user.id) {
    throw new ForbiddenError("You are not the owner of this question");
  }

  await question.deleteOne();

  return ApiRes.success(res, "Question deleted successfully");
});

// Get my question bank (teacher)
exports.getMyQuestions = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, level, skill, courseId, search } = req.query;

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const query = {
    createdBy: req.user.id,
  };

  if (level) query.level = level;
  if (skill) query.skill = skill;
  if (courseId) query.course = courseId;
  if (search) {
    query.content = { $regex: search, $options: "i" };
  }

  const [questions, total] = await Promise.all([
    Question.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .populate("course", "title")
      .lean(),
    Question.countDocuments(query),
  ]);

  return ApiRes.successWithMeta(
    res,
    "Questions retrieved successfully",
    questions,
    {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    }
  );
});

// Get single question detail
exports.getQuestionById = asyncHandler(async (req, res) => {
  const { questionId } = req.params;

  const question = await Question.findById(questionId).populate(
    "course",
    "title"
  );
  if (!question) {
    throw new NotFoundError("Question not found");
  }

  if (question.createdBy.toString() !== req.user.id) {
    throw new ForbiddenError("You are not the owner of this question");
  }

  return ApiRes.success(res, "Question retrieved successfully", question);
});
