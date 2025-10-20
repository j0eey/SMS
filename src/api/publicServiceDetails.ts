import api from "./axios";

// ✅ Get public service by slug
export async function getPublicServiceBySlug(serviceSlug: string) {
  const res = await api.get(`/user/services/${serviceSlug}`);
  return res.data;
}

// ✅ Get user profile (to check balance before ordering)
export async function getUserProfile(token: string) {
  const res = await api.get("/user/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
}

// ✅ Place service order
export async function placeOrder(params: {
  serviceSlug: string;
  quantity: number;
  token: string;
  serviceType: "api" | "local";
  providerServiceId?: string | number;
  link?: string;
}) {
  try {
    if (params.serviceType === "api") {
      const res = await api.post(
        "/secsers/order",
        {
          service: params.serviceSlug, // default fallback
          providerServiceId: (params as any).providerServiceId,
          link: params.link,
          quantity: params.quantity,
        },
        {
          headers: { Authorization: `Bearer ${params.token}` },
        }
      );

      if (res.data?.error) {
        throw new Error(res.data.error);
      }

      return res.data;
    } else {
      const res = await api.post(
        "/orders",
        {
          service: params.serviceSlug,
          quantity: params.quantity,
          provider: "manual",
        },
        {
          headers: { Authorization: `Bearer ${params.token}` },
        }
      );

      if (res.data?.error) {
        throw new Error(res.data.error);
      }

      return res.data;
    }
  } catch (err: any) {
    const message =
      err?.response?.data?.error ||
      err?.message ||
      "Failed to place order. Please try again.";
    throw new Error(message);
  }
}