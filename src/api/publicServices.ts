import api from "./axios";

// ✅ Interface for public service item
export interface PublicService {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  imageUrl?: string;
  userPrice: number;
  stock?: number;
  min: number;
  max: number;
  status: "active" | "inactive";
  serviceTitleId: string;
}

// ✅ Paginated response
export interface PaginatedServices {
  items: PublicService[];
  total: number;
  page: number;
  pageSize: number;
}

// ✅ Fetch services by serviceTitleId (User Side)
export async function getPublicServices(
  serviceTitleId: string,
  page: number = 1,
  pageSize: number = 16
): Promise<PaginatedServices> {
  const res = await api.get("/user/services", {
    params: { serviceTitleId, page, pageSize },
  });
  return res.data;
}

/**
 * ✅ Fetch single service by ID (User Side)
 */
export async function getPublicServiceById(serviceId: string): Promise<PublicService> {
  const res = await api.get(`/user/services/${serviceId}`);
  return res.data;
}

// ✅ Search services (User Side)
export async function searchPublicServices(
  query: string,
  serviceTitleId?: string,
  page: number = 1,
  pageSize: number = 16
): Promise<PaginatedServices> {
  const res = await api.get("/user/services/search", {
    params: { query, serviceTitleId, page, pageSize },
  });
  return res.data;
}