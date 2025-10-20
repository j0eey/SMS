import api from "./axios";

export interface Deposit {
  _id: string;
  userId: { email: string; name: string; balance: number };
  method: string;
  amount: number;
  status: "pending" | "completed" | "failed";
  reference?: string;
  proof?: string;
  currency?: string; // USD or LBP for whishmoney
  createdAt: string;
  updatedAt: string;
  depositLabel?: string;  // ✅ from backend
}

export interface PaginatedDeposits {
  items: Deposit[];
  total: number;
  page: number;
  pageSize: number;
}

/**
 * ✅ Fetch deposits (paginated + status filter)
 */
export async function getDeposits(
  status?: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedDeposits> {
  const res = await api.get("/admin/deposits", {
    params: {
      status,
      page,
      pageSize,
    },
  });
  return res.data as PaginatedDeposits;
}

/**
 * ✅ Search deposits by query (paginated)
 */
export async function searchDeposits(
  query: string,
  page: number = 1,
  pageSize: number = 20
): Promise<PaginatedDeposits> {
  const res = await api.get("/admin/deposits/search", {
    params: { query, page, pageSize },
  });
  return res.data as PaginatedDeposits;
}

/**
 * ✅ Confirm deposit
 */
export async function confirmDeposit(id: string) {
  const res = await api.post(`/admin/deposits/${id}/confirm`);
  return res.data;
}

/**
 * ✅ Reject deposit
 */
export async function rejectDeposit(id: string, reason: string) {
  const res = await api.post(`/admin/deposits/${id}/reject`, { reason });
  return res.data;
}
