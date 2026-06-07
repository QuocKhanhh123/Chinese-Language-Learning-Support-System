import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../network/httpRequest";

/* -------------------- Query Keys -------------------- */
const DASHBOARD_KEYS = {
  all: ["admin-dashboard"],
  summary: () => [...DASHBOARD_KEYS.all, "summary"],
};

const STUDENT_KEYS = {
  all: ["student-courses"],
  courses: (studentId) => [...STUDENT_KEYS.all, studentId],
};

const PAYMENT_KEYS = {
  all: ["admin-paid-students"],
};

/* -------------------- API Calls -------------------- */
const fetchDashboardSummary = async () => {
  const { data } = await axiosInstance.get("/admin/dashboard");
  return data.data;
};

// 🔥 SỬA API NÀY CHO ĐÚNG ROUTE BACKEND
const fetchStudentCourses = async (studentId) => {
  const { data } = await axiosInstance.get(
    "/courses/get-courses-for-student-detail",
    {
      params: { studentId },
    }
  );
  return data.data;
};

/* -------------------- React Query Hooks -------------------- */
export const useAdminDashboard = () =>
  useQuery({
    queryKey: DASHBOARD_KEYS.summary(),
    queryFn: fetchDashboardSummary,
    staleTime: 5 * 60 * 1000,
  });

export const useStudentCourses = (studentId) =>
  useQuery({
    queryKey: STUDENT_KEYS.courses(studentId),
    queryFn: () => fetchStudentCourses(studentId),
    enabled: !!studentId,
  });

export const usePaidStudents = () =>
  useQuery({
    queryKey: PAYMENT_KEYS.all,
    queryFn: async () => {
      const { data } = await axiosInstance.get("/admin/paid-students");
      return {
        paidStudentIds: data?.data?.paidStudentIds ?? [],
        students: data?.data?.students ?? [],
        total: data?.data?.total ?? 0,
        apiVersion: data?.data?.apiVersion,
      };
    },
    staleTime: 3 * 60 * 1000,
  });

/* -------------------- Recent students -------------------- */
export const useRecentStudents = () =>
  useQuery({
    queryKey: ["recentStudents"],
    queryFn: async () => {
      const res = await axiosInstance.get("/admin/recent-students");
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });

export { DASHBOARD_KEYS, STUDENT_KEYS, PAYMENT_KEYS };
