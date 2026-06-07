const { z } = require("zod");

// Question schema
const questionSchema = z.object({
  content: z.string().min(1, "Question content is required"),
  options: z.array(z.string()).min(2, "At least 2 options required").optional(),
  correctAnswer: z.string().min(1, "Correct answer is required").optional(), // Optional for writing questions
  audioUrl: z.string().url().optional(),
  imageUrl: z.string().url().optional(),
  points: z.number().min(0.5, "Points must be at least 0.5").default(1),
});

const skillSectionSchema = z
  .object({
    skill: z.enum(["listening", "reading", "writing"], {
      errorMap: () => ({
        message: "Skill must be listening, reading, or writing",
      }),
    }),
    title: z.string().min(1, "Section title is required"),
    instructions: z.string().optional(),
    audioUrl: z.string().url().optional(),
    questions: z.array(questionSchema).min(1, "At least 1 question required"),
  })
  .refine(
    (section) => {
      if (section.skill === "listening" || section.skill === "reading") {
        return section.questions.every((q) => q.correctAnswer);
      }
      return true;
    },
    {
      message: "Listening and reading questions must have a correctAnswer",
    }
  );

// Create exam schema
const createExamSchema = z.object({
  courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid courseId format"),
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().optional(),
  level: z.enum(["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"], {
    errorMap: () => ({ message: "Level must be HSK1 to HSK6" }),
  }),

  // ❌ Bỏ .min(1)
  // ✅ Cho phép không gửi, default []
  skills: z
    .array(z.enum(["listening", "reading", "writing"]))
    .optional()
    .default([]),

  // ❌ Bỏ .min(1)
  // ✅ Cho phép không gửi, default []
  sections: z.array(skillSectionSchema).optional().default([]),

  timeLimitMinutes: z
    .number()
    .min(10, "Time limit must be at least 10 minutes")
    .max(300),

  passingScore: z.number().min(0).max(100).default(60),
});

// Update exam schema (all fields optional except validation)
const updateExamSchema = z.object({
  courseId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "Invalid courseId format")
    .optional(),
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(200)
    .optional(),
  description: z.string().optional(),
  level: z.enum(["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"]).optional(),
  skills: z
    .array(z.enum(["listening", "reading", "writing"]))
    .min(1)
    .optional(),
  sections: z.array(skillSectionSchema).min(1).optional(),
  timeLimitMinutes: z.number().min(10).max(300).optional(),
  passingScore: z.number().min(0).max(100).optional(),
  // status: z.enum(["draft", "published", "archived"]).optional(),
});

// Submit exam answers schema
const submitExamSchema = z.object({
  answers: z
    .array(
      z.object({
        questionId: z
          .string()
          .regex(/^[0-9a-fA-F]{24}$/, "Invalid questionId format"),
        answer: z.string().min(1, "Answer cannot be empty"),
      })
    )
    .min(1, "At least 1 answer required"),
});

// Query params schemas
const getExamsQuerySchema = z.object({
  level: z.enum(["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"]).optional(),
  status: z
    .enum([
      "draft",
      "published",
      "archived",
      "in_progress",
      "submitted",
      "graded",
    ])
    .optional(),
  courseId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  examId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  studentId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .optional(),
  page: z.string().regex(/^\d+$/).transform(Number).optional(),
  limit: z.string().regex(/^\d+$/).transform(Number).optional(),
});

// Grade writing schema
const gradeWritingSchema = z.object({
  grades: z
    .array(
      z.object({
        questionId: z
          .string()
          .regex(/^[0-9a-fA-F]{24}$/, "Invalid questionId format"),
        pointsEarned: z.number().min(0, "Points must be at least 0"),
        feedback: z.string().optional(),
      })
    )
    .min(1, "At least 1 grade required"),
});
const updateExamScheduleSchema = z
  .object({
    startAt: z.string().datetime().optional().nullable(),
    endAt: z.string().datetime().optional().nullable(),
    timezone: z.string().optional(),
  })
  .refine(
    (data) => {
      // clear schedule: cả 2 đều null/undefined
      if (!data.startAt && !data.endAt) return true;

      // set schedule: phải đủ cả 2
      if (!data.startAt || !data.endAt) return false;

      const s = new Date(data.startAt);
      const e = new Date(data.endAt);
      return e > s;
    },
    {
      message:
        "startAt and endAt must be provided together, and endAt must be > startAt",
    }
  );
const getExamIdParamSchema = z.object({
  examId: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid examId"),
});
module.exports = {
  createExamSchema,
  updateExamSchema,
  submitExamSchema,
  getExamsQuerySchema,
  gradeWritingSchema,
  updateExamScheduleSchema,
  getExamIdParamSchema,
};
