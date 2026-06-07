const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      type: [String],
      default: [],
    },
    correctAnswer: {
      type: String,
    },
    audioUrl: {
      type: String,
    },
    imageUrl: {
      type: String,
    },
    points: {
      type: Number,
      default: 1,
      min: 0.5,
    },
    skill: {
      type: String,
      enum: ["listening", "reading", "writing"],
      required: true,
    },
    level: {
      type: String,
      enum: ["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"],
      required: true,
    },
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: false,
    },
    tags: {
      type: [String],
      default: [],
    },
    explanation: {
      type: String,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, // giáo viên tạo
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Question", QuestionSchema);
