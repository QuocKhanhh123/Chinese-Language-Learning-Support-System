const { z } = require("zod");

const baseQuestionBody = {
  content: z.string().min(1, "Question content is required"),
  options: z.array(z.string()).min(2, "At least 2 options required").optional(),
  correctAnswer: z.string().min(1, "Correct answer is required").optional(),
  audioUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  points: z.number().min(0.5, "Points must be at least 0.5").default(1),

  skill: z.enum(["listening", "reading", "writing"], {
    errorMap: () => ({
      message: "Skill must be listening, reading, or writing",
    }),
  }),

  level: z.enum(["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"], {
    errorMap: () => ({ message: "Level must be HSK1 to HSK6" }),
  }),

  courseId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid courseId format")
    .optional(),

  tags: z.array(z.string()).optional(),
  explanation: z.string().optional(),
};

// Create question
const createQuestionSchema = z.object(baseQuestionBody).refine(
  (q) => {
    if (q.skill === "listening" || q.skill === "reading") {
      // với listening/reading thì bắt buộc có correctAnswer
      return !!q.correctAnswer;
    }
    return true;
  },
  {
    message: "Listening and reading questions must have a correctAnswer",
    path: ["correctAnswer"],
  }
);

// Update question – tất cả optional
const updateQuestionSchema = z
  .object({
    content: z.string().min(1).optional(),
    options: z.array(z.string()).min(2).optional(),
    correctAnswer: z.string().min(1).optional(),
    audioUrl: z.string().url().optional(),
    imageUrl: z.string().url().optional(),
    points: z.number().min(0.5).optional(),
    skill: z.enum(["listening", "reading", "writing"]).optional(),
    level: z.enum(["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"]).optional(),
    courseId: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid courseId format")
      .optional(),
    tags: z.array(z.string()).optional(),
    explanation: z.string().optional(),
  })
  .refine(
    (q) => {
      if (q.skill && (q.skill === "listening" || q.skill === "reading")) {
        if (q.correctAnswer === undefined) return true; // không update field này
        return !!q.correctAnswer;
      }
      return true;
    },
    {
      message: "Listening and reading questions must have a correctAnswer",
      path: ["correctAnswer"],
    }
  );

// Query list (teacher question bank)
const getQuestionsQuerySchema = z.object({
  page: z.string().regex(/^\d+$/).transform(Number).optional().default("1"),
  limit: z.string().regex(/^\d+$/).transform(Number).optional().default("20"),
  level: z.enum(["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"]).optional(),
  skill: z.enum(["listening", "reading", "writing"]).optional(),
  courseId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  search: z.string().optional(), // tìm theo content
});

module.exports = {
  createQuestionSchema,
  updateQuestionSchema,
  getQuestionsQuerySchema,
};
