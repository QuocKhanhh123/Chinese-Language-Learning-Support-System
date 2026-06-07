// hooks/useUsers.js
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "../network/httpRequest";

// Tùy project, bạn có thể thay axios bằng instance riêng: import api from '@/lib/api'
const fetchUsers = async () => {
  const res = await axiosInstance.get("/users/get-users");
  // response mẫu bạn gửi:
  // { success, message, statusCode, data: { users, page, limit, total } }
  return res.data.data.users;
};

export const useUsers = () => {
  return useQuery({
    queryKey: ["users"],
    queryFn: fetchUsers,
  });
};
