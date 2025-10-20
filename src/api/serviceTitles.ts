import api from "./axios";

export interface ServiceTitle {
  _id: string;
  platformId: string | { _id: string; name: string }; // can be populated
  name: string;
  description?: string;
  status: "active" | "inactive";
  imageUrl?: string; // optional image
}

export type ServiceTitleInput = Omit<ServiceTitle, "_id">;

// ✅ Paginated fetch - unlimited size
export async function getServiceTitles(page = 1, pageSize = 10000) {
  const res = await api.get("/admin/service-titles", {
    params: { page, pageSize },
  });
  return res.data; // { items, total, page, pageSize }
}

// ✅ Search service titles
export async function searchServiceTitles(query: string) {
  const res = await api.get("/admin/service-titles/search", {
    params: { query },
  });
  return res.data as ServiceTitle[];
}

export async function createServiceTitle(formData: FormData) {
  const res = await api.post("/admin/service-titles", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function updateServiceTitle(id: string, formData: FormData) {
  const res = await api.put(`/admin/service-titles/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export async function deleteServiceTitle(id: string) {
  const res = await api.delete(`/admin/service-titles/${id}`);
  return res.data;
}
