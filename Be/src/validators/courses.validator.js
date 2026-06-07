const { z } = require("zod");

const createCourseSchema = z.object({
  title: z.string().min(1).max(200),
  assignedTeacher: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "assignedTeacher must be a ObjectId"),
  thumbnail: z.string().optional(),
  slug: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/i)
    .optional(),
  description: z.string().optional(),
  targetLevel: z.enum([
    "HSK1",
    "HSK2",
    "HSK3",
    "HSK4",
    "HSK5",
    "HSK6",
    "Mixed",
  ]),
  status: z.enum(["draft", "active", "archived"]).optional(),
  price: z.number().min(0).optional().default(0),
});

const updateCourseSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  assignedTeacher: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "assignedTeacher must be a ObjectId")
    .optional(),
  description: z.string().optional(),
  targetLevel: z
    .enum(["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6", "Mixed"])
    .optional(),
  thumbnail: z.string().optional(),
  price: z.number().min(0).optional(),
  // nếu sau này em muốn cho sửa status thì thêm:
  // status: z.enum(['draft','active','archived']).optional(),
});

const addStudentToCourseSchema = z.object({
  courseId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "courseId must be a ObjectId"),
  studentEmail: z.string().email("Invalid email format"),
});

const kickStudentFromCourseSchema = z.object({
  courseId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, "courseId must be a ObjectId"),
  studentEmail: z.string().email("Invalid email format"),
});

const getCoursesForAdminSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  page: z
    .string()
    .transform((val) => parseInt(val))
    .optional()
    .default("1"),
  limit: z
    .string()
    .transform((val) => parseInt(val))
    .optional()
    .default("10"),
  status: z.enum(["draft", "active", "archived"]).optional(),
  targetLevel: z
    .enum(["HSK1", "HSK2", "HSK3", "HSK4", "HSK5", "HSK6", "Mixed"])
    .optional(),
});

module.exports = {
  createCourseSchema,
  updateCourseSchema,
  addStudentToCourseSchema,
  kickStudentFromCourseSchema,
  getCoursesForAdminSchema,
};
