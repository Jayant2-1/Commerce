import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    code: '', discountType: 'PERCENTAGE', discountValue: '',
    minOrderAmount: '', maxDiscountAmount: '', usageLimit: '', expiryDate: '',
    active: true
  });

  const fetchCoupons = () => {
    adminApi.listCoupons()
      .then((res) => setCoupons(res.data.data || []))
      .catch(() => setCoupons([]));
  };

  useEffect(() => { fetchCoupons(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ code: '', discountType: 'PERCENTAGE', discountValue: '', minOrderAmount: '', maxDiscountAmount: '', usageLimit: '', expiryDate: '', active: true });
    setShowForm(true);
  };

  const openEdit = (c) => {
    setEditId(c.id);
    setForm({
      code: c.code, discountType: c.discountType, discountValue: c.discountValue,
      minOrderAmount: c.minOrderAmount || '', maxDiscountAmount: c.maxDiscountAmount || '',
      usageLimit: c.usageLimit || '', expiryDate: c.expiryDate?.split('T')[0] || '',
      active: c.active
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      discountValue: parseFloat(form.discountValue),
      minOrderAmount: form.minOrderAmount ? parseFloat(form.minOrderAmount) : 0,
      maxDiscountAmount: form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : null,
      usageLimit: form.usageLimit ? parseInt(form.usageLimit) : 0,
      expiryDate: form.expiryDate ? `${form.expiryDate}T23:59:59` : null,
      active: form.active
    };
    try {
      if (editId) {
        await adminApi.updateCoupon(editId, payload);
        toast.success('Coupon updated');
      } else {
        await adminApi.createCoupon(payload);
        toast.success('Coupon created');
      }
      setShowForm(false);
      fetchCoupons();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const deactivate = async (id) => {
    if (!window.confirm('Deactivate this coupon?')) return;
    try {
      await adminApi.deactivateCoupon(id);
      toast.success('Coupon deactivated');
      fetchCoupons();
    } catch {
      toast.error('Failed');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Coupons</h1>
        <button className="btn-primary" onClick={openCreate}><FiPlus /> Add Coupon</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editId ? 'Edit Coupon' : 'Add Coupon'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <input placeholder="Code" value={form.code} onChange={(e) => setForm({...form, code: e.target.value.toUpperCase()})} required />
                <select value={form.discountType} onChange={(e) => setForm({...form, discountType: e.target.value})}>
                  <option value="PERCENTAGE">Percentage</option>
                  <option value="FIXED">Fixed Amount</option>
                </select>
              </div>
              <div className="form-row">
                <input type="number" placeholder="Discount Value" value={form.discountValue} onChange={(e) => setForm({...form, discountValue: e.target.value})} required />
                <input type="number" placeholder="Min Order Amount" value={form.minOrderAmount} onChange={(e) => setForm({...form, minOrderAmount: e.target.value})} />
              </div>
              <div className="form-row">
                <input type="number" placeholder="Max Discount" value={form.maxDiscountAmount} onChange={(e) => setForm({...form, maxDiscountAmount: e.target.value})} />
                <input type="number" placeholder="Usage Limit" value={form.usageLimit} onChange={(e) => setForm({...form, usageLimit: e.target.value})} />
              </div>
              <input type="date" placeholder="Expiry Date" value={form.expiryDate} onChange={(e) => setForm({...form, expiryDate: e.target.value})} required />
              <label className="checkbox-label">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm({...form, active: e.target.checked})} />
                Active
              </label>
              <div className="modal-actions">
                <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-primary">{editId ? 'Update' : 'Create'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className="admin-table">
        <thead>
          <tr>
            <th>Code</th>
            <th>Type</th>
            <th>Value</th>
            <th>Min Order</th>
            <th>Used</th>
            <th>Expires</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((c) => (
            <tr key={c.id}>
              <td><strong>{c.code}</strong></td>
              <td>{c.discountType}</td>
              <td>{c.discountType === 'PERCENTAGE' ? `${c.discountValue}%` : `₹${c.discountValue}`}</td>
              <td>₹{c.minOrderAmount?.toLocaleString()}</td>
              <td>{c.usedCount}/{c.usageLimit || '∞'}</td>
              <td>{new Date(c.expiryDate).toLocaleDateString()}</td>
              <td><span className={`badge ${c.active ? 'active' : 'inactive'}`}>{c.active ? 'Active' : 'Inactive'}</span></td>
              <td className="actions-cell">
                <button className="btn-small" onClick={() => openEdit(c)}><FiEdit2 /></button>
                {c.active && <button className="btn-small-danger" onClick={() => deactivate(c.id)}><FiTrash2 /></button>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}