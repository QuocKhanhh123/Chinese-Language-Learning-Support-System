const mongoose = require("mongoose");
const { Schema, model, Types } = mongoose;

const VocabularySchema = new Schema(
  {
    chinese: { type: String, required: true, trim: true, maxLength: 200 },
    pinyin: { type: String, trim: true, maxLength: 300 },
    vietnamese: { type: String, required: true, trim: true, maxLength: 500 },
    audioUrl: { type: String, trim: true },
    example: {
      chinese: { type: String, maxLength: 500 },
      pinyin: { type: String, maxLength: 600 },
      vietnamese: { type: String, maxLength: 500 },
    },
    note: { type: String, maxLength: 1000 },
    level: {
      type: String,
      enum: ["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6"],
      index: true,
    },
    wordType: {
      type: String,
      enum: [
        "noun",
        "verb",
        "adjective",
        "adverb",
        "conjunction",
        "preposition",
        "pronoun",
        "number",
        "measure",
        "other",
      ],
      index: true,
    },

    course: { type: Types.ObjectId, ref: "Course", index: true },
    lesson: { type: Types.ObjectId, ref: "Lesson", index: true },
    createdBy: {
      type: Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    isSystem: { type: Boolean, default: false, index: true },
  },
  { timestamps: true }
);

VocabularySchema.index({ createdBy: 1, chinese: 1 });
VocabularySchema.index({ level: 1, wordType: 1 });

module.exports = model("Vocabulary", VocabularySchema);
