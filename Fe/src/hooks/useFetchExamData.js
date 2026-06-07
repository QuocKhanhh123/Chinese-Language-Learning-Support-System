import axiosInstance from "@/network/httpRequest";
import { useQuery } from "@tanstack/react-query";

const useFetchExamData = (examId) => {
  return useQuery({
    queryKey: ["exam data", examId],
    queryFn: async () => {
      const res = await axiosInstance.get(`exams/get-exam/${examId}`);
      return res.data.data;
    },
    gcTime: 1000 * 60 * 5, // 5 mins
  });
};

export default useFetchExamData;
