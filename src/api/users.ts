import api from "./axios";

// ✅ List users (no search, just normal list with pagination)
export async function getUsers() {
  const res = await api.get("/admin/users");
  const data = res.data;

  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

// ✅ Explicit search (calls /admin/users/search?=query)
export async function searchUsers(query: string) {
  // 👇 build raw querystring since backend expects ?=value (non-standard)
  const res = await api.get(`/admin/users/search?=${encodeURIComponent(query)}`);
  const data = res.data;

  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

// ✅ Create user (admin can add users/admins)
export async function createUser(user: {
  role: string;
  name: string;
  email: string;
  password: string;
}) {
  const res = await api.post("/admin/users", user);
  return res.data;
}

// ✅ Ban/unban user
export async function banUser(id: string, banned: boolean) {
  const res = await api.post(`/admin/users/${id}/ban`, { banned });
  return res.data;
}

// ✅ Adjust balance
export async function adjustBalance(id: string, amount: number, reason?: string) {
  const res = await api.post(`/admin/users/${id}/balance`, { amount, reason });
  return res.data;
}

// ✅ Delete user permanently
export async function deleteUser(id: string) {
  const res = await api.delete(`/admin/users/${id}`);
  return res.data;
}
