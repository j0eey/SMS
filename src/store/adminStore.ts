import { create } from "zustand";

interface AdminState {
  token: string | null;
  refreshToken: string | null;
  setTokens: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  token: localStorage.getItem("admin_token"),
  refreshToken: localStorage.getItem("admin_refresh"),

  setTokens: (accessToken, refreshToken) => {
    localStorage.setItem("admin_token", accessToken);
    localStorage.setItem("admin_refresh", refreshToken);
    set({ token: accessToken, refreshToken });
  },

  logout: () => {
    localStorage.removeItem("admin_token");
    localStorage.removeItem("admin_refresh");
    set({ token: null, refreshToken: null });
  },

  refreshAccessToken: async () => {
    // This will be called by the interceptor in axios.ts
    const { refreshToken } = get();
    if (!refreshToken) {
      get().logout();
      throw new Error("No refresh token available");
    }

    try {
      const axios = (await import("axios")).default;
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL || "https://api.smslb.shop/api"}/auth/refresh`,
        { refreshToken },
        { withCredentials: true }
      );

      const newAccessToken = res.data.accessToken;
      localStorage.setItem("admin_token", newAccessToken);
      set({ token: newAccessToken });
    } catch (error) {
      get().logout();
      throw error;
    }
  },
}));