import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../network/httpRequest";

export const CLASS_KEYS = {
  all:            (params) => ["classes", "all", params],
  byCourse:       (courseId) => ["classes", "by-course", courseId],
  detail:         (classId)  => ["classes", "detail", classId],
  mine:           ()         => ["classes", "my-classes"],
  teacherClasses: ()         => ["classes", "teacher-classes"],
};

export const classApi = {
  getAll:           (params)         => axiosInstance.get("/classes/all", { params }).then((r) => r.data.data),
  getByCourse:      (courseId)       => axiosInstance.get(`/classes/by-course/${courseId}`).then((r) => r.data.data),
  getDetail:        (classId)        => axiosInstance.get(`/classes/${classId}`).then((r) => r.data.data),
  getMyClasses:     ()               => axiosInstance.get("/classes/my-classes").then((r) => r.data.data),
  getTeacherClasses:()               => axiosInstance.get("/classes/teacher-classes").then((r) => r.data.data),
  createClass:      (data)           => axiosInstance.post("/classes/create", data).then((r) => r.data.data),
  updateClass:      (classId, data)  => axiosInstance.put(`/classes/${classId}`, data).then((r) => r.data.data),
  changeStatus:     (classId, status)=> axiosInstance.patch(`/classes/${classId}/status`, { status }).then((r) => r.data.data),
  deleteClass:      (classId)        => axiosInstance.delete(`/classes/${classId}`).then((r) => r.data),
};

export const useAllClasses = (params = {}) =>
  useQuery({
    queryKey: CLASS_KEYS.all(params),
    queryFn:  () => classApi.getAll(params),
  });

export const useClassesByCourse = (courseId) =>
  useQuery({
    queryKey: CLASS_KEYS.byCourse(courseId),
    queryFn:  () => classApi.getByCourse(courseId),
    enabled:  !!courseId,
  });

export const useClassDetail = (classId) =>
  useQuery({
    queryKey: CLASS_KEYS.detail(classId),
    queryFn:  () => classApi.getDetail(classId),
    enabled:  !!classId,
  });

export const useMyClasses = () =>
  useQuery({
    queryKey: CLASS_KEYS.mine(),
    queryFn:  classApi.getMyClasses,
  });

export const useTeacherClasses = () =>
  useQuery({
    queryKey: CLASS_KEYS.teacherClasses(),
    queryFn:  classApi.getTeacherClasses,
  });

export const useCreateClass = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: classApi.createClass,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["classes"] }),
  });
};

export const useUpdateClass = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, data }) => classApi.updateClass(classId, data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["classes"] }),
  });
};

export const useChangeClassStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ classId, status }) => classApi.changeStatus(classId, status),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["classes"] }),
  });
};

export const useDeleteClass = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: classApi.deleteClass,
    onSuccess:  () => qc.invalidateQueries({ queryKey: ["classes"] }),
  });
};
