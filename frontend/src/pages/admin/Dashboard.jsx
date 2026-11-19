import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import {
  FiAlertCircle,
  FiArrowRight,
  FiCreditCard,
  FiPackage,
  FiRefreshCw,
  FiShoppingBag,
  FiUsers,
} from 'react-icons/fi';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

const numberFormatter = new Intl.NumberFormat('en-IN');

function getResponseList(response, resourceName) {
  const data = response.data?.data;
  if (!Array.isArray(data)) {
    throw new Error(`The ${resourceName} response was not a list.`);
  }
  return data;
}

function getErrorMessage(requestError) {
  return requestError.response?.data?.message
    || requestError.message
    || 'Could not load dashboard data.';
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, users: 0, revenue: 0 });
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardData = useCallback(async () => {
    const [productResponse, orderResponse, userResponse] = await Promise.all([
      adminApi.searchProducts({ page: 0, size: 1 }),
      adminApi.getAllOrders(),
      adminApi.listUsers(),
    ]);
    const productPage = productResponse.data?.data;
    const orders = getResponseList(orderResponse, 'orders');
    const users = getResponseList(userResponse, 'users');
    const productCount = Number(productPage?.totalElements);
    if (!Number.isFinite(productCount)) {
      throw new Error('The products response did not include a valid total count.');
    }

    const newestOrders = [...orders].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const newestUsers = [...users].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    const totalRevenue = orders
      .filter((order) => order.paymentStatus === 'COMPLETED')
      .reduce((sum, order) => {
        const amount = Number(order.finalPrice);
        return Number.isFinite(amount) ? sum + amount : sum;
      }, 0);

    return {
      stats: {
        products: productCount,
        orders: orders.length,
        users: users.length,
        revenue: totalRevenue,
      },
      recentOrders: newestOrders.slice(0, 5),
      recentUsers: newestUsers.slice(0, 5),
    };
  }, []);

  const applyDashboardData = useCallback((data) => {
    setStats(data.stats);
    setRecentOrders(data.recentOrders);
    setRecentUsers(data.recentUsers);
  }, []);

  useEffect(() => {
    let active = true;
    fetchDashboardData()
      .then((data) => {
        if (active) applyDashboardData(data);
      })
      .catch((requestError) => {
        if (active) setError(getErrorMessage(requestError));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [applyDashboardData, fetchDashboardData]);

  const refreshDashboard = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      applyDashboardData(await fetchDashboardData());
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [applyDashboardData, fetchDashboardData]);

  const statCards = [
    { icon: <FiPackage size={24} />, label: 'Total Products', value: numberFormatter.format(stats.products), tone: 'products', link: '/admin/products' },
    { icon: <FiShoppingBag size={24} />, label: 'Total Orders', value: numberFormatter.format(stats.orders), tone: 'orders', link: '/admin/orders' },
    { icon: <FiUsers size={24} />, label: 'Total Users', value: numberFormatter.format(stats.users), tone: 'users', link: '/admin/users' },
    { icon: <FiCreditCard size={24} />, label: 'Total Revenue', value: currencyFormatter.format(stats.revenue), tone: 'revenue', link: '/admin/orders' },
  ];

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-heading">
        <h1>Dashboard</h1>
        <button
          className="dashboard-refresh"
          type="button"
          onClick={refreshDashboard}
          aria-label="Refresh dashboard"
          title="Refresh dashboard"
        >
          <FiRefreshCw size={17} />
        </button>
      </div>

      {error && (
        <div className="dashboard-error" role="alert">
          <FiAlertCircle size={20} />
          <div>
            <strong>Dashboard data could not be loaded</strong>
            <p>{error}</p>
          </div>
          <button type="button" onClick={refreshDashboard}>Try again</button>
        </div>
      )}

      {!error && (
        <>
          <div className="stats-grid">
            {statCards.map((card) => (
              <Link key={card.label} to={card.link} className={`stat-card stat-card-${card.tone}`}>
                <div className="stat-icon">
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
              <div className="admin-table-wrap">
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
                    {recentOrders.length === 0 ? (
                      <tr><td className="no-data" colSpan={4}>No orders yet</td></tr>
                    ) : recentOrders.map((order) => (
                      <tr key={order.id}>
                        <td><Link to="/admin/orders">#{order.orderNumber}</Link></td>
                        <td>{order.customer?.fullName || order.customer?.email || 'N/A'}</td>
                        <td>{currencyFormatter.format(Number(order.finalPrice) || 0)}</td>
                        <td><span className={`badge ${order.orderStatus?.toLowerCase()}`}>{order.orderStatus}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="admin-panel">
              <h2>Recent Users</h2>
              <div className="admin-table-wrap">
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
                    {recentUsers.length === 0 ? (
                      <tr><td className="no-data" colSpan={4}>No users yet</td></tr>
                    ) : recentUsers.map((u) => (
                      <tr key={u.id}>
                        <td>{u.fullName}</td>
                        <td>{u.email}</td>
                        <td>{u.role?.replace(/^ROLE_/, '')}</td>
                        <td><span className={`badge ${u.active ? 'active' : 'inactive'}`}>{u.active ? 'Active' : 'Inactive'}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}