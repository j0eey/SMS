import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/admin/LoginPage";
import AdminDashboardPage from "./pages/admin/DashboardPage";
import UsersPage from "./pages/admin/UsersPage";
import UserProfilePage from "./pages/admin/UserProfilePage"; // ✅ NEW
import DepositsPage from "./pages/admin/DepositsPage";
import OrdersPage from "./pages/admin/OrdersPage";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import CategoriesPage from "./pages/admin/CategoriesPage";
import PlatformsPage from "./pages/admin/PlatformsPage";
import ServicesPage from "./pages/admin/ServicesPage";
import ServiceTitlesPage from "./pages/admin/ServiceTitlesPage";
import ImportedServicesPage from "./pages/admin/ImportedServicesPage";
import DepositsHistoryPage from "./pages/admin/DepositHistoryPage";
import LoginUserPage from "./pages/userauth/LoginUserPage";
import SignupUserPage from "./pages/userauth/SignupUserPage";
import RequestPasswordPage from "./pages/userauth/RequestPasswordPage";
import ResetPasswordPage from "./pages/userauth/ResetPasswordPage";
import UserDashboard from "./pages/user/UserDashboard";
import HomeUserPage from "./pages/user/HomeUserPage";
import { useAdminStore } from "./store/adminStore";
import type { JSX } from "react";
import CategoriesUserPage from "./pages/user/CategoriesUserPage";
import PlatformsUserPage from "./pages/user/PlatformsUserPage";
import ServiceTitlesUserPage from "./pages/user/ServiceTitlesUserPage";
import ServicesUserPage from "./pages/user/ServicesUserPage";
import ServiceDetailsUserPage from "./pages/user/ServiceDetailsUserPage";
import OrdersUserPage from "./pages/user/OrdersUserPage";
import OrderDetailsUserPage from "./pages/user/OrderDetailsUserPage";
import TransactionsUserPage from "./pages/user/TransactionsUserPage";
import TransactionDetailsUserPage from "./pages/user/TransactionDetailsUserPage";
import AddFundsUserPage from "./pages/user/AddFundsUserPage";


function PrivateRoute({ children }: { children: JSX.Element }) {
  const token = useAdminStore((s) => s.token);
  return token ? children : <Navigate to="/admin/login" />;
}

function UserPrivateRoute({ children }: { children: JSX.Element }) {
  const accessToken = localStorage.getItem("accessToken");
  return accessToken ? children : <Navigate to="/login" />;
}

function App() {
  const token = useAdminStore((s) => s.token);

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        {/* Public Homepage */}
        <Route path="/" element={<HomeUserPage />} />

        {/* Admin Auth */}
        <Route
          path="/admin/login"
          element={
            token ? <Navigate to="/admin/dashboard" replace /> : <LoginPage />
          }
        />

        {/* User Auth */}
        <Route path="/login" element={<LoginUserPage />} />
        <Route path="/signup" element={<SignupUserPage />} />
        <Route path="/forgot-password" element={<RequestPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/dashboard" element={<UserPrivateRoute><UserDashboard /></UserPrivateRoute>} />
        <Route path="/account/orders" element={<OrdersUserPage />} />
        <Route path="/account/orders/:orderId" element={<OrderDetailsUserPage />} />
        <Route path="/account/transactions" element={<UserPrivateRoute><TransactionsUserPage /></UserPrivateRoute>} />
        <Route path="/account/transactions/:id" element={<UserPrivateRoute><TransactionDetailsUserPage /></UserPrivateRoute>} />
        <Route path="/account/add-funds" element={<UserPrivateRoute><AddFundsUserPage /></UserPrivateRoute>} />

        <Route
          path="/services/:categorySlug/:platformSlug/:serviceTitleSlug/:serviceSlug"
          element={<ServiceDetailsUserPage />}
        />
        <Route path="/services/:categorySlug/:platformSlug/:serviceTitleSlug" element={<ServicesUserPage />} />
        <Route path="/services/:categorySlug/:platformSlug" element={<ServiceTitlesUserPage />} />
        <Route path="/services/:categorySlug" element={<PlatformsUserPage />} />
        <Route path="/services" element={<CategoriesUserPage />} />

        {/* Admin Protected Routes */}
        <Route
          path="/admin/dashboard"
          element={
            <PrivateRoute>
              <AdminDashboardPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <PrivateRoute>
              <UsersPage />
            </PrivateRoute>
          }
        />
        {/* ✅ New User Profile Route */}
        <Route
          path="/admin/users/:id"
          element={
            <PrivateRoute>
              <UserProfilePage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/deposits"
          element={
            <PrivateRoute>
              <DepositsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <PrivateRoute>
              <OrdersPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <PrivateRoute>
              <AnalyticsPage />
            </PrivateRoute>
          }
        />

        {/* Extra Sections */}
        <Route
          path="/admin/categories"
          element={
            <PrivateRoute>
              <CategoriesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/platforms"
          element={
            <PrivateRoute>
              <PlatformsPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <PrivateRoute>
              <ServicesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/service-titles"
          element={
            <PrivateRoute>
              <ServiceTitlesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/importedservices"
          element={
            <PrivateRoute>
              <ImportedServicesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/depositshistory"
          element={
            <PrivateRoute>
              <DepositsHistoryPage />
            </PrivateRoute>
          }
        />

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
