
const { Schema, model, Types } = require("mongoose");

const vocabularyItemSchema = new Schema({
    chinese: { type: String, required: true, trim: true, maxLength: 200 },
    pinyin: { type: String, trim: true, maxLength: 300 },
    vietnamese: { type: String, required: true, trim: true, maxLength: 500 },
    audioUrl: { type: String, trim: true },
    example: {
        chinese: { type: String, maxLength: 500 },
        pinyin: { type: String, maxLength: 600 },
        vietnamese: { type: String, maxLength: 500 }
    },
    note: { type: String, maxLength: 1000 },
    level: { type: String, enum: ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'] },
    wordType: { type: String, enum: ['noun', 'verb', 'adjective', 'adverb', 'conjunction', 'preposition', 'pronoun', 'number', 'other'] }
});

const examplesSchema = new Schema({
    chinese: { type: String, trim: true, maxLength: 500 },
    pinyin: { type: String, trim: true, maxLength: 600 },
    vietnamese: { type: String, trim: true, maxLength: 500 },
}, { _id: false });

const grammarItemSchema = new Schema({
    title: { type: String, required: true, trim: true, maxLength: 200 },
    structure: { type: String, required: true, trim: true, maxLength: 1000 },
    explanation: { type: String, trim: true, maxLength: 2000 },
    examples: { type: [examplesSchema], default: [] },
    note: { type: String, maxLength: 1000 },
    level: { type: String, enum: ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'] }
});

const contentsSchema = new Schema({
    grammar: { type: [grammarItemSchema], default: [] },
    vocabulary: { type: [vocabularyItemSchema], default: [] },
});

const LessonSchema = new Schema({
    course: { type: Types.ObjectId, ref: 'Course', required: true, index: true },
    teacher: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true, maxLength: 200 },
    description: { type: String, default: '' },
    order: { type: Number, default: 1, min: 1, index: true },

    video_url: { type: String, default: '' },
    // Rich content for the lesson — plain text or HTML (store as string).
    // NOTE: sanitize on input at the API layer if you render this HTML in the client.
    content: { type: String, default: '' },
    status: { type: String, enum: ['draft', 'active', 'archived'], default: 'draft', index: true },

    contents: { type: contentsSchema, default: () => ({}) },
}, { timestamps: true });

LessonSchema.index({ course: 1, order: 1 }, { unique: true });
LessonSchema.index({ teacher: 1, course: 1 });


module.exports = model("Lesson", LessonSchema);