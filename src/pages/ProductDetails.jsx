import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import API from '../services/api';

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useContext(CartContext);
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // ✅ Track selected image

  useEffect(() => {
    API.get(`/products/${id}`)
      .then(res => {
        setProduct(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        setError('Product not found');
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading product...</p>;
  }

  if (error || !product) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Product Not Found</h2>
        <Link to="/" style={{ color: '#2a9d8f', fontSize: '18px' }}>Back to Home</Link>
      </div>
    );
  }

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    alert(`Added ${quantity} ${product.name}(s) to cart!`);
  };

  const handleBuyNow = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    navigate('/cart');
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
      {/* Breadcrumb */}
      <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
        <Link to="/" style={{ color: '#2a9d8f', textDecoration: 'none' }}>Home</Link>
        {' > '}
        <span>{product.category.name}</span>
        {' > '}
        <span>{product.name}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
        {/* ✅ Product Image Gallery */}
        <div>
          {/* Main Image Display */}
          <div style={{ 
            width: '100%',
            height: '500px',
            background: product.images && product.images.length > 0
              ? `url(https://handicraft-backend-azwn.onrender.com
${product.images[selectedImageIndex].url}) center/cover`
              : 'linear-gradient(135deg, #e9f5f4 0%, #c7e9e5 100%)',
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px',
            color: '#666',
            border: '2px solid #2a9d8f',
            position: 'relative',
            overflow: 'hidden',
            marginBottom: '15px'
          }}>
            {(!product.images || product.images.length === 0) && (
              <div style={{ textAlign: 'center' }}>
                📷 Product Image
                <br />
                <span style={{ fontSize: '14px' }}>(No image uploaded)</span>
              </div>
            )}

            {/* Image Counter */}
            {product.images && product.images.length > 1 && (
              <div style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'rgba(0,0,0,0.7)',
                color: 'white',
                padding: '8px 12px',
                borderRadius: '20px',
                fontSize: '13px',
                fontWeight: 'bold'
              }}>
                {selectedImageIndex + 1} / {product.images.length}
              </div>
            )}

            {/* Navigation Arrows */}
            {product.images && product.images.length > 1 && (
              <>
                <button
                  onClick={() => setSelectedImageIndex(selectedImageIndex === 0 ? product.images.length - 1 : selectedImageIndex - 1)}
                  style={{
                    position: 'absolute',
                    left: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    fontSize: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ‹
                </button>
                <button
                  onClick={() => setSelectedImageIndex(selectedImageIndex === product.images.length - 1 ? 0 : selectedImageIndex + 1)}
                  style={{
                    position: 'absolute',
                    right: '15px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '40px',
                    height: '40px',
                    fontSize: '20px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  ›
                </button>
              </>
            )}
          </div>

          {/* ✅ Thumbnail Gallery */}
          {product.images && product.images.length > 1 && (
            <div style={{ 
              display: 'flex', 
              gap: '10px', 
              overflowX: 'auto',
              paddingBottom: '5px'
            }}>
              {product.images.map((image, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  style={{
                    minWidth: '90px',
                    height: '90px',
                    background: `url(https://handicraft-backend-azwn.onrender.com
${image.url}) center/cover`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    border: selectedImageIndex === index ? '3px solid #2a9d8f' : '2px solid #ddd',
                    transition: 'all 0.2s',
                    opacity: selectedImageIndex === index ? 1 : 0.6
                  }}
                  onMouseEnter={(e) => {
                    if (selectedImageIndex !== index) {
                      e.currentTarget.style.opacity = '0.8';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedImageIndex !== index) {
                      e.currentTarget.style.opacity = '0.6';
                    }
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Product Information */}
        <div>
          <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', color: '#333' }}>{product.name}</h1>
          
          {/* Category & Artisan */}
          <div style={{ marginBottom: '20px', fontSize: '14px', color: '#666' }}>
            <span style={{ 
              display: 'inline-block',
              padding: '4px 10px',
              background: '#e9f5f4',
              borderRadius: '5px',
              marginRight: '10px',
              color: '#2a9d8f',
              fontWeight: 'bold'
            }}>
              {product.category.name}
            </span>
            <span>by <strong>{product.artisan.name}</strong></span>
          </div>

          {/* Price */}
          <div style={{ 
            fontSize: '36px', 
            fontWeight: 'bold', 
            color: '#2a9d8f',
            marginBottom: '20px'
          }}>
            ${product.price}
          </div>

          {/* Stock Status */}
          <div style={{ 
            marginBottom: '20px',
            padding: '10px',
            background: product.stock > 0 ? '#e8f5e9' : '#ffebee',
            borderRadius: '5px',
            color: product.stock > 0 ? '#2e7d32' : '#c62828',
            fontWeight: 'bold'
          }}>
            {product.stock > 0 ? (
              <>✓ In Stock ({product.stock} available)</>
            ) : (
              <>✗ Out of Stock</>
            )}
          </div>

          {/* Description */}
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ marginBottom: '10px', color: '#333' }}>Description</h3>
            <p style={{ lineHeight: '1.8', color: '#666', fontSize: '16px' }}>
              {product.description}
            </p>
          </div>

          {/* Materials */}
          {product.materials && (
            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ marginBottom: '8px', color: '#333' }}>Materials</h4>
              <p style={{ color: '#666', fontSize: '15px' }}>{product.materials}</p>
            </div>
          )}

          {/* Quantity Selector */}
          {product.stock > 0 && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Quantity
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  style={{
                    padding: '10px 15px',
                    fontSize: '18px',
                    background: '#f0f0f0',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                  min="1"
                  max={product.stock}
                  style={{
                    width: '80px',
                    padding: '10px',
                    fontSize: '18px',
                    textAlign: 'center',
                    border: '1px solid #ddd',
                    borderRadius: '5px'
                  }}
                />
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  style={{
                    padding: '10px 15px',
                    fontSize: '18px',
                    background: '#f0f0f0',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    cursor: 'pointer'
                  }}
                >
                  +
                </button>
                <span style={{ color: '#666', fontSize: '14px' }}>
                  (Max: {product.stock})
                </span>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', gap: '15px' }}>
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              style={{
                flex: 1,
                padding: '15px',
                background: product.stock === 0 ? '#ccc' : '#2a9d8f',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: product.stock === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Add to Cart
            </button>
            <button
              onClick={handleBuyNow}
              disabled={product.stock === 0}
              style={{
                flex: 1,
                padding: '15px',
                background: product.stock === 0 ? '#ccc' : '#e76f51',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '18px',
                fontWeight: 'bold',
                cursor: product.stock === 0 ? 'not-allowed' : 'pointer'
              }}
            >
              Buy Now
            </button>
          </div>

          {/* Product Meta Information */}
          <div style={{ 
            marginTop: '30px',
            padding: '20px',
            background: '#f9f9f9',
            borderRadius: '8px'
          }}>
            <h4 style={{ marginTop: 0 }}>Product Information</h4>
            <table style={{ width: '100%', fontSize: '14px' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '8px 0', fontWeight: 'bold', width: '40%' }}>SKU</td>
                  <td style={{ padding: '8px 0' }}>{product._id.slice(-8).toUpperCase()}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Category</td>
                  <td style={{ padding: '8px 0' }}>{product.category.name}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Artisan</td>
                  <td style={{ padding: '8px 0' }}>{product.artisan.name}</td>
                </tr>
                <tr>
                  <td style={{ padding: '8px 0', fontWeight: 'bold' }}>Listed On</td>
                  <td style={{ padding: '8px 0' }}>
                    {new Date(product.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetails;
