import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const fetchCategories = () => {
    adminApi.listCategories()
      .then((res) => {
        const data = res.data?.data;
        if (!Array.isArray(data)) throw new Error('The categories response was not a list.');
        setCategories(data);
        setLoadError('');
      })
      .catch((err) => setLoadError(err.response?.data?.message || err.message || 'Could not load categories.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchCategories(); }, []);

  const openCreate = () => {
    setEditId(null);
    setForm({ name: '', slug: '', description: '' });
    setShowForm(true);
  };

  const openEdit = (cat) => {
    setEditId(cat.id);
    setForm({ name: cat.name, slug: cat.slug, description: cat.description || '' });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await adminApi.updateCategory(editId, form);
        toast.success('Category updated');
      } else {
        await adminApi.createCategory(form);
        toast.success('Category created');
      }
      setShowForm(false);
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to save category');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await adminApi.deleteCategory(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Failed to delete category');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Categories</h1>
        <button className="btn-primary" onClick={openCreate}><FiPlus /> Add Category</button>
      </div>
      <p className="page-meta">{categories.length} records</p>

      {showForm && (
        <form className="admin-inline-form" onSubmit={handleSubmit}>
          <h2>{editId ? 'Edit Category' : 'Add Category'}</h2>
          <div className="category-form-fields">
            <label>
              Name
              <input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                maxLength={100}
              />
            </label>
            <label>
              Slug
              <input
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })}
                required
                maxLength={120}
              />
            </label>
            <label className="category-description">
              Description
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                maxLength={500}
              />
            </label>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn-primary">{editId ? 'Save Changes' : 'Create Category'}</button>
          </div>
        </form>
      )}

      {loadError && (
        <div className="admin-error" role="alert">
          <span>{loadError}</span>
          <button type="button" onClick={() => { setLoading(true); fetchCategories(); }}>Try again</button>
        </div>
      )}

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : !loadError && (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.length === 0 ? (
                <tr><td className="no-data" colSpan="4">No categories found.</td></tr>
              ) : categories.map((cat) => (
                <tr key={cat.id}>
                  <td>{cat.name}</td>
                  <td>{cat.slug}</td>
                  <td>{cat.description?.slice(0, 60) || '-'}</td>
                  <td className="actions-cell">
                    <button className="btn-small" type="button" onClick={() => openEdit(cat)} aria-label={`Edit ${cat.name}`}><FiEdit2 /></button>
                    <button className="btn-small-danger" type="button" onClick={() => handleDelete(cat.id)} aria-label={`Delete ${cat.name}`}><FiTrash2 /></button>
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