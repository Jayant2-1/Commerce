import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { orderApi } from '../../api/orders';
import { paymentApi } from '../../api/payments';
import { toast } from 'react-toastify';
import { FiChevronLeft, FiCreditCard } from 'react-icons/fi';

const statusSteps = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED'];

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderApi.getById(id)
      .then((res) => setOrder(res.data.data))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await orderApi.cancelOrder(id);
      toast.success('Order cancelled');
      setOrder({ ...order, orderStatus: 'CANCELLED' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel');
    }
  };

  const handlePaymentFailed = async () => {
    if (!window.confirm('Simulate payment failure? Order will be cancelled and stock restored.')) return;
    try {
      await orderApi.cancelOrder(id);
      toast.success('Payment failed - order cancelled, stock restored');
      const res = await orderApi.getById(id);
      setOrder(res.data.data);
    } catch {
      toast.error('Failed to process payment failure');
    }
  };

  const handlePayNow = async () => {
    try {
      const payRes = await paymentApi.mockComplete({
        orderId: id,
        paymentMethod: 'CREDIT_CARD'
      });
      if (payRes.data.success) {
        toast.success('Payment completed successfully!');
        const res = await orderApi.getById(id);
        setOrder(res.data.data);
      } else {
        toast.error('Payment failed. Please try again.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Payment failed');
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!order) return null;

  const currentStep = statusSteps.indexOf(order.orderStatus);

  return (
    <div className="order-detail-page">
      <Link to="/orders" className="back-link"><FiChevronLeft /> Back to Orders</Link>
      <div className="order-detail-header">
        <h1>Order #{order.orderNumber}</h1>
        <span className={`order-status ${order.orderStatus?.toLowerCase()}`}>{order.orderStatus}</span>
      </div>

      {order.orderStatus !== 'CANCELLED' && order.orderStatus !== 'DELIVERED' && (
        <div className="order-timeline">
          {statusSteps.map((step, i) => (
            <div key={step} className={`timeline-step ${i <= currentStep ? 'active' : ''} ${i < currentStep ? 'completed' : ''}`}>
              <div className="step-dot" />
              <span className="step-label">{step}</span>
            </div>
          ))}
        </div>
      )}

      <div className="order-detail-grid">
        <div className="order-info-card">
          <h3>Shipping Address</h3>
          {order.shippingAddress && (
            <>
              <p><strong>{order.shippingAddress.fullName}</strong></p>
              <p>{order.shippingAddress.phone}</p>
              <p>{order.shippingAddress.addressLine1}</p>
              {order.shippingAddress.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
              <p>{order.shippingAddress.city}, {order.shippingAddress.state} - {order.shippingAddress.postalCode}</p>
            </>
          )}
        </div>

        <div className="order-info-card">
          <h3>Payment Info</h3>
          <p><strong>Status:</strong> {order.paymentStatus}</p>
          <p><strong>Total:</strong> ₹{order.finalPrice?.toLocaleString()}</p>
          {order.discountAmount > 0 && (
            <p><strong>Discount:</strong> -₹{order.discountAmount?.toLocaleString()}</p>
          )}
          {order.couponCode && <p><strong>Coupon:</strong> {order.couponCode}</p>}
        </div>
      </div>

      <div className="order-items-section">
        <h3>Items ({order.items?.length})</h3>
        {order.items?.map((item) => (
          <div key={item.id} className="order-item">
            <div className="order-item-image">
              <img src="/images/product-placeholder.svg" alt={`${item.productName} image unavailable`} />
            </div>
            <div className="order-item-info">
              <h4>{item.productName}</h4>
              <p>Qty: {item.quantity} × ₹{item.purchasePrice?.toLocaleString()}</p>
            </div>
            <div className="order-item-total">₹{item.subtotal?.toLocaleString()}</div>
          </div>
        ))}
      </div>

      <div className="order-actions">
        {(order.orderStatus === 'PENDING' || order.orderStatus === 'CONFIRMED') && (
          <button className="btn-danger" onClick={handleCancel}>Cancel Order</button>
        )}
        {order.paymentStatus === 'PENDING' && order.orderStatus !== 'CANCELLED' && (
          <div className="payment-actions">
            <button className="btn-primary" onClick={handlePayNow}>
              <FiCreditCard /> Pay Now ₹{order.finalPrice?.toLocaleString()}
            </button>
            <button className="btn-primary payment-failed-btn" onClick={handlePaymentFailed}>
              Payment Failed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}