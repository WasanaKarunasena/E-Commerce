// src/Components/DescriptionBox/DescriptionBox.jsx

import React, { useEffect, useState } from 'react';
import './DescriptionBox.css';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const DescriptionBox = ({ productId }) => {
  const [description, setDescription] = useState('');

  useEffect(() => {
    if (!productId) return;

    axios
      .get(`${API_BASE_URL}/products/${productId}`)
      .then((res) => {
        const product = res.data;
        setDescription(product.description || 'No description available for this product.');
      })
      .catch((err) => {
        console.error("Error loading product description:", err);
        setDescription('Failed to load description.');
      });
  }, [productId]);

  return (
    <div className='descriptionbox'>
      <div className="descriptionbox-description">
        <p>{description}</p>
      </div>
    </div>
  );
};

export default DescriptionBox;
