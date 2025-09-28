import React, { useState, useEffect } from 'react';
import './ListProduct.css';
import cross_icon from '../../assets/cross_icon.png';
import Notification from '../Notification/Notification';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL;

const ListProduct = () => {
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notification, setNotification] = useState(null);
  const [editingProduct, setEditingProduct] = useState(null);

  const [editForm, setEditForm] = useState({
    name: '',
    new_price: '',
    old_price: '',
    category: '',
    stock: '',
    specifications: '',
    packageIncludes: '',
    description: '',
    reviews: ''
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
  };

  const fetchInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('Token not found. Please log in.');

      const res = await fetch(`${API_BASE_URL}/items`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Status ${res.status}`);
      }

      const data = await res.json();
      setAllProducts(data);
      setError(null);
    } catch (error) {
      console.error('Fetch error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInfo();
  }, []);

  const removeProduct = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return showNotification('Token not found. Please log in.', 'error');

      const res = await fetch(`${API_BASE_URL}/items/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const result = await res.json();

      if (res.ok) {
        showNotification('Product removed successfully', 'success');
        fetchInfo();
      } else {
        showNotification(result.error || 'Failed to remove product', 'error');
      }
    } catch (error) {
      showNotification('Something went wrong', 'error');
      console.error('Delete error:', error);
    }
  };

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      new_price: product.new_price,
      old_price: product.old_price,
      category: product.category || '',
      stock: product.stock ?? '',
      specifications: product.specifications || '',
      packageIncludes: product.packageIncludes || '',
      description: product.description || '',
      reviews: Array.isArray(product.reviews) ? product.reviews.join(', ') : product.reviews || ''
    });
  };

  const handleUpdate = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${API_BASE_URL}/items/${editingProduct._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editForm),
      });

      if (res.ok) {
        showNotification('Product updated successfully');
        setEditingProduct(null);
        fetchInfo();
      } else {
        const data = await res.json();
        showNotification(data.error || 'Update failed', 'error');
      }
    } catch (error) {
      console.error('Update error:', error);
      showNotification('Something went wrong while updating', 'error');
    }
  };

  return (
    <div className="list-product">
      <h1>All Product List</h1>

      {notification && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}

      {loading ? (
        <p>Loading products...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>Error: {error}</p>
      ) : allProducts.length === 0 ? (
        <p>No products found.</p>
      ) : (
        <div className="listproduct-container">
          <div className="listproduct-format-main">
            <p>Image</p>
            <p>Name</p>
            <p>New Price</p>
            <p>Old Price</p>
            <p>Category</p>
            <p>Stock</p>
            <p>Remove</p>
            <p>Edit</p>
          </div>
          {allProducts.map(product => (
            <div key={product._id} className="listproduct-format">
              <img src={product.image?.[0]} alt="product" className="listproduct-product-icon" />
              <p>{product.name}</p>
              <p>LKR{product.new_price}</p>
              <p>LKR{product.old_price}</p>
              <p>{product.category || 'N/A'}</p>
              <p>{product.stock ?? 'N/A'}</p>
              <img
                src={cross_icon}
                alt="remove"
                onClick={() => removeProduct(product._id)}
                className="listproduct-remove-icon"
              />
              <button className="listproduct-edit-button" onClick={() => handleEditClick(product)}>Edit</button>
            </div>
          ))}
        </div>
      )}

      {editingProduct && (
        <div className="edit-product-form">
          <h3>Edit Product: {editingProduct.name}</h3>
          <input type="text" placeholder="Name" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
          <input type="number" placeholder="New Price" value={editForm.new_price} onChange={(e) => setEditForm({ ...editForm, new_price: e.target.value })} />
          <input type="number" placeholder="Old Price" value={editForm.old_price} onChange={(e) => setEditForm({ ...editForm, old_price: e.target.value })} />
          <input type="text" placeholder="Category" value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} />
          <input type="number" placeholder="Stock" value={editForm.stock} onChange={(e) => setEditForm({ ...editForm, stock: e.target.value })} />
          <textarea
  placeholder="Specifications (comma separated)"
  rows="5"
  className="large-textarea"
  value={editForm.specifications}
  onChange={(e) => setEditForm({ ...editForm, specifications: e.target.value })}
/>

<textarea
  placeholder="Package Includes (comma separated)"
  rows="5"
  className="large-textarea"
  value={editForm.packageIncludes}
  onChange={(e) => setEditForm({ ...editForm, packageIncludes: e.target.value })}
/>

<textarea
  placeholder="Description"
  rows="6"
  className="large-textarea"
  value={editForm.description}
  onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
/>

<textarea
  placeholder="Reviews (comma separated)"
  rows="5"
  className="large-textarea"
  value={editForm.reviews}
  onChange={(e) => setEditForm({ ...editForm, reviews: e.target.value })}
/>

          <button onClick={handleUpdate}>Save</button>
          <button onClick={() => setEditingProduct(null)}>Cancel</button>
        </div>
      )}
    </div>
  );
};

export default ListProduct;
