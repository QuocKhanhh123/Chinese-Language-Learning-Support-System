const express = require("express");
const router = express.Router();
const notificationController = require("../controllers/notification.controller");
const auth = require("../middleware/auth.middleware");
const { validateBody } = require("../middleware/validateBody");
const notificationValidators = require("../validators/notification.validator");

// ============= USER ROUTES =============
// Lấy thông báo của user hiện tại
router.get(
  "/my",
  auth(),
  notificationController.getMyNotifications
);

// Đánh dấu đã đọc một thông báo
router.patch(
  "/:id/read",
  auth(),
  notificationController.markAsRead
);

// Đánh dấu tất cả đã đọc
router.patch(
  "/read-all",
  auth(),
  notificationController.markAllAsRead
);

// Xóa thông báo (soft delete)
router.delete(
  "/:id",
  auth(),
  notificationController.deleteNotification
);

// ============= ADMIN ROUTES =============
// Tạo thông báo mới (chỉ admin)
router.post(
  "/",
  auth(["admin"]),
  validateBody(notificationValidators.createNotification),
  notificationController.createNotification
);

// Lấy danh sách thông báo admin đã tạo
router.get(
  "/admin",
  auth(["admin"]),
  notificationController.getAdminNotifications
);

// Xem thống kê thông báo
router.get(
  "/:id/stats",
  auth(["admin"]),
  notificationController.getNotificationStats
);

// Cập nhật thông báo
router.patch(
  "/:id",
  auth(["admin"]),
  validateBody(notificationValidators.updateNotification),
  notificationController.updateNotification
);

// Xóa thông báo vĩnh viễn (chỉ admin)
router.delete(
  "/admin/:id",
  auth(["admin"]),
  notificationController.deleteNotificationPermanently
);

module.exports = router;
