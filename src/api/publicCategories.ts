import api from "./axios";

export interface PublicCategory {
  _id: string;
  slug: string;
  name: string;
  description?: string;
  status: string;
  imageUrl?: string;
}

export async function getPublicCategories(page = 1, pageSize = 12) {
  const res = await api.get(`/user/categories?page=${page}&pageSize=${pageSize}`);
  return res.data;
}

export async function searchPublicCategories(query: string, page = 1, pageSize = 12) {
  const res = await api.get(`/user/categories/search?query=${encodeURIComponent(query)}&page=${page}&pageSize=${pageSize}`);
  return res.data;
}