import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import Footer from "../../layouts/Footer";
import { ArrowLeftIcon, MinusIcon, PlusIcon } from "@heroicons/react/24/solid";
import toast from "react-hot-toast";
import {
  getPublicServiceBySlug,
  getUserProfile,
  placeOrder,
} from "../../api/publicServiceDetails";

interface ServiceDetails {
  _id: string;
  name: string;
  description: string;
  userPrice: number;
  stock?: number;
  min: number;
  max: number;
  status: "active" | "inactive";
  serviceType?: "api" | "local";
  slug?: string;
}

type ModalState = "idle" | "loading" | "success" | "error";

export default function ServiceDetailsUserPage() {
  const { categorySlug, platformSlug, serviceTitleSlug, serviceSlug } = useParams<{
    categorySlug: string;
    platformSlug: string;
    serviceTitleSlug: string;
    serviceSlug: string;
  }>();
  const navigate = useNavigate();

  const [service, setService] = useState<ServiceDetails | null>(null);
  const [loading, setLoading] = useState(true);

  const [link, setLink] = useState("");
  const [qty, setQty] = useState(0);
  const [ordering, setOrdering] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalState, setModalState] = useState<ModalState>("idle");
  const [modalMessage, setModalMessage] = useState("");
  const [orderNumber, setOrderNumber] = useState<string | number | null>(null);

  useEffect(() => {
    if (serviceSlug) loadService();
    // eslint-disable-next-line
  }, [serviceSlug]);

  async function loadService() {
    try {
      setLoading(true);
      const data: ServiceDetails = await getPublicServiceBySlug(serviceSlug as string);
      setService(data);
      setQty(data.min);
    } catch {
      toast.error("Service not found");
    } finally {
      setLoading(false);
    }
  }

  const clampQty = (value: number) => {
    if (!service) return value;
    if (service.serviceType === "local") {
      return Math.max(1, value); // allow any positive qty for local
    }
    return Math.max(service.min, Math.min(service.max, value));
  };

  const { displayTotal, numericTotal } = useMemo(() => {
    if (!service) return { displayTotal: "0.00000", numericTotal: 0 };
    const total = service.serviceType === "local"
      ? qty * service.userPrice
      : service.min === 1 && service.max === 1
        ? qty * service.userPrice
        : (qty / 1000) * service.userPrice;
    return { numericTotal: total, displayTotal: total.toFixed(5) };
  }, [service, qty]);

  const handleOrder = async () => {
    if (!service) return;

    const token = localStorage.getItem("accessToken");
    if (!token) {
      toast.error("You must login to place an order");
      return;
    }

    if (service.serviceType !== "local") {
      if (!link.startsWith("http")) {
        toast.error("Please enter a valid URL (https:// required)");
        return;
      }
    }

    setShowModal(true);
    setModalState("loading");
    setModalMessage("Validating order...");
    setOrdering(true);

    try {
      const user = await getUserProfile(token);
      if (user.balance < numericTotal) {
        setModalState("error");
        setModalMessage(`Insufficient balance. You need $${numericTotal.toFixed(2)}`);
        setOrdering(false);
        return;
      }

      setModalMessage("Placing your order...");
      const resp = await placeOrder({
        serviceSlug: (service.slug as string),
        providerServiceId: (service as any).providerServiceId,
        quantity: qty,
        token,
        serviceType: service.serviceType || "api",
        link: service.serviceType === "local" ? undefined : link
      });
      const orderId =
        resp.order_id || resp.orderId || resp.id || resp.order || "Unknown";

      setModalState("success");
      setModalMessage("Order placed successfully!");
      setOrderNumber(resp.orderNumber ?? orderId);
      setLink("");
    } catch (err: any) {
      setModalState("error");
      setModalMessage(err?.message || err?.response?.data?.error || "Order failed");
    } finally {
      setOrdering(false);
    }
  };

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(`/services/${categorySlug}/${platformSlug}/${serviceTitleSlug}`);
    }
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-black text-white px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button
              onClick={goBack}
              className="p-2 hover:bg-red-600/20 rounded-full transition"
            >
              <ArrowLeftIcon className="w-7 h-7 text-red-600" />
            </button>
          </div>

          {loading ? (
            <p className="text-center text-gray-400">Loading service...</p>
          ) : service ? (
            <div className="bg-neutral-900 rounded-lg shadow-lg p-6">
              <h1 className="text-3xl font-bold text-red-600">{service.name}</h1>
              <p className="text-gray-400 mt-3">{service.description}</p>

              {service.serviceType === "local" && (
                <div className="mt-3 bg-yellow-900/30 border border-yellow-700 text-yellow-300 p-3 rounded">
                  ⚙️ This is a <b>Local Service</b>. After you place your order, the admin will process it manually.
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
                <div className="bg-black/40 p-4 rounded">
                  <p className="text-gray-400">Price</p>
                  <p className="font-bold text-red-500">${service.userPrice.toFixed(2)}</p>
                  <small className="text-gray-500">
                    {service.serviceType === "local"
                      ? "Per unit"
                      : service.min === 1
                        ? "Per 1 unit"
                        : "Per 1000 units"}
                  </small>
                </div>

                {service.serviceType !== "local" && (
                  <div className="bg-black/40 p-4 rounded">
                    <p className="text-gray-400">Min/Max</p>
                    <p className="font-bold">{service.min} / {service.max}</p>
                  </div>
                )}

                <div className="bg-black/40 p-4 rounded">
                  <p className="text-gray-400">Stock</p>
                  <p className="font-bold">{service.stock ?? "Unlimited"}</p>
                </div>
              </div>

              <div className="space-y-6">
                {service.serviceType !== "local" && (
                  <div>
                    <label className="text-gray-400 text-sm">Link</label>
                    <input
                      value={link}
                      onChange={(e) => setLink(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full bg-black/50 border border-neutral-700 rounded px-3 py-2 mt-1"
                    />
                  </div>
                )}

                <div>
                  <label className="text-gray-400 text-sm">Quantity</label>
                  <div className="flex gap-2 mt-1">
                    <button
                      className="p-2 border border-neutral-700 rounded bg-black/50 hover:border-red-600"
                      onClick={() => setQty((v) => clampQty(v - 1))}
                    >
                      <MinusIcon className="w-5 h-5" />
                    </button>

                    <input
                      type="number"
                      value={qty}
                      min={service.serviceType === "local" ? 1 : service.min}
                      max={service.serviceType === "local" ? undefined : service.max}
                      onChange={(e) => setQty(clampQty(Number(e.target.value)))}
                      className="w-full text-center bg-black/50 border border-neutral-700 rounded"
                    />

                    <button
                      className="p-2 border border-neutral-700 rounded bg-black/50 hover:border-red-600"
                      onClick={() => setQty((v) => clampQty(v + 1))}
                    >
                      <PlusIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex justify-between bg-black/50 p-4 rounded">
                  <span>Total</span>
                  <span className="text-red-500 font-bold">${displayTotal}</span>
                </div>

                <button
                  disabled={ordering}
                  onClick={handleOrder}
                  className="w-full bg-red-600 hover:bg-red-700 py-3 rounded font-bold disabled:bg-gray-700"
                >
                  {ordering
                    ? "Processing..."
                    : service.serviceType === "local"
                      ? "Send Request"
                      : "Order Now"}
                </button>
              </div>
            </div>
          ) : (
            <p className="text-center text-red-500">Service not found</p>
          )}
        </div>
      </div>

      {/* ORDER MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <div className="bg-neutral-900 rounded-lg p-6 w-[90%] max-w-md text-center">
            {modalState === "loading" && (
              <>
                <p className="text-white text-lg mb-4">{modalMessage}</p>
                <div className="w-8 h-8 mx-auto border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
              </>
            )}

            {modalState === "success" && (
              <>
                <p className="text-green-400 text-xl mb-2">✅ Order Successful!</p>
                <p className="text-gray-300 mb-4">{modalMessage}</p>
                {orderNumber && <p className="text-gray-500">Order Number: #{orderNumber}</p>}
                <button
                  onClick={() => setShowModal(false)}
                  className="mt-4 w-full bg-red-600 py-2 rounded"
                > 
                  Close
                </button>
              </>
            )}

            {modalState === "error" && (
              <>
                <p className="text-red-500 text-xl mb-2">❌ Error</p>
                <p className="text-gray-300 mb-4">{modalMessage}</p>
                <button
                  onClick={() => setShowModal(false)}
                  className="mt-4 w-full bg-red-600 py-2 rounded"
                >
                  Close
                </button>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </UserLayout>
  );
}