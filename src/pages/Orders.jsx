import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Orders = () => {
  const { user } = useContext(AuthContext);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;

    API.get('/orders')
      .then(res => {
        setOrders(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.response?.data?.message || 'Failed to load orders');
        setLoading(false);
      });
  }, [user]);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Please login to view orders</h2>
        <Link to="/login" style={{ color: '#2a9d8f', fontSize: '18px' }}>Go to Login</Link>
      </div>
    );
  }

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading your orders...</p>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px', color: '#e76f51' }}>
        <h3>Error loading orders</h3>
        <p>{error}</p>
      </div>
    );
  }

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getStatusLabel = (status) => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
      <h1>My Orders</h1>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', marginTop: '50px' }}>
          <h3>No orders yet</h3>
          <p style={{ color: '#666', marginBottom: '20px' }}>Start shopping to see your orders here!</p>
          <Link to="/" style={{ color: '#2a9d8f', fontSize: '18px' }}>Browse Products</Link>
        </div>
      ) : (
        <div style={{ marginTop: '30px' }}>
          {orders.map(order => (
            <div
              key={order._id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '20px',
                backgroundColor: '#fff'
              }}
            >
              {/* Order Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', paddingBottom: '15px', borderBottom: '2px solid #f0f0f0' }}>
                <div>
                  <h3 style={{ margin: '0 0 5px 0' }}>Order #{order._id.slice(-8).toUpperCase()}</h3>
                  <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                    Placed on {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '6px 12px',
                      borderRadius: '20px',
                      fontSize: '14px',
                      fontWeight: 'bold',
                      color: 'white',
                      backgroundColor: getStatusColor(order.status)
                    }}
                  >
                    {getStatusLabel(order.status)}
                  </span>
                  <p style={{ margin: '10px 0 0 0', fontSize: '18px', fontWeight: 'bold', color: '#2a9d8f' }}>
                    ${order.totalAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div style={{ marginBottom: '15px' }}>
                <h4 style={{ marginBottom: '10px', color: '#333' }}>Items ({order.items.length})</h4>
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      padding: '10px',
                      backgroundColor: '#f9f9f9',
                      borderRadius: '5px',
                      marginBottom: '8px'
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 5px 0', fontWeight: '500' }}>{item.name}</p>
                      <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                        Quantity: {item.quantity} × ${item.price}
                      </p>
                    </div>
                    <div style={{ fontWeight: 'bold', color: '#2a9d8f' }}>
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Shipping Address */}
              <div style={{ padding: '15px', backgroundColor: '#f9f9f9', borderRadius: '5px', marginBottom: '15px' }}>
                <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>Shipping Address</h4>
                <p style={{ margin: 0, fontSize: '14px', color: '#666', lineHeight: '1.6' }}>
                  {order.shippingAddress.street}<br />
                  {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.zipCode}<br />
                  {order.shippingAddress.country}
                </p>
              </div>

              {/* Payment Method */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
                  <strong>Payment Method:</strong> {order.paymentMethod || 'Cash on Delivery'}
                </p>
                <Link
                  to={`/orders/${order._id}`}
                  style={{
                    padding: '8px 16px',
                    background: '#2a9d8f',
                    color: 'white',
                    borderRadius: '5px',
                    textDecoration: 'none',
                    fontSize: '14px'
                  }}
                >
                  View Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
