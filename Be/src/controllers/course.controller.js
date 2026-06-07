const User = require("../models/User.model");
const Course = require("../models/Course.model");
const Enrollment = require("../models/Enrollment.model");
const Lesson = require("../models/Lesson.model");
const Class = require("../models/Class.model");
const path = require("path");
const fs = require("fs");

const ApiRes = require("../res/apiRes");

exports.getCoursesForAdmin = async (req, res) => {
  const { title, page, limit, targetLevel, status } = req.query;

  const filter = {};
  if (title) {
    filter.title = { $regex: title, $options: "i" };
  }
  if (targetLevel) {
    filter.targetLevel = targetLevel;
  }
  if (status) {
    filter.status = status;
  }
  const skip = (page - 1) * limit;
  const courses = await Course.find(filter)
    .sort({ createdAt: -1 })
    .skip(parseInt(skip))
    .limit(parseInt(limit));

  return ApiRes.success(res, "Lấy danh sách khóa học thành công", courses);
};

exports.getCoursesForTeacher = async (req, res) => {
  const { title, page = 1, limit = 10, targetLevel, status } = req.query;

  const filter = { assignedTeacher: req.user.id };

  if (title) {
    filter.title = { $regex: title, $options: "i" };
  }
  if (targetLevel) {
    filter.targetLevel = targetLevel;
  }
  if (status) {
    filter.status = status;
  }

  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  const skip = (pageNumber - 1) * limitNumber;

  const [courses, total] = await Promise.all([
    Course.find(filter)
      .populate("assignedTeacher", "name email phone")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNumber)
      .lean(),
    Course.countDocuments(filter),
  ]);

  // Nếu bạn đã có ApiRes.successWithMeta thì dùng cái này
  return ApiRes.successWithMeta(
    res,
    "Lấy danh sách khóa học thành công",
    courses,
    {
      page: pageNumber,
      limit: limitNumber,
      total,
      totalPages: Math.ceil(total / limitNumber),
    }
  );
};

exports.getCoursesForStudent = async (req, res) => {
  try {
    const { page = 1, limit = 20, title, targetLevel } = req.query;
    const skip = (page - 1) * limit;

    const filter = { status: "active" };
    if (title) filter.title = { $regex: title, $options: "i" };
    if (targetLevel) filter.targetLevel = targetLevel;

    const courses = await Course.find(filter)
      .populate("assignedTeacher", "name email avatar")
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();

    return ApiRes.success(res, "Lấy danh sách khóa học thành công", courses);
  } catch (error) {
    console.error("Lỗi getCoursesForStudent:", error);
    return ApiRes.error(res, "Lỗi server", 500);
  }
};

exports.getCourseUsers = async (req, res) => {
  try {
    const { courseId } = req.params;

    const enrollments = await Enrollment.find({ course: courseId })
      .populate("user", "name email roles avatar") // roles, không phải role
      .lean();

    const users = enrollments
      .filter((enr) => enr.user) // tránh crash nếu populate không ra
      .map((enr) => ({
        _id: enr.user._id,
        name: enr.user.name,
        email: enr.user.email,
        role: enr.user.roles, // roles
        avatar: enr.user.avatar || null,
        enrolledAt: enr.enrolledAt || enr.createdAt || null,
      }));

    return ApiRes.success(
      res,
      "Lấy danh sách người dùng của khóa học thành công",
      users
    );
  } catch (error) {
    console.error("getCourseUsers error:", error);
    return ApiRes.error(res, "Lỗi máy chủ nội bộ", 500);
  }
};

exports.getCourseDetails = async (req, res) => {
  const { courseId } = req.params;
  const user = req.user;
  // Không block học viên xem chi tiết khóa học vì họ cần xem để đăng ký
  // Tuy nhiên ta có thể cất bớt danh sách lessons (nếu cần thiết) nhưng để không crash UI cũ thì ta cứ giữ lại logic lessons.

  const course = await Course.findById(courseId).populate(
    "assignedTeacher",
    "name email"
  );
  if (!course) {
    return ApiRes.error(res, "Không tìm thấy khóa học", 404);
  }

  if (user.role === "teacher") {
    if (course.assignedTeacher._id.toString() !== user.id) {
      return ApiRes.error(res, "Bạn không có quyền truy cập khóa học này", 403);
    }
  }
  const lessons = await Lesson.find({ course: courseId }).sort({ order: 1 });
  return ApiRes.success(res, "Lấy chi tiết khóa học thành công", {
    course,
    lessons,
  });
};

