import api from "./axios";

export interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  userPrice?: number;
  stock?: number;
  min: number;
  max: number;
  status: "active" | "inactive";
  serviceType: "api" | "local";
  provider?: string | null;
  providerServiceId?: string | null;
  imageUrl?: string;
  serviceTitle?: {
    _id: string;
    name: string;
    platform?: {
      _id: string;
      name: string;
      category?: { _id: string; name: string } | null;
    } | null;
  } | null;
}

export type ServiceInput = {
  name: string;
  description: string;
  price: number;
  stock?: number;
  min: number;
  max: number;
  status: "active" | "inactive";
  serviceTitleId: string;
  serviceType: "api" | "local";
  provider?: string | null;
  providerServiceId?: string | null;
};

// ✅ Get services with pagination
export async function getServices(page = 1, pageSize = 20) {
  const res = await api.get("/admin/services", {
    params: { page, pageSize },
  });
  return res.data;
}

// ✅ Search services (NO pagination)
export async function searchServices(query: string) {
  const res = await api.get("/admin/services/search", { params: { query } });
  return res.data;
}

// ✅ Create service (supports image upload)
export async function createService(formData: FormData) {
  const res = await api.post("/admin/services", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ✅ Update service (supports image upload)
export async function updateService(id: string, formData: FormData) {
  const res = await api.put(`/admin/services/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

// ✅ Delete service
export async function deleteService(id: string) {
  const res = await api.delete(`/admin/services/${id}`);
  return res.data;
}