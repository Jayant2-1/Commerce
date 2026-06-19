import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { addressApi } from '../../api/addresses';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMapPin, FiPlus, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function Profile() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    fullName: '', phone: '', addressLine1: '', addressLine2: '',
    city: '', state: '', postalCode: '', country: 'India',
    addressType: 'HOME', isDefault: false
  });

  useEffect(() => {
    if (user) {
      addressApi.list().then((res) => setAddresses(res.data.data || [])).catch(() => {});
    }
  }, [user]);

  const addAddress = async (e) => {
    e.preventDefault();
    try {
      const res = await addressApi.add(form);
      setAddresses([...addresses, res.data.data]);
      setShowForm(false);
      setForm({ fullName: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', addressType: 'HOME' });
      toast.success('Address added');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const deleteAddress = async (id) => {
    try {
      await addressApi.delete(id);
      setAddresses(addresses.filter(a => a.id !== id));
      toast.success('Address deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar">{user?.fullName?.charAt(0) || 'U'}</div>
        <h2>{user?.fullName}</h2>
        <p>{user?.email}</p>
        {user?.phone && <p>{user.phone}</p>}
        <span className={`profile-role ${user?.role === 'ROLE_ADMIN' ? 'admin' : ''}`}>{user?.role}</span>
      </div>

      <section className="profile-addresses">
        <div className="section-header">
          <h2><FiMapPin /> My Addresses</h2>
          <button className="btn-outline" onClick={() => setShowForm(!showForm)}>
            <FiPlus /> {showForm ? 'Cancel' : 'Add Address'}
          </button>
        </div>

        {showForm && (
          <form className="address-form" onSubmit={addAddress}>
            <div className="form-row">
              <input placeholder="Full Name" value={form.fullName} onChange={(e) => setForm({...form, fullName: e.target.value})} required />
              <input placeholder="Phone" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} required />
            </div>
            <input placeholder="Address Line 1" value={form.addressLine1} onChange={(e) => setForm({...form, addressLine1: e.target.value})} required />
            <input placeholder="Address Line 2" value={form.addressLine2} onChange={(e) => setForm({...form, addressLine2: e.target.value})} />
            <div className="form-row three">
              <input placeholder="City" value={form.city} onChange={(e) => setForm({...form, city: e.target.value})} required />
              <input placeholder="State" value={form.state} onChange={(e) => setForm({...form, state: e.target.value})} required />
              <input placeholder="Postal Code" value={form.postalCode} onChange={(e) => setForm({...form, postalCode: e.target.value})} required />
            </div>
            <div className="form-row">
              <input placeholder="Country" value={form.country} onChange={(e) => setForm({...form, country: e.target.value})} required />
              <label className="checkbox-label">
                <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({...form, isDefault: e.target.checked})} />
                Set as default address
              </label>
            </div>
            <button type="submit" className="btn-primary">Save</button>
          </form>
        )}

        <div className="address-grid">
          {addresses.map((addr) => (
            <div key={addr.id} className="address-item">
              <div className="address-item-header">
                <strong>{addr.fullName}</strong>
                <span className="addr-type">{addr.addressType}</span>
              </div>
              <p>{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ''}</p>
              <p>{addr.city}, {addr.state} - {addr.postalCode}</p>
              <p>{addr.phone}</p>
              <button className="btn-small-danger" onClick={() => deleteAddress(addr.id)}><FiTrash2 /> Remove</button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}