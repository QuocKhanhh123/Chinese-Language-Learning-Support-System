// hooks/useExam.js
import axiosInstance from "@/network/httpRequest";
import { useMutation, useQuery } from "@tanstack/react-query";

const EXAM_KEYS = {
  all: ["exams"],
  list: () => [...EXAM_KEYS.all, "list"],
  detail: (examId) => [...EXAM_KEYS.all, "detail", examId],
  take: (examId, attemptId) => [
    ...EXAM_KEYS.all,
    "take",
    examId,
    attemptId || "noAttempt",
  ],
  result: (attemptId) => [...EXAM_KEYS.all, "result", attemptId],
  history: (examId) => [...EXAM_KEYS.all, "history", examId],
};

const examApi = {
  getExamList: async () => {
    const res = await axiosInstance.get("/exams/available/list");
    return res.data.data;
  },

  getExamById: async (examId) => {
    const res = await axiosInstance.get(`/exams/info/${examId}`);
    return res.data.data; // { ..., questionCount, myAttempt, ... }
  },

  // ✅ lấy đề thi để làm: cần cả examId + attemptId
  getExamTake: async ({ examId, attemptId }) => {
    const res = await axiosInstance.get(`/exams/take/${examId}`, {
      params: { attemptId },
    });
    return res.data.data; // { exam, attemptId, timeLimitMinutes, startedAt, ... }
  },

  startExam: async (examId) => {
    if (!examId) throw new Error("Exam ID is required");
    const res = await axiosInstance.post(`/exams/start-exam/${examId}`);
    return res.data.data; // { resultId, attemptCount, ... }
  },

  // ✅ submit theo resultId (attemptId)
  submitExam: async ({ attemptId, resultId, answers }) => {
    const id = attemptId || resultId;
    const res = await axiosInstance.post(`/exams/result/${id}/submit`, {
      answers,
    });
    return res.data.data;
  },
  getExamResult: async (attemptId) => {
    const res = await axiosInstance.get(`/exams/result/${attemptId}`);
    return res.data.data;
  },
  // ✅ lịch sử: trả full object, không chỉ array
  getExamHistory: async (examId) => {
    const res = await axiosInstance.get(`/exams/my-exam-history/${examId}`);
    return res.data.data; // { exam, attempts, statistics, pagination }
  },
};

export const useExamList = () =>
  useQuery({ queryKey: EXAM_KEYS.list(), queryFn: examApi.getExamList });

export const useExamById = (examId) =>
  useQuery({
    queryKey: EXAM_KEYS.detail(examId),
    queryFn: () => examApi.getExamById(examId),
    enabled: !!examId,
  });

// ✅ sửa: truyền examId + attemptId
export const useExamTake = (examId, attemptId) =>
  useQuery({
    queryKey: EXAM_KEYS.take(examId, attemptId),
    queryFn: () => examApi.getExamTake({ examId, attemptId }),
    enabled: !!examId && !!attemptId,
    retry: false,
  });

export const useStartExam = () =>
  useMutation({
    mutationFn: examApi.startExam,
    onError: (error) => {
      console.error("Start exam error:", error.message);
    },
  });

export const useSubmitExam = () =>
  useMutation({
    mutationFn: examApi.submitExam,
    onError: (error) => {
      console.error("Submit exam error:", error.message);
    },
  });

export const useExamResult = (attemptId) =>
  useQuery({
    queryKey: EXAM_KEYS.result(attemptId),
    queryFn: () => examApi.getExamResult(attemptId),
    enabled: !!attemptId,
  });

export const useExamHistory = (examId) =>
  useQuery({
    queryKey: EXAM_KEYS.history(examId),
    queryFn: () => examApi.getExamHistory(examId),
    enabled: !!examId,
  });

export { EXAM_KEYS, examApi };
