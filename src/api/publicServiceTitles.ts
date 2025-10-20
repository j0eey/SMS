

import api from "./axios";

export interface PublicServiceTitle {
  _id: string;
  slug: string;
  name: string;
  status: string;
  platformId: {
    _id: string;
    slug?: string;
    name: string;
    imageUrl?: string;
  };
}

export interface PaginatedServiceTitles {
  items: PublicServiceTitle[];
  total: number;
  page: number;
  pageSize: number;
}

export async function getPublicServiceTitles(platformId: string, page = 1, pageSize = 16) {
  const res = await api.get("/user/service-titles", { params: { platformId, page, pageSize } });
  return res.data as PaginatedServiceTitles;
}

export async function searchPublicServiceTitles(query: string, platformId?: string, page = 1, pageSize = 16) {
  const res = await api.get("/user/service-titles/search", {
    params: { query, platformId, page, pageSize }
  });
  return res.data;
}