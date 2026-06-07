const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth.middleware");
const classController = require("../controllers/class.controller");

// Đặt các route cụ thể TRƯỚC /:classId để tránh Express nhầm lẫn
router.get("/my-classes",         auth(["student"]),                          classController.getMyClasses);
router.get("/teacher-classes",    auth(["teacher"]),                          classController.getTeacherClasses);
router.get("/by-course/:courseId",auth(["student","teacher","admin"]),        classController.getClassesByCourse);
router.get("/by-teacher/:teacherId", auth(["admin"]),                         classController.getClassesByTeacher);
router.get("/all",                auth(["admin"]),                            classController.getAllClasses);

router.post  ("/create",          auth(["admin"]),                            classController.createClass);
router.get   ("/:classId",        auth(["student","teacher","admin"]),        classController.getClassDetail);
router.put   ("/:classId",        auth(["admin"]),                            classController.updateClass);
router.patch ("/:classId/status", auth(["admin","teacher"]),                  classController.changeClassStatus);
router.delete("/:classId",        auth(["admin"]),                            classController.deleteClass);

module.exports = router;
