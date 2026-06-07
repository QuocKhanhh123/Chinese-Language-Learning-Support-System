
const { Schema, model, Types } = require("mongoose");

const EnrollmentSchema = new Schema({
    user: { type: Types.ObjectId, ref: 'User', required: true, index: true },
    course: { type: Types.ObjectId, ref: 'Course', required: true, index: true },
    enrolledAt: { type: Date, default: Date.now },
});
EnrollmentSchema.index({ course: 1, user: 1 }, { unique: true });
module.exports = model("Enrollment", EnrollmentSchema);