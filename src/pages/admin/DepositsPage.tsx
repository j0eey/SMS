import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getDeposits,
  searchDeposits,
  confirmDeposit,
  rejectDeposit,
  type Deposit,
} from "../../api/deposits";
import toast from "react-hot-toast";

const PAGE_SIZE = 15;

// ⏳ simple debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function DepositsPage() {
  const [deposits, setDeposits] = useState<Deposit[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  // Search + pagination + filter
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<
    "pending" | "completed" | "failed" | "all"
  >("pending");

  const debouncedQuery = useDebounce(query, 400);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      let data;
      if (debouncedQuery.trim()) {
        data = await searchDeposits(debouncedQuery, page, PAGE_SIZE);
      } else {
        data = await getDeposits(
          statusFilter !== "all" ? statusFilter : undefined,
          page,
          PAGE_SIZE
        );
      }
      setDeposits(data.items);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load deposits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter, debouncedQuery]);

  const handleConfirm = async (id: string) => {
    try {
      await confirmDeposit(id);
      toast.success("Deposit confirmed");
      fetchDeposits();
    } catch {
      toast.error("Failed to confirm deposit");
    }
  };

  const handleReject = async (id: string) => {
    const reason = prompt("Reason for rejection?");
    if (!reason) return;
    try {
      await rejectDeposit(id, reason);
      toast.success("Deposit rejected");
      fetchDeposits();
    } catch {
      toast.error("Failed to reject deposit");
    }
  };

  // Helpers
  const getUserEmail = (d: Deposit) => d.userId?.email || "N/A";
  const getUserName = (d: Deposit) => d.userId?.name || "N/A";

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold">Manage Deposits</h2>

        <div className="flex flex-col md:flex-row gap-3 w-full md:w-auto">
          {/* Search */}
          <div className="flex items-stretch w-full md:w-auto">
            <input
              type="text"
              placeholder="Search by email, user, reference or ID..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1); // reset page on new query
              }}
              className="border px-3 py-2 rounded-l-lg w-full md:w-80"
            />
            <button
              type="button"
              onClick={() => {
                setQuery("");
                setPage(1);
              }}
              className="bg-gray-200 px-3 py-2 rounded-r-lg hover:bg-gray-300"
            >
              Clear
            </button>
          </div>

          {/* Status filter */}
          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(
                e.target.value as "pending" | "completed" | "failed" | "all"
              )
            }
            className="border px-3 py-2 rounded"
          >
            <option value="pending">Pending</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="all">All</option>
          </select>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : deposits.length === 0 ? (
        <p>No deposits found</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow text-sm">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="py-2 px-4">Deposit ID</th>
                  <th className="py-2 px-4">User</th>
                  <th className="py-2 px-4">Email</th>
                  <th className="py-2 px-4">Method</th>
                  <th className="py-2 px-4">Amount</th>
                  <th className="py-2 px-4">Currency</th>
                  <th className="py-2 px-4">Reference</th>
                  <th className="py-2 px-4">Proof</th>
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((d) => (
                  <tr key={d._id} className="border-t">
                    <td className="py-2 px-4">{d.depositLabel || "-"}</td>
                    <td className="py-2 px-4">{getUserName(d)}</td>
                    <td className="py-2 px-4">{getUserEmail(d)}</td>
                    <td className="py-2 px-4">{d.method}</td>
                    <td className="py-2 px-4">{d.amount.toFixed(2)}</td>
                    <td className="py-2 px-4">
                      {d.method === "whishmoney" ? (d.currency || "-") : "USD"}
                    </td>
                    <td className="py-2 px-4">{d.reference || "-"}</td>
                    <td className="py-2 px-4">
                      {d.proof ? (
                        <a
                          href={d.proof}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 underline"
                        >
                          View Proof
                        </a>
                      ) : (
                        "N/A"
                      )}
                    </td>
                    <td className="py-2 px-4 capitalize">
                      <span
                        className={`px-3 py-1 rounded text-white ${
                          d.status === "completed"
                            ? "bg-green-500"
                            : d.status === "pending"
                            ? "bg-yellow-500"
                            : "bg-red-500"
                        }`}
                      >
                        {d.status}
                      </span>
                    </td>
                    <td className="py-2 px-4 space-x-2">
                      {d.status === "pending" && (
                        <>
                          <button
                            onClick={() => handleConfirm(d._id)}
                            className="px-3 py-1 rounded bg-green-500 text-white"
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => handleReject(d._id)}
                            className="px-3 py-1 rounded bg-red-500 text-white"
                          >
                            Reject
                          </button>
                        </>
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
              Showing {(page - 1) * PAGE_SIZE + 1}-
              {Math.min(page * PAGE_SIZE, total)} of {total} result(s)
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
