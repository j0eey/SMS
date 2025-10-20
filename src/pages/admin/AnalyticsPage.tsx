import { useEffect, useState } from "react";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getAdminOverview,
  getDailyDeposits,
  getDailyOrders,
  getMonthlyUsersGrowth,
} from "../../api/analytics";
import {
  LineChart,
  Line,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
} from "recharts";
import toast from "react-hot-toast";

export default function AnalyticsPage() {
  const [overview, setOverview] = useState<any>(null);
  const [deposits, setDeposits] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [monthlyUsers, setMonthlyUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState<string>("30d");

  const fetchData = () => {
    setLoading(true);
    Promise.all([
      getAdminOverview(),
      getDailyDeposits(range),
      getDailyOrders(range),
      getMonthlyUsersGrowth(),
    ])
      .then(([ov, dep, ord, users]) => {
        setOverview(ov);
        setDeposits(dep || []);
        setOrders(ord || []);
        setMonthlyUsers(users || []);
      })
      .catch(() => toast.error("Failed to load analytics"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchData();
  }, [range]);

  if (loading) {
    return (
      <AdminLayout>
        <p>Loading analytics...</p>
      </AdminLayout>
    );
  }

  // ✅ Merge datasets by date/month (safe merge)
  const combinedData = (() => {
    const map: Record<string, { date: string; deposits?: number; users?: number }> = {};

    deposits.forEach((d) => {
      if (!map[d.date]) map[d.date] = { date: d.date };
      map[d.date].deposits = d.amount;
    });

    monthlyUsers.forEach((u) => {
      if (!map[u.month]) map[u.month] = { date: u.month };
      map[u.month].users = u.count;
    });

    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  })();

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Analytics & Reports</h2>

        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="border rounded px-3 py-2"
        >
          <option value="7d">Last 7 Days</option>
          <option value="30d">Last 30 Days</option>
          <option value="all">All Time</option>
        </select>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h3 className="text-gray-500">Total Users</h3>
          <p className="text-2xl font-bold">{overview?.users?.total || 0}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h3 className="text-gray-500">Active Users</h3>
          <p className="text-2xl font-bold">{overview?.users?.active || 0}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h3 className="text-gray-500">Total Orders</h3>
          <p className="text-2xl font-bold">{overview?.orders?.total || 0}</p>
        </div>
        <div className="bg-white shadow rounded-lg p-6 text-center">
          <h3 className="text-gray-500">Total Deposits</h3>
          <p className="text-2xl font-bold">{overview?.deposits?.total || 0}</p>
        </div>
      </div>

      {/* Combined Users Growth & Deposits */}
      <div className="bg-white shadow rounded-lg p-6 mb-10">
        <h3 className="text-lg font-semibold mb-4">Users Growth & Deposits</h3>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={combinedData}>
            <CartesianGrid stroke="#ccc" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            {/* Deposits Line */}
            <Line
              type="monotone"
              dataKey="deposits"
              stroke="#3b82f6"
              name="Deposits"
              connectNulls
            />
            {/* Users Growth Line */}
            <Line
              type="monotone"
              dataKey="users"
              stroke="#10b981"
              name="New Users"
              connectNulls
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Orders by status */}
      <div className="bg-white shadow rounded-lg p-6 mb-10">
        <h3 className="text-lg font-semibold mb-4">Orders by Status</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={orders}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {orders.map((_: any, index: number) => (
                <Cell
                  key={index}
                  fill={
                    ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1"][
                      index % 5
                    ]
                  }
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Wallet balance */}
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-4">Wallet Balance Overview</h3>
        <p className="text-xl font-bold">
          ${overview?.wallets?.totalBalance?.toFixed(2) || "0.00"}
        </p>
      </div>
    </AdminLayout>
  );
}
