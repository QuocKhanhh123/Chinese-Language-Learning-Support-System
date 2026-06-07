const { z } = require('zod');

const createLessonSchema = z.object({
    courseId: z.string().regex(/^[0-9a-fA-F]{24}$/, "courseId must be a ObjectId"),
    title: z.string().min(2).max(100),
    description: z.string().min(10).max(1000).optional(),
    // content may contain plain text or HTML (beware of XSS on render)
    content: z.string().max(20000).optional(),
    order: z.number().min(1),
    video_url: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional()
});

const updateLessonSchema = z.object({
    title: z.string().min(2).max(100).optional(),
    description: z.string().min(10).max(1000).optional(),
    content: z.string().max(20000).optional(),
    order: z.number().min(1).optional(),
    video_url: z.string().optional(),
    status: z.enum(['active', 'inactive']).optional()
});

const deleteLessonSchema = z.object({
    lessonId: z.string().regex(/^[0-9a-fA-F]{24}$/, "lessonId must be a ObjectId")
});

const vocabularyItemSchema = z.object({
    chinese: z.string().min(1).max(200),
    pinyin: z.string().max(300).optional(),
    vietnamese: z.string().min(1).max(500),
    audioUrl: z.string().optional(),
    example: z.object({
        chinese: z.string().max(500).optional(),
        pinyin: z.string().max(600).optional(),
        vietnamese: z.string().max(500).optional()
    }).optional(),
    note: z.string().max(1000).optional(),
    level: z.enum(['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6']).optional(),
    wordType: z.enum(['noun', 'verb', 'adjective', 'adverb', 'conjunction', 'preposition', 'pronoun', 'number', 'other']).optional()
});

const addVocabulariesSchema = z.object({
    vocabularies: z.array(vocabularyItemSchema).min(1)
});

const removeVocabulariesSchema = z.object({
    vocabularyIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Each vocabularyId must be a ObjectId")).min(1)
});

const updateVocabularySchema = z.object({
    chinese: z.string().max(200).optional(),
    pinyin: z.string().max(300).optional(),
    vietnamese: z.string().max(500).optional(),
    audioUrl: z.string().optional(),
    example: z.object({
        chinese: z.string().max(500).optional(),
        pinyin: z.string().max(600).optional(),
        vietnamese: z.string().max(500).optional()
    }).optional(),
    note: z.string().max(1000).optional(),
    level: z.enum(['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6']).optional(),
    wordType: z.enum(['noun', 'verb', 'adjective', 'adverb', 'conjunction', 'preposition', 'pronoun', 'number', 'other']).optional()
});

const grammarItemSchema = z.object({
    title: z.string().min(1).max(200),
    structure: z.string().min(1).max(1000),
    explanation: z.string().max(2000).optional(),
    examples: z.array(z.object({
        chinese: z.string().max(500),
        pinyin: z.string().max(600).optional(),
        vietnamese: z.string().max(500).optional()
    })).optional(),
    note: z.string().max(1000).optional(),
    level: z.enum(['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6']).optional()
});

const addGrammarsSchema = z.object({
    grammars: z.array(grammarItemSchema).min(1)
});

const removeGrammarsSchema = z.object({
    grammarIds: z.array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Each grammarId must be a ObjectId")).min(1)
});

const updateGrammarSchema = z.object({
    title: z.string().max(200).optional(),
    structure: z.string().max(1000).optional(),
    explanation: z.string().max(2000).optional(),
    examples: z.array(z.object({
        chinese: z.string().max(500).optional(),
        pinyin: z.string().max(600).optional(),
        vietnamese: z.string().max(500).optional()
    })).optional(),
    note: z.string().max(1000).optional(),
    level: z.enum(['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6']).optional()
});

module.exports = {
    createLessonSchema,
    updateLessonSchema,
    deleteLessonSchema,
    addVocabulariesSchema,
    removeVocabulariesSchema,
    updateVocabularySchema,
    addGrammarsSchema,
    removeGrammarsSchema,
    updateGrammarSchema
};
