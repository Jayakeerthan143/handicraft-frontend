import { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../services/api';

const ArtisanProducts = () => {
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: '',
    stock: '',
    materials: ''
  });

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingProducts, setFetchingProducts] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingStock, setEditingStock] = useState(null);
  
  // Image states
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  
  // ✅ NEW: Edit product states
  const [editingProduct, setEditingProduct] = useState(null);
  const [editFormData, setEditFormData] = useState({});
  const [primaryImageIndex, setPrimaryImageIndex] = useState(0);

  useEffect(() => {
    fetchCategories();
    fetchArtisanProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await API.get('/categories');
      setCategories(response.data.data);
      if (response.data.data.length > 0) {
        setFormData(prev => ({ ...prev, category: response.data.data[0]._id }));
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  };

  const fetchArtisanProducts = async () => {
    try {
      setFetchingProducts(true);
      const response = await API.get('/products');
      const myProducts = response.data.data.filter(
        product => product.artisan._id === user.id
      );
      setProducts(myProducts);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setFetchingProducts(false);
    }
  };

  if (!user || user.role !== 'artisan') {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>Access Denied</h2>
        <p>Only artisans can access this page</p>
      </div>
    );
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setImageFiles(files);
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('category', formData.category);
      formDataToSend.append('stock', formData.stock);
      formDataToSend.append('materials', formData.materials);

      imageFiles.forEach(file => {
        formDataToSend.append('images', file);
      });

      const response = await API.post('/products', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      if (response.data.success) {
        setSuccess('Product created successfully!');
        setFormData({
          name: '',
          description: '',
          price: '',
          category: categories.length > 0 ? categories[0]._id : '',
          stock: '',
          materials: ''
        });
        setImageFiles([]);
        setImagePreviews([]);
        fetchArtisanProducts();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
      setTimeout(() => setError(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (productId, newStock) => {
    try {
      const response = await API.put(`/products/${productId}`, { stock: newStock });
      if (response.data.success) {
        fetchArtisanProducts();
        setEditingStock(null);
        setSuccess('Stock updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to update stock');
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await API.delete(`/products/${productId}`);
      if (response.data.success) {
        setSuccess('Product deleted successfully!');
        fetchArtisanProducts();
        setTimeout(() => setSuccess(''), 3000);
      }
    } catch (err) {
      setError('Failed to delete product');
      setTimeout(() => setError(''), 3000);
    }
  };

  // ✅ NEW: Open edit modal
  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setEditFormData({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category._id,
      stock: product.stock,
      materials: product.materials || ''
    });
    setPrimaryImageIndex(0);
  };

  // ✅ NEW: Handle edit form changes
  const handleEditChange = (e) => {
    setEditFormData({
      ...editFormData,
      [e.target.name]: e.target.value
    });
  };

  // ✅ NEW: Save edited product
// ✅ UPDATED: Save edited product
const handleSaveEdit = async () => {
  try {
    // First update the basic product details
    const response = await API.put(`/products/${editingProduct._id}`, editFormData);
    
    // Then reorder images if primary changed
    if (primaryImageIndex !== 0) {
      await API.put(`/products/${editingProduct._id}/reorder-images`, {
        primaryImageIndex
      });
    }
    
    if (response.data.success) {
      setSuccess('Product updated successfully!');
      setEditingProduct(null);
      fetchArtisanProducts();
      setTimeout(() => setSuccess(''), 3000);
    }
  } catch (err) {
    setError('Failed to update product');
    setTimeout(() => setError(''), 3000);
  }
};


  // ✅ NEW: Reorder images when primary changes
  const getReorderedImages = (images, primaryIndex) => {
    if (!images || images.length === 0) return [];
    const reordered = [...images];
    const primaryImage = reordered.splice(primaryIndex, 1)[0];
    return [primaryImage, ...reordered];
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '20px auto', padding: '0 20px' }}>
      <h1>My Products</h1>

      {/* Global Success/Error Messages */}
      {success && <div style={{ padding: '10px', background: '#e8f5e9', color: '#2e7d32', borderRadius: '5px', marginBottom: '15px' }}>{success}</div>}
      {error && <div style={{ padding: '10px', background: '#ffebee', color: '#c62828', borderRadius: '5px', marginBottom: '15px' }}>{error}</div>}

      {/* Product List Section */}
      <div style={{ marginBottom: '40px' }}>
        <h2>Your Products ({products.length})</h2>
        
        {fetchingProducts ? (
          <p>Loading products...</p>
        ) : products.length === 0 ? (
          <p style={{ color: '#666', fontStyle: 'italic' }}>You haven't created any products yet.</p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }}>
            {products.map(product => (
              <div key={product._id} style={{ 
                border: '1px solid #ddd', 
                padding: '15px', 
                borderRadius: '8px',
                backgroundColor: '#f9f9f9'
              }}>
                {/* Product Image */}
                {product.images && product.images.length > 0 ? (
                  <div style={{ position: 'relative' }}>
                    <img
                     src={`https://handicraft-backend-azwn.onrender.com${product.images[0]}`}

                      alt={product.name}
                      style={{
                        width: '100%',
                        height: '220px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        marginBottom: '10px'
                      }}
                    />
                    {product.images.length > 1 && (
                      <span style={{
                        position: 'absolute',
                        bottom: '15px',
                        right: '15px',
                        background: 'rgba(0,0,0,0.7)',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 'bold'
                      }}>
                        📸 {product.images.length}
                      </span>
                    )}
                  </div>
                ) : (
                  <div style={{
                    width: '100%',
                    height: '220px',
                    background: 'linear-gradient(135deg, #e9f5f4 0%, #c7e9e5 100%)',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: '10px',
                    color: '#666',
                    fontSize: '14px'
                  }}>
                    📷 No Image
                  </div>
                )}

                <h3 style={{ marginTop: 0, color: '#2a9d8f' }}>{product.name}</h3>
                <p style={{ color: '#666', fontSize: '14px', minHeight: '60px' }}>{product.description}</p>
                
                {product.materials && (
                  <p style={{ fontSize: '12px', color: '#888', marginTop: '5px' }}>
                    <strong>Materials:</strong> {product.materials}
                  </p>
                )}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                  <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#2a9d8f' }}>${product.price}</span>
                  
                  {editingStock === product._id ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <button
                        onClick={() => handleStockUpdate(product._id, Math.max(0, product.stock - 1))}
                        style={{ padding: '5px 10px', cursor: 'pointer' }}
                      >
                        -
                      </button>
                      <span style={{ fontWeight: 'bold', minWidth: '30px', textAlign: 'center' }}>{product.stock}</span>
                      <button
                        onClick={() => handleStockUpdate(product._id, product.stock + 1)}
                        style={{ padding: '5px 10px', cursor: 'pointer' }}
                      >
                        +
                      </button>
                      <button
                        onClick={() => setEditingStock(null)}
                        style={{ padding: '5px 10px', background: '#e76f51', color: 'white', border: 'none', borderRadius: '3px', cursor: 'pointer', marginLeft: '5px' }}
                      >
                        Done
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setEditingStock(product._id)}
                      style={{ 
                        padding: '5px 10px', 
                        background: '#f0f0f0', 
                        border: '1px solid #ddd', 
                        borderRadius: '5px', 
                        cursor: 'pointer',
                        fontSize: '12px'
                      }}
                    >
                      Stock: {product.stock} ✏️
                    </button>
                  )}
                </div>

                <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid #ddd' }}>
                  <small style={{ color: '#888' }}>Created: {new Date(product.createdAt).toLocaleDateString()}</small>
                </div>

                {/* ✅ NEW: Edit and Delete Buttons */}
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    onClick={() => handleEditProduct(product)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#2a9d8f',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    ✏️ Edit
                  </button>
                  <button
                    onClick={() => handleDeleteProduct(product._id)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#ef4444',
                      color: 'white',
                      border: 'none',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      fontWeight: 'bold'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ✅ NEW: Edit Product Modal */}
      {editingProduct && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            padding: '30px',
            borderRadius: '12px',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '90vh',
            overflowY: 'auto'
          }}>
            <h2 style={{ marginTop: 0 }}>Edit Product</h2>

            {/* ✅ Select Primary Image */}
            {editingProduct.images && editingProduct.images.length > 1 && (
              <div style={{ marginBottom: '20px' }}>
                <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>
                  Select Primary Image (Click to set as main)
                </label>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {editingProduct.images.map((image, index) => (
                    <div
                      key={index}
                      onClick={() => setPrimaryImageIndex(index)}
                      style={{
                        width: '100px',
                        height: '100px',
                        cursor: 'pointer',
                        border: primaryImageIndex === index ? '3px solid #2a9d8f' : '2px solid #ddd',
                        borderRadius: '8px',
                        overflow: 'hidden',
                        position: 'relative'
                      }}
                    >
                      <img
src={image}

                        alt={`Product ${index + 1}`}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                      {primaryImageIndex === index && (
                        <span style={{
                          position: 'absolute',
                          bottom: '5px',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          background: '#2a9d8f',
                          color: 'white',
                          padding: '3px 8px',
                          fontSize: '10px',
                          borderRadius: '3px',
                          fontWeight: 'bold'
                        }}>
                          PRIMARY
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Product Name</label>
              <input
                type="text"
                name="name"
                value={editFormData.name}
                onChange={handleEditChange}
                style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description</label>
              <textarea
                name="description"
                value={editFormData.description}
                onChange={handleEditChange}
                rows="4"
                style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Materials</label>
              <input
                type="text"
                name="materials"
                value={editFormData.materials}
                onChange={handleEditChange}
                style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '5px' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Price ($)</label>
                <input
                  type="number"
                  name="price"
                  value={editFormData.price}
                  onChange={handleEditChange}
                  style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Stock</label>
                <input
                  type="number"
                  name="stock"
                  value={editFormData.stock}
                  onChange={handleEditChange}
                  style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '5px' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category</label>
              <select
                name="category"
                value={editFormData.category}
                onChange={handleEditChange}
                style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '5px' }}
              >
                {categories.map(cat => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSaveEdit}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#2a9d8f',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                💾 Save Changes
              </button>
              <button
                onClick={() => setEditingProduct(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  background: '#666',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '16px'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <hr style={{ margin: '40px 0', border: 'none', borderTop: '2px solid #ddd' }} />

      {/* Create Product Form */}
      <div>
        <h2>Create New Product</h2>

        <form onSubmit={handleSubmit} style={{ marginTop: '30px' }}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Product Name</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '5px' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} required rows="4" style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '5px' }} />
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Materials Used</label>
            <input 
              type="text" 
              name="materials" 
              value={formData.materials} 
              onChange={handleChange} 
              placeholder="e.g., Wood, Clay, Cotton, Metal" 
              style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '5px' }} 
            />
            <small style={{ color: '#666' }}>Optional: List the materials used to create this product</small>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Category</label>
            <select 
              name="category" 
              value={formData.category} 
              onChange={handleChange} 
              required 
              style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '5px' }}
            >
              <option value="">Select Category</option>
              {categories.map(cat => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginBottom: '15px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Price ($)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} required min="0" step="0.01" style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '5px' }} />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Stock</label>
              <input type="number" name="stock" value={formData.stock} onChange={handleChange} required min="0" style={{ width: '100%', padding: '10px', fontSize: '16px', border: '1px solid #ddd', borderRadius: '5px' }} />
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Product Images (Max 5)</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              style={{
                width: '100%',
                padding: '10px',
                border: '2px dashed #2a9d8f',
                borderRadius: '5px',
                cursor: 'pointer',
                background: '#f9f9f9'
              }}
            />
            <small style={{ color: '#666', display: 'block', marginTop: '5px' }}>
              📷 Upload up to 5 images (JPG, PNG, WEBP). First image will be the main product image.
            </small>

            {imagePreviews.length > 0 && (
              <div style={{ display: 'flex', gap: '10px', marginTop: '15px', flexWrap: 'wrap' }}>
                {imagePreviews.map((preview, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img
                      src={preview}
                      alt={`Preview ${index + 1}`}
                      style={{
                        width: '120px',
                        height: '120px',
                        objectFit: 'cover',
                        borderRadius: '8px',
                        border: index === 0 ? '3px solid #2a9d8f' : '2px solid #ddd'
                      }}
                    />
                    {index === 0 && (
                      <span style={{
                        position: 'absolute',
                        bottom: '5px',
                        left: '5px',
                        background: '#2a9d8f',
                        color: 'white',
                        padding: '3px 8px',
                        fontSize: '11px',
                        borderRadius: '3px',
                        fontWeight: 'bold'
                      }}>
                        PRIMARY
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button type="submit" disabled={loading} style={{ width: '100%', padding: '15px', background: loading ? '#ccc' : '#2a9d8f', color: 'white', border: 'none', borderRadius: '5px', fontSize: '18px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '20px' }}>
            {loading ? 'Creating Product...' : 'Create Product'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ArtisanProducts;
