import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/admin';
import { toast } from 'react-toastify';
import { FiUser } from 'react-icons/fi';

const statusOptions = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getAllOrders()
      .then((res) => setOrders(res.data.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (orderId, orderStatus) => {
    try {
      await adminApi.updateOrderStatus(orderId, orderStatus);
      setOrders(orders.map(o => o.id === orderId ? { ...o, orderStatus } : o));
      toast.success('Status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="admin-page">
      <h1>Orders</h1>
      {loading ? <div className="page-loading"><div className="spinner" /></div> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Items</th>
              <th>Total</th>
              <th>Status</th>
              <th>Payment</th>
              <th>Date</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td>#{order.orderNumber}</td>
                <td>
                  {order.customer ? (
                    <Link to={`/admin/users`} className="customer-link">
                      <FiUser size={14} /> {order.customer.fullName || order.customer.email || 'N/A'}
                    </Link>
                  ) : (
                    <span className="text-muted">N/A</span>
                  )}
                </td>
                <td>{order.items?.length || 0}</td>
                <td>₹{order.finalPrice?.toLocaleString()}</td>
                <td><span className={`badge ${order.orderStatus?.toLowerCase()}`}>{order.orderStatus}</span></td>
                <td><span className={`badge ${order.paymentStatus?.toLowerCase()}`}>{order.paymentStatus}</span></td>
                <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                <td>
                  <select
                    value={order.orderStatus}
                    onChange={(e) => updateStatus(order.id, e.target.value)}
                    className="status-select"
                  >
                    {statusOptions.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}