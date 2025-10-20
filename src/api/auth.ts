import api from "./axios";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role?: string;
  balance?: number;
  banned?: boolean;
}

export interface LoginResponse {
  accessToken?: string;
  refreshToken?: string;
  user: AuthUser;
  message?: string;
  error?: string;
}

export async function login(payload: { email: string; password: string }) {
  const res = await api.post<LoginResponse>("/auth/login", payload, {
    withCredentials: true,
  });
  
  // Store tokens
  localStorage.setItem("accessToken", res.data.accessToken || "");
  localStorage.setItem("refreshToken", res.data.refreshToken || "");
  
  return res.data;
}

export async function signup(payload: {
  name: string;
  email: string;
  password: string;
}) {
  const res = await api.post<LoginResponse>("/auth/signup", payload);
  
  // Store tokens after signup
  localStorage.setItem("accessToken", res.data.accessToken || "");
  localStorage.setItem("refreshToken", res.data.refreshToken || "");
  
  return res.data;
}

export async function logout() {
  try {
    const refreshToken =
      localStorage.getItem("refreshToken") ||
      sessionStorage.getItem("refreshToken");

    if (refreshToken) {
      await api.post("/auth/logout", { refreshToken });
    }
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear tokens
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("refreshToken");
    
    // Redirect to login
    window.location.href = "/login";
  }
}

export async function refreshAccessToken() {
  const refreshToken =
    localStorage.getItem("refreshToken") ||
    sessionStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("No refresh token available");
  }

  const res = await api.post<{ accessToken: string }>("/auth/refresh", {
    refreshToken,
  });

  const newAccessToken = res.data.accessToken;

  // Update stored token
  if (localStorage.getItem("accessToken")) {
    localStorage.setItem("accessToken", newAccessToken);
  } else {
    sessionStorage.setItem("accessToken", newAccessToken);
  }

  return newAccessToken;
}

export async function requestPasswordReset(email: string) {
  const res = await api.post("/auth/request-reset", { email });
  return res.data;
}

export async function resetPassword(token: string, newPassword: string) {
  const res = await api.post("/auth/reset-password", { token, newPassword });
  return res.data;
}