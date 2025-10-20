import api from "./axios";

export async function loginAdmin(email: string, password: string) {
  const res = await api.post("/admin/auth/login", { email, password });
  return res.data; // { accessToken, refreshToken, user }
}
