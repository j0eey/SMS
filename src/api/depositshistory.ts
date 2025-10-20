import api from "./axios";

export interface DepositHistory {
  _id: string;
  userId:
    | {
        _id: string;
        email: string;
        name: string;
        balance: number;
      }
    | string;
  method: string;
  type: "deposit";
  amount: number;
  status: "pending" | "completed" | "failed";
  reference?: string;
  proof?: string | null;
  currency?: string; // USD or LBP for whishmoney
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
  depositNumber?: number;
  depositLabel?: string;
}

export interface DepositHistoryResponse {
  page: number;
  pageSize: number;
  total: number;
  items: DepositHistory[];
}

// 🔹 Fetch paginated deposits
export async function getDepositHistory(
  page = 1,
  pageSize = 20
): Promise<DepositHistoryResponse> {
  const res = await api.get("/admin/deposits", { params: { page, pageSize } });
  return res.data;
}

// 🔹 Search deposits
export async function searchDepositHistory(
  query: string,
  page = 1,
  pageSize = 10
): Promise<DepositHistoryResponse> {
  const res = await api.get("/admin/deposits/search", {
    params: { query, page, pageSize },
  });
  return res.data;
}
