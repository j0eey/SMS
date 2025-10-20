import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getDepositHistory,
  searchDepositHistory,
  type DepositHistory,
  type DepositHistoryResponse,
} from "../../api/depositshistory";
import toast from "react-hot-toast";

const PAGE_SIZE = 10;

export default function DepositHistoryPage() {
  const [deposits, setDeposits] = useState<DepositHistory[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const fetchDeposits = async () => {
    setLoading(true);
    try {
      let data: DepositHistoryResponse;
      if (query.trim()) {
        data = await searchDepositHistory(query, page, PAGE_SIZE);
      } else {
        data = await getDepositHistory(page, PAGE_SIZE);
      }
      setDeposits(data.items);
      setTotal(data.total);
    } catch {
      toast.error("Failed to load deposit history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeposits();
  }, [query, page]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  // Helpers for user fields
  const getUserEmail = (d: DepositHistory) =>
    typeof d.userId === "object" && d.userId ? d.userId.email : "N/A";
  const getUserName = (d: DepositHistory) =>
    typeof d.userId === "object" && d.userId ? d.userId.name : "N/A";

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold">Deposit History</h2>

        {/* Search */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1); // reset to first page when searching
            fetchDeposits();
          }}
          className="flex items-stretch w-full md:w-auto"
        >
          <input
            type="text"
            placeholder="Search by email, name, reference, or deposit #..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(1); // reset when typing
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
        </form>
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
                  <th className="py-2 px-4">Status</th>
                  <th className="py-2 px-4">Reference</th>
                  <th className="py-2 px-4">Proof</th>
                  <th className="py-2 px-4">Reject Reason</th>
                  <th className="py-2 px-4">Created At</th>
                </tr>
              </thead>
              <tbody>
                {deposits.map((d) => (
                  <tr key={d._id} className="border-t">
                    <td className="py-2 px-4">
                      {d.depositLabel || `Deposit #${d.depositNumber || "-"}`}
                    </td>
                    <td className="py-2 px-4">{getUserName(d)}</td>
                    <td className="py-2 px-4">{getUserEmail(d)}</td>
                    <td className="py-2 px-4 capitalize">{d.method}</td>
                    <td className="py-2 px-4">
                      {(Number(d.amount) || 0).toFixed(2)}
                    </td>
                    <td className="py-2 px-4">
                      {d.method === "whishmoney" ? (d.currency || "-") : "USD"}
                    </td>
                    <td className="py-2 px-4">
                      <span
                        className={`px-3 py-1 rounded text-white capitalize ${
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
                        "-"
                      )}
                    </td>
                    <td className="py-2 px-4 text-red-500">
                      {d.rejectReason || "-"}
                    </td>
                    <td className="py-2 px-4">
                      {new Date(d.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col md:flex-row justify-between items-center gap-3 mt-4">
            <div className="text-sm text-gray-600">
              Showing page {page} of {totalPages} ({total} deposits)
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
