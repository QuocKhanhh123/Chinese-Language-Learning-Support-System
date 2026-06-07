import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import axiosInstance from "@/network/httpRequest";

export const useUsersByRole = (role) => {
  return useQuery({
    queryKey: ["admin-users", role],
    queryFn: async () => {
      // Backend đang paginate mặc định limit=10, nên set limit lớn để lấy đủ danh sách hiển thị ở Admin
      const { data } = await axiosInstance.get(`/users/get-users`, {
        params: { role, page: 1, limit: 1000 },
      });
      // tuỳ ApiRes của bạn: data.data.users hoặc data.users
      return data?.data?.users ?? data?.users ?? [];
    },
  });
};

export const useDeleteUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (userId) => {
      const { data } = await axiosInstance.delete(
        `/users/delete-user/${userId}`
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
};

export const useUpdateUser = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }) => {
      // bạn đã có updateUser controller nhưng chưa thấy route -> ví dụ:
      // PUT /users/update-user/:id
      const { data } = await axiosInstance.put(
        `/users/update-user/${id}`,
        payload
      );
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
};

export const useUpdateStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }) => {
      const { data } = await axiosInstance.put(`/users/update-status/${id}`, {
        status,
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["admin-users"] }),
  });
};
