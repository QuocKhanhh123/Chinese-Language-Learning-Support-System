const Notification = require("../models/Notification.model");
const NotificationRecipient = require("../models/NotificationRecipient.model");
const User = require("../models/User.model");
const Enrollment = require("../models/Enrollment.model");
const asyncHandler = require("../middleware/asyncHandler");
const AppError = require("../res/AppError");
const apiRes = require("../res/apiRes");

class NotificationController {
  /**
   * ADMIN: Tạo thông báo mới
   * POST /api/notifications
   */
  createNotification = asyncHandler(async (req, res) => {
    const { title, message, type, scope, targetCourse, targetUser, priority, scheduledAt, expiresAt } = req.body;
    const adminId = req.user.id;

    // Validate scope
    if (scope === "course" && !targetCourse) {
      throw new AppError("targetCourse is required when scope is 'course'", 400);
    }
    if (scope === "individual" && !targetUser) {
      throw new AppError("targetUser is required when scope is 'individual'", 400);
    }

    // Tính toán số lượng người nhận
    let totalRecipients = 0;
    switch (scope) {
      case "all":
        totalRecipients = await User.countDocuments({ status: "active" });
        break;
      case "teachers":
        totalRecipients = await User.countDocuments({ role: "teacher", status: "active" });
        break;
      case "students":
        totalRecipients = await User.countDocuments({ role: "student", status: "active" });
        break;
      case "course":
        totalRecipients = await Enrollment.countDocuments({ course: targetCourse });
        break;
      case "individual":
        totalRecipients = 1;
        break;
    }

    // Tạo thông báo
    const notification = await Notification.create({
      title,
      message,
      type: type || "announcement",
      createdBy: adminId,
      scope,
      targetCourse: scope === "course" ? targetCourse : null,
      targetUser: scope === "individual" ? targetUser : null,
      priority: priority || "normal",
      scheduledAt: scheduledAt || null,
      expiresAt: expiresAt || null,
      status: "published",
      stats: {
        totalRecipients,
        readCount: 0,
      },
    });

    return apiRes.created(res, "Tạo thông báo thành công", notification);
  });

