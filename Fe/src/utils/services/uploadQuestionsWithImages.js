import { uploadImage } from "../firebase/firebaseUtils";

// mime -> ext
const extFromMime = (mime = "image/png") => {
  const parts = mime.split("/");
  return parts[1] || "png";
};

// base64 -> File
export const dataUrlToFile = (dataUrl, fileNameNoExt = "image") => {
  const arr = dataUrl.split(",");
  const mime = (arr[0].match(/:(.*?);/) || [])[1] || "image/png";
  const ext = extFromMime(mime);

  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);

  return new File([u8arr], `${fileNameNoExt}.${ext}`, { type: mime });
};

/**
 * parents: list parent questions (có imgUrl base64)
 * metaBase: {examId, courseId, courseTitle, lessonId, lessonTitle}
 */
export const uploadImagesForExamQuestions = async (
  parents,
  metaBase,
  onProgressEach
) => {
  const out = [];

  for (const parent of parents) {
    const { imgUrl, orderNo, sectionType } = parent;

    if (
      imgUrl &&
      typeof imgUrl === "string" &&
      imgUrl.startsWith("data:image/")
    ) {
      const file = dataUrlToFile(imgUrl, `question-${orderNo}`);

      const url = await uploadImage(
        file,
        {
          ...metaBase,
          skillType: sectionType || "reading",
          orderNo,
        },
        (progress) => {
          if (onProgressEach) {
            onProgressEach({ orderNo, progress });
          }
        }
      );

      out.push({ ...parent, imgUrl: url });
    } else {
      out.push(parent);
    }
  }

  return out;
};

/**
 * Upload bank A–F (reading part 1 images)
 * reading1Images: array base64
 */
export const uploadReading1BankImages = async (
  reading1Images,
  metaBase,
  onProgressEach
) => {
  if (!Array.isArray(reading1Images) || reading1Images.length === 0) return [];

  const out = [];
  for (let i = 0; i < reading1Images.length; i++) {
    const src = reading1Images[i];

    if (src && typeof src === "string" && src.startsWith("data:image/")) {
      const file = dataUrlToFile(src, `reading1-bank-${i + 1}`);

      const url = await uploadImage(
        file,
        {
          ...metaBase,
          skillType: "reading1-bank",
          orderNo: i + 1,
        },
        (progress) => {
          if (onProgressEach) {
            onProgressEach({ index: i, progress });
          }
        }
      );

      out.push(url);
    } else {
      out.push(src);
    }
  }

  return out;
};
