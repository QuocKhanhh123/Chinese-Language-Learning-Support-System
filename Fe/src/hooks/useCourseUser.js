import { useQuery } from "@tanstack/react-query";
import axiosInstance from "@/network/httpRequest";

export const useCourseUsers = (courseId) =>
  useQuery({
    queryKey: ["course-users", courseId],
    queryFn: async () => {
      const res = await axiosInstance.get(
        `/courses/get-course-users/${courseId}`
      );
      return res.data.data;
    },
    enabled: !!courseId,
  });
