const { Schema, model, Types } = require("mongoose");

/** Phiên làm bài — một học viên / một quiz (cho đến khi nộp hoặc hết hạn trên server). */
const QuizAttemptSchema = new Schema(
  {
    quiz: { type: Types.ObjectId, ref: "Quiz", required: true, index: true },
    student: { type: Types.ObjectId, ref: "User", required: true, index: true },
    startedAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

QuizAttemptSchema.index({ quiz: 1, student: 1 }, { unique: true });

module.exports = model("QuizAttempt", QuizAttemptSchema);