exports.createCourseForTeacher = async (req, res) => {
  try {
    const { title, assignedTeacher, ...rest } = req.body;

    const teacher = await User.findById(assignedTeacher).select("role");
    if (!teacher || teacher.role !== "teacher") {
      return res.status(400).json({
        message: "Không tìm thấy teacher hoặc assignedTeacher phải là teacher",
      });
    }
    const doc = await Course.create({
      title,
      assignedTeacher,
      createdBy: req.user._id,
      ...rest,
    });

    await doc.save();
    res.status(201).json(doc);
  } catch (error) {
    console.error("Lỗi khi tạo khóa học:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

exports.updateCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const {
      title,
      assignedTeacher,
      description,
      targetLevel,
      thumbnail,
      status,
    } = req.body;

    const course = await Course.findById(courseId);
    if (!course) {
      return ApiRes.error(res, "Không tìm thấy khóa học", 404);
    }

    // Route-level auth only allows admins to manage course metadata.

    // If changing assignedTeacher, verify it's a valid teacher
    if (
      assignedTeacher &&
      assignedTeacher !== course.assignedTeacher.toString()
    ) {
      const teacher = await User.findById(assignedTeacher).select("role");
      if (!teacher || teacher.role !== "teacher") {
        return ApiRes.error(res, "assignedTeacher phải là teacher", 400);
      }
    }

    // Update fields
    const allowedFields = [
      "title",
      "assignedTeacher",
      "description",
      "targetLevel",
      "thumbnail",
      "status",
      "price",
    ];
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        course[field] = req.body[field];
      }
    });

    await course.save();

    const updatedCourse = await Course.findById(courseId).populate(
      "assignedTeacher",
      "name email phone"
    );
    return ApiRes.success(res, "Cập nhật khóa học thành công", updatedCourse);
  } catch (error) {
    console.error("Lỗi khi cập nhật khóa học:", error);
    return ApiRes.error(res, "Lỗi máy chủ nội bộ", 500);
  }
};

exports.addStudentToCourseByEmail = async (req, res) => {
  try {
    const { studentEmail, courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }
    const student = await User.findOne({
      email: studentEmail,
      role: "student",
    });
    if (!student) {
      return res.status(404).json({
        message: "Không tìm thấy học sinh hoặc không phải vai trò student",
      });
    }
    const existingEnrollment = await Enrollment.findOne({
      user: student._id,
      course: course._id,
    });
    if (existingEnrollment) {
      return res
        .status(400)
        .json({ message: "Học sinh đã tham gia khóa học này" });
    }
    const doc = await Enrollment.create({
      user: student._id,
      course: course._id,
    });
    await doc.save();
    await Course.findByIdAndUpdate(course._id, {
      $inc: { "stats.enrolledCount": 1 },
    }).exec();
    res.status(200).json({
      message: "Thêm học sinh vào khóa học thành công",
      enrollment: doc,
    });
  } catch (error) {
    console.error("Lỗi khi thêm học sinh vào khóa học:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};

exports.kickStudentFromCourseByEmail = async (req, res) => {
  try {
    const { studentEmail, courseId } = req.body;
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Không tìm thấy khóa học" });
    }
    const student = await User.findOne({
      email: studentEmail,
      role: "student",
    });
    if (!student) {
      return res.status(404).json({
        message: "Không tìm thấy học sinh hoặc không phải vai trò student",
      });
    }

    const deleted = await Enrollment.findOneAndDelete({
      user: student._id,
      course: course._id,
    });
    if (!deleted) {
      return res
        .status(400)
        .json({ message: "Học sinh không tham gia khóa học này" });
    }
    await Course.findByIdAndUpdate(course._id, {
      $inc: { "stats.enrolledCount": -1 },
    }).exec();
    res.status(200).json({ message: "Xóa học sinh khỏi khóa học thành công" });
  } catch (error) {
    console.error("Lỗi khi xóa học sinh khỏi khóa học:", error);
    res.status(500).json({ error: "Lỗi máy chủ nội bộ" });
  }
};
exports.publishCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;

    const course = await Course.findById(courseId);
    if (!course) {
      return ApiRes.error(res, "Không tìm thấy khóa học", 404);
    }

    // Teacher chỉ được mở lớp khoá của mình
    if (
      user.role === "teacher" &&
      course.assignedTeacher.toString() !== user.id
    ) {
      return ApiRes.error(
        res,
        "Bạn không có quyền mở lớp cho khóa học này",
        403
      );
    }

    // Chỉ cho publish từ draft
    if (course.status !== "draft") {
      return ApiRes.error(res, "Chỉ được mở lớp từ trạng thái draft", 400);
    }

    course.status = "active";
    await course.save();

    return ApiRes.success(res, "Mở lớp (publish) khóa học thành công", course);
  } catch (error) {
    console.error("Lỗi khi publish khóa học:", error);
    return ApiRes.error(res, "Lỗi máy chủ nội bộ", 500);
  }
};
exports.closeCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return ApiRes.error(res, "Không tìm thấy khóa học", 404);
    }

    // Chỉ cho tắt lớp từ active
    if (course.status !== "active") {
      return ApiRes.error(res, "Chỉ được tắt lớp từ trạng thái active", 400);
    }

    course.status = "draft";
    await course.save();

    return ApiRes.success(res, "Đã tắt lớp (đưa về draft) thành công", course);
  } catch (error) {
    console.error("Lỗi khi tắt lớp khóa học:", error);
    return ApiRes.error(res, "Lỗi máy chủ nội bộ", 500);
  }
};
exports.getCoursesForTeacherWithStudents = async (req, res) => {
  try {
    const teacherId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const skip = (page - 1) * limit;

    // Lấy courses của teacher
    const courses = await Course.find({
      assignedTeacher: teacherId,
    })
      .sort({ createdAt: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit))
      .lean();

    const courseIds = courses.map((c) => c._id);

    // Lấy enrollments theo course
    const enrollments = await Enrollment.find({
      course: { $in: courseIds },
    })
      .populate("user", "name email")
      .lean();

    // Gom students theo khóa học
    const courseStudentsMap = {};

    enrollments.forEach((enr) => {
      const cid = enr.course.toString();
      if (!courseStudentsMap[cid]) courseStudentsMap[cid] = [];

      courseStudentsMap[cid].push({
        _id: enr.user._id,
        name: enr.user.name,
        email: enr.user.email,
        progress: enr.progress || 0,
      });
    });

    // Ghép data students vào course
    const result = courses.map((course) => {
      const students = courseStudentsMap[course._id.toString()] || [];
      return {
        ...course,
        students,
        studentCount: students.length,
      };
    });

    const total = await Course.countDocuments({ assignedTeacher: teacherId });

    return ApiRes.successWithMeta(
      res,
      "Lấy danh sách khóa học + học sinh thành công",
      result,
      {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / limit),
      }
    );
  } catch (error) {
    console.error(error);
    return ApiRes.error(res, "Lỗi máy chủ nội bộ", 500);
  }
};

