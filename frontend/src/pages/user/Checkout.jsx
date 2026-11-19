import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { cartApi } from '../../api/cart';
import { useCart } from '../../context/CartContext';
import { addressApi } from '../../api/addresses';
import { orderApi } from '../../api/orders';
import { paymentApi } from '../../api/payments';
import { toast } from 'react-toastify';
import { FiMapPin, FiPlus, FiCheck, FiLock } from 'react-icons/fi';

export default function Checkout() {
  const navigate = useNavigate();
  const { refreshCart } = useCart();
  const [cart, setCart] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [form, setForm] = useState({
    fullName: '', phone: '', addressLine1: '', addressLine2: '',
    city: '', state: '', postalCode: '', country: 'India',
    addressType: 'HOME', isDefault: false
  });

  useEffect(() => {
    Promise.all([cartApi.getCart(), addressApi.list()])
      .then(([cartRes, addrRes]) => {
        setCart(cartRes.data.data);
        const addrs = addrRes.data.data || [];
        setAddresses(addrs);
        const def = addrs.find(a => a.isDefault) || addrs[0];
        setSelectedAddress(def?.id || null);
      })
      .catch(() => navigate('/cart'))
      .finally(() => setLoading(false));
  }, [navigate]);

  // Scroll reveal observer
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('revealed');
          observer.unobserve(e.target);
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  });

  const addAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await addressApi.add(form);
      setAddresses([...addresses, res.data.data]);
      setSelectedAddress(res.data.data.id);
      setShowForm(false);
      toast.success('Address added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    }
  };

  const placeOrder = async () => {
    if (!selectedAddress) { toast.error('Please select an address'); return; }
    setPlacing(true);
    try {
      const res = await orderApi.placeOrder({ addressId: selectedAddress, paymentMethod });
      const order = res.data.data;
      await refreshCart();
      
      if (paymentMethod === 'COD') {
        toast.success('Order placed successfully! Pay on delivery');
        navigate(`/orders/${order.id}`);
      } else {
        // For card/UPI/etc, initiate payment via mock-complete
        try {
          const payRes = await paymentApi.mockComplete({
            orderId: order.id,
            paymentMethod: paymentMethod
          });
          if (payRes.data.success) {
            toast.success('Payment completed! Order placed successfully');
          } else {
            toast.success('Order placed! Complete payment on order details page');
          }
        } catch {
          toast.warn('Order placed but payment pending. Go to order details to pay.');
        }
        navigate(`/orders/${order.id}`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  if (!cart || !cart.items?.length) {
    return <div className="empty-cart"><h2>Your cart is empty</h2><button onClick={() => navigate('/shop')}>Shop Now</button></div>;
  }

  const total = Number(cart.subtotal ?? 0);
  const shipping = Number(cart.shippingAmount ?? 0);
  const finalTotal = Number(cart.totalAmount ?? total + shipping);

  return (
    <div className="checkout-page">
      <h1>Checkout</h1>
      <div className="checkout-layout">
        <div className="checkout-main">
          <section className="checkout-section">
            <h2><FiMapPin /> Shipping Address</h2>
            {addresses.length > 0 ? (
              <div className="address-list">
                {addresses.map((addr) => (
                  <div
                    key={addr.id}
                    className={`address-card ${selectedAddress === addr.id ? 'selected' : ''}`}
                    onClick={() => setSelectedAddress(addr.id)}
                  >
                    <div className="address-select">
                      {selectedAddress === addr.id && <FiCheck />}
                    </div>
                    <div>
                      <p><strong>{addr.fullName}</strong> | {addr.phone}</p>
                      <p>{addr.addressLine1}, {addr.city}, {addr.state} - {addr.postalCode}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No addresses found. Please add one.</p>
            )}
            <button className="btn-outline" onClick={() => setShowForm(!showForm)}>
              <FiPlus /> {showForm ? 'Cancel' : 'Add New Address'}
            </button>
            {showForm && (
              <form className="address-form" onSubmit={addAddress}>
                <div className="form-row">
                  <input placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} required />
                  <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} required />
                </div>
                <input placeholder="Address Line 1" value={form.addressLine1} onChange={(e) => setForm({...form, addressLine1: e.target.value})} required />
                <input placeholder="Address Line 2 (optional)" value={form.addressLine2} onChange={(e) => setForm({...form, addressLine2: e.target.value})} />
                <div className="form-row three">
                  <input placeholder="City" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} required />
                  <input placeholder="State" value={form.state} onChange={(e) => setForm({...form, state: e.target.value})} required />
                  <input placeholder="Postal Code" value={form.postalCode} onChange={(e) => setForm({...form, postalCode: e.target.value})} required />
                </div>
                <div className="form-row">
                  <input placeholder="Country" value={form.country} onChange={(e) => setForm({...form, country: e.target.value})} required />
                  <label className="checkbox-label">
                    <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({...form, isDefault: e.target.checked})} />
                    Set as default address
                  </label>
                </div>
                <button type="submit" className="btn-primary">Save Address</button>
              </form>
            )}
          </section>

          <section className="checkout-section">
            <h2>Order Items</h2>
            {cart.items.map((item) => (
              <div key={item.id} className="checkout-item">
                <span>{item.product?.name} × {item.quantity}</span>
                <span>₹{Number(item.subtotal ?? 0).toLocaleString()}</span>
              </div>
            ))}
          </section>
        </div>

        <div className="checkout-summary">
          <h3>Payment Summary</h3>
          <div className="summary-row"><span>Subtotal</span><span>₹{total?.toLocaleString()}</span></div>
          <div className="summary-row"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span></div>
          <div className="summary-divider" />
          <div className="summary-row total"><span>Total</span><span>₹{finalTotal?.toLocaleString()}</span></div>
          <div className="payment-methods">
            <h4>Payment Method</h4>
            <div className="payment-options">
              {['COD', 'CREDIT_CARD', 'DEBIT_CARD', 'UPI', 'NET_BANKING', 'WALLET'].map((method) => (
                <label key={method} className={`payment-option ${paymentMethod === method ? 'selected' : ''}`}>
                  <input type="radio" name="payment" value={method} checked={paymentMethod === method} onChange={(e) => setPaymentMethod(e.target.value)} />
                  <span>{method === 'COD' ? 'Cash on Delivery' : method === 'UPI' ? 'UPI' : method === 'NET_BANKING' ? 'Net Banking' : method === 'WALLET' ? 'Wallet' : method === 'CREDIT_CARD' ? 'Credit Card' : 'Debit Card'}</span>
                </label>
              ))}
            </div>
          </div>

          {paymentMethod !== 'COD' && (
            <div className="payment-form">
              <h3>Secure Payment</h3>
              <div className="payment-card">
                <div className="payment-card-number">•••• •••• •••• ••••</div>
                <div className="payment-card-row">
                  <span>CARD HOLDER</span>
                  <span>MM/YY</span>
                </div>
              </div>
              <div className="payment-form-row">
                <div className="input-group">
                  <input placeholder="Card Number" maxLength={19} />
                </div>
              </div>
              <div className="payment-form-row">
                <div className="input-group">
                  <input placeholder="MM/YY" maxLength={5} />
                </div>
                <div className="input-group">
                  <input placeholder="CVV" maxLength={4} type="password" />
                </div>
              </div>
              <div className="input-group">
                <input placeholder="Cardholder Name" />
              </div>
              {paymentMethod === 'UPI' && (
                <div className="input-group">
                  <input placeholder="UPI ID (name@bank)" />
                </div>
              )}
            </div>
          )}

          <button className="btn-primary" onClick={placeOrder} disabled={placing}>
            {placing ? 'Processing...' : paymentMethod === 'COD' ? 'Place Order (COD)' : <>
              <FiLock /> Pay Securely ₹{finalTotal?.toLocaleString()}
            </>}
          </button>
        </div>
      </div>
    </div>
  );
}