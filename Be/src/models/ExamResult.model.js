const { model, Schema, Types } = require("mongoose");

const DOCUMENT_NAME = "ExamResult";
const COLLECTION_NAME = "ExamResults";

// Answer for each question
const answerSchema = new Schema(
  {
    questionId: { type: Types.ObjectId, required: true }, // Reference to question._id
    answer: { type: String }, // Student's answer (A, B, C, D or text)
    isCorrect: { type: Boolean },
    pointsEarned: { type: Number, default: 0 },
    feedback: { type: String }, // Teacher's feedback for writing questions
  },
  { _id: false }
);

// Result for each skill section
const sectionResultSchema = new Schema(
  {
    sectionId: { type: Types.ObjectId, required: true }, // Reference to section._id
    skill: { type: String, enum: ["listening", "reading", "writing"] },
    answers: [answerSchema],
    score: { type: Number, default: 0 }, // Points earned in this section
    maxScore: { type: Number }, // Max points for this section
  },
  { _id: false }
);

const examResultSchema = new Schema(
  {
    exam: {
      type: Types.ObjectId,
      ref: "Exam",
      required: true,
      index: true,
    },

    student: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    course: {
      type: Types.ObjectId,
      ref: "Course",
      index: true,
    },

    // ✅ NEW: số lần làm của student cho exam này
    attemptCount: { type: Number, default: 1 },

    sectionResults: [sectionResultSchema],
    score: {
      totalPoints: { type: Number, default: 0 },
      maxPoints: { type: Number },
      percentage: { type: Number, default: 0, min: 0, max: 100 },
      passed: { type: Boolean, default: false },
    },

    skillScores: {
      listening: { type: Number, default: 0 },
      reading: { type: Number, default: 0 },
      writing: { type: Number, default: 0 },
    },

    startedAt: { type: Date, required: true },
    submittedAt: { type: Date },
    timeSpentMinutes: { type: Number },

    gradedAt: { type: Date },
    gradedBy: { type: Types.ObjectId, ref: "User" },

    status: {
      type: String,
      enum: ["in_progress", "submitted", "graded"],
      default: "in_progress",
      index: true,
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

// examResultSchema.index({ exam: 1, student: 1 });
examResultSchema.index({ course: 1, status: 1 });
examResultSchema.index({ student: 1, status: 1 });
examResultSchema.index({ submittedAt: 1 });

module.exports = model(DOCUMENT_NAME, examResultSchema);
