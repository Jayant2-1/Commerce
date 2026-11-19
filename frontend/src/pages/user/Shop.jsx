import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { productApi } from '../../api/products';
import { FiStar, FiFilter, FiGrid, FiList } from 'react-icons/fi';

export default function Shop() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [view, setView] = useState('grid');

  const q = searchParams.get('q') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || '';
  const page = parseInt(searchParams.get('page') || '0');
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';

  useEffect(() => {
    setLoading(true);
    const params = { page, size: 12, sort };
    if (q) params.keyword = q;
    if (category) params.categorySlug = category;
    if (minPrice) params.minPrice = minPrice;
    if (maxPrice) params.maxPrice = maxPrice;

    productApi.search(params)
      .then((res) => {
        setProducts(res.data.data?.content || []);
        setTotalPages(res.data.data?.totalPages || 1);
      })
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  }, [q, category, sort, page, minPrice, maxPrice]);

  const updateParams = (key, value) => {
    const params = new URLSearchParams(searchParams);
    if (value) params.set(key, value);
    else params.delete(key);
    if (key !== 'page') params.set('page', '0');
    setSearchParams(params);
  };

  return (
    <div className="shop-page">
      <div className="shop-header">
        <h1>{q ? `Search: "${q}"` : category ? category : 'All Products'}</h1>
        <div className="shop-controls">
          <div className="sort-group">
            <select value={sort} onChange={(e) => updateParams('sort', e.target.value)}>
              <option value="">Default</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
              <option value="newest">Newest</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
          <div className="view-toggle">
            <button className={view === 'grid' ? 'active' : ''} onClick={() => setView('grid')}><FiGrid /></button>
            <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><FiList /></button>
          </div>
        </div>
      </div>

      <div className="shop-layout">
        <aside className="shop-filters">
          <h3><FiFilter /> Filters</h3>
          <div className="filter-section">
            <h4>Price Range</h4>
            <div className="price-range">
              <input type="number" placeholder="Min" value={minPrice} onChange={(e) => updateParams('minPrice', e.target.value)} />
              <span>—</span>
              <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => updateParams('maxPrice', e.target.value)} />
            </div>
          </div>
          {minPrice || maxPrice || q || category ? (
            <button className="clear-btn" onClick={() => setSearchParams({})}>Clear Filters</button>
          ) : null}
        </aside>

        <main className="shop-content">
          {loading ? (
            <div className={view === 'grid' ? 'loading-grid' : 'loading-list'}>
              {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton-card" />)}
            </div>
          ) : products.length === 0 ? (
            <div className="empty-state">
              <h3>No products found</h3>
              <p>Try adjusting your search or filters</p>
            </div>
          ) : (
            <>
              <div className={view === 'grid' ? 'product-grid' : 'product-list'}>
                {products.map((product) => (
                  <Link key={product.id} to={`/product/${product.slug}`} className={`product-card ${view === 'list' ? 'list-view' : ''}`}>
                    <div className="product-image">
                      {product.images?.[0]?.imageUrl ? (
                        <img
                          src={product.images[0].imageUrl}
                          alt={product.images[0].altText || product.name}
                          onError={(e) => { e.currentTarget.src = '/images/product-placeholder.svg'; }}
                        />
                      ) : (
                        <img src="/images/product-placeholder.svg" alt={`${product.name} image unavailable`} />
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
                      <p className="product-desc">{product.description?.slice(0, 100)}</p>
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
              {totalPages > 1 && (
                <div className="pagination">
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button key={i} className={page === i ? 'active' : ''} onClick={() => updateParams('page', i.toString())}>
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}