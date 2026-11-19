import { FiCheck, FiX } from 'react-icons/fi';
import { Link } from 'react-router-dom';

export default function WishlistSelectorModal({
  open,
  title = 'Add to Wishlist',
  wishlists,
  selectedWishlistId,
  onClose,
  onSelect,
  onConfirm,
  confirming = false,
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="modal-overlay wishlist-selector" onClick={onClose}>
      <div
        className="modal-content"
        role="dialog"
        aria-modal="true"
        aria-labelledby="wishlist-selector-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="modal-header">
          <h3 id="wishlist-selector-title">{title}</h3>
          <button className="modal-close" onClick={onClose} type="button" aria-label="Close wishlist selector">
            <FiX />
          </button>
        </div>
        <div className="modal-body">
          {wishlists.length === 0 ? (
            <p className="wishlist-empty">
              No wishlists yet. <Link to="/wishlists">Create one</Link> to save this product.
            </p>
          ) : (
            <div className="wishlist-options">
              {wishlists.map((wishlist) => (
                <label
                  key={wishlist.id}
                  className={`wishlist-option ${selectedWishlistId === wishlist.id ? 'selected' : ''}`}
                >
                  <input
                    type="radio"
                    name="wishlist"
                    value={wishlist.id}
                    checked={selectedWishlistId === wishlist.id}
                    onChange={() => onSelect(wishlist.id)}
                  />
                  <FiCheck />
                  <span>{wishlist.name}</span>
                </label>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose} type="button">Cancel</button>
          <button
            className="btn-primary"
            onClick={onConfirm}
            disabled={!selectedWishlistId || confirming}
            type="button"
          >
            {confirming ? 'Adding...' : 'Add to Wishlist'}
          </button>
        </div>
      </div>
    </div>
  );
}
