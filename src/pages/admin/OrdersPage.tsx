import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import { getOrders, searchOrders, confirmOrder, rejectOrder } from "../../api/orders";
import toast from "react-hot-toast";

interface Order {
  _id: string;
  orderNumber?: number;
  userId: { email: string; name: string };
  service: { _id: string; name: string; serviceType?: string } | string;
  quantity: number;
  status: string;
  provider?: string;
  charge?: number;
  currency?: string;
  createdAt: string;
  adminNotes?: string;
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const [filter, setFilter] = useState<string>("all");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const pageSize = 10;

  const fetchOrders = async () => {
    setLoading(true);
    try {
      let res;
      if (query) {
        if (page !== 1) setPage(1);
        res = await searchOrders(query, 1, pageSize);
      } else {
        res = await getOrders(filter === "all" ? undefined : filter, page, pageSize);
      }
      setOrders(res.items || []);
      setTotal(res.total || 0);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter, query, page]);

  const handleConfirm = async (id: string) => {
    const creds = prompt("Enter credentials/details to send to the user:");
    try {
      await confirmOrder(id, creds || undefined);
      toast.success("Order confirmed");
      fetchOrders();
    } catch {
      toast.error("Failed to confirm order");
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Reason for rejection?");
    if (!reason) return;
    try {
      await rejectOrder(id, reason);
      toast.success("Order rejected");
      fetchOrders();
    } catch {
      toast.error("Failed to reject order");
    }
  };

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold">Manage Orders</h2>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <form onSubmit={(e) => e.preventDefault()} className="flex items-stretch w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by email, user, order number, service..."
              value={query}
              onChange={(e) => {
                setPage(1);
                setQuery(e.target.value.trimStart());
              }}
              className="border px-3 py-2 rounded-l-lg w-full md:w-80"
            />
            <button
              type="button"
              onClick={() => setQuery("")}
              className="bg-gray-200 px-3 py-2 rounded-r-lg hover:bg-gray-300"
            >
              Clear
            </button>
          </form>

          {/* Status Filter */}
          <select
            value={filter}
            onChange={(e) => {
              setFilter(e.target.value);
              setPage(1);
            }}
            className="border px-3 py-2 rounded"
          >
            <option value="all">All</option>
            <option value="Pending Admin Approval">Pending</option>
            <option value="Completed">Completed</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : orders.length === 0 ? (
        <p>No orders found</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="py-2 px-4">Order ID</th>
                  <th className="py-2 px-4">User</th>
                  <th className="py-2 px-4">Service</th>
                  <th className="py-2 px-4">Quantity</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Charge</th>
                  <th className="py-2 px-4">Created</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o._id} className="border-t">
                    <td className="py-2 px-4">#{o.orderNumber || o._id.slice(-6)}</td>
                    <td className="py-2 px-4">
                      {o.userId?.email} <br />
                      <span className="text-sm text-gray-500">{o.userId?.name}</span>
                    </td>
                    <td className="py-2 px-4">
                      {typeof o.service === "object" ? (
                        <>
                          <div>{o.service.name}</div>
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

                    <td className="py-2 px-4">{o.quantity}</td>
                    <td className="py-2 px-4">{o.status}</td>
                    <td className="py-2 px-4">
                      {o.charge ? `${o.charge} ${o.currency || "USD"}` : "-"}
                    </td>
                    <td className="py-2 px-4">{new Date(o.createdAt).toLocaleString()}</td>
                    <td className="py-2 px-4 space-x-2">
                      {o.provider === "manual" && o.status === "Pending Admin Approval" ? (
                        <>
                          <button
                            onClick={() => handleConfirm(o._id)}
                            className="px-3 py-1 rounded bg-green-500 text-white"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleReject(o._id)}
                            className="px-3 py-1 rounded bg-red-500 text-white"
                          >
                            Reject
                          </button>
                        </>
                      ) : (
                        <span className="text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 mt-4">
            <div className="text-sm text-gray-600">
              Showing page {page} of {totalPages} ({total} total orders)
            </div>
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={`px-3 py-1 rounded ${
                    page === 1
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Prev
                </button>
                <span>
                  Page {page} of {totalPages}
                </span>
                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={`px-3 py-1 rounded ${
                    page === totalPages
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-blue-500 text-white hover:bg-blue-600"
                  }`}
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </>
      )}
    </AdminLayout>
  );
}
