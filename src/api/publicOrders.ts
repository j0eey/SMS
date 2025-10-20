import api from "./axios";

export type UserOrder = {
  _id: string;
  userId: string;         // id string (already populated as string in your response)
  service: { _id: string; name: string; serviceType?: string } | string;        // populated service info or service ID
  quantity?: number;
  status: "Pending" | "Processing" | "Completed" | "Rejected" | string;
  charge?: string;        // backend sends string ("1"), keep as-is
  currency?: string;      // "USD"
  provider: "secsers" | "manual";
  orderNumber: number;    // ✅ the one we’ll display
  createdAt: string;
  updatedAt: string;
  adminNotes?: string;
};

/** Get all orders for the logged-in user (Authorization handled by axios interceptor) */
export async function getUserOrders(page = 1, pageSize = 20): Promise<{ items: UserOrder[]; total: number; page: number; totalPages: number; }> {
  try {
    const res = await api.get("/orders", { params: { page, pageSize } });
    if (res.data && Array.isArray(res.data.items)) {
      return {
        items: res.data.items,
        total: res.data.total || res.data.items.length,
        page: res.data.page || page,
        totalPages: res.data.totalPages || 1
      };
    }
    return { items: [], total: 0, page: 1, totalPages: 1 };
  } catch (err) {
    console.error("Failed to fetch user orders:", err);
    return { items: [], total: 0, page: 1, totalPages: 1 };
  }
}

export async function getUserOrderById(id: string): Promise<UserOrder | null> {
  try {
    const res = await api.get(`/orders/${id}`);
    return res.data as UserOrder;
  } catch (err) {
    console.error("Failed to fetch order:", err);
    return null;
  }
}