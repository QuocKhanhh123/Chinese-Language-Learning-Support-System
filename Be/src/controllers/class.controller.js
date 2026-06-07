const asyncHandler = require("../middleware/asyncHandler");
const Class = require("../models/Class.model");
const Course = require("../models/Course.model");
const User = require("../models/User.model");
const ApiRes = require("../res/ApiRes");
const { NotFoundError, BadRequestError, ForbiddenError } = require("../res/AppError");
const { createClassSchema, updateClassSchema } = require("../validators/class.validator");

// Admin tạo lớp học
exports.createClass = asyncHandler(async (req, res) => {
  const data = createClassSchema.parse(req.body);

  const course = await Course.findById(data.course);
  if (!course) throw new NotFoundError("Khóa học không tồn tại");

  const teacher = await User.findById(data.teacher).select("role");
  if (!teacher || teacher.role !== "teacher")
    throw new BadRequestError("Người dùng được chỉ định phải có role teacher");

  const newClass = await Class.create({
    name:                 data.name,
    course:               data.course,
    teacher:              data.teacher,
    schedule:             data.schedule,
    startDate:            data.startDate,
    endDate:              data.endDate,
    registrationDeadline: data.registrationDeadline,
    maxStudents:          data.maxStudents,
  });

  const populated = await newClass.populate([
    { path: "teacher", select: "name email avatar" },
    { path: "course",  select: "title targetLevel price thumbnail" },
  ]);

  return ApiRes.created(res, "Tạo lớp học thành công", populated);
});

// Admin lấy tất cả lớp (có filter)
exports.getAllClasses = asyncHandler(async (req, res) => {
  const { status, courseId, search, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (courseId) filter.course = courseId;
  if (search) filter.name = { $regex: search, $options: "i" };

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [classes, total] = await Promise.all([
    Class.find(filter)
      .populate("teacher", "name email avatar")
      .populate("course", "title targetLevel price thumbnail")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit)),
    Class.countDocuments(filter),
  ]);

  const result = classes.map((c) => ({
    ...c.toObject(),
    enrolledCount:  c.studentIds.length,
    availableSpots: Math.max(0, c.maxStudents - c.studentIds.length),
    isRegistrationOpen:
      c.status === "open" && new Date() <= new Date(new Date(c.registrationDeadline).setHours(23, 59, 59, 999)),
  }));

  return ApiRes.success(res, "Lấy danh sách lớp thành công", {
    classes: result,
    pagination: { total, page: parseInt(page), limit: parseInt(limit), totalPages: Math.ceil(total / parseInt(limit)) },
  });
});

// Lấy danh sách lớp theo khóa học
exports.getClassesByCourse = asyncHandler(async (req, res) => {
  const { courseId } = req.params;
  const { role } = req.user;

  const filter = { course: courseId };
  // Student chỉ thấy lớp đang mở
  if (role === "student") {
    filter.status = "open";
  }

  const classes = await Class.find(filter)
    .populate("teacher", "name email avatar")
    .sort({ createdAt: 1 });

  const result = classes.map((c) => ({
    ...c.toObject(),
    enrolledCount:  c.studentIds.length,
    availableSpots: Math.max(0, c.maxStudents - c.studentIds.length),
    isRegistrationOpen:
      c.status === "open" && new Date() <= new Date(new Date(c.registrationDeadline).setHours(23, 59, 59, 999)),
  }));

  return ApiRes.success(res, "Lấy danh sách lớp thành công", result);
});

// Chi tiết 1 lớp (populate studentIds đầy đủ)
exports.getClassDetail = asyncHandler(async (req, res) => {
  const { classId } = req.params;

  const cls = await Class.findById(classId)
    .populate("teacher", "name email avatar")
    .populate("course", "title targetLevel price thumbnail description")
    .populate("studentIds", "name email avatar");

  if (!cls) throw new NotFoundError("Lớp học không tồn tại");

  return ApiRes.success(res, "Lấy chi tiết lớp thành công", {
    ...cls.toObject(),
    enrolledCount:  cls.studentIds.length,
    availableSpots: Math.max(0, cls.maxStudents - cls.studentIds.length),
    isRegistrationOpen:
      cls.status === "open" && new Date() <= new Date(new Date(cls.registrationDeadline).setHours(23, 59, 59, 999)),
  });
});

