import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { FiPlus, FiEdit2, FiTrash2, FiSearch } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '', discountPrice: '',
    brand: '', sku: '', categoryId: ''
  });
  const [categories, setCategories] = useState([]);

  const fetchProducts = () => {
    adminApi.searchProducts({ keyword: search, page: 0, size: 50 })
      .then((res) => setProducts(res.data.data?.content || []))
      .catch(() => setProducts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    adminApi.listCategories().then((res) => setCategories(res.data.data || [])).catch(() => {});
    fetchProducts();
  }, []);

  useEffect(() => { fetchProducts(); }, [search]);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: '', slug: '', description: '', price: '', discountPrice: '', brand: '', sku: '', categoryId: '' });
    setShowForm(true);
  };

  const openEdit = (p) => {
    setEditId(p.id);
    setForm({
      name: p.name, slug: p.slug, description: p.description || '',
      price: p.price, discountPrice: p.discountPrice || '',
      brand: p.brand || '', sku: p.sku, categoryId: p.categoryId || ''
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...form, price: parseFloat(form.price), discountPrice: form.discountPrice ? parseFloat(form.discountPrice) : null };
    try {
      if (editId) {
        await adminApi.updateProduct(editId, payload);
        toast.success('Product updated');
      } else {
        await adminApi.createProduct(payload);
        toast.success('Product created');
      }
      setShowForm(false);
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await adminApi.deleteProduct(id);
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Products</h1>
        <button className="btn-primary" onClick={openCreate}><FiPlus /> Add Product</button>
      </div>

      <div className="search-bar-admin">
        <FiSearch />
        <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editId ? 'Edit Product' : 'Add Product'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <input placeholder="Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
                <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({...form, slug: e.target.value})} required />
              </div>
              <div className="form-row">
                <input type="number" placeholder="Price" value={form.price} onChange={(e) => setForm({...form, price: e.target.value})} required />
                <input type="number" placeholder="Discount Price" value={form.discountPrice} onChange={(e) => setForm({...form, discountPrice: e.target.value})} />
              </div>
              <div className="form-row">
                <input placeholder="Brand" value={form.brand} onChange={(e) => setForm({...form, brand: e.target.value})} />
                <input placeholder="SKU" value={form.sku} onChange={(e) => setForm({...form, sku: e.target.value})} required />
              </div>
              <select value={form.categoryId} onChange={(e) => setForm({...form, categoryId: e.target.value})}>
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} rows={3} />
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
            <th>Name</th>
            <th>Brand</th>
            <th>Price</th>
            <th>Discount</th>
            <th>SKU</th>
            <th>Rating</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => (
            <tr key={p.id}>
              <td>{p.name}</td>
              <td>{p.brand}</td>
              <td>₹{p.price?.toLocaleString()}</td>
              <td>{p.discountPrice ? `₹${p.discountPrice?.toLocaleString()}` : '-'}</td>
              <td>{p.sku}</td>
              <td>⭐ {p.avgRating?.toFixed(1)}</td>
              <td className="actions-cell">
                <button className="btn-small" onClick={() => openEdit(p)}><FiEdit2 /></button>
                <button className="btn-small-danger" onClick={() => handleDelete(p.id)}><FiTrash2 /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}