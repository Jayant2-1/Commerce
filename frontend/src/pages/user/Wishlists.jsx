import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { wishlistApi } from '../../api/wishlist';
import { FiHeart, FiTrash2, FiShoppingCart, FiPlus } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { getProductImageUrl } from '../../utils/productMedia';

export default function Wishlists() {
  const [wishlists, setWishlists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [newName, setNewName] = useState('');

  const fetchWishlists = () => {
    wishlistApi.getAll()
      .then((res) => {
        const data = res.data?.data;
        if (!Array.isArray(data)) throw new Error('The wishlists response was not a list.');
        setWishlists(data);
        setLoadError('');
      })
      .catch((error) => setLoadError(error.response?.data?.message || error.message || 'Could not load wishlists.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchWishlists(); }, []);

  const createWishlist = async () => {
    if (!newName.trim()) return;
    try {
      await wishlistApi.create(newName.trim());
      setNewName('');
      fetchWishlists();
      toast.success('Wishlist created');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const deleteWishlist = async (id) => {
    if (!window.confirm('Delete this wishlist?')) return;
    try {
      await wishlistApi.delete(id);
      fetchWishlists();
      toast.success('Wishlist deleted');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete wishlist');
    }
  };

  const removeItem = async (wishlistId, itemId) => {
    try {
      await wishlistApi.removeItem(wishlistId, itemId);
      fetchWishlists();
      toast.success('Item removed');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to remove item');
    }
  };

  const moveToCart = async (wishlistId, itemId) => {
    try {
      await wishlistApi.moveToCart(wishlistId, itemId, 1);
      fetchWishlists();
      toast.success('Moved to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  if (loading) return <div className="page-loading"><div className="spinner" /></div>;

  return (
    <div className="wishlists-page">
      <div className="section-header">
        <h1><FiHeart /> My Wishlists</h1>
        <div className="create-wishlist">
          <input
            type="text"
            placeholder="New wishlist name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && createWishlist()}
          />
          <button className="btn-primary" onClick={createWishlist}><FiPlus /> Create</button>
        </div>
      </div>

      {loadError && (
        <div className="admin-error" role="alert">
          <span>{loadError}</span>
          <button type="button" onClick={() => { setLoading(true); fetchWishlists(); }}>Try again</button>
        </div>
      )}

      {loadError ? null : wishlists.length === 0 ? (
        <div className="empty-state">
          <FiHeart size={48} />
          <h3>No wishlists yet</h3>
          <p>Create a wishlist to save your favorite items</p>
        </div>
      ) : (
        <div className="wishlists-grid">
          {wishlists.map((wl) => (
            <div key={wl.id} className="wishlist-card">
              <div className="wishlist-header">
                <h3>{wl.name}</h3>
                <button className="btn-icon" onClick={() => deleteWishlist(wl.id)}><FiTrash2 /></button>
              </div>
              <p className="wishlist-count">{wl.items?.length || 0} items</p>
              {wl.items?.length > 0 ? (
                <div className="wishlist-items">
                  {wl.items.map((item) => (
                    <div key={item.id} className="wishlist-item">
                      <div className="wishlist-item-image">
                        <img
                          src={getProductImageUrl(item.product) || '/images/product-placeholder.svg'}
                          alt={item.product?.images?.[0]?.altText || item.product?.name || 'Product'}
                          onError={(e) => { e.currentTarget.src = '/images/product-placeholder.svg'; }}
                        />
                      </div>
                      <div className="wishlist-item-info">
                        <Link to={`/product/${item.product?.slug}`}><h4>{item.product?.name}</h4></Link>
                        <p>₹{item.product?.effectivePrice?.toLocaleString()}</p>
                      </div>
                      <div className="wishlist-item-actions">
                        <button className="btn-small" onClick={() => moveToCart(wl.id, item.id)} title="Move to Cart"><FiShoppingCart /></button>
                        <button className="btn-small-danger" onClick={() => removeItem(wl.id, item.id)} title="Remove"><FiTrash2 /></button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="empty-wishlist-msg">No items yet</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}