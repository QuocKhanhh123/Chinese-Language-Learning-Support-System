import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../network/httpRequest";

export const QUIZ_KEYS = {
  byClass:   (classId) => ["quizzes", "by-class", classId],
  detail:    (quizId)  => ["quizzes", "detail", quizId],
  results:   (quizId)  => ["quizzes", "results", quizId],
  myResults: (classId) => ["quizzes", "my-results", classId],
};

export const quizApi = {
  getByClass:   (classId) => axiosInstance.get(`/quizzes/by-class/${classId}`).then((r) => r.data.data),
  getDetail:    (quizId)  => axiosInstance.get(`/quizzes/${quizId}`).then((r) => r.data.data),
  createQuiz:   (data)    => axiosInstance.post("/quizzes/create", data).then((r) => r.data.data),
  publishQuiz:  (quizId)  => axiosInstance.patch(`/quizzes/${quizId}/publish`).then((r) => r.data.data),
  submitQuiz:   (quizId, answers) =>
    axiosInstance.post(`/quizzes/${quizId}/submit`, { answers }).then((r) => r.data.data),
  startQuiz:    (quizId) =>
    axiosInstance.post(`/quizzes/${quizId}/start`).then((r) => r.data.data),
  getResults:   (quizId)  => axiosInstance.get(`/quizzes/${quizId}/results`).then((r) => r.data.data),
  getMyResults: (classId) => axiosInstance.get(`/quizzes/my-results/${classId}`).then((r) => r.data.data),
};

export const useQuizzesByClass = (classId) =>
  useQuery({
    queryKey: QUIZ_KEYS.byClass(classId),
    queryFn:  () => quizApi.getByClass(classId),
    enabled:  !!classId,
  });

export const useQuizDetail = (quizId) =>
  useQuery({
    queryKey: QUIZ_KEYS.detail(quizId),
    queryFn:  () => quizApi.getDetail(quizId),
    enabled:  !!quizId,
  });

export const useQuizResults = (quizId) =>
  useQuery({
    queryKey: QUIZ_KEYS.results(quizId),
    queryFn:  () => quizApi.getResults(quizId),
    enabled:  !!quizId,
  });

export const useMyQuizResults = (classId) =>
  useQuery({
    queryKey: QUIZ_KEYS.myResults(classId),
    queryFn:  () => quizApi.getMyResults(classId),
    enabled:  !!classId,
  });

export const useCreateQuiz = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: quizApi.createQuiz,
    onSuccess:  (_, vars) =>
      qc.invalidateQueries({ queryKey: QUIZ_KEYS.byClass(vars.classId) }),
  });
};

export const usePublishQuiz = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: quizApi.publishQuiz,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["quizzes"] }),
  });
};

export const useSubmitQuiz = (quizId) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (answers) => quizApi.submitQuiz(quizId, answers),
    onSuccess:  () => {
      qc.invalidateQueries({ queryKey: QUIZ_KEYS.detail(quizId) });
      qc.invalidateQueries({ queryKey: ["quizzes", "my-results"] });
      qc.invalidateQueries({ queryKey: ["quizzes", "by-class"] });
    },
  });
};

export const useStartQuiz = (quizId) =>
  useMutation({
    mutationFn: () => quizApi.startQuiz(quizId),
  });
