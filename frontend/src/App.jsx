import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/user/Home';
import Shop from './pages/user/Shop';
import ProductDetail from './pages/user/ProductDetail';
import Cart from './pages/user/Cart';
import Checkout from './pages/user/Checkout';
import Orders from './pages/user/Orders';
import OrderDetail from './pages/user/OrderDetail';
import Profile from './pages/user/Profile';
import Wishlists from './pages/user/Wishlists';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProducts from './pages/admin/AdminProducts';
import AdminCategories from './pages/admin/AdminCategories';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminCoupons from './pages/admin/AdminCoupons';
import AdminInventory from './pages/admin/AdminInventory';
import AdminReviews from './pages/admin/AdminReviews';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="inventory" element={<AdminInventory />} />
            <Route path="reviews" element={<AdminReviews />} />
          </Route>

          {/* Public with Navbar */}
          <Route path="*" element={
            <>
              <Navbar />
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/shop" element={<Shop />} />
                  <Route path="/product/:slug" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route path="/orders/:id" element={<OrderDetail />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/wishlists" element={<Wishlists />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                </Routes>
              </main>
              <footer className="footer">
                <div className="footer-content">
                  <p>&copy; 2026 Commerce. All rights reserved.</p>
                </div>
              </footer>
            </>
          } />
        </Routes>
        <ToastContainer position="bottom-right" autoClose={2500} hideProgressBar theme="dark" />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;