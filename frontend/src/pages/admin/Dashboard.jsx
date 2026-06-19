import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { FiPackage, FiShoppingBag, FiUsers, FiCreditCard, FiArrowRight } from 'react-icons/fi';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminApi.searchProducts({ page: 0, size: 1 }),
      adminApi.getAllOrders(),
      adminApi.listUsers(),
    ]).then(([prodRes, orderRes, userRes]) => {
      const orders = orderRes.data.data || [];
      const users = userRes.data.data || [];
      const totalRevenue = orders
        .filter(o => o.paymentStatus === 'COMPLETED' || o.orderStatus === 'DELIVERED')
        .reduce((sum, o) => sum + (o.finalPrice || 0), 0);

      setStats({
        products: prodRes.data.data?.totalElements || 0,
        orders: orders.length,
        users: users.length,
        revenue: totalRevenue,
      });
      setRecentOrders(orders.slice(0, 5));
      setRecentUsers(users.slice(0, 5));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statCards = [
    { icon: <FiPackage size={24} />, label: 'Total Products', value: stats.products, color: '#6366f1', link: '/admin/products' },
    { icon: <FiShoppingBag size={24} />, label: 'Total Orders', value: stats.orders, color: '#f59e0b', link: '/admin/orders' },
    { icon: <FiUsers size={24} />, label: 'Total Users', value: stats.users, color: '#10b981', link: '/admin/users' },
    { icon: <FiCreditCard size={24} />, label: 'Total Revenue', value: `₹${stats.revenue?.toLocaleString()}`, color: '#ef4444', link: '/admin/orders' },
  ];

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="admin-dashboard">
      <h1>Dashboard</h1>
      <div className="stats-grid">
        {statCards.map((card, i) => (
          <Link key={i} to={card.link} className="stat-card" style={{ borderTopColor: card.color }}>
            <div className="stat-icon" style={{ background: `${card.color}20`, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-info">
              <h3>{card.value}</h3>
              <p>{card.label}</p>
            </div>
            <FiArrowRight className="stat-arrow" />
          </Link>
        ))}
      </div>

      <div className="admin-panels">
        <div className="admin-panel">
          <h2>Recent Orders</h2>
          {recentOrders.length === 0 ? (
            <p className="no-data">No orders yet</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((order) => (
                  <tr key={order.id}>
                    <td>#{order.orderNumber}</td>
                    <td>{order.customer?.fullName || order.customer?.email || 'N/A'}</td>
                    <td>₹{order.finalPrice?.toLocaleString()}</td>
                    <td><span className={`badge ${order.orderStatus?.toLowerCase()}`}>{order.orderStatus}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="admin-panel">
          <h2>Recent Users</h2>
          {recentUsers.length === 0 ? (
            <p className="no-data">No users yet</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentUsers.map((u) => (
                  <tr key={u.id}>
                    <td>{u.fullName}</td>
                    <td>{u.email}</td>
                    <td>{u.role}</td>
                    <td><span className={`badge ${u.active ? 'active' : 'inactive'}`}>{u.active ? 'Active' : 'Inactive'}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}