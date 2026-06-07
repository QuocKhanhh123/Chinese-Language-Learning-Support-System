
const { Schema, model, Types } = require("mongoose");

const CourseSchema = new Schema({
    title: { type: String, required: true, trim: true, maxLength: 200 },
    thumbnail: { type: String, default: '' },
    slug:  { type: String, trim: true, index: true, unique: true, sparse: true },
    
    targetLevel: { type: String, enum: ['HSK1','HSK2','HSK3','HSK4','HSK5','HSK6','Mixed'], default: 'HSK1' },
    description: { type: String, default: '' },

    status: { type: String, enum: ['draft','active','archived'], default: 'draft', index: true },
    assignedTeacher: { type: Types.ObjectId, ref: 'User', required: true, index: true },

    price: { type: Number, default: 0, min: 0 },

    stats: {
      lessonCount: { type: Number, default: 0 },
      enrolledCount: { type: Number, default: 0 },
      ratingAvg: { type: Number, default: 0, min: 0, max: 5 },
      ratingCount: { type: Number, default: 0 }
    },
});

module.exports = model("Course", CourseSchema);