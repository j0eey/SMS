import api from "./axios";

export async function getUserProfile() {
  const res = await api.get("/user/profile");
  return res.data;
}

export async function getUserNotifications() {
  const res = await api.get("/user/notifications");
  return res.data;
}

export async function getUserSecurity() {
  const res = await api.get("/user/security");
  return res.data;
}