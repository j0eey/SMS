import { create } from "zustand";

interface UserState {
  token: string | null;
  refreshToken: string | null;
  setToken: (accessToken: string) => void;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

export const useUserStore = create<UserState>((set, get) => ({
  token: localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken"),
  refreshToken: localStorage.getItem("refreshToken") || sessionStorage.getItem("refreshToken"),

  setToken: (accessToken) => {
    localStorage.setItem("accessToken", accessToken);
    set({ token: accessToken });
  },

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    set({ token: accessToken, refreshToken });
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    set({ token: null, refreshToken: null });
  },

  refreshAccessToken: async () => {
    // This will be called by the interceptor
    const { refreshToken } = get();
    if (!refreshToken) {
      get().logout();
      throw new Error("No refresh token available");
    }

    try {
      const axios = (await import("axios")).default;
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "https://smslb.shop/api"}/auth/refresh`,
        { refreshToken },
        { withCredentials: true }
      );

      const newAccessToken = res.data.accessToken;
      localStorage.setItem("accessToken", newAccessToken);
      set({ token: newAccessToken });
    } catch (error) {
      get().logout();
      throw error;
    }
  },
}));