import { useState } from 'react';
import { adminApi } from '../../api/admin';
import { FiCheck, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);

  const fetchReviews = async () => {
    setLoading(true);
    try {
      const res = await adminApi.searchProducts({ page: 0, size: 100 });
      const products = res.data.data?.content || [];
      const allReviews = [];
      for (const p of products) {
        if (p.totalReviews > 0) {
          try {
            const revRes = await import('../../api/reviews').then(m => m.reviewApi.getByProduct(p.id, { page: 0, size: 100 }));
            const productReviews = (revRes.data.data?.content || []).map(r => ({ ...r, productName: p.name }));
            allReviews.push(...productReviews);
          } catch(e) {}
        }
      }
      setReviews(allReviews);
      setFetched(true);
    } catch (err) {
      toast.error('Failed to fetch reviews');
    } finally {
      setLoading(false);
    }
  };

  const moderate = async (id, status) => {
    try {
      const res = await adminApi.moderateReview(id, status);
      setReviews(reviews.map(r => r.id === id ? res.data.data : r));
      toast.success(`Review ${status.toLowerCase()}`);
    } catch (err) {
      toast.error('Failed to moderate');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Review Moderation</h1>
        {!fetched && (
          <button className="btn-primary" onClick={fetchReviews} disabled={loading}>
            {loading ? 'Loading...' : 'Load Reviews'}
          </button>
        )}
      </div>

      {fetched && reviews.length === 0 && <p className="no-data">No reviews found</p>}

      {reviews.length > 0 && (
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
      )}
    </div>
  );
}