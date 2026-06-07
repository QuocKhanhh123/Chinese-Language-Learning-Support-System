import axiosInstance from "@/network/httpRequest";
import { useQuery } from "@tanstack/react-query";

/* -------------------- Query Keys -------------------- */
const TEACHER_KEYS = {
  all: ["teachers"],
  list: (role) => [...TEACHER_KEYS.all, "list", role],
  detail: (id) => [...TEACHER_KEYS.all, "detail", id],
  courses: (id) => [...TEACHER_KEYS.all, "courses", id],
  classes: (id) => [...TEACHER_KEYS.all, "classes", id],
};

/* -------------------- API -------------------- */
const teacherApi = {
  getAllTeachers: async ({ role }) => {
    const response = await axiosInstance.get("/users/get-users", {
      params: role ? { role } : {},
    });
    return response.data.data.users;
  },

  getTeacherById: async (id) => {
    const res = await axiosInstance.get(`/users/get-user/${id}`);
    return res.data.data;
  },

  // ❌ Route cũ — backend không có
  // getTeacherCourses: async (id) => {
  //   const res = await axiosInstance.get(`/course/teacher/${id}`);
  //   return res.data.data;
  // },

  // ✅ Route mới đúng backend
  getTeacherCoursesId: async (id) => {
    const res = await axiosInstance.get(
      `/courses/get-courses-by-teacher/${id}`
    );
    return res.data.data;
  },

  getTeacherClasses: async (id) => {
    const res = await axiosInstance.get(`/classes/by-teacher/${id}`);
    return res.data.data;
  },
};

/* -------------------- HOOKS -------------------- */
export const useTeachers = (role = "teacher") =>
  useQuery({
    queryKey: TEACHER_KEYS.list(role),
    queryFn: () => teacherApi.getAllTeachers({ role }),
  });

export const useTeacherById = (teacherId) =>
  useQuery({
    queryKey: TEACHER_KEYS.detail(teacherId),
    queryFn: () => teacherApi.getTeacherById(teacherId),
    enabled: !!teacherId,
  });

export const useTeacherCourses = (teacherId) =>
  useQuery({
    queryKey: TEACHER_KEYS.courses(teacherId),
    queryFn: () => teacherApi.getTeacherCoursesId(teacherId), // FIXED
    enabled: !!teacherId,
  });

export const useTeacherClasses = (teacherId) =>
  useQuery({
    queryKey: TEACHER_KEYS.classes(teacherId),
    queryFn: () => teacherApi.getTeacherClasses(teacherId),
    enabled: !!teacherId,
  });

export { teacherApi, TEACHER_KEYS };
