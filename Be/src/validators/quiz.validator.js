const { z } = require("zod");

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Must be a valid ObjectId");

const quizQuestionSchema = z.object({
  chineseText:    z.string().min(1),
  vietnameseText: z.string().optional().default(""),
  options:        z.array(z.string().min(1)).length(4, "Phải có đúng 4 đáp án"),
  correctIndex:   z.number().int().min(0).max(3),
});

const createQuizSchema = z.object({
  title:     z.string().min(1).max(200),
  classId:   objectId,
  questions: z.array(quizQuestionSchema).min(1, "Phải có ít nhất 1 câu hỏi"),
  opensAt: z.coerce.date({ invalid_type_error: "opensAt không hợp lệ" }),
  durationMinutes: z.coerce.number().int().min(1, "Tối thiểu 1 phút").max(480, "Tối đa 480 phút"),
});

const submitQuizSchema = z.object({
  answers: z.array(
    z.object({
      questionId:    objectId,
      selectedIndex: z.number().int().min(-1).max(3),
    })
  ),
});

module.exports = { createQuizSchema, submitQuizSchema };
