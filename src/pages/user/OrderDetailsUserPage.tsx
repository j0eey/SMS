import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import Footer from "../../layouts/Footer";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { getUserOrderById } from "../../api/publicOrders";
import toast from "react-hot-toast";

interface OrderDetails {
  _id: string;
  orderNumber?: number;
  service: { _id: string; name: string; serviceType?: string } | string;
  link?: string;
  quantity?: number;
  charge?: string;
  currency?: string;
  status: string;
  adminNotes?: string;
  createdAt: string;
}

export default function OrderDetailsUserPage() {
  const navigate = useNavigate();
  const { orderId } = useParams();
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/account/orders");
    }
  };

  useEffect(() => {
    if (!token) {
      toast.error("Please log in to view order details");
      navigate("/login");
      return;
    }

    async function fetchOrder() {
      try {
        setLoading(true);
        const data = await getUserOrderById(orderId!);
        setOrder(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load order details.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [orderId, token, navigate]);

  return (
    <UserLayout>
      <div className="min-h-screen bg-black text-white px-4 py-10">
        <div className="max-w-4xl mx-auto">

          {/* Back Button */}
          <div className="flex items-center gap-4 mb-8">
            <button
              onClick={goBack}
              className="p-2 hover:bg-red-600/20 rounded-full transition"
            >
              <ArrowLeftIcon className="w-7 h-7 text-red-600" />
            </button>
            <h1 className="text-3xl font-bold text-red-600">
              Order Details
            </h1>
          </div>

          {loading ? (
            <p className="text-center text-gray-400">Loading order details...</p>
          ) : !order ? (
            <p className="text-center text-gray-400">Order not found.</p>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">

              <p><span className="font-semibold text-red-500">Order Number:</span> {order.orderNumber ?? "—"}</p>
              <p>
                <span className="font-semibold text-red-500">Service:</span>{" "}
                {typeof order.service === "object" ? (
                  <>
                    {order.service.name}
                    {order.service.serviceType && (
                      <span className="text-sm text-gray-400"> (
                        {order.service.serviceType === "api" ? "API Service" : "Local Service"}
                      )</span>
                    )}
                  </>
                ) : (
                  order.service
                )}
              </p>

              {!(typeof order.service === "object" && order.service?.serviceType === "local") && (
                <p>
                  <span className="font-semibold text-red-500">Link:</span>{" "}
                  {order.link ? (
                    <a
                      href={/^https?:\/\//i.test(order.link) ? order.link : `https://${order.link}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-red-400 hover:underline break-all"
                    >
                      {order.link}
                    </a>
                  ) : (
                    "—"
                  )}
                </p>
              )}

              <p><span className="font-semibold text-red-500">Quantity:</span> {order.quantity ?? "—"}</p>
              <p><span className="font-semibold text-red-500">Price:</span> {order.charge ? `$${order.charge}` : "—"}</p>

              <p><span className="font-semibold text-red-500">Status:</span> {order.status}</p>

              <p><span className="font-semibold text-red-500">Admin Notes:</span> {order.adminNotes || "—"}</p>

              <p><span className="font-semibold text-red-500">Date:</span> {new Date(order.createdAt).toLocaleString()}</p>

            </div>
          )}

        </div>
      </div>
      <Footer />
    </UserLayout>
  );
}