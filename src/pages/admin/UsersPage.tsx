import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import AdminLayout from "../../layouts/AdminLayout";
import {
  getUsers,
  searchUsers,
  banUser,
  adjustBalance,
  deleteUser,
  createUser,
} from "../../api/users";
import toast from "react-hot-toast";

interface User {
  _id: string;
  email: string;
  name: string;
  role: string;
  balance: number;
  banned: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Search state
  const [search, setSearch] = useState("");

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 20;

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const [newRole, setNewRole] = useState("user");
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async (searchQuery?: string) => {
    setLoading(true);
    try {
      if (searchQuery && searchQuery.length > 0) {
        const result = await searchUsers(searchQuery);
        setUsers(result);
      } else {
        const result = await getUsers();
        setUsers(result);
      }
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  const handleBanToggle = async (id: string, banned: boolean) => {
    try {
      await banUser(id, !banned);
      toast.success(`User ${!banned ? "banned" : "unbanned"}`);
      fetchUsers(search);
    } catch {
      toast.error("Failed to update user status");
    }
  };

  const handleAdjustBalance = async (id: string) => {
    const amountStr = prompt("Enter amount (+/-):");
    if (!amountStr) return;

    const amount = parseFloat(amountStr);
    if (isNaN(amount)) return toast.error("Invalid number");

    const reason = prompt("Reason for adjustment?") || "manual";

    try {
      await adjustBalance(id, amount, reason);
      toast.success("Balance adjusted");
      fetchUsers(search);
    } catch {
      toast.error("Failed to adjust balance");
    }
  };

  const handleDelete = async (id: string) => {
    if (
      !window.confirm(
        "Are you sure you want to permanently delete this user? This cannot be undone."
      )
    ) {
      return;
    }
    try {
      await deleteUser(id);
      toast.success("User deleted successfully");
      setUsers((prev) => prev.filter((u) => u._id !== id));
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to delete user");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createUser({
        role: newRole,
        name: newName,
        email: newEmail,
        password: newPassword,
      });
      toast.success("User created successfully");
      setShowModal(false);
      setNewRole("user");
      setNewName("");
      setNewEmail("");
      setNewPassword("");
      fetchUsers(search);
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Failed to create user");
    }
  };

  // Pagination logic
  const startIndex = (page - 1) * pageSize;
  const paginatedUsers = users.slice(startIndex, startIndex + pageSize);
  const totalPages = Math.ceil(users.length / pageSize);

  return (
    <AdminLayout>
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 space-y-3 md:space-y-0">
        <h2 className="text-2xl font-bold">Manage Users</h2>
        <div className="flex space-x-2 items-center">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="border px-3 py-2 rounded-lg w-64 pr-8"
            />
            {loading && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <svg
                  className="animate-spin h-5 w-5 text-gray-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
              </div>
            )}
          </div>
          {/* Add user */}
          <button
            onClick={() => setShowModal(true)}
            disabled={loading}
            className={`px-4 py-2 rounded text-white ${
              loading
                ? "bg-green-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            + Add User
          </button>
        </div>
      </div>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white rounded-xl shadow">
              <thead>
                <tr className="bg-gray-100 text-left">
                  <th className="py-2 px-4">Email</th>
                  <th className="py-2 px-4">Name</th>
                  <th className="py-2 px-4">Role</th>
                  <th className="py-2 px-4">Balance</th>
                  <th className="py-2 px-4">Banned</th>
                  <th className="py-2 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedUsers.length > 0 ? (
                  paginatedUsers.map((u) => (
                    <tr key={u._id} className="border-t">
                      <td className="py-2 px-4">{u.email}</td>
                      <td className="py-2 px-4">{u.name}</td>
                      <td className="py-2 px-4">{u.role}</td>
                      <td className="py-2 px-4">${u.balance?.toFixed(2)}</td>
                      <td className="py-2 px-4">{u.banned ? "Yes" : "No"}</td>
                      <td className="py-2 px-4 space-x-2">
                        {/* ✅ New View Profile Button */}
                        <Link
                          to={`/admin/users/${u._id}`}
                          className="px-3 py-1 rounded bg-indigo-500 text-white hover:bg-indigo-600"
                        >
                          View Profile
                        </Link>
                        <button
                          onClick={() => handleBanToggle(u._id, u.banned)}
                          className={`px-3 py-1 rounded text-white ${
                            u.banned ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          {u.banned ? "Unban" : "Ban"}
                        </button>
                        <button
                          onClick={() => handleAdjustBalance(u._id)}
                          className="px-3 py-1 rounded bg-blue-500 text-white"
                        >
                          Adjust Balance
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="px-3 py-1 rounded bg-gray-700 text-white hover:bg-black"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-4 text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center mt-4 space-x-4">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Previous
              </button>
              <span>
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Add New User</h3>
            <form onSubmit={handleCreateUser} className="space-y-4">
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value)}
                className="w-full border px-3 py-2 rounded"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
              <input
                type="text"
                placeholder="Name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                type="email"
                placeholder="Email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <input
                type="password"
                placeholder="Password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full border px-3 py-2 rounded"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-gray-300 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
