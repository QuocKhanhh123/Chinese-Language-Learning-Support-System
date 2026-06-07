const { z } = require("zod");

const notificationValidators = {
  createNotification: z.object({
    title: z
      .string()
      .min(1, "Title is required")
      .max(200, "Title must not exceed 200 characters")
      .trim(),

    message: z
      .string()
      .min(1, "Message is required")
      .max(2000, "Message must not exceed 2000 characters")
      .trim(),

    type: z
      .enum(["announcement", "course", "exam", "system", "personal"])
      .default("announcement"),

    scope: z.enum(["all", "teachers", "students", "course", "individual"], {
      required_error: "Scope is required",
    }),

    targetCourse: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid course ID format")
      .optional()
      .nullable(),

    targetUser: z
      .string()
      .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID format")
      .optional()
      .nullable(),

    priority: z
      .enum(["low", "normal", "high", "urgent"])
      .default("normal"),

    scheduledAt: z
      .string()
      .datetime()
      .or(z.date())
      .optional()
      .nullable(),

    expiresAt: z
      .string()
      .datetime()
      .or(z.date())
      .optional()
      .nullable(),
  }).refine(
    (data) => {
      if (data.scope === "course") {
        return !!data.targetCourse;
      }
      return true;
    },
    {
      message: "targetCourse is required when scope is 'course'",
      path: ["targetCourse"],
    }
  ).refine(
    (data) => {
      if (data.scope === "individual") {
        return !!data.targetUser;
      }
      return true;
    },
    {
      message: "targetUser is required when scope is 'individual'",
      path: ["targetUser"],
    }
  ),

  updateNotification: z
    .object({
      title: z.string().max(200).trim().optional(),
      message: z.string().max(2000).trim().optional(),
      type: z.enum(["announcement", "course", "exam", "system", "personal"]).optional(),
      priority: z.enum(["low", "normal", "high", "urgent"]).optional(),
      status: z.enum(["draft", "published", "archived"]).optional(),
      scheduledAt: z
        .string()
        .datetime()
        .or(z.date())
        .optional()
        .nullable(),
      expiresAt: z
        .string()
        .datetime()
        .or(z.date())
        .optional()
        .nullable(),
    })
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one field must be provided for update",
    }),
};

module.exports = notificationValidators;
