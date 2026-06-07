const { Schema, model, Types } = require("mongoose");

const DOCUMENT_NAME = "NotificationRecipient";
const COLLECTION_NAME = "NotificationRecipients";

/**
 * Model này lưu trạng thái đọc/chưa đọc của từng user
 * Thiết kế tối ưu: chỉ tạo record khi user đọc thông báo
 * Giảm số lượng documents trong DB
 */
const notificationRecipientSchema = new Schema(
  {
    notification: {
      type: Types.ObjectId,
      ref: "Notification",
      required: true,
      index: true,
    },

    user: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Trạng thái đọc
    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Thời gian đọc
    readAt: {
      type: Date,
      default: null,
    },

    // Đánh dấu quan trọng
    isStarred: {
      type: Boolean,
      default: false,
    },

    // Đã xóa (soft delete từ góc nhìn user)
    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
    },

    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: COLLECTION_NAME,
  }
);

// Compound index cho query tối ưu
notificationRecipientSchema.index({ user: 1, notification: 1 }, { unique: true });
notificationRecipientSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationRecipientSchema.index({ notification: 1, isRead: 1 });
notificationRecipientSchema.index({ user: 1, isDeleted: 1, isRead: 1, createdAt: -1 });

module.exports = model(DOCUMENT_NAME, notificationRecipientSchema);
