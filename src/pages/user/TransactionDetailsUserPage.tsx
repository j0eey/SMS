import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import UserLayout from "../../layouts/UserLayout";
import Footer from "../../layouts/Footer";
import { getUserTransactionById, type Transaction } from "../../api/publicTransactions";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export default function TransactionDetailsUserPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        if (id) {
          const data = await getUserTransactionById(id);
          setTransaction(data);
        }
      } catch (err) {
        setError("Failed to load transaction details.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  const goBack = () => {
    if (window.history.length > 1) navigate(-1);
    else navigate("/account/transactions");
  };

  return (
    <UserLayout>
      <div className="min-h-screen bg-black text-white px-4 py-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={goBack} className="p-2 hover:bg-red-600/20 rounded-full transition">
              <ArrowLeftIcon className="w-7 h-7 text-red-600" />
            </button>
            <h1 className="text-3xl font-bold text-red-600">Transaction Details</h1>
          </div>

          {loading ? (
            <p className="text-gray-400 text-center">Loading transaction details...</p>
          ) : error ? (
            <p className="text-red-500 text-center">{error}</p>
          ) : !transaction ? (
            <p className="text-gray-400 text-center">Transaction not found.</p>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
              <div className="flex justify-between">
                <span className="text-zinc-400">Order Number:</span>
                <span className="text-white">{transaction.orderNumber ?? "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Amount:</span>
                <span className="text-white">${transaction.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Method:</span>
                <span className="text-white capitalize">{transaction.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Status:</span>
                <span className="text-white capitalize">{transaction.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-400">Reference:</span>
                <span className="text-white">{transaction.reference ?? "—"}</span>
              </div>
              {typeof transaction.proof === "string" && transaction.proof.trim() ? (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Proof:</span>
                  <span className="text-white">
                    {/\.(png|jpe?g|gif|webp)$/i.test(transaction.proof) ? (
                      <a
                        href={transaction.proof}
                        target="_blank"
                        rel="noreferrer"
                        className="text-red-400 hover:text-red-300 underline"
                      >
                        View Image
                      </a>
                    ) : (
                      <a
                        href={transaction.proof}
                        target="_blank"
                        rel="noreferrer"
                        className="text-red-400 hover:text-red-300 underline"
                      >
                        Open File
                      </a>
                    )}
                  </span>
                </div>
              ) : (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Proof:</span>
                  <span className="text-zinc-400">—</span>
                </div>
              )}
              {transaction.rejectReason && (
                <div className="flex justify-between">
                  <span className="text-zinc-400">Reject Reason:</span>
                  <span className="text-red-400">{transaction.rejectReason}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-zinc-400">Created At:</span>
                <span className="text-white">
                  {new Date(transaction.createdAt).toLocaleString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </UserLayout>
  );
}