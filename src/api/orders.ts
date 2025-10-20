import api from "./axios";

export async function getOrders(status?: string, page = 1, pageSize = 10) {
  const res = await api.get("/admin/orders", {
    params: {
      status,
      page,
      pageSize,
    },
  });
  return res.data;
}

export async function searchOrders(search = "", page = 1, pageSize = 10) {
  const res = await api.get("/admin/orders", {
    params: { search, page, pageSize },
  });
  return res.data;
}

// Confirm manual order (with optional credentials)
export async function confirmOrder(id: string, credentials?: string) {
  const res = await api.post(`/admin/orders/${id}/confirm`, {
    notes: credentials || "Confirmed by admin",
  });
  return res.data;
}

// Reject manual order (with reason)
export async function rejectOrder(id: string, reason: string) {
  const res = await api.post(`/admin/orders/${id}/reject`, { reason });
  return res.data;
}
