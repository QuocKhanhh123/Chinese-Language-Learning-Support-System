const { z } = require('zod');

const exampleSchema = z.object({
    chinese: z.string().max(500).optional(),
    pinyin: z.string().max(600).optional(),
    vietnamese: z.string().max(500).optional()
}).optional();

const createVocabularySchema = z.object({
    chinese: z.string().min(1, 'Chinese text is required').max(200),
    pinyin: z.string().max(300).optional(),
    vietnamese: z.string().min(1, 'Vietnamese translation is required').max(500),
    audioUrl: z.string().url().optional().or(z.literal('')),
    example: exampleSchema,
    note: z.string().max(1000).optional(),
    level: z.enum(['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6']).optional(),
    wordType: z.enum(['noun', 'verb', 'adjective', 'adverb', 'conjunction', 'preposition', 'pronoun', 'number', 'other']).optional(),
    courseId: z.string().optional(),
    lessonId: z.string().optional()
});

const updateVocabularySchema = z.object({
    chinese: z.string().min(1).max(200).optional(),
    pinyin: z.string().max(300).optional(),
    vietnamese: z.string().min(1).max(500).optional(),
    audioUrl: z.string().url().optional().or(z.literal('')),
    example: exampleSchema,
    note: z.string().max(1000).optional(),
    level: z.enum(['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6']).optional(),
    wordType: z.enum(['noun', 'verb', 'adjective', 'adverb', 'conjunction', 'preposition', 'pronoun', 'number', 'other']).optional(),
    courseId: z.string().optional(),
    lessonId: z.string().optional()
});

module.exports = {
    createVocabularySchema,
    updateVocabularySchema
};
