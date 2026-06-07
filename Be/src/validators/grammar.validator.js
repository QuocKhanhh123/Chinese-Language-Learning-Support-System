const { z } = require('zod');

const exampleSchema = z.object({
    chinese: z.string().max(500).optional(),
    pinyin: z.string().max(600).optional(),
    vietnamese: z.string().max(500).optional()
});

const createGrammarSchema = z.object({
    title: z.string().min(1, 'Title is required').max(200),
    structure: z.string().min(1, 'Structure is required').max(1000),
    explanation: z.string().max(2000).optional(),
    examples: z.array(exampleSchema).optional(),
    note: z.string().max(1000).optional(),
    level: z.enum(['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6']).optional(),
    courseId: z.string().optional(),
    lessonId: z.string().optional()
});

const updateGrammarSchema = z.object({
    title: z.string().min(1).max(200).optional(),
    structure: z.string().min(1).max(1000).optional(),
    explanation: z.string().max(2000).optional(),
    examples: z.array(exampleSchema).optional(),
    note: z.string().max(1000).optional(),
    level: z.enum(['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6']).optional(),
    courseId: z.string().optional(),
    lessonId: z.string().optional()
});

module.exports = {
    createGrammarSchema,
    updateGrammarSchema
};

module.exports = { createGrammarSchema, updateGrammarSchema };