// Học viên xem lớp của mình (đã đăng ký)
exports.getMyClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find({ studentIds: req.user.id })
    .populate("teacher", "name email avatar")
    .populate("course", "title targetLevel price thumbnail")
    .sort({ startDate: 1 });

  const result = classes.map((c) => ({
    ...c.toObject(),
    enrolledCount:  c.studentIds.length,
    availableSpots: Math.max(0, c.maxStudents - c.studentIds.length),
  }));

  return ApiRes.success(res, "Lấy lớp của bạn thành công", result);
});

// Giáo viên xem lớp phụ trách
exports.getTeacherClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find({ teacher: req.user.id })
    .populate("course", "title targetLevel price thumbnail")
    .sort({ startDate: 1 });

  const result = classes.map((c) => ({
    ...c.toObject(),
    enrolledCount: c.studentIds.length,
    availableSpots: Math.max(0, c.maxStudents - c.studentIds.length),
  }));

  return ApiRes.success(res, "Lấy lớp phụ trách thành công", result);
});

// Admin xem các lớp học một giáo viên đang đảm nhận
exports.getClassesByTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;

  const teacher = await User.findById(teacherId).select("role");
  if (!teacher || teacher.role !== "teacher") {
    throw new NotFoundError("Giáo viên không tồn tại");
  }

  const classes = await Class.find({ teacher: teacherId })
    .populate("course", "title targetLevel price thumbnail")
    .populate("teacher", "name email avatar")
    .sort({ startDate: 1 });

  const result = classes.map((c) => ({
    ...c.toObject(),
    enrolledCount: c.studentIds.length,
    availableSpots: Math.max(0, c.maxStudents - c.studentIds.length),
  }));

  return ApiRes.success(res, "Lấy danh sách lớp giáo viên đang dạy thành công", result);
});

// Admin cập nhật lớp
exports.updateClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const data = updateClassSchema.parse(req.body);

  const cls = await Class.findById(classId);
  if (!cls) throw new NotFoundError("Lớp học không tồn tại");

  if (data.teacher) {
    const teacher = await User.findById(data.teacher).select("role");
    if (!teacher || teacher.role !== "teacher")
      throw new BadRequestError("Người dùng được chỉ định phải có role teacher");
  }

  Object.assign(cls, data);
  await cls.save();

  const populated = await cls.populate([
    { path: "teacher", select: "name email avatar" },
    { path: "course",  select: "title targetLevel price thumbnail" },
  ]);

  return ApiRes.success(res, "Cập nhật lớp thành công", populated);
});

// Admin/Teacher đổi trạng thái lớp
exports.changeClassStatus = asyncHandler(async (req, res) => {
  const { classId } = req.params;
  const { status } = req.body;

  const VALID_STATUSES = ["open", "closed", "ongoing", "finished"];
  if (!VALID_STATUSES.includes(status))
    throw new BadRequestError(`Trạng thái không hợp lệ. Chọn một trong: ${VALID_STATUSES.join(", ")}`);

  const cls = await Class.findById(classId)
    .populate("teacher", "name email")
    .populate("course", "title targetLevel");

  if (!cls) throw new NotFoundError("Lớp học không tồn tại");

  // Teacher chỉ được đổi lớp của mình
  if (req.user.role === "teacher" && cls.teacher._id.toString() !== req.user.id)
    throw new ForbiddenError("Bạn không phụ trách lớp này");

  cls.status = status;
  await cls.save();

  return ApiRes.success(res, `Cập nhật trạng thái lớp thành "${status}" thành công`, cls);
});

// Admin xóa lớp (chỉ khi chưa có học viên)
exports.deleteClass = asyncHandler(async (req, res) => {
  const { classId } = req.params;

  const cls = await Class.findById(classId);
  if (!cls) throw new NotFoundError("Lớp học không tồn tại");

  if (cls.studentIds.length > 0)
    throw new BadRequestError("Không thể xóa lớp đã có học viên đăng ký");

  await cls.deleteOne();
  return ApiRes.deleted(res, "Xóa lớp học thành công");
});
