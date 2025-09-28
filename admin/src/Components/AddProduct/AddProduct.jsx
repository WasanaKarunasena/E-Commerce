import React, { useState } from 'react';
import './AddProduct.css';
import upload_area from '../../assets/upload_area.svg';
import Notification from '../Notification/Notification';

const AddProduct = () => {
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  const [images, setImages] = useState([]);
  const [productDetails, setProductDetails] = useState({
    name: '',
    old_price: '',
    new_price: '',
    category: '',
    stock: '',
    specifications: '',
    packageIncludes: '',
    description: '',
    reviews: ''
  });

  const [notification, setNotification] = useState({ show: false, message: '', type: '' });

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification({ show: false, message: '', type: '' }), 3000);
  };

  const imageHandler = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 4) {
      showNotification('You can upload a maximum of 4 images.', 'error');
      return;
    }
    setImages(prev => [...prev, ...files]);
    e.target.value = '';
  };

  const removeImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const changeHandler = (e) => {
    const { name, value } = e.target;
    setProductDetails((prev) => ({
      ...prev,
      [name]: ['old_price', 'new_price', 'stock'].includes(name) ? Number(value) : value
    }));
  };

  const Add_Product = async () => {
    const { name, old_price, new_price, category, stock, specifications, packageIncludes, description, reviews } = productDetails;

    if (!name || !old_price || !new_price || !category || !stock || images.length !== 4) {
      showNotification('Fill all required fields and upload exactly 4 images.', 'error');
      return;
    }

    const token = localStorage.getItem('token');

    try {
      const formData = new FormData();
      images.forEach(img => formData.append('images', img));
      formData.append('name', name);
      formData.append('old_price', old_price);
      formData.append('new_price', new_price);
      formData.append('category', category);
      formData.append('stock', stock);
      formData.append('specifications', specifications);
      formData.append('packageIncludes', packageIncludes);
      formData.append('description', description);
      formData.append('reviews', reviews); // newline-separated

      const response = await fetch(`${BASE_URL}/items`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        showNotification('Product added successfully!', 'success');
        setProductDetails({
          name: '',
          old_price: '',
          new_price: '',
          category: '',
          stock: '',
          specifications: '',
          packageIncludes: '',
          description: '',
          reviews: ''
        });
        setImages([]);
      } else {
        console.error('Upload failed:', result);
        showNotification(result.error || 'Failed to add product.', 'error');
      }
    } catch (error) {
      console.error('Error:', error);
      showNotification('Something went wrong while adding the product.', 'error');
    }
  };

  return (
    <div className="add-product">
      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification({ show: false, message: '', type: '' })}
        />
      )}

      {/* Existing Fields */}
      <div className="addproduct-itemfield">
        <p>Product Name</p>
        <input name="name" type="text" value={productDetails.name} onChange={changeHandler} />
      </div>
      <div className="addproduct-itemfield">
        <p>Old Price</p>
        <input name="old_price" type="number" value={productDetails.old_price} onChange={changeHandler} />
      </div>
      <div className="addproduct-itemfield">
        <p>New Price</p>
        <input name="new_price" type="number" value={productDetails.new_price} onChange={changeHandler} />
      </div>
      <div className="addproduct-itemfield">
        <p>Category</p>
        <input name="category" type="text" value={productDetails.category} onChange={changeHandler} />
      </div>
      <div className="addproduct-itemfield">
        <p>Stock</p>
        <input name="stock" type="number" value={productDetails.stock} onChange={changeHandler} />
      </div>

      {/* New Fields */}
      <div className="addproduct-itemfield">
        <p>Specifications (comma separated)</p>
        <textarea name="specifications" value={productDetails.specifications} onChange={changeHandler} rows="3" />
      </div>
      <div className="addproduct-itemfield">
        <p>Package Includes (comma separated)</p>
        <textarea name="packageIncludes" value={productDetails.packageIncludes} onChange={changeHandler} rows="3" />
      </div>
      <div className="addproduct-itemfield">
        <p>Description</p>
        <textarea name="description" value={productDetails.description} onChange={changeHandler} rows="4" />
      </div>

      {/* Reviews as point form */}
      <div className="addproduct-itemfield">
        <p>Reviews (one per line)</p>
        <textarea
          name="reviews"
          value={productDetails.reviews}
          onChange={changeHandler}
          rows="3"
          placeholder="Enter each review on a new line"
        />
      </div>

      {/* Upload Images */}
      <div className="addproduct-itemfield">
        <label htmlFor="file-upload">
          <img
            src={upload_area}
            alt="upload"
            style={{
              cursor: images.length < 4 ? 'pointer' : 'not-allowed',
              opacity: images.length < 4 ? 1 : 0.5
            }}
          />
        </label>
        <input
          type="file"
          id="file-upload"
          name="images"
          accept="image/*"
          multiple
          onChange={imageHandler}
          hidden
          disabled={images.length >= 4}
        />
        {images.length > 0 && (
          <ul style={{ marginTop: '10px' }}>
            {images.map((img, i) => (
              <li key={i}>
                {img.name}
                <button type="button" style={{ marginLeft: 8 }} onClick={() => removeImage(i)}>
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button onClick={Add_Product}>Add</button>
    </div>
  );
};

export default AddProduct;
