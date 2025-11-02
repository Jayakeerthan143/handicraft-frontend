import { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const Checkout = () => {
  const { cart, removeFromCart } = useContext(CartContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [checkoutItems, setCheckoutItems] = useState([]);
  const [shippingAddress, setShippingAddress] = useState({ street: '', city: '', state: '', zipCode: '', country: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const selectedItems = sessionStorage.getItem('checkoutItems');
    if (selectedItems) {
      setCheckoutItems(JSON.parse(selectedItems));
    } else if (cart.length > 0) {
      setCheckoutItems(cart);
    }
  }, [cart]);

  if (!user) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Please login to checkout</h2>
        <Link to="/login" style={{ color: '#2a9d8f', fontSize: '18px' }}>Go to Login</Link>
      </div>
    );
  }

  if (checkoutItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>No items selected for checkout</h2>
        <Link to="/cart" style={{ color: '#2a9d8f', fontSize: '18px' }}>Back to Cart</Link>
      </div>
    );
  }

  const handleChange = (e) => {
    setShippingAddress({ ...shippingAddress, [e.target.name]: e.target.value });
  };

  const getTotal = () => checkoutItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const orderData = {
        items: checkoutItems.map(item => ({ product: item._id, quantity: item.quantity })),
        shippingAddress
      };

      const response = await API.post('/orders', orderData);

      if (response.data.success) {
        checkoutItems.forEach(item => removeFromCart(item._id));
        sessionStorage.removeItem('checkoutItems');
        alert('Order placed successfully!');
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '20px auto', padding: '0 20px' }}>
      <h1>Checkout</h1>

      <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f9f9f9', borderRadius: '8px' }}>
        <h2>Order Summary</h2>
        {checkoutItems.map(item => (
          <div key={item._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #ddd' }}>
            <span>{item.name} x {item.quantity}</span>
            <span>${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '15px 10px', fontSize: '20px', fontWeight: 'bold', borderTop: '2px solid #2a9d8f', marginTop: '10px' }}>
          <span>Total:</span>
          <span>${getTotal().toFixed(2)}</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
        <h2>Shipping Address</h2>
        {error && <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Street Address</label>
          <input type="text" name="street" value={shippingAddress.street} onChange={handleChange} required style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '5px' }} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>City</label>
            <input type="text" name="city" value={shippingAddress.city} onChange={handleChange} required style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '5px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>State</label>
            <input type="text" name="state" value={shippingAddress.state} onChange={handleChange} required style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '5px' }} />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>ZIP Code</label>
            <input type="text" name="zipCode" value={shippingAddress.zipCode} onChange={handleChange} required style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '5px' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Country</label>
            <input type="text" name="country" value={shippingAddress.country} onChange={handleChange} required style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '5px' }} />
          </div>
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: loading ? '#ccc' : '#2a9d8f', color: 'white', border: 'none', borderRadius: '5px', fontSize: '18px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '20px' }}>
          {loading ? 'Placing Order...' : 'Place Order (Cash on Delivery)'}
        </button>
      </form>
    </div>
  );
};

export default Checkout;
