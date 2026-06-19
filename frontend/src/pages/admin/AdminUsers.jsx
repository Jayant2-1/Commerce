import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { toast } from 'react-toastify';
import { FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.listUsers()
      .then((res) => setUsers(res.data.data || []))
      .catch(() => setUsers([]))
      .finally(() => setLoading(false));
  }, []);

  const toggleStatus = async (userId, currentStatus) => {
    try {
      const res = await adminApi.updateUserStatus(userId, !currentStatus);
      setUsers(users.map(u => u.id === userId ? res.data.data : u));
      toast.success('User status updated');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await adminApi.deleteUser(userId);
      setUsers(users.filter(u => u.id !== userId));
      toast.success('User deleted');
    } catch (err) {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="admin-page">
      <h1>Users</h1>
      {loading ? <div className="page-loading"><div className="spinner" /></div> : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.fullName}</td>
                <td>{u.email}</td>
                <td>{u.phone || '-'}</td>
                <td><span className={`badge ${u.role === 'ROLE_ADMIN' ? 'admin' : ''}`}>{u.role}</span></td>
                <td><span className={`badge ${u.active ? 'active' : 'inactive'}`}>{u.active ? 'Active' : 'Inactive'}</span></td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td className="actions-cell">
                  <button className="btn-small" onClick={() => toggleStatus(u.id, u.active)} title={u.active ? 'Deactivate' : 'Activate'}>
                    {u.active ? <FiToggleRight /> : <FiToggleLeft />}
                  </button>
                  <button className="btn-small-danger" onClick={() => deleteUser(u.id)} title="Delete"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}