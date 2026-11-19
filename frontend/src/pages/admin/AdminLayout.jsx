import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  FiGrid, FiPackage, FiShoppingBag, FiUsers, FiPercent,
  FiClipboard, FiStar, FiLogOut, FiHome, FiChevronLeft
} from 'react-icons/fi';

const sidebarLinks = [
  { to: '/admin', icon: <FiGrid size={18} />, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: <FiPackage size={18} />, label: 'Products' },
  { to: '/admin/categories', icon: <FiGrid size={18} />, label: 'Categories' },
  { to: '/admin/orders', icon: <FiShoppingBag size={18} />, label: 'Orders' },
  { to: '/admin/users', icon: <FiUsers size={18} />, label: 'Users' },
  { to: '/admin/coupons', icon: <FiPercent size={18} />, label: 'Coupons' },
  { to: '/admin/inventory', icon: <FiClipboard size={18} />, label: 'Inventory' },
  { to: '/admin/reviews', icon: <FiStar size={18} />, label: 'Reviews' },
];

export default function AdminLayout() {
  const { user, isAdmin, logout } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" />;
  if (!isAdmin) return <Navigate to="/" />;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="sidebar-brand">
          <Link to="/admin"><span aria-hidden="true">✦</span> Commerce</Link>
          <span className="sidebar-sub">Admin Panel</span>
        </div>
        <nav className="sidebar-nav">
          {sidebarLinks.map((link) => {
            const isActive = link.end
              ? location.pathname === link.to
              : location.pathname.startsWith(link.to);
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`sidebar-link ${isActive ? 'active' : ''}`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <Link to="/" className="sidebar-link"><FiHome size={18} /> <span>Back to Store</span></Link>
          <button className="sidebar-link logout-btn" onClick={handleLogout}>
            <FiLogOut size={18} /> <span>Logout</span>
          </button>
        </div>
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  );
}