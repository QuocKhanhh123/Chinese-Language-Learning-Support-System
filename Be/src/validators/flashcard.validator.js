const { z } = require("zod");

const createDeckSchema = z.object({
  title: z.string().min(1, "Deck title is required").max(200),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
});

const updateDeckSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  tags: z.array(z.string()).optional(),
});

const exampleSchema = z.object({
  chinese: z.string().max(500).optional(),
  pinyin: z.string().max(600).optional(),
  vietnamese: z.string().max(500).optional(),
});

const vocabularyDataSchema = z.object({
  chinese: z.string().min(1).max(200),
  pinyin: z.string().max(300).optional(),
  vietnamese: z.string().min(1).max(500),
  audioUrl: z.string().url().optional().or(z.literal("")),
  example: exampleSchema.optional(),
  note: z.string().max(1000).optional(),
  level: z.enum(["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"]).optional(),
  wordType: z
    .enum([
      "noun",
      "verb",
      "adjective",
      "adverb",
      "pronoun",
      "preposition",
      "conjunction",
      "particle",
      "measure",
      "number",
      "other",
    ])
    .optional(),
});

const grammarDataSchema = z.object({
  structure: z.string().min(1).max(1000),
  explanation: z.string().max(2000).optional(),
  examples: z.array(exampleSchema).optional(),
  note: z.string().max(1000).optional(),
  level: z.enum(["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"]).optional(),
});

const createFlashCardSchema = z
  .object({
    deckId: z.string().min(1, "Deck ID is required"),
    type: z.enum(["normal", "vocabulary", "grammar"]),

    frontText: z.string().max(1000).optional(),
    backText: z.string().max(2000).optional(),

    vocabularyData: vocabularyDataSchema.optional(),
    grammarData: grammarDataSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.type === "normal") {
        return data.frontText && data.backText;
      }
      if (data.type === "vocabulary") {
        return data.vocabularyData;
      }
      if (data.type === "grammar") {
        return data.grammarData;
      }
      return true;
    },
    {
      message: "Invalid data for flashcard type",
    }
  );

const updateFlashCardSchema = z.object({
  type: z.enum(["normal", "vocabulary", "grammar"]).optional(),

  frontText: z.string().max(1000).optional(),
  backText: z.string().max(2000).optional(),

  vocabularyData: vocabularyDataSchema.optional(),
  grammarData: grammarDataSchema.optional(),
});

module.exports = {
  createDeckSchema,
  updateDeckSchema,
  createFlashCardSchema,
  updateFlashCardSchema,
};
