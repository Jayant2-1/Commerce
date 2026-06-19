import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { orderApi } from '../../api/orders';
import { FiPackage, FiChevronRight } from 'react-icons/fi';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getMyOrders()
      .then((res) => setOrders(res.data.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="orders-page">
      <h1>My Orders</h1>
      {orders.length === 0 ? (
        <div className="empty-state">
          <FiPackage size={48} />
          <h3>No orders yet</h3>
          <p>Start shopping to see your orders here</p>
          <Link to="/shop" className="btn-primary">Browse Products</Link>
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <Link key={order.id} to={`/orders/${order.id}`} className="order-card">
              <div className="order-header">
                <span className="order-number">#{order.orderNumber}</span>
                <span className={`order-status ${order.orderStatus?.toLowerCase()}`}>{order.orderStatus}</span>
              </div>
              <div className="order-body">
                <span className="order-items-count">{order.items?.length || 0} items</span>
                <span className="order-total">₹{order.finalPrice?.toLocaleString()}</span>
              </div>
              <div className="order-footer">
                <span>{new Date(order.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                <FiChevronRight />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}