const { Schema, model, Types } = require("mongoose");

const quizQuestionSchema = new Schema(
  {
    chineseText:    { type: String, required: true },
    vietnameseText: { type: String, default: "" },
    options:        [{ type: String, required: true }], // đúng 4 phần tử
    correctIndex:   { type: Number, min: 0, max: 3, required: true }, // index 0-3
  },
  { _id: true }
);

const QuizSchema = new Schema(
  {
    title:     { type: String, required: true, trim: true, maxLength: 200 },
    class:     { type: Types.ObjectId, ref: "Class", required: true, index: true },
    createdBy: { type: Types.ObjectId, ref: "User",  required: true, index: true },

    questions: [quizQuestionSchema],

    /** Thời điểm học viên được xem và bắt đầu làm bài (null = luôn mở — tương thích dữ liệu cũ). */
    opensAt: { type: Date, default: null, index: true },
    /** Thời gian làm bài (phút), đếm từ lúc bấm “Bắt đầu làm bài”. */
    durationMinutes: { type: Number, default: 15, min: 1, max: 480 },

    status: {
      type: String,
      enum: ["draft", "published"],
      default: "draft",
      index: true,
    },

    stats: {
      attemptCount: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

QuizSchema.index({ class: 1, status: 1 });

module.exports = model("Quiz", QuizSchema);
