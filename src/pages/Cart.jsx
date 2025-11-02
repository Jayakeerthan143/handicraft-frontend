import { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, clearCart } = useContext(CartContext);
  const navigate = useNavigate();
  
  const [selectedItems, setSelectedItems] = useState(
    cart.reduce((acc, item) => ({ ...acc, [item._id]: true }), {})
  );

  if (cart.length === 0) {
    return (
      <div style={{ maxWidth: '1200px', margin: '50px auto', textAlign: 'center' }}>
        <h2>Your Cart is Empty</h2>
        <Link to="/" style={{ color: '#2a9d8f', fontSize: '18px' }}>Continue Shopping</Link>
      </div>
    );
  }

  const toggleItemSelection = (itemId) => {
    setSelectedItems(prev => ({ ...prev, [itemId]: !prev[itemId] }));
  };

  const toggleSelectAll = () => {
    const allSelected = cart.every(item => selectedItems[item._id]);
    const newSelection = cart.reduce((acc, item) => ({ ...acc, [item._id]: !allSelected }), {});
    setSelectedItems(newSelection);
  };

  const getSelectedItems = () => cart.filter(item => selectedItems[item._id]);

  const getSelectedTotal = () => getSelectedItems().reduce((total, item) => total + (item.price * item.quantity), 0);

  const getSelectedCount = () => getSelectedItems().reduce((sum, item) => sum + item.quantity, 0);

  const handleCheckout = () => {
    const selected = getSelectedItems();
    if (selected.length === 0) {
      alert('Please select at least one item to checkout');
      return;
    }
    sessionStorage.setItem('checkoutItems', JSON.stringify(selected));
    navigate('/checkout');
  };

  const allSelected = cart.every(item => selectedItems[item._id]);
  const selectedCount = getSelectedItems().length;

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Shopping Cart</h1>
        <button onClick={toggleSelectAll} style={{ padding: '8px 15px', background: '#f0f0f0', border: '1px solid #ddd', borderRadius: '5px', cursor: 'pointer' }}>
          {allSelected ? 'Deselect All' : 'Select All'}
        </button>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        {cart.map(item => (
          <div key={item._id} style={{ display: 'flex', alignItems: 'center', padding: '15px', marginBottom: '10px', border: '2px solid', borderColor: selectedItems[item._id] ? '#2a9d8f' : '#ddd', borderRadius: '8px', backgroundColor: selectedItems[item._id] ? '#e9f5f4' : '#f9f9f9', transition: 'all 0.2s' }}>
            <input type="checkbox" checked={selectedItems[item._id] || false} onChange={() => toggleItemSelection(item._id)} style={{ width: '20px', height: '20px', marginRight: '15px', cursor: 'pointer' }} />
            
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 5px 0' }}>{item.name}</h3>
              <p style={{ color: '#666', fontSize: '14px', margin: '0' }}>{item.description}</p>
              <p style={{ fontWeight: 'bold', color: '#2a9d8f', margin: '5px 0 0 0' }}>${item.price}</p>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginRight: '20px' }}>
              <button onClick={() => updateQuantity(item._id, item.quantity - 1)} style={{ padding: '5px 10px', cursor: 'pointer', fontSize: '16px' }}>-</button>
              <span style={{ minWidth: '30px', textAlign: 'center', fontSize: '16px', fontWeight: 'bold' }}>{item.quantity}</span>
              <button onClick={() => updateQuantity(item._id, item.quantity + 1)} style={{ padding: '5px 10px', cursor: 'pointer', fontSize: '16px' }} disabled={item.quantity >= item.stock}>+</button>
            </div>

            <div style={{ minWidth: '100px', textAlign: 'right', fontWeight: 'bold', marginRight: '20px' }}>${(item.price * item.quantity).toFixed(2)}</div>
            
            <button onClick={() => removeFromCart(item._id)} style={{ padding: '8px 15px', background: '#e76f51', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}>Remove</button>
          </div>
        ))}
      </div>
      
      <div style={{ marginTop: '30px', padding: '20px', border: '2px solid #2a9d8f', borderRadius: '8px', backgroundColor: '#e9f5f4' }}>
        <h2>Order Summary</h2>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '10px' }}>{selectedCount} of {cart.length} item(s) selected</div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', marginTop: '10px' }}>
          <span>Selected Items Total:</span>
          <span>{getSelectedCount()} items</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '20px', fontWeight: 'bold', marginTop: '10px' }}>
          <span>Total Price:</span>
          <span>${getSelectedTotal().toFixed(2)}</span>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
          <button onClick={clearCart} style={{ flex: 1, padding: '12px', background: '#e76f51', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '16px' }}>Clear Cart</button>
          <button onClick={handleCheckout} disabled={selectedCount === 0} style={{ flex: 2, padding: '12px', background: selectedCount === 0 ? '#ccc' : '#2a9d8f', color: 'white', border: 'none', borderRadius: '5px', cursor: selectedCount === 0 ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold' }}>Checkout Selected Items ({selectedCount})</button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
