import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('stats');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
    fetchStats();
  }, [user, navigate]);

  const fetchStats = async () => {
    try {
      const response = await API.get('/admin/stats');
      setStats(response.data.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await API.get('/admin/users');
      setUsers(response.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      const response = await API.get('/admin/products');
      setProducts(response.data.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await API.get('/admin/orders');
      setOrders(response.data.data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      await API.delete(`/admin/users/${userId}`);
      alert('User deleted successfully');
      fetchUsers();
      fetchStats();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product?')) {
      return;
    }

    try {
      await API.delete(`/admin/products/${productId}`);
      alert('Product deleted successfully');
      fetchProducts();
      fetchStats();
    } catch (error) {
      alert('Failed to delete product');
    }
  };

  useEffect(() => {
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'products') fetchProducts();
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab]);

  if (!user || user.role !== 'admin') {
    return null;
  }

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading admin dashboard...</p>;
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '20px auto', padding: '0 20px' }}>
      <h1>🔐 Admin Dashboard</h1>
      <p style={{ color: '#666', marginBottom: '30px' }}>Welcome, {user.name}! Manage your marketplace here.</p>

      {/* Stats Cards */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginBottom: '30px' }}>
          <div style={{ background: '#e3f2fd', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '36px', color: '#1976d2' }}>{stats.totalUsers}</h2>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Total Users</p>
          </div>
          <div style={{ background: '#f3e5f5', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '36px', color: '#7b1fa2' }}>{stats.totalProducts}</h2>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Total Products</p>
          </div>
          <div style={{ background: '#fff3e0', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '36px', color: '#f57c00' }}>{stats.totalOrders}</h2>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Total Orders</p>
          </div>
          <div style={{ background: '#e8f5e9', padding: '20px', borderRadius: '10px', textAlign: 'center' }}>
            <h2 style={{ margin: 0, fontSize: '36px', color: '#388e3c' }}>${stats.totalRevenue.toFixed(2)}</h2>
            <p style={{ margin: '5px 0 0 0', color: '#666' }}>Total Revenue</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ borderBottom: '2px solid #ddd', marginBottom: '20px' }}>
        <button
          onClick={() => setActiveTab('stats')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'stats' ? '#2a9d8f' : 'transparent',
            color: activeTab === 'stats' ? 'white' : '#666',
            border: 'none',
            borderRadius: '5px 5px 0 0',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginRight: '5px'
          }}
        >
          📊 Dashboard
        </button>
        <button
          onClick={() => setActiveTab('users')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'users' ? '#2a9d8f' : 'transparent',
            color: activeTab === 'users' ? 'white' : '#666',
            border: 'none',
            borderRadius: '5px 5px 0 0',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginRight: '5px'
          }}
        >
          👥 Users ({stats?.totalUsers})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'products' ? '#2a9d8f' : 'transparent',
            color: activeTab === 'products' ? 'white' : '#666',
            border: 'none',
            borderRadius: '5px 5px 0 0',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginRight: '5px'
          }}
        >
          📦 Products ({stats?.totalProducts})
        </button>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '12px 24px',
            background: activeTab === 'orders' ? '#2a9d8f' : 'transparent',
            color: activeTab === 'orders' ? 'white' : '#666',
            border: 'none',
            borderRadius: '5px 5px 0 0',
            cursor: 'pointer',
            fontWeight: 'bold'
          }}
        >
          🛒 Orders ({stats?.totalOrders})
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'stats' && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#666' }}>
          <h2>📈 Welcome to Admin Dashboard</h2>
          <p>Select a tab above to manage users, products, or orders.</p>
        </div>
      )}

      {activeTab === 'users' && (
        <div>
          <h2>User Management</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: '#2a9d8f', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Role</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Joined</th>
                  <th style={{ padding: '12px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px' }}>{u.name}</td>
                    <td style={{ padding: '12px' }}>{u.email}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        background: u.role === 'admin' ? '#e3f2fd' : u.role === 'artisan' ? '#fff3e0' : '#f3e5f5',
                        color: u.role === 'admin' ? '#1976d2' : u.role === 'artisan' ? '#f57c00' : '#7b1fa2',
                        borderRadius: '5px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      {u._id !== user.id && (
                        <button
                          onClick={() => handleDeleteUser(u._id)}
                          style={{
                            padding: '6px 12px',
                            background: '#ef4444',
                            color: 'white',
                            border: 'none',
                            borderRadius: '5px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div>
          <h2>Product Management</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {products.map(p => (
              <div key={p._id} style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '15px', background: 'white' }}>
                {p.images && p.images.length > 0 && (
                  <img
                    src={`https://handicraft-backend-azwn.onrender.com
${p.images[0].url}`}
                    alt={p.name}
                    style={{ width: '100%', height: '150px', objectFit: 'cover', borderRadius: '5px', marginBottom: '10px' }}
                  />
                )}
                <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{p.name}</h3>
                <p style={{ fontSize: '12px', color: '#666', marginBottom: '8px' }}>By: {p.artisan?.name || 'Unknown'}</p>
                <p style={{ fontSize: '18px', fontWeight: 'bold', color: '#2a9d8f', margin: '8px 0' }}>${p.price}</p>
                <p style={{ fontSize: '12px', color: '#666' }}>Stock: {p.stock}</p>
                <button
                  onClick={() => handleDeleteProduct(p._id)}
                  style={{
                    width: '100%',
                    marginTop: '10px',
                    padding: '8px',
                    background: '#ef4444',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontWeight: 'bold'
                  }}
                >
                  🗑️ Delete Product
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <h2>Order Management</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white', borderRadius: '8px', overflow: 'hidden' }}>
              <thead>
                <tr style={{ background: '#2a9d8f', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Order ID</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Total</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id} style={{ borderBottom: '1px solid #f0f0f0' }}>
                    <td style={{ padding: '12px', fontSize: '13px', fontFamily: 'monospace' }}>
                      {order._id.slice(-8).toUpperCase()}
                    </td>
                    <td style={{ padding: '12px' }}>{order.user?.name || 'Deleted User'}</td>
                    <td style={{ padding: '12px', fontWeight: 'bold' }}>${order.totalAmount}</td>
                    <td style={{ padding: '12px' }}>
                      <span style={{
                        padding: '4px 8px',
                        background: order.status === 'completed' ? '#e8f5e9' : '#fff3e0',
                        color: order.status === 'completed' ? '#388e3c' : '#f57c00',
                        borderRadius: '5px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
                        {order.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px', fontSize: '14px', color: '#666' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
