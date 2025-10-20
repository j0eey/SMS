import api from "./axios";

export interface PublicPlatform {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  status: "active" | "inactive";
  imageUrl?: string;
}

export interface PaginatedPlatforms {
  items: PublicPlatform[];
  total: number;
  page: number;
  pageSize: number;
}

// ✅ Fetch paginated platforms
export async function getPublicPlatforms(categorySlug?: string, page = 1, pageSize = 16): Promise<PaginatedPlatforms> {
  const res = await api.get("/user/platforms", {
    params: { categorySlug, page, pageSize }
  });
  return res.data; // { page, pageSize, total, totalPages, items }
}

// ✅ Search across platforms
export async function searchPublicPlatforms(query: string, categorySlug?: string, page = 1, pageSize = 16): Promise<PaginatedPlatforms> {
  const res = await api.get("/user/platforms/search", {
    params: { query, categorySlug, page, pageSize }
  });
  return res.data; // { page, pageSize, total, totalPages, items }
}