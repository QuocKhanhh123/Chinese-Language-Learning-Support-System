const { model, Schema, Types } = require("mongoose");

const DOCUMENT_NAME = "Exam";
const COLLECTION_NAME = "Exams";

// ============================================================================
// Question schema - câu hỏi trong bài thi
// - FE UploadQuestionsFile hiện gắn 1 ảnh/câu => imageUrl
// - Sau này có thể mở rộng nhiều ảnh => imageUrls (giữ compatibility)
// ============================================================================
const questionSchema = new Schema(
  {
    content: { type: String, required: true }, // Nội dung câu hỏi
    options: [{ type: String }], // Các đáp án đã flatten "a. ..." ...
    correctAnswer: { type: String }, // Đáp án đúng
    audioUrl: { type: String }, // Audio cho listening

    // legacy: 1 ảnh/câu (FE đang dùng)
    imageUrl: { type: String, default: "" },

    // new: nhiều ảnh/câu (nếu sau này cần)
    imageUrls: { type: [String], default: [] },

    points: { type: Number, default: 1 }, // Điểm cho câu này
  },
  { _id: true }
);

// ============================================================================
// Skill section schema - mỗi kỹ năng là 1 section
// ============================================================================
const skillSectionSchema = new Schema(
  {
    skill: {
      type: String,
      enum: ["listening", "reading", "writing"],
      required: true,
    },
    title: { type: String, required: true }, // "听力" / "阅读" / "写作"
    instructions: { type: String, default: "" },
    audioUrl: { type: String, default: "" }, // Audio cho cả section (nếu listening)
    questions: [questionSchema],
  },
  { _id: true }
);

// ============================================================================
// Exam schema
// - Thêm các bank fields để lưu đúng UploadQuestionsFile gửi lên
// ============================================================================
const examSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, maxLength: 200 },
    description: { type: String, default: "" },

    level: {
      type: String,
      enum: ["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"],
      required: true,
      index: true,
    },

    skills: [
      {
        type: String,
        enum: ["listening", "reading", "writing"],
      },
    ],

    sections: [skillSectionSchema],

    // ===================== HSK Upload Banks =====================
    // Reading part 1 images A–F (FE gửi reading1Images)
    reading1Images: { type: [String], default: [] },

    // Word bank part 2 (FE gửi reading2WordBank)
    // shape: [{id, hanzi, pinyin}]
    reading2WordBank: { type: Array, default: [] },

    // Reading part 4 bank 51–55 (FE gửi reading4BankFirst)
    // shape: [{id, text}]
    reading4BankFirst: { type: Array, default: [] },

    // Reading part 4 bank 56–60 (FE gửi reading4BankSecond)
    reading4BankSecond: { type: Array, default: [] },
    // ===========================================================

    listeningAudios: {
      type: [
        {
          url: String, // link Firebase
          name: String, // tên hiển thị
          provider: { type: String, default: "firebase" },
          createdAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },

    timeLimitMinutes: { type: Number, required: true, min: 1 },
    scheduleStartAt: { type: Date, default: null },
    scheduleEndAt: { type: Date, default: null },
    scheduleTimezone: { type: String, default: "Asia/Ho_Chi_Minh" },
    totalPoints: { type: Number, default: 0 },

    passingScore: { type: Number, default: 60, min: 0, max: 100 },

    course: {
      type: Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "published",
      index: true,
    },

    stats: {
      attemptCount: { type: Number, default: 0 },
      averageScore: { type: Number, default: 0 },
    },
  },
  {
    collection: COLLECTION_NAME,
    timestamps: true,
  }
);

examSchema.index({ level: 1, status: 1 });
examSchema.index({ course: 1, status: 1 });
examSchema.index({ createdBy: 1, status: 1 });

// Auto calculate total points
examSchema.pre("save", function (next) {
  if (this.isModified("sections")) {
    let totalPoints = 0;
    this.sections.forEach((section) => {
      section.questions.forEach((q) => {
        totalPoints += q.points || 1;
      });
    });
    this.totalPoints = totalPoints;
  }
  next();
});

module.exports = model(DOCUMENT_NAME, examSchema);
