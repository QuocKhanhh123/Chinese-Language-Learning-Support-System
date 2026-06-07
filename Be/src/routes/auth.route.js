const express = require("express");
const auth = require("../middleware/auth.middleware");
const {
  register,
  verifyOtp,
  resendOtp,
  login,
  refresh,
  logout,
  getMe,
  adminOnly,
  promoteToTeacher,
  demoteToStudent,
} = require("../controllers/auth.controller");

const router = express.Router();

router.post("/register", register);
router.post("/verify-otp", verifyOtp);
router.post("/resend-otp", resendOtp);
router.post("/login", login);
router.post("/logout", logout);
router.post("/refresh", refresh);
router.get("/me", auth(), getMe);
router.get("/admin", auth(["admin"]), adminOnly);
router.patch("/promote", auth(["admin"]), promoteToTeacher);
router.patch("/demote", auth(["admin"]), demoteToStudent);

module.exports = router;
