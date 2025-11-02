import { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { cart } = useContext(CartContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Calculate total items in cart (sum of quantities)
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);

  return (
    <nav style={{ 
      background: '#333', 
      padding: '15px 20px', 
      color: 'white',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    }}>
      <Link to="/" style={{ color: 'white', fontSize: '20px', fontWeight: 'bold', textDecoration: 'none' }}>
        Handicraft Market
      </Link>
      
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {user && (
          <Link to="/orders" style={{ color: 'white', textDecoration: 'none' }}>
            My Orders
          </Link>
        )}
        
        <Link to="/cart" style={{ color: 'white', position: 'relative', textDecoration: 'none' }}>
          🛒 Cart
          {cartItemCount > 0 && (
            <span style={{ 
              position: 'absolute', 
              top: '-8px', 
              right: '-10px', 
              background: 'red', 
              borderRadius: '50%', 
              padding: '2px 6px', 
              fontSize: '12px',
              minWidth: '20px',
              textAlign: 'center'
            }}>
              {cartItemCount}
            </span>
          )}
        </Link>
        
        {user ? (
          <>
            <span>Welcome, {user.name}</span>
            
            {/* ✅ Admin Link */}
            {user.role === 'admin' && (
              <Link to="/admin" style={{ color: 'white', textDecoration: 'none' }}>
                🔐 Admin
              </Link>
            )}
            
            {/* Artisan Link */}
            {user.role === 'artisan' && (
              <Link to="/artisan/products" style={{ color: 'white', textDecoration: 'none' }}>
                My Products
              </Link>
            )}
            
            <button onClick={handleLogout} style={{ padding: '8px 15px', cursor: 'pointer', background: '#e76f51', color: 'white', border: 'none', borderRadius: '5px' }}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={{ color: 'white', textDecoration: 'none' }}>Login</Link>
            <Link to="/register" style={{ color: 'white', textDecoration: 'none' }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
