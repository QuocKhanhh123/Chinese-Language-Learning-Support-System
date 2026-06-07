const { Schema, model, Types } = require("mongoose");

const DOCUMENT_NAME = "Notification";
const COLLECTION_NAME = "Notifications";

const notificationSchema = new Schema(
  {
    // Nội dung thông báo
    title: {
      type: String,
      required: true,
      trim: true,
      maxLength: 200,
    },
    
    message: {
      type: String,
      required: true,
      maxLength: 2000,
    },

    // Loại thông báo để phân loại
    type: {
      type: String,
      enum: ["announcement", "course", "exam", "system", "personal"],
      default: "announcement",
      index: true,
    },

    // Người tạo (admin)
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Phạm vi gửi thông báo
    scope: {
      type: String,
      enum: ["all", "teachers", "students", "course", "individual"],
      required: true,
      index: true,
    },

    // Nếu scope = 'course', lưu courseId
    targetCourse: {
      type: Types.ObjectId,
      ref: "Course",
      default: null,
      index: true,
    },

    // Nếu scope = 'individual', lưu userId
    targetUser: {
      type: Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
    },

    // Priority để sắp xếp
    priority: {
      type: String,
      enum: ["low", "normal", "high", "urgent"],
      default: "normal",
      index: true,
    },

    // Trạng thái
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
      index: true,
    },

    // Thời gian hẹn gửi (nếu cần)
    scheduledAt: {
      type: Date,
      default: null,
      index: true,
    },

    // Thời gian hết hạn
    expiresAt: {
      type: Date,
      default: null,
    },

    // Thống kê
    stats: {
      totalRecipients: { type: Number, default: 0 },
      readCount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

// Index tổng hợp cho query tối ưu
notificationSchema.index({ scope: 1, status: 1, createdAt: -1 });
notificationSchema.index({ targetCourse: 1, status: 1, createdAt: -1 });
notificationSchema.index({ targetUser: 1, status: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1, priority: -1 });

module.exports = model(DOCUMENT_NAME, notificationSchema);
