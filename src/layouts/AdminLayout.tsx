import type { ReactNode } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAdminStore } from "../store/adminStore";

interface Props {
  children: ReactNode;
}

export default function AdminLayout({ children }: Props) {
  const logout = useAdminStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const linkClasses = (path: string) =>
    `block px-4 py-2 rounded ${
      location.pathname === path
        ? "bg-blue-600 text-white"
        : "text-gray-700 hover:bg-blue-100"
    }`;

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md">
        <div className="p-4 text-2xl font-bold text-blue-600">Admin Panel</div>
        <nav className="mt-6 space-y-2">
          <Link to="/admin/dashboard" className={linkClasses("/admin/dashboard")}>
            Dashboard
          </Link>
          <Link to="/admin/users" className={linkClasses("/admin/users")}>
            Users
          </Link>
          <Link to="/admin/deposits" className={linkClasses("/admin/deposits")}>
            Deposits
          </Link>
          <Link to="/admin/orders" className={linkClasses("/admin/orders")}>
            Orders
          </Link>
          <Link to="/admin/categories" className={linkClasses("/admin/categories")}>
            Categories
          </Link>
          <Link to="/admin/platforms" className={linkClasses("/admin/platforms")}>
            Platforms
          </Link>
          <Link to="/admin/service-titles" className={linkClasses("/admin/service-titles")}>
            Services Name
          </Link>
          <Link to="/admin/services" className={linkClasses("/admin/services")}>
            Services
          </Link>
          <Link to="/admin/importedservices" className={linkClasses("/admin/importedservices")}>
            Imported Services
          </Link>
          <Link to="/admin/depositshistory" className={linkClasses("/admin/depositshistory")}>
            Deposits History
          </Link>
          <Link to="/admin/analytics" className={linkClasses("/admin/analytics")}>
            Analytics
          </Link>
        </nav>
      </aside>

      {/* Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Navbar */}
        <header className="flex justify-between items-center bg-white shadow px-6 py-4">
          <h1 className="text-xl font-semibold text-gray-700">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
          >
            Logout
          </button>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
