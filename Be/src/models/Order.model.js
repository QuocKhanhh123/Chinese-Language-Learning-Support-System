const { Schema, model, Types } = require("mongoose");

const OrderSchema = new Schema(
  {
    student:  { type: Types.ObjectId, ref: "User",   required: true, index: true },
    class:    { type: Types.ObjectId, ref: "Class",  required: true, index: true },
    course:   { type: Types.ObjectId, ref: "Course", required: true, index: true },

    amount:   { type: Number, required: true, min: 0 }, // snapshot giá lúc đặt (VND)
    currency: { type: String, default: "VND" },

    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
      index: true,
    },

    paymentMethod:  { type: String, default: "zalopay" },  // "zalopay" | "free"
    gatewayOrderId: { type: String, default: null },      // ZaloPay order ID (future)
    gatewayData:    { type: Schema.Types.Mixed, default: null }, // raw gateway response

    paidAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Ngăn mua 2 lần cùng 1 lớp
OrderSchema.index({ student: 1, class: 1 }, { unique: true });
OrderSchema.index({ status: 1, createdAt: -1 });

module.exports = model("Order", OrderSchema);
