import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../../api/products';
import { cartApi } from '../../api/cart';
import { wishlistApi } from '../../api/wishlist';
import { reviewApi } from '../../api/reviews';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import { FiStar, FiShoppingCart, FiHeart, FiMinus, FiPlus } from 'react-icons/fi';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    productApi.getBySlug(slug)
      .then((res) => {
        setProduct(res.data.data);
        return reviewApi.getByProduct(res.data.data.id, { page: 0, size: 10 });
      })
      .then((res) => setReviews(res.data.data?.content || []))
      .catch(() => navigate('/shop'))
      .finally(() => setLoading(false));
  }, [slug, navigate]);

  const handleAddToCart = async () => {
    if (!user) { navigate('/login'); return; }
    setAddingToCart(true);
    try {
      const cartRes = await cartApi.getCart();
      const existingItem = cartRes.data.data?.items?.find(
        i => i.product?.id === product.id || i.productId === product.id
      );
      if (existingItem) {
        await cartApi.updateItem(existingItem.id, { quantity: existingItem.quantity + quantity });
      } else {
        await cartApi.addItem({ productId: product.id, quantity });
      }
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    try {
      const wl = await wishlistApi.getAll();
      const lists = wl.data.data || [];
      if (lists.length === 0) {
        const created = await wishlistApi.create('My Wishlist');
        await wishlistApi.addItem(created.data.data.id, product.id);
      } else {
        await wishlistApi.addItem(lists[0].id, product.id);
      }
      toast.success('Added to wishlist!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to wishlist');
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!product) return null;

  const allImages = product.images || [];
  const inStock = product.inventory?.inStock && product.inventory?.availableQuantity > 0;

  return (
    <div className="product-detail-page">
      <div className="product-detail">
        <div className="product-gallery">
          <div className="main-image">
            {allImages[activeImage]?.url ? (
              <img src={allImages[activeImage].url} alt={product.name} />
            ) : (
              <div className="product-placeholder large">{product.name.charAt(0)}</div>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="image-thumbnails">
              {allImages.map((img, i) => (
                <button key={i} className={i === activeImage ? 'active' : ''} onClick={() => setActiveImage(i)}>
                  <img src={img.url} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="product-detail-info">
          <span className="product-brand">{product.brand}</span>
          <h1>{product.name}</h1>
          <div className="product-rating">
            <FiStar size={16} fill="#f59e0b" color="#f59e0b" />
            <span>{product.avgRating?.toFixed(1)}</span>
            <span>({product.totalReviews} reviews)</span>
          </div>
          <div className="product-price">
            <span className="current-price">₹{product.effectivePrice?.toLocaleString()}</span>
            {product.discountPrice && (
              <span className="original-price">₹{product.price?.toLocaleString()}</span>
            )}
          </div>
          <div className="stock-info">
            <span className={inStock ? 'in-stock' : 'out-of-stock'}>
              {inStock ? `✓ ${product.inventory.availableQuantity} in stock` : '✗ Out of stock'}
            </span>
          </div>
          <p className="product-description">{product.description}</p>

          <div className="quantity-selector">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))} disabled={quantity <= 1}><FiMinus /></button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)} disabled={!inStock}><FiPlus /></button>
          </div>

          <div className="product-actions">
            <button className="btn-primary" onClick={handleAddToCart} disabled={!inStock || addingToCart}>
              <FiShoppingCart /> {addingToCart ? 'Adding...' : 'Add to Cart'}
            </button>
            <button className="btn-outline" onClick={handleAddToWishlist}>
              <FiHeart /> Wishlist
            </button>
          </div>

          <div className="product-meta">
            <p><strong>SKU:</strong> {product.sku}</p>
            <p><strong>Category:</strong> {product.categoryName}</p>
          </div>
        </div>
      </div>

      <section className="reviews-section">
        <h2>Customer Reviews</h2>
        {reviews.length === 0 ? (
          <p className="no-reviews">No reviews yet. Be the first to review!</p>
        ) : (
          <div className="reviews-list">
            {reviews.map((review) => (
              <div key={review.id} className="review-card">
                <div className="review-header">
                  <strong>{review.userName || 'Anonymous'}</strong>
                  <div className="review-stars">
                    {[1,2,3,4,5].map(i => (
                      <FiStar key={i} size={14} fill={i <= review.rating ? '#f59e0b' : 'none'} color="#f59e0b" />
                    ))}
                  </div>
                </div>
                {review.title && <h4>{review.title}</h4>}
                {review.body && <p>{review.body}</p>}
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}