import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

const useAuthStore = create()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      login: (user, token) => {
        localStorage.setItem("token", token);
        set({ isAuthenticated: true, user: user });
      },
      logout: () => {
        localStorage.removeItem("token");
        set({ isAuthenticated: false, user: null });
      },
    }),
    {
      name: "auth",
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export default useAuthStore;
