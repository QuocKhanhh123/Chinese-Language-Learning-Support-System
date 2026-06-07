const { Schema, model, Types } = require("mongoose");

const quizAnswerSchema = new Schema(
  {
    questionId:    { type: Types.ObjectId, required: true },
    selectedIndex: { type: Number, min: -1, max: 3 }, // -1 = chưa chọn / nộp khi hết giờ
    isCorrect:     { type: Boolean, required: true },
  },
  { _id: false }
);

const QuizResultSchema = new Schema(
  {
    quiz:    { type: Types.ObjectId, ref: "Quiz",  required: true, index: true },
    student: { type: Types.ObjectId, ref: "User",  required: true, index: true },
    class:   { type: Types.ObjectId, ref: "Class", required: true, index: true },

    answers: [quizAnswerSchema],

    score:          { type: Number, default: 0 },       // số câu đúng
    totalQuestions: { type: Number, required: true },
    percentage:     { type: Number, default: 0, min: 0, max: 100 },

    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// 1 lần nộp / quiz / student
QuizResultSchema.index({ quiz: 1, student: 1 }, { unique: true });
QuizResultSchema.index({ class: 1, quiz: 1 });

module.exports = model("QuizResult", QuizResultSchema);
