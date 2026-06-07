const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const VocabularyDataSchema = new Schema(
  {
    chinese: { type: String, trim: true, maxLength: 200 },
    pinyin: { type: String, trim: true, maxLength: 300 },
    vietnamese: { type: String, trim: true, maxLength: 500 },
    audioUrl: { type: String, trim: true },
    example: {
      chinese: { type: String, trim: true, maxLength: 500 },
      pinyin: { type: String, trim: true, maxLength: 600 },
      vietnamese: { type: String, trim: true, maxLength: 500 },
    },
    note: { type: String, trim: true, maxLength: 1000 },
    level: {
      type: String,
      enum: ["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"],
    },
    wordType: {
      type: String,
      enum: [
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
      ],
    },
  },
  { _id: false }
);

const GrammarDataSchema = new Schema(
  {
    structure: { type: String, trim: true, maxLength: 1000 },
    explanation: { type: String, trim: true, maxLength: 2000 },
    examples: [
      {
        chinese: { type: String, trim: true, maxLength: 500 },
        pinyin: { type: String, trim: true, maxLength: 600 },
        vietnamese: { type: String, trim: true, maxLength: 500 },
      },
    ],
    note: { type: String, trim: true, maxLength: 1000 },
    level: {
      type: String,
      enum: ["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"],
    },
  },
  { _id: false }
);

const FlashCardSchema = new Schema({
  deck: { type: Types.ObjectId, ref: "Deck", required: true, index: true },

  type: {
    type: String,
    enum: ["normal", "vocabulary", "grammar"],
    default: "normal",
    required: true,
    index: true,
  },

  frontText: { type: String, trim: true, maxLength: 1000 },
  backText: { type: String, trim: true, maxLength: 2000 },

  vocabularyData: { type: VocabularyDataSchema },
  grammarData: { type: GrammarDataSchema },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

FlashCardSchema.index({ deck: 1, type: 1 });

module.exports = model("FlashCard", FlashCardSchema);
