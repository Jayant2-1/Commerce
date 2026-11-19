import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { cartApi } from '../../api/cart';
import { couponApi } from '../../api/coupons';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import { FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiTag } from 'react-icons/fi';
import { getProductImageUrl } from '../../utils/productMedia';

export default function Cart() {
  const navigate = useNavigate();
  const { applyCart } = useCart();
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [, setCouponId] = useState(null);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    cartApi.getCart()
      .then((res) => {
        setCart(res.data.data);
        applyCart(res.data.data);
      })
      .catch(() => setCart(null))
      .finally(() => setLoading(false));
  }, [applyCart]);

  const updateQty = async (itemId, quantity) => {
    if (quantity < 1) return;
    try {
      const res = await cartApi.updateItem(itemId, { quantity });
      setCart(res.data.data);
      applyCart(res.data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
    }
  };

  const removeItem = async (itemId) => {
    try {
      const res = await cartApi.removeItem(itemId);
      setCart(res.data.data);
      applyCart(res.data.data);
      toast.success('Item removed');
    } catch (err) {
      toast.error('Failed to remove');
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setApplying(true);
    try {
      const res = await couponApi.validate({ code: couponCode, orderAmount: cart.subtotal });
      const data = res.data.data;
      setCouponDiscount(data.discountAmount);
      setCouponId(data.couponId);
      toast.success(`Coupon applied! You save ₹${data.discountAmount}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid coupon');
      setCouponDiscount(0);
      setCouponId(null);
    } finally {
      setApplying(false);
    }
  };

  const getItemPrice = (item) => Number(item.priceAtAddition ?? item.product?.effectivePrice ?? item.product?.price ?? 0);

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  if (!cart || !cart.items?.length) {
    return (
      <div className="empty-cart">
        <FiShoppingBag size={64} />
        <h2>Your cart is empty</h2>
        <p>Looks like you haven't added anything yet</p>
        <Link to="/shop" className="btn-primary">Start Shopping</Link>
      </div>
    );
  }

  const total = Number(cart.subtotal ?? 0);
  const shipping = Number(cart.shippingAmount ?? 0);
  const finalTotal = Number(cart.totalAmount ?? total + shipping) - couponDiscount;

  return (
    <div className="cart-page">
      <h1>Shopping Cart</h1>
      <div className="cart-layout">
        <div className="cart-items">
          {cart.items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item-image">
                <img
                  src={getProductImageUrl(item.product) || '/images/product-placeholder.svg'}
                  alt={item.product?.images?.[0]?.altText || item.product?.name || 'Product'}
                  onError={(e) => { e.currentTarget.src = '/images/product-placeholder.svg'; }}
                />
              </div>
              <div className="cart-item-info">
                <Link to={`/product/${item.product?.slug}`}><h3>{item.product?.name}</h3></Link>
                <p className="cart-item-price">₹{getItemPrice(item)?.toLocaleString()}</p>
              </div>
              <div className="cart-item-qty">
                <button onClick={() => updateQty(item.id, item.quantity - 1)}><FiMinus /></button>
                <span>{item.quantity}</span>
                <button onClick={() => updateQty(item.id, item.quantity + 1)}><FiPlus /></button>
              </div>
              <div className="cart-item-total">
                ₹{(getItemPrice(item) * item.quantity)?.toLocaleString()}
              </div>
              <button className="cart-remove" onClick={() => removeItem(item.id)}><FiTrash2 /></button>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h3>Order Summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>₹{total?.toLocaleString()}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
          </div>
          {couponDiscount > 0 && (
            <div className="summary-row discount">
              <span>Discount</span>
              <span>-₹{couponDiscount?.toLocaleString()}</span>
            </div>
          )}
          <div className="summary-divider" />
          <div className="summary-row total">
            <span>Total</span>
            <span>₹{finalTotal?.toLocaleString()}</span>
          </div>

          <div className="coupon-section">
            <div className="coupon-input">
              <FiTag />
              <input
                type="text"
                placeholder="Coupon code"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              />
              <button onClick={applyCoupon} disabled={applying}>
                {applying ? '...' : 'Apply'}
              </button>
            </div>
          </div>

          <button className="btn-primary checkout-btn" onClick={() => navigate('/checkout')}>
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
}