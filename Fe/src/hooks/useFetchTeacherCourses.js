import axiosInstance from "@/network/httpRequest";
import useAuthStore from "@/store/useAuthStore";
import { useQuery } from "@tanstack/react-query";

const useFetchTeacherCourses = () => {
  const { user } = useAuthStore();
  const getCourse = async () => {
    const res = await axiosInstance.get(`courses/get-courses-for-teacher`);
    return res.data;
  };

  return useQuery({
    queryKey: ["getCourseLecturer", user?._id],
    queryFn: getCourse,
    staleTime: 1000 * 60 * 5,
    retry: 3,
  });
};

export default useFetchTeacherCourses;
