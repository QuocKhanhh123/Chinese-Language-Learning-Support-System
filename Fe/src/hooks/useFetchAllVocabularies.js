import axiosInstance from "@/network/httpRequest";
import { useQuery } from "@tanstack/react-query";

/**
 * TEACHER: lấy tất cả vocab do GV tạo (my-vocabularies)
 */
export const useFetchAllVocabularies = (params) => {
  const { level, wordType, page = 1, limit = 20 } = params || {};

  const getVocabulary = async () => {
    const res = await axiosInstance.get("/vocabularies/my-vocabularies", {
      params: {
        level,
        wordType,
        page,
        limit,
      },
    });
    // ApiRes.successWithMeta(..., vocabularies, meta)
    return res.data;
  };

  return useQuery({
    queryKey: ["vocabulary-all-teacher", { level, wordType, page, limit }],
    queryFn: getVocabulary,
    gcTime: 1000 * 60 * 5, // 5 mins
  });
};

/**
 * STUDENT: lấy vocab để học
 * GET /vocabularies/student/list
 */
export const useFetchStudentVocabularies = (params) => {
  const {
    level,
    wordType,
    courseId,
    lessonId,
    page = 1,
    limit = 20,
  } = params || {};

  const getStudentVocabulary = async () => {
    const res = await axiosInstance.get("/vocabularies/student/list", {
      params: {
        level,
        wordType,
        courseId,
        lessonId,
        page,
        limit,
      },
    });
    // { success, message, data: [...], meta: {...} }
    return res.data;
  };

  return useQuery({
    queryKey: [
      "vocabulary-student",
      { level, wordType, courseId, lessonId, page, limit },
    ],
    queryFn: getStudentVocabulary,
    gcTime: 1000 * 60 * 5,
  });
};

export default useFetchAllVocabularies;
