import { useState } from 'react';
import { adminApi } from '../../api/admin';
import { FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { reviewApi } from '../../api/reviews';

function getErrorMessage(error) {
  return error.response?.data?.message || error.message || 'Could not load reviews.';
}

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [loadError, setLoadError] = useState('');

  const fetchReviews = async () => {
    setLoading(true);
    setLoadError('');
    try {
      const res = await adminApi.searchProducts({ page: 0, size: 100 });
      const products = res.data.data?.content;
      if (!Array.isArray(products)) throw new Error('The products response was not a list.');
      const reviewsByProduct = await Promise.all(products
        .filter((product) => product.totalReviews > 0)
        .map(async (product) => {
          const reviewResponse = await reviewApi.getByProduct(product.id, { page: 0, size: 100 });
          const productReviews = reviewResponse.data?.data?.content;
          if (!Array.isArray(productReviews)) throw new Error(`Reviews for ${product.name} were not a list.`);
          return productReviews.map((review) => ({ ...review, productName: product.name }));
        }));
      setReviews(reviewsByProduct.flat());
      setFetched(true);
    } catch (err) {
      setLoadError(getErrorMessage(err));
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const moderate = async (id, status) => {
    try {
      const res = await adminApi.moderateReview(id, status);
      setReviews((currentReviews) => currentReviews.map((review) => (
        review.id === id ? { ...review, ...res.data.data, productName: review.productName } : review
      )));
      toast.success(`Review ${status.toLowerCase()}`);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Review Moderation</h1>
        <button className="btn-primary" onClick={fetchReviews} disabled={loading}>
          {loading ? 'Loading...' : fetched ? 'Refresh Reviews' : 'Load Reviews'}
        </button>
      </div>

      {loadError && <div className="admin-error" role="alert"><span>{loadError}</span></div>}
      {loading && <div className="page-loading"><div className="spinner" /></div>}
      {!loading && fetched && reviews.length === 0 && <p className="no-data">No reviews found</p>}

      {!loading && reviews.length > 0 && (
        <div className="admin-table-wrap">
          <table className="admin-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>User</th>
              <th>Rating</th>
              <th>Review</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reviews.map((r) => (
              <tr key={r.id}>
                <td>{r.productName || 'N/A'}</td>
                <td>{r.userName || 'Anonymous'}</td>
                <td>{'⭐'.repeat(r.rating)}</td>
                <td>
                  <strong>{r.title}</strong>
                  {r.body && <p className="review-body">{r.body}</p>}
                </td>
                <td>
                  <span className={`badge ${r.status?.toLowerCase()}`}>{r.status}</span>
                </td>
                <td className="actions-cell">
                  {r.status === 'PENDING' && (
                    <>
                      <button className="btn-small" onClick={() => moderate(r.id, 'APPROVED')} title="Approve">
                        <FiCheck style={{ color: '#10b981' }} />
                      </button>
                      <button className="btn-small-danger" onClick={() => moderate(r.id, 'REJECTED')} title="Reject">
                        <FiX />
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
          </table>
        </div>
      )}
    </div>
  );
}