const express = require("express");
const auth = require("../middleware/auth.middleware");
const { validateBody, validateQuery } = require("../middleware/validate");
const courseController = require("../controllers/course.controller");
const {
  createCourseSchema,
  updateCourseSchema,
  addStudentToCourseSchema,
  kickStudentFromCourseSchema,
  getCoursesForAdminSchema,
} = require("../validators/courses.validator");

const router = express.Router();

router.post(
  "/create",
  auth(["admin"]),
  validateBody(createCourseSchema),
  courseController.createCourseForTeacher
);
router.put(
  "/update/:courseId",
  auth(["admin"]),
  validateBody(updateCourseSchema),
  courseController.updateCourse
);

router.get(
  "/get-courses-for-admin",
  auth(["admin"]),
  validateQuery(getCoursesForAdminSchema),
  courseController.getCoursesForAdmin
);
router.get(
  "/get-courses-for-teacher",
  auth(["teacher"]),
  validateQuery(getCoursesForAdminSchema),
  courseController.getCoursesForTeacher
);
router.get(
  "/get-courses-for-student",
  auth(["student"]),
  validateQuery(getCoursesForAdminSchema),
  courseController.getCoursesForStudent
);

router.get(
  "/get-course-users/:courseId",
  auth(["admin", "teacher"]),
  courseController.getCourseUsers
);
router.post(
  "/add-student",
  auth(["admin"]),
  validateBody(addStudentToCourseSchema),
  courseController.addStudentToCourseByEmail
);
router.post(
  "/kick-student",
  auth(["admin"]),
  validateBody(kickStudentFromCourseSchema),
  courseController.kickStudentFromCourseByEmail
);

router.get(
  "/course-detail/:courseId",
  auth(["admin", "teacher", "student"]),
  courseController.getCourseDetails
);
router.patch(
  "/publish/:courseId",
  auth(["admin"]),
  courseController.publishCourse
);
router.patch(
  "/close/:courseId",
  auth(["admin"]),
  courseController.closeCourse
);
// Admin xem khóa học + danh sách học viên theo từng khóa
router.get(
  "/get-courses-for-teacher-with-students",
  auth(["admin"]),
  courseController.getCoursesForTeacherWithStudents
);

// Admin xem khóa học của student + thông tin teacher + progress
router.get(
  "/get-courses-for-student-detail",
  auth(["admin"]),
  courseController.getCoursesForStudentDetail
);
router.get(
  "/get-courses-by-teacher/:teacherId",
  auth(["admin"]),
  courseController.getCoursesByTeacherId
);
router.delete(
  "/delete/:courseId",
  auth(["admin"]),
  courseController.deleteCourse
);

// Mở route lấy document HSK file PDF
router.get(
  "/document/:courseId",
  auth(["student", "teacher", "admin"]),
  courseController.getCourseDocument
);

module.exports = router;
