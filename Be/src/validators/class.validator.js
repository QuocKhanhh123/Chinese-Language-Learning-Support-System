const { z } = require("zod");

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Must be a valid ObjectId");

const scheduleSlotSchema = z.object({
  dayOfWeek: z.number().int().min(0).max(6),
  startTime: z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM"),
  endTime:   z.string().regex(/^\d{2}:\d{2}$/, "Format HH:MM"),
});

const createClassSchema = z.object({
  name:                 z.string().min(1).max(200),
  course:               objectId,
  teacher:              objectId,
  schedule:             z.array(scheduleSlotSchema).min(1),
  startDate:            z.string().datetime(),
  endDate:              z.string().datetime(),
  registrationDeadline: z.string().datetime(),
  maxStudents:          z.number().int().min(1),
});

const updateClassSchema = createClassSchema.partial();

module.exports = { createClassSchema, updateClassSchema };