  /**
   * ADMIN: Lấy danh sách thông báo đã tạo
   * GET /api/notifications/admin
   */
  getAdminNotifications = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20, scope, status, type } = req.query;
    const filter = { createdBy: req.user.id };

    if (scope) filter.scope = scope;
    if (status) filter.status = status;
    if (type) filter.type = type;

    const skip = (page - 1) * limit;

    const [notifications, total] = await Promise.all([
      Notification.find(filter)
        .populate("targetCourse", "title")
        .populate("targetUser", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Notification.countDocuments(filter),
    ]);

    return apiRes.successWithMeta(res, "Lấy danh sách thông báo thành công", notifications, {
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  });

  /**
   * USER: Lấy thông báo của user hiện tại (tối ưu query)
   * GET /api/notifications/my
   */
  getMyNotifications = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;
    const { page = 1, limit = 20, unreadOnly } = req.query;
    
    // Parse unreadOnly as boolean (query params are always strings)
    const isUnreadOnly = unreadOnly === 'true' || unreadOnly === true;

    const skip = (page - 1) * limit;

    // Query thông báo theo scope
    const notificationQuery = {
      status: "published",
      $or: [
        { scope: "all" },
        { scope: userRole === "teacher" ? "teachers" : "students" },
        { scope: "individual", targetUser: userId },
      ],
    };

    // Nếu là student, thêm thông báo từ các course đã enroll
    if (userRole === "student") {
      const enrolledCourses = await Enrollment.find({ user: userId }).distinct("course");
      if (enrolledCourses.length > 0) {
        notificationQuery.$or.push({ scope: "course", targetCourse: { $in: enrolledCourses } });
      }
    }

    // Nếu là teacher, thêm thông báo từ các course được assign
    if (userRole === "teacher") {
      const Course = require("../models/Course.model");
      const assignedCourses = await Course.find({ assignedTeacher: userId }).distinct("_id");
      if (assignedCourses.length > 0) {
        notificationQuery.$or.push({ scope: "course", targetCourse: { $in: assignedCourses } });
      }
    }

    // Lấy danh sách notification IDs đã bị user delete (để loại trừ)
    const deletedNotificationIds = await NotificationRecipient.find({
      user: userId,
      isDeleted: true,
    }).distinct("notification");

    // Thêm điều kiện loại trừ notifications đã delete
    if (deletedNotificationIds.length > 0) {
      notificationQuery._id = notificationQuery._id 
        ? { ...notificationQuery._id, $nin: deletedNotificationIds }
        : { $nin: deletedNotificationIds };
    }

    // Nếu chỉ lấy unread, cần filter ở database level
    let notifications;
    let total;
    
    if (isUnreadOnly) {
      // Lấy danh sách notification IDs đã đọc
      const readNotificationIds = await NotificationRecipient.find({
        user: userId,
        isRead: true,
        isDeleted: false,
      }).distinct("notification");

      // Thêm điều kiện loại trừ các notification đã đọc
      if (notificationQuery._id) {
        // Merge với điều kiện _id hiện có
        const existingNin = notificationQuery._id.$nin || [];
        notificationQuery._id.$nin = [...existingNin, ...readNotificationIds];
      } else {
        notificationQuery._id = { $nin: readNotificationIds };
      }

      // Lấy danh sách thông báo chưa đọc
      [notifications, total] = await Promise.all([
        Notification.find(notificationQuery)
          .sort({ priority: -1, createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Notification.countDocuments(notificationQuery),
      ]);
    } else {
      // Lấy tất cả thông báo
      [notifications, total] = await Promise.all([
        Notification.find(notificationQuery)
          .sort({ priority: -1, createdAt: -1 })
          .skip(skip)
          .limit(parseInt(limit))
          .lean(),
        Notification.countDocuments(notificationQuery),
      ]);
    }

    const notificationIds = notifications.map((n) => n._id);

    // Lấy trạng thái đọc của user
    const readStatuses = await NotificationRecipient.find({
      user: userId,
      notification: { $in: notificationIds },
      isDeleted: false,
    }).lean();

    const readStatusMap = new Map(readStatuses.map((r) => [r.notification.toString(), r]));

    // Merge thông tin đọc vào thông báo
    const finalNotifications = notifications.map((notification) => {
      const readStatus = readStatusMap.get(notification._id.toString());
      return {
        ...notification,
        isRead: readStatus ? readStatus.isRead : false,
        readAt: readStatus ? readStatus.readAt : null,
        isStarred: readStatus ? readStatus.isStarred : false,
      };
    });

    // Đếm số thông báo chưa đọc
    const unreadCount = await this.countUnreadNotifications(userId, userRole);

    return apiRes.successWithMeta(res, "Lấy thông báo thành công", finalNotifications, {
      unreadCount,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  });

  /**
   * Helper: Đếm số thông báo chưa đọc
   */
  countUnreadNotifications = async (userId, userRole) => {
    const notificationQuery = {
      status: "published",
      $or: [
        { scope: "all" },
        { scope: userRole === "teacher" ? "teachers" : "students" },
        { scope: "individual", targetUser: userId },
      ],
    };

    if (userRole === "student") {
      const enrolledCourses = await Enrollment.find({ user: userId }).distinct("course");
      if (enrolledCourses.length > 0) {
        notificationQuery.$or.push({ scope: "course", targetCourse: { $in: enrolledCourses } });
      }
    }

    if (userRole === "teacher") {
      const Course = require("../models/Course.model");
      const assignedCourses = await Course.find({ assignedTeacher: userId }).distinct("_id");
      if (assignedCourses.length > 0) {
        notificationQuery.$or.push({ scope: "course", targetCourse: { $in: assignedCourses } });
      }
    }

    const allNotificationIds = await Notification.find(notificationQuery).distinct("_id");
    
    // Loại trừ notifications đã bị user delete
    const deletedNotificationIds = await NotificationRecipient.find({
      user: userId,
      isDeleted: true,
    }).distinct("notification");
    
    const validNotificationIds = allNotificationIds.filter(
      (id) => !deletedNotificationIds.some((deletedId) => deletedId.toString() === id.toString())
    );
    
    // Đếm số notification đã đọc (trong số các notification hợp lệ)
    const readNotificationIds = await NotificationRecipient.find({
      user: userId,
      notification: { $in: validNotificationIds },
      isRead: true,
      isDeleted: false,
    }).distinct("notification");

    return validNotificationIds.length - readNotificationIds.length;
  };

  /**
   * USER: Đánh dấu đã đọc
   * PATCH /api/notifications/:id/read
   */
  markAsRead = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    // Kiểm tra thông báo tồn tại
    const notification = await Notification.findById(id);
    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    // Tìm hoặc tạo recipient record
    let recipient = await NotificationRecipient.findOne({
      notification: id,
      user: userId,
    });

    if (!recipient) {
      recipient = await NotificationRecipient.create({
        notification: id,
        user: userId,
        isRead: true,
        readAt: new Date(),
      });

      // Cập nhật stats
      await Notification.findByIdAndUpdate(id, {
        $inc: { "stats.readCount": 1 },
      });
    } else {
      let needsUpdate = false;
      let shouldIncrementStats = false;

      if (!recipient.isRead) {
        recipient.isRead = true;
        recipient.readAt = new Date();
        needsUpdate = true;
        shouldIncrementStats = true;
      }

      // Nếu đã bị xóa, un-delete khi mark as read
      if (recipient.isDeleted) {
        recipient.isDeleted = false;
        recipient.deletedAt = null;
        needsUpdate = true;
      }

      if (needsUpdate) {
        await recipient.save();
      }

      // Cập nhật stats
      if (shouldIncrementStats) {
        await Notification.findByIdAndUpdate(id, {
          $inc: { "stats.readCount": 1 },
        });
      }
    }

    return apiRes.success(res, "Đã đánh dấu thông báo đã đọc", recipient);
  });

  /**
   * USER: Đánh dấu tất cả đã đọc
   * PATCH /api/notifications/read-all
   */
  markAllAsRead = asyncHandler(async (req, res) => {
    const userId = req.user.id;
    const userRole = req.user.role;

    // Lấy tất cả thông báo của user
    const notificationQuery = {
      status: "published",
      $or: [
        { scope: "all" },
        { scope: userRole === "teacher" ? "teachers" : "students" },
        { scope: "individual", targetUser: userId },
      ],
    };

    if (userRole === "student") {
      const enrolledCourses = await Enrollment.find({ user: userId }).distinct("course");
      if (enrolledCourses.length > 0) {
        notificationQuery.$or.push({ scope: "course", targetCourse: { $in: enrolledCourses } });
      }
    }

    if (userRole === "teacher") {
      const Course = require("../models/Course.model");
      const assignedCourses = await Course.find({ assignedTeacher: userId }).distinct("_id");
      if (assignedCourses.length > 0) {
        notificationQuery.$or.push({ scope: "course", targetCourse: { $in: assignedCourses } });
      }
    }

    const allNotifications = await Notification.find(notificationQuery).distinct("_id");

    // Lấy danh sách đã có recipient
    const existingRecipients = await NotificationRecipient.find({
      user: userId,
      notification: { $in: allNotifications },
    });

    const existingNotificationIds = new Set(existingRecipients.map((r) => r.notification.toString()));

    // Tạo recipient mới cho những thông báo chưa có
    const newRecipients = allNotifications
      .filter((nid) => !existingNotificationIds.has(nid.toString()))
      .map((nid) => ({
        notification: nid,
        user: userId,
        isRead: true,
        readAt: new Date(),
      }));

    if (newRecipients.length > 0) {
      await NotificationRecipient.insertMany(newRecipients);
    }

    // Cập nhật những recipient đã tồn tại nhưng chưa đọc
    const updateResult = await NotificationRecipient.updateMany(
      {
        user: userId,
        notification: { $in: allNotifications },
        isRead: false,
      },
      {
        $set: { isRead: true, readAt: new Date() },
      }
    );

    return apiRes.success(res, "Đã đánh dấu tất cả thông báo đã đọc", { 
      modifiedCount: updateResult.modifiedCount + newRecipients.length 
    });
  });

  /**
   * USER: Xóa thông báo (soft delete)
   * DELETE /api/notifications/:id
   */
  deleteNotification = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.user.id;

    let recipient = await NotificationRecipient.findOne({
      notification: id,
      user: userId,
    });

    if (!recipient) {
      recipient = await NotificationRecipient.create({
        notification: id,
        user: userId,
        isDeleted: true,
        deletedAt: new Date(),
      });
    } else {
      recipient.isDeleted = true;
      recipient.deletedAt = new Date();
      await recipient.save();
    }

    return apiRes.success(res, "Đã xóa thông báo", null);
  });

  /**
   * ADMIN: Xem thống kê thông báo
   * GET /api/notifications/:id/stats
   */
  getNotificationStats = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const notification = await Notification.findById(id).populate("createdBy", "name email");
    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    // Thống kê chi tiết
    const readCount = await NotificationRecipient.countDocuments({
      notification: id,
      isRead: true,
    });

    const unreadCount = notification.stats.totalRecipients - readCount;

    return apiRes.success(res, "Lấy thống kê thông báo thành công", {
      notification,
      stats: {
        totalRecipients: notification.stats.totalRecipients,
        readCount,
        unreadCount,
        readPercentage: notification.stats.totalRecipients > 0 
          ? ((readCount / notification.stats.totalRecipients) * 100).toFixed(2) 
          : 0,
      },
    });
  });

  /**
   * ADMIN: Cập nhật thông báo
   * PATCH /api/notifications/:id
   */
  updateNotification = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const updates = req.body;

    const notification = await Notification.findByIdAndUpdate(
      id,
      { $set: updates },
      { new: true, runValidators: true }
    );

    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    return apiRes.success(res, "Cập nhật thông báo thành công", notification);
  });

  /**
   * ADMIN: Xóa thông báo hoàn toàn
   * DELETE /api/notifications/admin/:id
   */
  deleteNotificationPermanently = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const notification = await Notification.findByIdAndDelete(id);
    if (!notification) {
      throw new AppError("Notification not found", 404);
    }

    // Xóa tất cả recipient records
    await NotificationRecipient.deleteMany({ notification: id });

    return apiRes.success(res, "Đã xóa thông báo vĩnh viễn", null);
  });
}

module.exports = new NotificationController();
