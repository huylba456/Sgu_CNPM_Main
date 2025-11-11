import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import AdminLayout from './components/AdminLayout.jsx';
import RestaurantLayout from './components/RestaurantLayout.jsx';
import HomePage from './pages/HomePage.jsx';
import ProductsPage from './pages/ProductsPage.jsx';
import ProductDetailPage from './pages/ProductDetailPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrdersPage from './pages/OrdersPage.jsx';
import OrderDetailPage from './pages/OrderDetailPage.jsx';
import CustomerProfilePage from './pages/CustomerProfilePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import AdminDashboardPage from './pages/admin/AdminDashboardPage.jsx';
import AdminProductsPage from './pages/admin/AdminProductsPage.jsx';
import AdminUsersPage from './pages/admin/AdminUsersPage.jsx';
import AdminOrdersPage from './pages/admin/AdminOrdersPage.jsx';
import AdminDronesPage from './pages/admin/AdminDronesPage.jsx';
import RestaurantDashboardPage from './pages/restaurant/RestaurantDashboardPage.jsx';
import RestaurantProductsPage from './pages/restaurant/RestaurantProductsPage.jsx';
import RestaurantOrdersPage from './pages/restaurant/RestaurantOrdersPage.jsx';
import { useAuth } from './hooks/useAuth.js';

const ProtectedRoute = ({ children, allowed }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowed && !allowed.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:id" element={<ProductDetailPage />} />
        <Route
          path="cart"
          element={
            <ProtectedRoute>
              <CartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="checkout"
          element={
            <ProtectedRoute>
              <CheckoutPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders"
          element={
            <ProtectedRoute>
              <OrdersPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="orders/:id"
          element={
            <ProtectedRoute>
              <OrderDetailPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute allowed={["customer"]}>
              <CustomerProfilePage />
            </ProtectedRoute>
          }
        />
      </Route>
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowed={["admin"]}>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="products" element={<AdminProductsPage />} />
        <Route path="drones" element={<AdminDronesPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
      </Route>
      <Route
        path="/restaurant"
        element={
          <ProtectedRoute allowed={["restaurant", "admin"]}>
            <RestaurantLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<RestaurantDashboardPage />} />
        <Route path="products" element={<RestaurantProductsPage />} />
        <Route path="orders" element={<RestaurantOrdersPage />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
