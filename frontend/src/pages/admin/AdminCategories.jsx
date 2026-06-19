import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { FiPlus, FiEdit2, FiTrash2 } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({ name: '', slug: '', description: '' });

  const fetchCategories = () => {
    adminApi.listCategories()
      .then((res) => setCategories(res.data.data || []))
      .catch(() => setCategories([]));
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
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await adminApi.deleteCategory(id);
      toast.success('Category deleted');
      fetchCategories();
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Categories</h1>
        <button className="btn-primary" onClick={openCreate}><FiPlus /> Add Category</button>
      </div>

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{editId ? 'Edit Category' : 'Add Category'}</h2>
            <form onSubmit={handleSubmit}>
              <input placeholder="Name" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required />
              <input placeholder="Slug" value={form.slug} onChange={(e) => setForm({...form, slug: e.target.value})} required />
              <textarea placeholder="Description" value={form.description} onChange={(e) => setForm({...form, description: e.target.value})} />
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
            <th>Slug</th>
            <th>Description</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((cat) => (
            <tr key={cat.id}>
              <td>{cat.name}</td>
              <td>{cat.slug}</td>
              <td>{cat.description?.slice(0, 60) || '-'}</td>
              <td className="actions-cell">
                <button className="btn-small" onClick={() => openEdit(cat)}><FiEdit2 /></button>
                <button className="btn-small-danger" onClick={() => handleDelete(cat.id)}><FiTrash2 /></button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}