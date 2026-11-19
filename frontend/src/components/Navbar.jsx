import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { FiShoppingCart, FiHeart, FiUser, FiLogOut, FiMenu, FiX, FiPackage, FiSearch } from 'react-icons/fi';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">✦</span>
          <span className="brand-text">Commerce</span>
        </Link>

        <form className="search-bar" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <button type="submit"><FiSearch /></button>
        </form>

        <div className="nav-links">
          <Link to="/shop" className="nav-link">Shop</Link>
          {user ? (
            <>
              <Link
                to="/cart"
                className="nav-link-icon"
                title={cartCount > 0 ? `Cart (${cartCount})` : 'Cart'}
                aria-label={cartCount > 0 ? `Cart, ${cartCount} items` : 'Cart'}
              >
                <FiShoppingCart size={20} />
                {cartCount > 0 && (
                  <span className="cart-count" aria-hidden="true">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </Link>
              <Link to="/wishlists" className="nav-link-icon" title="Wishlist"><FiHeart size={20} /></Link>
              <Link to="/orders" className="nav-link" title="Orders"><FiPackage size={20} /></Link>
              {isAdmin && <Link to="/admin" className="nav-link admin-link">Admin</Link>}
              <div className="user-menu">
                <Link to="/profile" className="nav-link-icon"><FiUser size={20} /></Link>
                <span className="user-name">{user.fullName?.split(' ')[0]}</span>
                <button className="logout-btn" onClick={handleLogout}><FiLogOut size={18} /></button>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-link">Login</Link>
              <Link to="/register" className="nav-link register-link">Register</Link>
            </>
          )}
          <button className="mobile-menu-btn" onClick={() => setMobileOpen(!mobileOpen)}>
            {mobileOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-menu">
          <Link to="/shop" onClick={() => setMobileOpen(false)}>Shop</Link>
          {user ? (
            <>
              <Link to="/cart" onClick={() => setMobileOpen(false)}>Cart</Link>
              <Link to="/wishlists" onClick={() => setMobileOpen(false)}>Wishlist</Link>
              <Link to="/orders" onClick={() => setMobileOpen(false)}>Orders</Link>
              <Link to="/profile" onClick={() => setMobileOpen(false)}>Profile</Link>
              {isAdmin && <Link to="/admin" onClick={() => setMobileOpen(false)}>Admin Panel</Link>}
              <button onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={() => setMobileOpen(false)}>Login</Link>
              <Link to="/register" onClick={() => setMobileOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}