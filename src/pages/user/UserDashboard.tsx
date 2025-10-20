import { useEffect, useState } from "react";
import { getUserProfile, getUserNotifications, getUserSecurity } from "../../api/user";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import DashboardLayout from "../../layouts/DashboardLayout";
import Footer from "../../layouts/Footer";

interface UserProfile {
  id: string;
  name: string;
  email: string;
  balance: number;
  role: string;
  banned: boolean;
  createdAt: string;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  createdAt: string;
}

interface SecurityInfo {
  banned: boolean;
  createdAt: string;
  lastUpdated: string;
  message: string;
}

export default function UserDashboard() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [security, setSecurity] = useState<SecurityInfo | null>(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [profileRes, notifRes, secRes] = await Promise.all([
        getUserProfile(),
        getUserNotifications(),
        getUserSecurity(),
      ]);
      setProfile(profileRes);
      setNotifications(notifRes);
      setSecurity(secRes);
    } catch (err) {
      toast.error("Failed to load dashboard data.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 animate-spin rounded-full border-2 border-red-600 border-t-transparent"></span>
          <span>Loading Dashboard...</span>
        </div>
      </div>
    );

  if (!profile)
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <p>Unable to load profile. Please log in again.</p>
      </div>
    );

  return (
    <DashboardLayout>
      {/* Content */}
      <main className="flex-1 w-full max-w-6xl mx-auto p-6 space-y-8">
        {/* User Info Card */}
        <section className="bg-[#111] border border-red-600/30 rounded-xl p-6 flex flex-col sm:flex-row justify-between gap-6">
          <div>
            <h2 className="text-2xl font-semibold">{profile.name}</h2>
            <p className="text-gray-400 text-sm">{profile.email}</p>
            <p className="mt-2 text-sm text-gray-400">
              Joined: {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Balance</p>
            <h3 className="text-3xl font-bold text-red-500">${profile.balance.toFixed(2)}</h3>
            <button
              onClick={() => navigate("/account/add-funds")}
              className="mt-2 px-4 py-2 text-sm bg-red-600 hover:bg-red-700 rounded-lg"
            >
              Add Funds
            </button>
          </div>
        </section>

        {/* Quick Actions */}
        <section>
          <h3 className="text-lg font-semibold mb-3">Quick Actions</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              { label: "My Payments", action: () => navigate("/account/transactions") },
              { label: "My Orders", action: () => navigate("/account/orders") },
              { label: "Browse Services", action: () => navigate("/services") },
            ].map((a) => (
              <button
                key={a.label}
                onClick={a.action}
                className="bg-[#121212] border border-red-600/30 hover:bg-red-600/10 transition rounded-xl p-5 font-medium text-left"
              >
                {a.label}
              </button>
            ))}
          </div>
        </section>

        {/* Notifications */}
        <section>
          <h3 className="text-lg font-semibold mb-3">Recent Notifications</h3>
          {notifications.length === 0 ? (
            <p className="text-gray-500 text-sm">No notifications yet.</p>
          ) : (
            <ul className="space-y-3">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className="bg-[#111] border border-white/10 rounded-lg p-4 hover:border-red-600/40 transition"
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-medium text-red-400">{n.title}</h4>
                    <span className="text-xs text-gray-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm text-gray-300 mt-1">{n.message}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Security */}
        {security && (
          <section>
            <h3 className="text-lg font-semibold mb-3">Account Security</h3>
            <div className="bg-[#111] border border-white/10 rounded-lg p-4">
              <p className={`font-medium ${security.banned ? "text-red-500" : "text-green-400"}`}>
                {security.message}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Last Updated: {new Date(security.lastUpdated).toLocaleString()}
              </p>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </DashboardLayout>
  );
}