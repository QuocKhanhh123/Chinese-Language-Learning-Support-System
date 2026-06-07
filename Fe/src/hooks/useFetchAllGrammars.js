import axiosInstance from "@/network/httpRequest";
import { useQuery } from "@tanstack/react-query";

const useFetchAllGrammars = () => {
  const getVocabulary = async () => {
    const res = await axiosInstance.get(`/grammars/my-grammars`);
    return res.data.data;
  };

  return useQuery({
    queryKey: ["grammar-all"],
    queryFn: getVocabulary,
    gcTime: 1000 * 60 * 5, // 5 mins
  });
};

export default useFetchAllGrammars;
