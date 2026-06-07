export const slugify = (s = "") =>
  s
    .toLowerCase()
    .trim()
    .replace(/đ/g, "d")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

export const buildQuestionImagePath = ({
  courseId = "unknown-course",
  courseTitle = "unknown-course",
  lessonId = "unknown-lesson",
  lessonTitle = "unknown-lesson",
  skillType = "reading",
  orderNo = "0",
  fileName = "image.png",
}) => {
  const cSlug = slugify(courseTitle);
  const lSlug = slugify(lessonTitle);
  const ts = Date.now();

  return [
    "courses",
    `${cSlug}-${courseId}`,
    "lessons",
    `${lSlug}-${lessonId}`,
    skillType,
    `question-${orderNo}`,
    `${ts}-${fileName}`,
  ].join("/");
};
