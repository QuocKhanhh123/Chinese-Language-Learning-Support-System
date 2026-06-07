const mongoose = require('mongoose');
const { Schema, model, Types } = mongoose;

const examplesSchema = new Schema({
    chinese: { type: String, trim: true, maxLength: 500 },
    pinyin: { type: String, trim: true, maxLength: 600 },
    vietnamese: { type: String, trim: true, maxLength: 500 },
}, { _id: false });

const GrammarSchema = new Schema({
    title: { type: String, required: true, trim: true, maxLength: 200 },
    structure: { type: String, required: true, trim: true, maxLength: 1000 },
    explanation: { type: String, trim: true, maxLength: 2000 },
    examples: { type: [examplesSchema], default: [] },
    note: { type: String, maxLength: 1000 },
    level: { type: String, enum: ['HSK1', 'HSK2', 'HSK3', 'HSK4', 'HSK5', 'HSK6'], index: true },
    
    course: { type: Types.ObjectId, ref: 'Course', index: true },
    lesson: { type: Types.ObjectId, ref: 'Lesson', index: true },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true, index: true },
}, { timestamps: true });

GrammarSchema.index({ createdBy: 1, title: 1 });
GrammarSchema.index({ level: 1 });

module.exports = model('Grammar', GrammarSchema);