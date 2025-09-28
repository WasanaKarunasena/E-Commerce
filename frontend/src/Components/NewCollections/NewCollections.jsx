import React, { useEffect, useState } from 'react';
import './NewCollections.css';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const NewCollections = () => {
  const [newCollection, setNewCollection] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/items/newcollection`);
        if (!response.ok) {
          const text = await response.text();
          throw new Error(`HTTP error ${response.status}: ${text}`);
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Fetched data is not an array');
        }
        setNewCollection(data);
      } catch (err) {
        console.error('❌ Error:', err.message);
        setError(err.message);
      }
    };
    fetchData();
  }, []);

  const handleProductClick = (id) => {
    navigate(`/product/${id}`);
  };

  return (
    <div className="new-collections">
      <h1>JUST ARRIVED</h1>
      <hr />
      {error ? (
        <p className="error-message">Error: {error}</p>
      ) : (
        <div className="collections">
          {newCollection.map((item) => (
            <div
              className="product-card"
              key={item._id}
              onClick={() => handleProductClick(item._id)}
              style={{ cursor: 'pointer' }}
            >
              <img src={item.image[0]} alt={item.name} />
              <h3>{item.name}</h3>
              <div className="price-container">
                <span className="new-price">LKR{item.new_price}</span>
                <span className="old-price">LKR{item.old_price}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewCollections;
