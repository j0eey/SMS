import api from "./axios";

export async function getAdminOverview() {
  const res = await api.get("/admin/analytics/overview");
  return res.data;
}

export async function getDailyDeposits(range: string = "30d") {
  const res = await api.get("/admin/deposits", { params: { range } });
  const data = res.data;

  // normalize to array
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

export async function getDailyOrders(range: string = "30d") {
  const res = await api.get("/admin/orders", { params: { range } });
  const data = res.data;

  // normalize to array
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.items)) return data.items;
  return [];
}

export async function getMonthlyUsersGrowth() {
  const res = await api.get("/admin/analytics/users-growth");
  return res.data.monthlySignups.map((item: any) => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
    count: item.count,
  }));
}
