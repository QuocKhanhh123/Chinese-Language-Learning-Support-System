import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "../network/httpRequest";

export const COURSE_KEYS = {
  all: ["courses"],
  list: () => [...COURSE_KEYS.all, "list"],
  detail: (id) => [...COURSE_KEYS.all, "detail", id],
  teacherWithStudents: () => [...COURSE_KEYS.all, "teacher-with-students"],
  studentDetail: (studentId) => [
    ...COURSE_KEYS.all,
    "student-detail",
    studentId,
  ],
};

export const courseApi = {
  getAllCourses: async () => {
    const res = await axiosInstance.get("/courses/get-courses-for-admin");
    return res.data.data;
  },

  getCourseById: async (id) => {
    const res = await axiosInstance.get(`/courses/course-detail/${id}`);
    return res.data.data;
  },

  getCoursesForTeacherWithStudents: async () => {
    const res = await axiosInstance.get(
      "/courses/get-courses-for-teacher-with-students"
    );
    return res.data.data;
  },

  getCoursesForStudentDetail: async (studentId) => {
    const res = await axiosInstance.get(
      "/courses/get-courses-for-student-detail",
      { params: { studentId } }
    );
    return res.data.data;
  },

  deleteCourse: async (courseId) => {
    const res = await axiosInstance.delete(`/courses/delete/${courseId}`);
    return res.data;
  },
};

export const useCourses = () =>
  useQuery({
    queryKey: COURSE_KEYS.list(),
    queryFn: courseApi.getAllCourses,
  });

export const useDeleteCourse = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (courseId) => courseApi.deleteCourse(courseId),
    onSuccess: () => qc.invalidateQueries({ queryKey: COURSE_KEYS.all }),
  });
};

export const useCourseById = (id) =>
  useQuery({
    queryKey: COURSE_KEYS.detail(id),
    queryFn: () => courseApi.getCourseById(id),
    enabled: !!id,
  });

export const useCoursesTeacherWithStudents = () =>
  useQuery({
    queryKey: COURSE_KEYS.teacherWithStudents(),
    queryFn: courseApi.getCoursesForTeacherWithStudents,
  });

export const useCoursesStudentDetail = (studentId) =>
  useQuery({
    queryKey: COURSE_KEYS.studentDetail(studentId),
    queryFn: () => courseApi.getCoursesForStudentDetail(studentId),
    enabled: !!studentId,
  });
