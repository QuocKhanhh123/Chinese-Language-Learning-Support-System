const mongoose = require("mongoose");

// ============================================================================
// Option schema (A-F)
// ============================================================================
const OptionSchema = new mongoose.Schema(
  {
    id: { type: String, required: true }, // 'a' | 'b' | ...
    text: { type: String, required: true },
  },
  { _id: false }
);

// ============================================================================
// Child question schema
// ============================================================================
const ChildQuestionSchema = new mongoose.Schema(
  {
    content: { type: String, required: true }, // ✅ vẫn required
    type: {
      type: String,
      enum: ["multiple_choice"],
      default: "multiple_choice",
    },
    correctAnswer: { type: String, default: "" }, // ✅ cho phép rỗng
    options: {
      type: [OptionSchema],
      default: [],
    },
  },
  { _id: false }
);

// ============================================================================
// ExamQuestion schema (parent question)
// ============================================================================
const ExamQuestionSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },

    parentQuestion: { type: String, required: true },
    paragraph: { type: String, default: "" },

    imgUrl: { type: String, default: "" },
    imgUrls: { type: [String], default: [] },

    audioUrl: { type: String, default: "" },

    childQuestions: {
      type: [ChildQuestionSchema],
      default: [],
    },

    orderNo: { type: Number, required: true },

    sectionType: {
      type: String,
      enum: ["listening", "reading", "writing", null],
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ExamQuestion", ExamQuestionSchema);
