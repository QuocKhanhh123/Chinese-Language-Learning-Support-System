// hooks/useFetchAllDecks.ts
import axiosInstance from "@/network/httpRequest";
import { useQuery } from "@tanstack/react-query";

const useFetchAllDecks = () => {
  return useQuery({
    queryKey: ["decks"],
    queryFn: async () => {
      const res = await axiosInstance.get("/flashcards/get-decks");
      const payload = res.data?.data || {};
      return {
        decks: payload.decks ?? [],
        total: payload.total ?? 0,
        currentPage: payload.currentPage ?? 1,
        totalPages: payload.totalPages ?? 1,
      };
    },
  });
};
export default useFetchAllDecks;
