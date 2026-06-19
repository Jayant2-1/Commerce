import { useState, useEffect } from 'react';
import { adminApi } from '../../api/admin';
import { FiSearch, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';

export default function AdminInventory() {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [updates, setUpdates] = useState({});

  const fetchProducts = () => {
    adminApi.searchProducts({ keyword: search, page: 0, size: 50 })
      .then((res) => {
        const prods = res.data.data?.content || [];
        setProducts(prods);
        prods.forEach(p => {
          if (p.inventory) {
            setUpdates(prev => ({
              ...prev,
              [p.id]: {
                stockQuantity: p.inventory.stockQuantity || 0,
                lowStockThreshold: p.inventory.lowStockThreshold || 10
              }
            }));
          }
        });
      })
      .catch(() => setProducts([]));
  };

  useEffect(() => { fetchProducts(); }, []);

  const handleUpdate = (productId, field, value) => {
    setUpdates(prev => ({
      ...prev,
      [productId]: { ...prev[productId], [field]: parseInt(value) || 0 }
    }));
  };

  const saveInventory = async (productId) => {
    const data = updates[productId];
    if (!data) return;
    try {
      await adminApi.updateInventory({
        productId,
        stockQuantity: data.stockQuantity,
        lowStockThreshold: data.lowStockThreshold
      });
      toast.success('Inventory updated');
      fetchProducts();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
  };

  return (
    <div className="admin-page">
      <h1>Inventory Management</h1>
      <div className="search-bar-admin">
        <FiSearch />
        <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
        <button className="btn-primary" onClick={fetchProducts}>Search</button>
      </div>

      <table className="admin-table">
        <thead>
          <tr>
            <th>Product</th>
            <th>SKU</th>
            <th>Stock Quantity</th>
            <th>Available</th>
            <th>Low Stock Threshold</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {products.map((p) => {
            const inv = p.inventory || {};
            const up = updates[p.id] || {};
            return (
              <tr key={p.id}>
                <td>{p.name}</td>
                <td>{p.sku}</td>
                <td>
                  <input
                    type="number"
                    className="inv-input"
                    value={up.stockQuantity ?? inv.stockQuantity ?? 0}
                    onChange={(e) => handleUpdate(p.id, 'stockQuantity', e.target.value)}
                    min="0"
                  />
                </td>
                <td>{inv.availableQuantity ?? 0}</td>
                <td>
                  <input
                    type="number"
                    className="inv-input"
                    value={up.lowStockThreshold ?? inv.lowStockThreshold ?? 10}
                    onChange={(e) => handleUpdate(p.id, 'lowStockThreshold', e.target.value)}
                    min="1"
                  />
                </td>
                <td>
                  <span className={`badge ${inv.inStock ? 'active' : 'inactive'}`}>
                    {inv.inStock ? 'In Stock' : 'Out of Stock'}
                  </span>
                </td>
                <td>
                  <button className="btn-small" onClick={() => saveInventory(p.id)}>
                    <FiSave /> Save
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}