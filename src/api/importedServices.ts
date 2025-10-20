import api from "./axios";

export interface ImportedService {
  service: string;
  name: string;
  category: string;
  type: string;
  rate: string;
  min: number;
  max: number;
  dripfeed: boolean;
  refill: boolean;
  cancel: boolean;
}

// ✅ Supports search + pagination
export async function getImportedServices(query = "", page = 1, pageSize = 50) {
  const res = await api.get("/secsers/services", {
    params: { query, page, pageSize },
  });
  return res.data;
}