import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productApi } from '../../api/products';
import { cartApi } from '../../api/cart';
import { wishlistApi } from '../../api/wishlist';
import { reviewApi } from '../../api/reviews';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { toast } from 'react-toastify';
import { FiStar, FiShoppingCart, FiHeart, FiMinus, FiPlus } from 'react-icons/fi';
import { getProductImageUrl } from '../../utils/productMedia';
import WishlistSelectorModal from '../../components/WishlistSelectorModal';

export default function ProductDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { applyCart } = useCart();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [wishlists, setWishlists] = useState([]);
  const [selectedWishlistId, setSelectedWishlistId] = useState('');
  const [showWishlistSelector, setShowWishlistSelector] = useState(false);
  const [loadingWishlists, setLoadingWishlists] = useState(false);
  const [addingToWishlist, setAddingToWishlist] = useState(false);

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
      let updatedCart;
      if (existingItem) {
        updatedCart = await cartApi.updateItem(existingItem.id, { quantity: existingItem.quantity + quantity });
      } else {
        updatedCart = await cartApi.addItem({ productId: product.id, quantity });
      }
      applyCart(updatedCart.data.data);
      toast.success('Added to cart');
    } catch {
      toast.error('Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    if (!user) { navigate('/login'); return; }
    setLoadingWishlists(true);
    try {
      const response = await wishlistApi.getAll();
      const lists = response.data?.data;
      if (!Array.isArray(lists)) throw new Error('The wishlists response was not a list.');
      setWishlists(lists);
      setSelectedWishlistId('');
      setShowWishlistSelector(true);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Could not load wishlists');
    } finally {
      setLoadingWishlists(false);
    }
  };

  const addToSelectedWishlist = async () => {
    if (!selectedWishlistId) return;
    setAddingToWishlist(true);
    try {
      await wishlistApi.addItem(selectedWishlistId, product.id);
      setShowWishlistSelector(false);
      toast.success('Added to wishlist!');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to add to wishlist');
    } finally {
      setAddingToWishlist(false);
    }
  };

  const closeWishlistSelector = () => {
    setShowWishlistSelector(false);
    setSelectedWishlistId('');
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;
  if (!product) return null;

  const allImages = product.images || [];
  const activeImageData = allImages[activeImage];
  const mainImageUrl = activeImageData
    ? getProductImageUrl({ ...product, images: [activeImageData] }, activeImage)
    : getProductImageUrl(product);
  const inStock = product.inventory?.inStock && product.inventory?.availableQuantity > 0;

  return (
    <div className="product-detail-page">
      <div className="product-detail">
        <div className="product-gallery">
          <div className="main-image">
            {mainImageUrl ? (
              <img
                src={mainImageUrl}
                alt={activeImageData?.altText || product.name}
                onError={(e) => { e.currentTarget.src = '/images/product-placeholder.svg'; }}
              />
            ) : (
              <img src="/images/product-placeholder.svg" alt={`${product.name} image unavailable`} />
            )}
          </div>
          {allImages.length > 1 && (
            <div className="image-thumbnails">
              {allImages.map((img, i) => (
                <button key={i} className={i === activeImage ? 'active' : ''} onClick={() => setActiveImage(i)}>
                  <img
                    src={getProductImageUrl({ ...product, images: [img] }, i) || '/images/product-placeholder.svg'}
                    alt={img.altText || ''}
                    onError={(e) => { e.currentTarget.src = '/images/product-placeholder.svg'; }}
                  />
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
            <button className="btn-outline" onClick={handleAddToWishlist} disabled={loadingWishlists}>
              <FiHeart /> {loadingWishlists ? 'Loading wishlists...' : 'Wishlist'}
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

      <WishlistSelectorModal
        open={showWishlistSelector}
        wishlists={wishlists}
        selectedWishlistId={selectedWishlistId}
        onSelect={setSelectedWishlistId}
        onClose={closeWishlistSelector}
        onConfirm={addToSelectedWishlist}
        confirming={addingToWishlist}
      />
    </div>
  );
}