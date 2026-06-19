import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productApi } from '../../api/products';
import { categoryApi } from '../../api/categories';
import { FiArrowRight, FiStar, FiTrendingUp, FiShield, FiTruck, FiRefreshCw } from 'react-icons/fi';

const features = [
  { icon: <FiTruck size={24} />, title: 'Free Shipping', desc: 'On orders above ₹999' },
  { icon: <FiShield size={24} />, title: 'Secure Payment', desc: '100% secure checkout' },
  { icon: <FiRefreshCw size={24} />, title: 'Easy Returns', desc: '30-day return policy' },
  { icon: <FiTrendingUp size={24} />, title: 'Premium Quality', desc: 'Curated collections' },
];

export default function Home() {
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      productApi.getFeatured(8),
      categoryApi.getTree()
    ]).then(([prodRes, catRes]) => {
      setFeatured(prodRes.data.data || []);
      const cats = catRes.data.data || [];
      setCategories(cats.filter(c => c.productsCount > 0 || c.subCategories?.length > 0).slice(0, 6));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="home-page">
      {/* Hero */}
      <section className="hero">
        <div className="hero-content">
          <h1>Style That<br /><span>Speaks Volumes</span></h1>
          <p>Discover curated fashion collections that define your unique style. Premium quality, timeless designs.</p>
          <div className="hero-actions">
            <Link to="/shop" className="btn-primary">Explore Collection <FiArrowRight /></Link>
            <Link to="/shop?sort=newest" className="btn-secondary">New Arrivals</Link>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card hero-card-1">
            <span className="hero-tag">NEW</span>
            <span>Summer Collection '26</span>
          </div>
          <div className="hero-card hero-card-2">
            <span className="hero-tag">SALE</span>
            <span>Up to 40% Off</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features-bar">
        {features.map((f, i) => (
          <div key={i} className="feature-item">
            {f.icon}
            <div>
              <strong>{f.title}</strong>
              <p>{f.desc}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Categories */}
      {categories.length > 0 && (
        <section className="section">
          <div className="section-header">
            <h2>Shop by Category</h2>
            <Link to="/shop" className="section-link">View All <FiArrowRight /></Link>
          </div>
          <div className="category-grid">
            {categories.map((cat) => (
              <Link key={cat.id} to={`/shop?category=${cat.slug}`} className="category-card">
                <div className="cat-icon">{cat.name.charAt(0)}</div>
                <h3>{cat.name}</h3>
                <p>{cat.productsCount || 0} items</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Featured Products */}
      <section className="section">
        <div className="section-header">
          <h2>Featured Products</h2>
          <Link to="/shop" className="section-link">View All <FiArrowRight /></Link>
        </div>
        {loading ? (
          <div className="loading-grid">
            {[1,2,3,4].map(i => <div key={i} className="skeleton-card" />)}
          </div>
        ) : (
          <div className="product-grid">
            {featured.map((product) => (
              <Link key={product.id} to={`/product/${product.slug}`} className="product-card">
                <div className="product-image">
                  {product.images?.[0]?.url ? (
                    <img src={product.images[0].url} alt={product.name} />
                  ) : (
                    <div className="product-placeholder">{product.name.charAt(0)}</div>
                  )}
                  {product.discountPrice && (
                    <span className="discount-badge">
                      -{Math.round((1 - product.discountPrice / product.price) * 100)}%
                    </span>
                  )}
                </div>
                <div className="product-info">
                  <span className="product-brand">{product.brand}</span>
                  <h3>{product.name}</h3>
                  <div className="product-rating">
                    <FiStar size={14} fill="#f59e0b" color="#f59e0b" />
                    <span>{product.avgRating?.toFixed(1)}</span>
                    <span>({product.totalReviews})</span>
                  </div>
                  <div className="product-price">
                    <span className="current-price">₹{product.effectivePrice?.toLocaleString()}</span>
                    {product.discountPrice && (
                      <span className="original-price">₹{product.price?.toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}