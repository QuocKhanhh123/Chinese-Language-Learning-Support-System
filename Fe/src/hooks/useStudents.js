import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../network/httpRequest";

const STUDENT_KEYS = {
  all: ["students"],
  list: (role) => [...STUDENT_KEYS.all, "list", role],
  detail: (id) => [...STUDENT_KEYS.all, "detail", id],
};

const studentApi = {
  getAllUsers: async ({ role }) => {
    const response = await axiosInstance.get("/users/get-users", {
      params: role ? { role } : {},
    });
    return response.data.data.users;
  },

  getUserById: async (studentId) => {
    const response = await axiosInstance.get(`/users/get-user/${studentId}`);
    return response.data.data;
  },
};

export const useStudents = (role = "student") =>
  useQuery({
    queryKey: STUDENT_KEYS.list(role),
    queryFn: () => studentApi.getAllUsers({ role }),
  });

export const useStudentById = (studentId) =>
  useQuery({
    queryKey: STUDENT_KEYS.detail(studentId),
    queryFn: () => studentApi.getUserById(studentId),
    enabled: !!studentId,
  });

export { studentApi };
