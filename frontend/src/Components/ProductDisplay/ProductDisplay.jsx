// src/Components/ProductDisplay/ProductDisplay.jsx

import React, { useContext, useState, useEffect } from 'react';
import './ProductDisplay.css';
import star_icon from '../Assets/star_icon.png';
import star_dull_icon from '../Assets/star_dull_icon.png';
import { ShopContext } from '../../Context/ShopContext';
import { useNavigate, useLocation } from 'react-router-dom';

const ProductDisplay = ({ product }) => {
  const { addToCart } = useContext(ShopContext);
  const [showNotification, setShowNotification] = useState(false);
  const [selectedImage, setSelectedImage] = useState('');
  const [activeTab, setActiveTab] = useState('description');
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (Array.isArray(product.image)) {
      setSelectedImage(product.image[0]);
    } else {
      setSelectedImage(product.image || '');
    }
  }, [product]);

  const handleAddToCart = () => {
    addToCart(product._id); // Guests allowed
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  const handleBuyNow = () => {
    const token = localStorage.getItem('auth-token');
    if (!token) {
      // Redirect guest to signup, save current page so we can return later
      navigate('/login', { state: { from: location } });
    } else {
      navigate('/order-now', { state: { product } });
    }
  };

  const reviewsArray = (() => {
    if (!product.reviews) return [];
    if (Array.isArray(product.reviews)) return product.reviews;
    if (typeof product.reviews === 'string' && product.reviews.trim() !== '') {
      return product.reviews
        .split(/\r?\n/)
        .map(r => r.trim())
        .filter(r => r.length > 0);
    }
    return [];
  })();

  const specsArray = product.specifications
    ? product.specifications.split(',').map(s => s.trim()).filter(s => s.length > 0)
    : [];

  const packageArray = product.packageIncludes
    ? product.packageIncludes.split(',').map(p => p.trim()).filter(p => p.length > 0)
    : [];

  return (
    <div className='productdisplay'>
      {showNotification && (
        <div className="custom-notification">
          ✅ <strong>{product.name}</strong> added to cart!
        </div>
      )}

      <div className="productdisplay-left">
        <div className="productdisplay-img">
          <img className='productdisplay-main-img' src={selectedImage} alt="Main" />
        </div>

        <div className="productdisplay-img-list">
          {Array.isArray(product.image) && product.image.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`thumb-${index}`}
              onClick={() => setSelectedImage(img)}
              className={selectedImage === img ? 'active' : ''}
            />
          ))}
        </div>
      </div>

      <div className="productdisplay-right">
        <h1>{product.name}</h1>

        <div className="productdisplay-right-star">
          <img src={star_icon} alt="star" />
          <img src={star_icon} alt="star" />
          <img src={star_icon} alt="star" />
          <img src={star_icon} alt="star" />
          <img src={star_dull_icon} alt="star dull" />
          <p>({reviewsArray.length || 0})</p>
        </div>

        <div className="productdisplay-right-prices">
          <div className="productdisplay-right-price-old">LKR {product.old_price}</div>
          <div className="productdisplay-right-price-new">LKR {product.new_price}</div>
        </div>

        {specsArray.length > 0 && (
          <div className="productdisplay-info-box">
            <h3>Specifications:</h3>
            <ul>
              {specsArray.map((spec, i) => (
                <li key={i}>{spec}</li>
              ))}
            </ul>
          </div>
        )}

        {packageArray.length > 0 && (
          <div className="productdisplay-info-box">
            <h3>Package Includes:</h3>
            <ul>
              {packageArray.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        <button onClick={handleAddToCart}>ADD TO CART</button>
        <button onClick={handleBuyNow} className="buy-now-button">BUY NOW</button>

        <p className='productdisplay-right-category'>
          <span>Category:</span> {Array.isArray(product.category) ? product.category.join(', ') : product.category}
        </p>
      </div>

      <div className="productdisplay-tabs-fullwidth">
        <div className="tabs-header">
          <button
            className={activeTab === 'description' ? 'active' : ''}
            onClick={() => setActiveTab('description')}
          >
            Description
          </button>
          <button
            className={activeTab === 'reviews' ? 'active' : ''}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews{reviewsArray.length !== 1 ? ` (${reviewsArray.length})` : ''}
          </button>
        </div>

        <div className="tabs-content">
          {activeTab === 'description' ? (
            <div>
              <p>{product.description || 'No description available.'}</p>
            </div>
          ) : (
            <div>
              {reviewsArray.length > 0 ? (
                <ul className="reviews-list">
                  {reviewsArray.map((review, index) => (
                    <li key={index}>{review}</li>
                  ))}
                </ul>
              ) : (
                <p>No reviews yet.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDisplay;
