import axiosInstance from "@/network/httpRequest";
import { useQuery } from "@tanstack/react-query";

const useFetchLessonData = (course_id) => {
  const getLessons = async () => {
    const res = await axiosInstance.get(
      `/lessons/get-lessons-in-course/${course_id}`
    );
    return res.data;
  };

  return useQuery({
    queryKey: ["lessons"],
    queryFn: getLessons,
    gcTime: 1000 * 60 * 5, // 5 minutes
    retry: 3,
  });
};

export default useFetchLessonData;
