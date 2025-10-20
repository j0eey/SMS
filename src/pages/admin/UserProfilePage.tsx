import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import { getUserProfile, type UserProfile } from "../../api/userProfile";
import toast from "react-hot-toast";

const PAGE_SIZE = 5;

export default function UserProfilePage() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Section toggle: "transactions" | "notifications"
  const [activeTab, setActiveTab] = useState<"transactions" | "notifications">(
    "transactions"
  );

  // Pagination states
  const [pageTransactions, setPageTransactions] = useState(1);
  const [pageNotifications, setPageNotifications] = useState(1);

  useEffect(() => {
    if (!id) return;
    fetchProfile(id);
  }, [id]);

  const fetchProfile = async (userId: string) => {
    setLoading(true);
    try {
      const data = await getUserProfile(userId);
      setProfile(data);
    } catch {
      toast.error("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <AdminLayout><p>Loading...</p></AdminLayout>;
  if (!profile) return <AdminLayout><p>User not found</p></AdminLayout>;

  const { user, transactions, notifications } = profile;

  // Paginated transactions
  const totalTxPages = Math.max(1, Math.ceil(transactions.length / PAGE_SIZE));
  const txStart = (pageTransactions - 1) * PAGE_SIZE;
  const txEnd = txStart + PAGE_SIZE;
  const paginatedTransactions = transactions.slice(txStart, txEnd);

  // Paginated notifications
  const totalNotifPages = Math.max(1, Math.ceil(notifications.length / PAGE_SIZE));
  const notifStart = (pageNotifications - 1) * PAGE_SIZE;
  const notifEnd = notifStart + PAGE_SIZE;
  const paginatedNotifications = notifications.slice(notifStart, notifEnd);

  return (
    <AdminLayout>
      <div className="mb-6">
        <Link to="/admin/users" className="text-blue-600 underline">
          ← Back to Users
        </Link>
      </div>

      <h2 className="text-2xl font-bold mb-4">User Profile</h2>

      {/* User Info */}
      <div className="bg-white rounded-xl shadow p-4 mb-6">
        <h3 className="text-lg font-semibold mb-2">Details</h3>
        <p><b>Name:</b> {user.name}</p>
        <p><b>Email:</b> {user.email}</p>
        <p><b>Role:</b> {user.role}</p>
        <p><b>Balance:</b> ${user.balance.toFixed(2)}</p>
        <p><b>Status:</b> {user.banned ? "🚫 Banned" : "✅ Active"}</p>
        <p><b>Created:</b> {new Date(user.createdAt).toLocaleString()}</p>
      </div>

      {/* Section Toggle */}
      <div className="flex space-x-2 mb-4">
        <button
          onClick={() => setActiveTab("transactions")}
          className={`px-4 py-2 rounded ${
            activeTab === "transactions"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Transactions
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2 rounded ${
            activeTab === "notifications"
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
        >
          Notifications
        </button>
      </div>

      {/* Transactions Section */}
      {activeTab === "transactions" && (
        <div className="bg-white rounded-xl shadow p-4 mb-6">
          <h3 className="text-lg font-semibold mb-2">Transactions</h3>
          {transactions.length === 0 ? (
            <p className="text-gray-500">No transactions found</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="px-3 py-2">Type</th>
                      <th className="px-3 py-2">Method</th>
                      <th className="px-3 py-2">Amount</th>
                      <th className="px-3 py-2">Status</th>
                      <th className="px-3 py-2">Reference</th>
                      <th className="px-3 py-2">Reject Reason</th>
                      <th className="px-3 py-2">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedTransactions.map((t) => (
                      <tr key={t._id} className="border-t">
                        <td className="px-3 py-2">{t.type}</td>
                        <td className="px-3 py-2">{t.method}</td>
                        <td className="px-3 py-2">${t.amount.toFixed(2)}</td>
                        <td className="px-3 py-2">{t.status}</td>
                        <td className="px-3 py-2">{t.reference || "-"}</td>
                        <td className="px-3 py-2 text-red-500">{t.rejectReason || "-"}</td>
                        <td className="px-3 py-2">
                          {new Date(t.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalTxPages > 1 && (
                <div className="flex justify-center items-center mt-4 space-x-2">
                  <button
                    onClick={() =>
                      setPageTransactions((p) => Math.max(1, p - 1))
                    }
                    disabled={pageTransactions === 1}
                    className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span>
                    Page {pageTransactions} of {totalTxPages}
                  </span>
                  <button
                    onClick={() =>
                      setPageTransactions((p) =>
                        Math.min(totalTxPages, p + 1)
                      )
                    }
                    disabled={pageTransactions === totalTxPages}
                    className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Notifications Section */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-xl shadow p-4">
          <h3 className="text-lg font-semibold mb-2">Notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-gray-500">No notifications</p>
          ) : (
            <>
              <ul className="divide-y">
                {paginatedNotifications.map((n) => (
                  <li key={n._id} className="py-2">
                    <p>
                      <b>{n.title}</b> - {n.message}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </li>
                ))}
              </ul>

              {/* Pagination */}
              {totalNotifPages > 1 && (
                <div className="flex justify-center items-center mt-4 space-x-2">
                  <button
                    onClick={() =>
                      setPageNotifications((p) => Math.max(1, p - 1))
                    }
                    disabled={pageNotifications === 1}
                    className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
                  >
                    Prev
                  </button>
                  <span>
                    Page {pageNotifications} of {totalNotifPages}
                  </span>
                  <button
                    onClick={() =>
                      setPageNotifications((p) =>
                        Math.min(totalNotifPages, p + 1)
                      )
                    }
                    disabled={pageNotifications === totalNotifPages}
                    className="px-3 py-1 rounded bg-gray-200 disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </AdminLayout>
  );
}
