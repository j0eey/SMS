import { useEffect, useState } from "react";
import { getAdminOverview } from "../../api/analytics";
import { getProviderBalance } from "../../api/provider"; // ✅ new
import toast from "react-hot-toast";
import AdminLayout from "../../layouts/AdminLayout";

interface Overview {
  users: { total: number; active: number; banned: number };
  orders: { total: number };
  deposits: { total: number };
  wallets: { totalBalance: number };
}

interface ProviderBalance {
  balance: string;
  currency: string;
}

export default function AdminDashboardPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [provider, setProvider] = useState<ProviderBalance | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getAdminOverview(), getProviderBalance()])
      .then(([ov, pb]) => {
        setData(ov);
        setProvider(pb);
      })
      .catch((err) => {
        toast.error(err.response?.data?.error || "Failed to load dashboard");
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <h2 className="text-2xl font-bold mb-6">Overview</h2>
      {loading ? (
        <p>Loading...</p>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold text-gray-700">Users</h2>
            <p className="text-2xl font-bold">{data.users.total}</p>
            <p className="text-sm text-green-600">Active: {data.users.active}</p>
            <p className="text-sm text-red-600">Banned: {data.users.banned}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold text-gray-700">Orders</h2>
            <p className="text-2xl font-bold">{data.orders.total}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold text-gray-700">Deposits</h2>
            <p className="text-2xl font-bold">{data.deposits.total}</p>
          </div>

          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold text-gray-700">User Wallets</h2>
            <p className="text-2xl font-bold">${data.wallets.totalBalance.toFixed(2)}</p>
          </div>

          {/* ✅ New card for Secsers Provider Balance */}
          <div className="bg-white rounded-xl shadow p-4">
            <h2 className="text-lg font-semibold text-gray-700">Secsers Balance</h2>
            <p className="text-2xl font-bold">
              {provider ? `${parseFloat(provider.balance).toFixed(2)} ${provider.currency}` : "N/A"}
            </p>
          </div>
        </div>
      ) : (
        <p>No data available</p>
      )}
    </AdminLayout>
  );
}