exports.getCoursesForStudentDetail = async (req, res) => {
  try {
    const { studentId } = req.query;

    if (!studentId) {
      return ApiRes.error(res, "Thiếu studentId", 400);
    }

    const enrollments = await Enrollment.find({ user: studentId })
      .populate({
        path: "course",
        populate: { path: "assignedTeacher", select: "name email" },
      })
      .lean();

    const courses = enrollments.map((enr) => ({
      ...enr.course,
      progress: enr.progress || 0,
    }));

    return ApiRes.success(
      res,
      "Lấy danh sách khóa học của học viên thành công",
      courses
    );
  } catch (error) {
    console.error("Lỗi getCoursesForStudentDetail:", error);
    return ApiRes.error(res, "Lỗi máy chủ nội bộ", 500);
  }
};
exports.getCoursesByTeacherId = async (req, res) => {
  try {
    const { teacherId } = req.params;

    const courses = await Course.find({ assignedTeacher: teacherId })
      .sort({ createdAt: -1 })
      .lean();

    return ApiRes.success(
      res,
      "Lấy khóa học theo teacherId thành công",
      courses
    );
  } catch (err) {
    console.error(err);
    return ApiRes.error(res, "Lỗi server", 500);
  }
};
exports.deleteCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course) {
      return ApiRes.error(res, "Không tìm thấy khóa học", 404);
    }

    // Chỉ admin được xoá
    if (req.user.role !== "admin") {
      return ApiRes.error(res, "Bạn không có quyền xoá khóa học", 403);
    }

    // Xoá học viên đăng ký
    await Enrollment.deleteMany({ course: courseId });

    // Xoá bài học
    await Lesson.deleteMany({ course: courseId });

    // Xoá khóa học
    await Course.findByIdAndDelete(courseId);

    return ApiRes.success(res, "Xoá khóa học thành công", null);
  } catch (err) {
    console.error("Lỗi deleteCourse:", err);
    return ApiRes.error(res, "Lỗi server", 500);
  }
};

exports.getCourseDocument = async (req, res) => {
  try {
    const { courseId } = req.params;
    const user = req.user;

    const course = await Course.findById(courseId);
    if (!course) {
      return ApiRes.error(res, "Không tìm thấy khóa học", 404);
    }

    if (user.role === "student") {
      const cls = await Class.findOne({
        course: courseId,
        studentIds: user.id
      });
      if (!cls) {
        return ApiRes.error(res, "Bạn chưa đăng ký khóa học này nên không thể xem giáo trình", 403);
      }
    }

    const targetLevel = course.targetLevel; 
    let fileName = '';
    if (targetLevel && targetLevel.startsWith('HSK')) {
      fileName = targetLevel.replace('HSK', 'HSK ') + '.pdf';
    } else {
      return ApiRes.error(res, "Khóa học này không có giáo trình HSK mặc định", 404);
    }

    const documentPath = path.resolve(__dirname, '../../../Documents HSK', fileName);
    
    if (!fs.existsSync(documentPath)) {
      return ApiRes.error(res, "Không tìm thấy file giáo trình hệ thống", 404);
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${fileName}"`);
    
    const fileStream = fs.createReadStream(documentPath);
    fileStream.pipe(res);

  } catch (error) {
    console.error("Lỗi getCourseDocument:", error);
    return ApiRes.error(res, "Lỗi server", 500);
  }
};
