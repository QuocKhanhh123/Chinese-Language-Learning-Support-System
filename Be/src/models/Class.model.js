const { Schema, model, Types } = require("mongoose");

const scheduleSlotSchema = new Schema(
  {
    dayOfWeek: { type: Number, min: 0, max: 6, required: true }, // 0=Sun, 1=Mon, ..., 6=Sat
    startTime: { type: String, required: true },                  // "08:00"
    endTime:   { type: String, required: true },                  // "10:00"
  },
  { _id: false }
);

const ClassSchema = new Schema(
  {
    name:    { type: String, required: true, trim: true, maxLength: 200 },
    course:  { type: Types.ObjectId, ref: "Course", required: true, index: true },
    teacher: { type: Types.ObjectId, ref: "User",   required: true, index: true },

    schedule: [scheduleSlotSchema],

    startDate:            { type: Date, required: true },
    endDate:              { type: Date, required: true },
    registrationDeadline: { type: Date, required: true },

    maxStudents: { type: Number, required: true, min: 1 },
    studentIds:  [{ type: Types.ObjectId, ref: "User" }],

    status: {
      type: String,
      enum: ["open", "closed", "ongoing", "finished"],
      default: "open",
      index: true,
    },
  },
  { timestamps: true }
);

ClassSchema.index({ course: 1, status: 1 });
ClassSchema.index({ teacher: 1, status: 1 });

module.exports = model("Class", ClassSchema);
