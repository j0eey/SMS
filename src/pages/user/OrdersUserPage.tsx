import { useEffect, useState } from "react";
import UserLayout from "../../layouts/UserLayout";
import Footer from "../../layouts/Footer";
import { getUserOrders, type UserOrder } from "../../api/publicOrders";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { Link, useNavigate } from "react-router-dom";

// ✅ Simple auth check
function useAuthGuard() {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return { isAuthed: !!token };
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  if (s === "completed")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-400">
        ✅ Completed
      </span>
    );
  if (s === "pending")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-600/20 text-yellow-300">
        ⏳ Pending
      </span>
    );
  if (s === "processing")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-600/20 text-blue-300">
        🔄 Processing
      </span>
    );
  if (s === "rejected")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-600/20 text-red-400">
        ❌ Rejected
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-600/30 text-gray-300">
      {status}
    </span>
  );
}

function fmtMoney(charge?: string, currency = "USD") {
  const num = Number(charge ?? 0);
  const formatted = num.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency === "USD" ? "$" : ""}${formatted}${currency !== "USD" ? ` ${currency}` : ""}`;
}

const PAGE_SIZE = 10;

export default function OrdersUserPage() {
  const { isAuthed } = useAuthGuard();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<UserOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const goBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/account");
    }
  };

  useEffect(() => {
    if (!isAuthed) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const res = await getUserOrders(page, PAGE_SIZE);
        setOrders(res.items);
        setTotalPages(res.totalPages);
      } catch (e) {
        console.error(e);
        setErr("Failed to load orders.");
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthed, page]);

  const pageSafe = Math.min(page, totalPages);

  return (
    <UserLayout>
      <div className="min-h-screen bg-black text-white px-4 py-10">
        <div className="max-w-6xl mx-auto">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4 mb-8">
              <button
                onClick={goBack}
                className="p-2 hover:bg-red-600/20 rounded-full transition"
              >
                <ArrowLeftIcon className="w-7 h-7 text-red-600" />
              </button>
              <h1 className="text-3xl font-bold text-red-600">My Orders</h1>
            </div>
            <Link
              to="/services"
              className="text-sm px-3 py-2 rounded border border-red-600 text-red-500 hover:bg-red-600 hover:text-white transition"
            >
              + New Order
            </Link>
          </div>

          {/* Content */}
          {!isAuthed ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
              <p className="text-gray-300 mb-3">You need to be logged in to view your orders.</p>
              <Link
                to="/login"
                className="inline-block px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700 transition"
              >
                Log in
              </Link>
            </div>
          ) : loading ? (
            <p className="text-center text-gray-400">Loading your orders…</p>
          ) : err ? (
            <p className="text-center text-red-500">{err}</p>
          ) : orders.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
              <p className="text-gray-300">No orders yet.</p>
            </div>
          ) : (
            <>
              {/* Orders Table */}
              <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="min-w-full bg-zinc-950">
                  <thead className="bg-zinc-900">
                    <tr className="text-left text-zinc-300">
                      <th className="py-3 px-4">Order #</th>
                      <th className="py-3 px-4">Service</th>
                      <th className="py-3 px-4">Quantity</th>
                      <th className="py-3 px-4">Price</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((o) => (
                      <tr key={o._id} className="border-t border-zinc-800">
                        <td className="py-3 px-4 font-semibold text-white">
                          {o.orderNumber ?? "—"}
                        </td>
                        <td className="py-3 px-4 text-zinc-300">
                          {typeof o.service === "object" && o.service !== null ? (
                            <>
                              <div>{o.service.name || "—"}</div>
                              {o.service.serviceType && (
                                <div className="text-xs text-gray-500">
                                  {o.service.serviceType === "api" ? "API Service" : "Local Service"}
                                </div>
                              )}
                            </>
                          ) : (
                            o.service
                          )}
                        </td>
                        <td className="py-3 px-4 text-zinc-300">{o.quantity ?? "—"}</td>
                        <td className="py-3 px-4 text-zinc-200">
                          {fmtMoney(o.charge, o.currency)}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={o.status} />
                        </td>
                        <td className="py-3 px-4 text-zinc-400">
                          {new Date(o.createdAt).toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <Link to={`/account/orders/${o._id}`} className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm">View Details</Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center mt-6 space-x-4">
                  <button
                    disabled={pageSafe === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    className="px-4 py-2 bg-gray-800 disabled:opacity-40 rounded"
                  >
                    Previous
                  </button>
                  <span>Page {pageSafe} of {totalPages}</span>
                  <button
                    disabled={pageSafe === totalPages}
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    className="px-4 py-2 bg-gray-800 disabled:opacity-40 rounded"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
      <Footer />
    </UserLayout>
  );
}