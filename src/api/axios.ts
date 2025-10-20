import axios from "axios";
import { useAdminStore } from "../store/adminStore";
import { useUserStore } from "../store/userStore";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "https://api.smslb.shop/api",
});

let isRefreshing = false;
let failedQueue: Array<{
  onSuccess: (token: string) => void;
  onFailed: (error: any) => void;
}> = [];

const processQueue = (error: any, token?: string) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.onFailed(error);
    } else {
      prom.onSuccess(token!);
    }
  });
  failedQueue = [];
};

// ✅ Intercept all outgoing requests
api.interceptors.request.use(
  (config) => {
    const adminToken = useAdminStore.getState().token;
    const userToken = useUserStore.getState().token;

    // Detect context based on URL path
    const currentPath = window.location.pathname;
    const isAdminPath = currentPath.includes("/admin") || currentPath.includes("/dashboard/admin");

    // Use appropriate token based on current path
    let token: string | null = null;
    if (isAdminPath) {
      token = adminToken;
    } else {
      token = userToken;
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Intercept responses to handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Detect context based on URL path
      const currentPath = window.location.pathname;
      const isAdminPath = currentPath.includes("/admin") || currentPath.includes("/dashboard/admin");

      // Determine which store to use based on current path
      const store = isAdminPath ? useAdminStore : useUserStore;

      if (isRefreshing) {
        // Queue request while refreshing
        return new Promise((onSuccess, onFailed) => {
          failedQueue.push({ onSuccess, onFailed });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        await store.getState().refreshAccessToken();
        const newToken = store.getState().token;
        if (newToken) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          processQueue(null, newToken);
          return api(originalRequest);
        } else {
          throw new Error("Token refresh failed");
        }
      } catch (refreshError) {
        store.getState().logout();
        processQueue(refreshError, undefined);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default api;