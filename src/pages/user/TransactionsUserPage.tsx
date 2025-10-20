import { useEffect, useState, useMemo } from "react";
import UserLayout from "../../layouts/UserLayout";
import Footer from "../../layouts/Footer";
import { getUserDeposits, type Transaction } from "../../api/publicTransactions";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

function useAuthGuard() {
  const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
  return { isAuthed: !!token };
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase();
  if (s === "completed")
    return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-600/20 text-green-400">✅ Completed</span>;
  if (s === "pending")
    return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-yellow-600/20 text-yellow-300">⏳ Pending</span>;
  if (s === "failed")
    return <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-600/20 text-red-400">❌ Failed</span>;
  return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-700 text-gray-300">{status}</span>;
}

const PAGE_SIZE = 10;

export default function TransactionsUserPage() {
  const { isAuthed } = useAuthGuard();
  const navigate = useNavigate();
  const [deposits, setDeposits] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/account");
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
        const data = await getUserDeposits();
        setDeposits(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error(e);
        setErr("Failed to load deposits.");
      } finally {
        setLoading(false);
      }
    })();
  }, [isAuthed]);

  const totalPages = Math.max(1, Math.ceil(deposits.length / PAGE_SIZE));
  const pageSafe = Math.min(page, totalPages);
  const visible = useMemo(() => deposits.slice((pageSafe - 1) * PAGE_SIZE, pageSafe * PAGE_SIZE), [deposits, pageSafe]);

  return (
    <UserLayout>
      <div className="min-h-screen bg-black text-white px-4 py-10">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={goBack} className="p-2 hover:bg-red-600/20 rounded-full transition">
              <ArrowLeftIcon className="w-7 h-7 text-red-600" />
            </button>
            <h1 className="text-3xl font-bold text-red-600">My Payments</h1>
          </div>

          {!isAuthed ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
              <p className="text-gray-300 mb-3">You need to be logged in to view your deposit history.</p>
            </div>
          ) : loading ? (
            <p className="text-center text-gray-400">Loading deposit history…</p>
          ) : err ? (
            <p className="text-center text-red-500">{err}</p>
          ) : deposits.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center">
              <p className="text-gray-300">No deposits yet.</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto rounded-xl border border-zinc-800">
                <table className="min-w-full bg-zinc-950">
                  <thead className="bg-zinc-900">
                    <tr className="text-left text-zinc-300">
                      <th className="py-3 px-4">Payment #</th>
                      <th className="py-3 px-4">Amount</th>
                      <th className="py-3 px-4">Method</th>
                      <th className="py-3 px-4">Reference</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Date</th>
                      <th className="py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visible.map((tx) => (
                      <tr key={tx._id} className="border-t border-zinc-800">
                        <td className="py-3 px-4 font-semibold text-white">{tx.orderNumber ?? "—"}</td>
                        <td className="py-3 px-4 text-zinc-200">${tx.amount.toFixed(2)}</td>
                        <td className="py-3 px-4 text-zinc-300 capitalize">{tx.method}</td>
                        <td className="py-3 px-4 text-zinc-400">{tx.reference || "—"}</td>
                        <td className="py-3 px-4"><StatusBadge status={tx.status} /></td>
                        <td className="py-3 px-4 text-zinc-400">{new Date(tx.createdAt).toLocaleString()}</td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => navigate(`/account/transactions/${tx._id}`)}
                            className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 text-sm"
                          >
                            View Details
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

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
            </>
          )}
        </div>
      </div>
      <Footer />
    </UserLayout>
  );
}