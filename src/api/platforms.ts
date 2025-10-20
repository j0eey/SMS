import api from "./axios";

export interface PlatformRecord {
  _id: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  image?: string;
  categoryId: string | { _id: string; name: string };
}

export interface PaginatedPlatforms {
  items: PlatformRecord[];
  total: number;
  page: number;
  pageSize: number;
}

// ✅ Fetch platforms with pagination
export async function getPlatforms(
  page: number = 1,
  pageSize: number = 30,
  categoryId?: string
): Promise<PaginatedPlatforms> {
  const res = await api.get("/admin/platforms", {
    params: { page, pageSize, categoryId },
  });
  return res.data;
}

// ✅ Search platforms (name/description/category) — no pagination
export async function searchPlatforms(query: string): Promise<PlatformRecord[]> {
  const res = await api.get("/admin/platforms/search", {
    params: { query },
  });
  return res.data;
}

// ✅ Create platform
export async function createPlatform(formData: FormData) {
  const res = await api.post("/admin/platforms", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ✅ Update platform
export async function updatePlatform(id: string, formData: FormData) {
  const res = await api.put(`/admin/platforms/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ✅ Delete platform
export async function deletePlatform(id: string) {
  const res = await api.delete(`/admin/platforms/${id}`);
  return res.data;
}
