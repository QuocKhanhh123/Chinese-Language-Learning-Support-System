const express = require("express");
const auth = require("../middleware/auth.middleware");
const adminController = require("../controllers/adminDashboard.controller");

const router = express.Router();

/**
 * GET /api/admin/dashboard
 * Admin dashboard overview
 */
router.get("/dashboard", auth(["admin"]), adminController.getDashboardOverview);
router.get("/paid-students", auth(["admin"]), adminController.getPaidStudents);

module.exports = router;
