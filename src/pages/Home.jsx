import { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import API from '../services/api';
import { CartContext } from '../context/CartContext';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart } = useContext(CartContext);

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    // Fetch products
    API.get('/products')
      .then(res => {
        setProducts(res.data.data);
        setFilteredProducts(res.data.data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });

    // Fetch categories
    API.get('/categories')
      .then(res => {
        setCategories(res.data.data);
      })
      .catch(err => console.error(err));
  }, []);

  // Apply filters whenever filter criteria change
  useEffect(() => {
    applyFilters();
  }, [searchTerm, selectedCategory, minPrice, maxPrice, sortBy, products]);

  const applyFilters = () => {
    let filtered = [...products];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(p => p.category?._id === selectedCategory);
    }

    // Price range filter
    if (minPrice) {
      filtered = filtered.filter(p => p.price >= Number(minPrice));
    }
    if (maxPrice) {
      filtered = filtered.filter(p => p.price <= Number(maxPrice));
    }

    // Sorting
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'name') {
      filtered.sort((a, b) => a.name.localeCompare(b.name));
    } else if (sortBy === 'newest') {
      filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    setFilteredProducts(filtered);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('newest');
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '50px' }}>Loading products...</p>;

  return (
    <div style={{ maxWidth: '1400px', margin: '20px auto', padding: '0 20px' }}>
      <h1>Handicraft Products</h1>

      {/* Search & Filter Section */}
      <div style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
        {/* Search Bar */}
        <div style={{ marginBottom: '15px' }}>
          <input
            type="text"
            placeholder="Search products by name or description..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '12px',
              fontSize: '16px',
              border: '1px solid #ddd',
              borderRadius: '5px'
            }}
          />
        </div>

        {/* Filters Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginBottom: '15px' }}>
          {/* Category Filter */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '5px' }}
            >
              <option value="">All Categories</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Min Price ($)</label>
            <input
              type="number"
              placeholder="0"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
              min="0"
              style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>

          {/* Max Price */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Max Price ($)</label>
            <input
              type="number"
              placeholder="1000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              min="0"
              style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '5px' }}
            />
          </div>

          {/* Sort By */}
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', fontSize: '14px' }}>Sort By</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{ width: '100%', padding: '8px', fontSize: '14px', border: '1px solid #ddd', borderRadius: '5px' }}
            >
              <option value="newest">Newest First</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        <button
          onClick={clearFilters}
          style={{
            padding: '8px 16px',
            background: '#e76f51',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Clear All Filters
        </button>

        {/* Results Count */}
        <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
          Showing {filteredProducts.length} of {products.length} products
        </div>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <h3>No products found</h3>
          <p>Try adjusting your filters or search term</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
          {filteredProducts.map(product => (
            <Link
              key={product._id}
              to={`/products/${product._id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                style={{
                  border: '1px solid #ddd',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  backgroundColor: '#fff',
                  transition: 'transform 0.3s, box-shadow 0.3s',
                  cursor: 'pointer',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
                }}
              >
                {/* Product Image */}
                <div style={{ 
                  width: '100%', 
                  height: '240px', 
                  background: product.images && product.images.length > 0 
                    ? `url(https://handicraft-backend-azwn.onrender.com
${product.images[0].url}) center/cover` 
                    : 'linear-gradient(135deg, #e9f5f4 0%, #c7e9e5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#888',
                  fontSize: '14px',
                  position: 'relative'
                }}>
                  {(!product.images || product.images.length === 0) && (
                    <div style={{ textAlign: 'center' }}>
                      📷 
                      <br />
                      <span style={{ fontSize: '12px' }}>No Image</span>
                    </div>
                  )}
                  
                  {/* Low Stock Badge */}
                  {product.stock < 10 && product.stock > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: '#e76f51',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}>
                      ⚠️ Low Stock
                    </span>
                  )}

                  {/* Out of Stock Badge */}
                  {product.stock === 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '12px',
                      right: '12px',
                      background: '#c62828',
                      color: 'white',
                      padding: '5px 10px',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: 'bold',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}>
                      ❌ Out of Stock
                    </span>
                  )}
                </div>

                {/* Product Info */}
                <div style={{ padding: '16px', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ margin: '0 0 8px 0', color: '#2a9d8f', fontSize: '18px', fontWeight: '600', lineHeight: '1.3' }}>
                    {product.name}
                  </h3>

                  <p style={{ color: '#666', fontSize: '14px', minHeight: '60px', marginBottom: '12px', lineHeight: '1.5' }}>
                    {product.description.substring(0, 85)}...
                  </p>

                  <div style={{ marginTop: 'auto' }}>
                    <p style={{ fontSize: '26px', fontWeight: 'bold', color: '#2a9d8f', margin: '12px 0' }}>
                      ${product.price}
                    </p>

                    <div style={{ 
                      fontSize: '12px', 
                      color: '#888', 
                      marginBottom: '12px', 
                      paddingTop: '12px', 
                      borderTop: '1px solid #f0f0f0' 
                    }}>
                      {/* ✅ FIXED: Added safety checks with ?. */}
                      <div style={{ marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600', marginRight: '5px' }}>📦</span>
                        <span>{product.category?.name || 'Unknown Category'}</span>
                      </div>
                      <div style={{ marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
                        <span style={{ fontWeight: '600', marginRight: '5px' }}>👨‍🎨</span>
                        <span>{product.artisan?.name || 'Unknown Artisan'}</span>
                      </div>
                      {product.materials && (
                        <div style={{ marginBottom: '5px', display: 'flex', alignItems: 'center' }}>
                          <span style={{ fontWeight: '600', marginRight: '5px' }}>🎨</span>
                          <span style={{ 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis', 
                            whiteSpace: 'nowrap' 
                          }}>
                            {product.materials}
                          </span>
                        </div>
                      )}
                      <div style={{ 
                        color: product.stock > 10 ? '#2a9d8f' : product.stock > 0 ? '#e76f51' : '#c62828', 
                        fontWeight: 'bold',
                        marginTop: '5px'
                      }}>
                        📊 Stock: {product.stock}
                      </div>
                    </div>

                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        addToCart(product);
                      }}
                      disabled={product.stock === 0}
                      style={{
                        width: '100%',
                        padding: '12px',
                        background: product.stock === 0 ? '#ccc' : '#2a9d8f',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: product.stock === 0 ? 'not-allowed' : 'pointer',
                        fontWeight: 'bold',
                        fontSize: '15px',
                        transition: 'all 0.2s',
                        boxShadow: product.stock === 0 ? 'none' : '0 2px 8px rgba(42, 157, 143, 0.3)'
                      }}
                      onMouseEnter={(e) => {
                        if (product.stock > 0) {
                          e.currentTarget.style.background = '#218b7f';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 4px 12px rgba(42, 157, 143, 0.4)';
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (product.stock > 0) {
                          e.currentTarget.style.background = '#2a9d8f';
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 2px 8px rgba(42, 157, 143, 0.3)';
                        }
                      }}
                    >
                      {product.stock === 0 ? '❌ Out of Stock' : '🛒 Add to Cart'}
                    </button>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
