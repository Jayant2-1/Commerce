import { useCallback, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import {
  FiAlertCircle,
  FiEdit2,
  FiPlus,
  FiRefreshCw,
  FiTrash2,
  FiToggleLeft,
  FiToggleRight,
  FiUser,
} from 'react-icons/fi';
import { adminApi } from '../../api/admin';

const emptyForm = {
  fullName: '',
  email: '',
  password: '',
  phone: '',
  role: 'USER',
  isActive: true,
  isEmailVerified: false,
};

function formatDate(value, includeTime = false) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return includeTime ? date.toLocaleString() : date.toLocaleDateString();
}

function getErrorMessage(error) {
  return error.response?.data?.message || error.message || 'Could not load users.';
}

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const loadUsers = useCallback(() => {
    return adminApi.listUsers()
      .then((response) => {
        const data = response.data?.data;
        if (!Array.isArray(data)) throw new Error('The users response was not a list.');
        setUsers(data);
        setError('');
      })
      .catch((requestError) => setError(getErrorMessage(requestError)))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const openCreate = () => {
    setEditingUser(null);
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setForm({
      fullName: user.fullName || '',
      email: user.email || '',
      password: '',
      phone: user.phone || '',
      role: user.role?.replace(/^ROLE_/, '') || 'USER',
      isActive: Boolean(user.isActive),
      isEmailVerified: Boolean(user.isEmailVerified),
    });
    setShowForm(true);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    const payload = {
      ...form,
      fullName: form.fullName.trim(),
      email: form.email.trim(),
      password: form.password.trim() || null,
      phone: form.phone.trim() || null,
    };

    try {
      if (editingUser) {
        await adminApi.updateUser(editingUser.id, payload);
        toast.success('User updated');
      } else {
        await adminApi.createUser(payload);
        toast.success('User created');
      }
      setShowForm(false);
      setEditingUser(null);
      await loadUsers();
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  };

  const toggleStatus = async (user) => {
    try {
      const response = await adminApi.updateUserStatus(user.id, !user.isActive);
      const updatedUser = response.data?.data;
      setUsers((currentUsers) => currentUsers.map((currentUser) => (
        currentUser.id === user.id ? updatedUser : currentUser
      )));
      toast.success(`User ${updatedUser.isActive ? 'activated' : 'deactivated'}`);
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    }
  };

  const deleteUser = async (user) => {
    if (!window.confirm(`Delete ${user.fullName || user.email} permanently?`)) return;
    try {
      await adminApi.deleteUser(user.id);
      setUsers((currentUsers) => currentUsers.filter((currentUser) => currentUser.id !== user.id));
      toast.success('User deleted');
    } catch (requestError) {
      toast.error(getErrorMessage(requestError));
    }
  };

  return (
    <div className="admin-page user-management">
      <div className="admin-page-header">
        <h1><FiUser aria-hidden="true" /> User Management</h1>
        <button className="btn-primary" type="button" onClick={openCreate}>
          <FiPlus /> Create User
        </button>
      </div>
      <p className="page-meta">{users.length} records</p>

      {showForm && (
        <form className="create-user-card" onSubmit={handleSubmit}>
          <h2>{editingUser ? 'Edit User' : 'Create User'}</h2>
          <div className="form-grid">
            <label>
              Full name
              <input
                autoComplete="name"
                required
                maxLength={100}
                value={form.fullName}
                onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              />
            </label>
            <label>
              Email
              <input
                type="email"
                autoComplete="email"
                required
                maxLength={255}
                value={form.email}
                onChange={(event) => setForm({ ...form, email: event.target.value })}
              />
            </label>
            <label>
              {editingUser ? 'New password (optional)' : 'Password'}
              <input
                type="password"
                autoComplete="new-password"
                required={!editingUser}
                minLength={8}
                maxLength={72}
                placeholder={editingUser ? 'Leave blank to keep current password' : ''}
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
              />
            </label>
            <label>
              Phone
              <input
                type="tel"
                pattern="[0-9]{10,15}"
                maxLength={15}
                placeholder="Optional"
                value={form.phone}
                onChange={(event) => setForm({ ...form, phone: event.target.value })}
              />
            </label>
            <label>
              Role
              <select value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                <option value="USER">Customer</option>
                <option value="ADMIN">Admin</option>
              </select>
            </label>
            <div className="user-form-options">
              <label>
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
                />
                Active
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.isEmailVerified}
                  onChange={(event) => setForm({ ...form, isEmailVerified: event.target.checked })}
                />
                Email verified
              </label>
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Saving...' : editingUser ? 'Save Changes' : 'Create User'}
            </button>
          </div>
        </form>
      )}

      {error && (
        <div className="admin-error" role="alert">
          <FiAlertCircle />
          <span>{error}</span>
          <button type="button" onClick={() => { setLoading(true); loadUsers(); }}>
            <FiRefreshCw /> Try again
          </button>
        </div>
      )}

      {loading ? (
        <div className="page-loading"><div className="spinner" /></div>
      ) : !error && (
        <div className="users-grid">
          {users.length === 0 ? (
            <div className="empty-state-card">
              <FiUser size={36} />
              <p>No users found.</p>
            </div>
          ) : users.map((user) => (
            <article key={user.id} className="user-card">
              <div className="user-card-glow" />
              <div className="user-card-header">
                <div className="user-avatar">
                  {user.profileImageUrl ? (
                    <img src={user.profileImageUrl} alt="" />
                  ) : (
                    (user.fullName || user.email || '?').charAt(0).toUpperCase()
                  )}
                </div>
                <div className="user-card-info">
                  <h2>{user.fullName || 'Unnamed user'}</h2>
                  <p title={user.email}>{user.email}</p>
                  <span className={`badge ${user.role === 'ADMIN' || user.role === 'ROLE_ADMIN' ? 'admin' : 'user'}`}>
                    {(user.role || 'USER').replace(/^ROLE_/, '') === 'ADMIN' ? 'Admin' : 'Customer'}
                  </span>
                </div>
              </div>
              <div className="user-card-body">
                <p><strong>Phone:</strong> {user.phone || '-'}</p>
                <p><strong>Active:</strong> {user.isActive ? 'Yes' : 'No'}</p>
                <p><strong>Verified:</strong> {user.isEmailVerified ? 'Yes' : 'No'}</p>
                <p><strong>Last login:</strong> {formatDate(user.lastLoginAt, true)}</p>
                <p><strong>Joined:</strong> {formatDate(user.createdAt)}</p>
                <p><strong>Updated:</strong> {formatDate(user.updatedAt, true)}</p>
              </div>
              <div className="user-card-actions">
                <button className="btn-small" type="button" onClick={() => openEdit(user)}>
                  <FiEdit2 /> Edit
                </button>
                <button
                  className="btn-small"
                  type="button"
                  onClick={() => toggleStatus(user)}
                  title={user.isActive ? 'Deactivate user' : 'Activate user'}
                >
                  {user.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                  {user.isActive ? 'Active' : 'Inactive'}
                </button>
                <button className="btn-small-danger" type="button" onClick={() => deleteUser(user)}>
                  <FiTrash2 /> Delete
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
