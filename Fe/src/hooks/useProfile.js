// hooks/useProfile.ts
import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/network/httpRequest";

export const useProfile = () => {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await axiosInstance.get("/auth/me");
      return res.data.data;
    },
    staleTime: 5 * 60 * 1000,
  });
};
