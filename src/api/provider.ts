import api from "./axios";

export async function getProviderBalance() {
  const res = await api.get("/admin/balance");
  return res.data; // { balance: string, currency: string }
}
