import api from "./axios";

export interface Transaction {
  _id: string;
  userId: string;
  method: "whishmoney" | "binance" | "usdt" | "wallet" | "admin";
  type: "deposit" | "order" | "adjustment";
  amount: number;
  status: "pending" | "completed" | "failed";
  reference?: string;
  proof?: string | null;
  rejectReason?: string;
  orderNumber?: number;
  createdAt: string;
  updatedAt: string;
}

/**
 * Get user's deposit history
 * Only returns transactions of type "deposit"
 */
export async function getUserDeposits(): Promise<Transaction[]> {
  const response = await api.get("/user/transactions");
  // Filter only deposits
  return response.data.filter((t: Transaction) => t.type === "deposit");
}

/**
 * Get a single user transaction by ID
 */
export async function getUserTransactionById(id: string): Promise<Transaction> {
  const response = await api.get(`/user/transactions/${id}`);
  return response.data;
}

/**
 * Create a new deposit request
 */
export async function createDeposit(formData: FormData) {
  const response = await api.post("/payments/deposit", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}