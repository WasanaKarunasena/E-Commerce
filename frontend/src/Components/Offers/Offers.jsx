import React, { useEffect, useState } from 'react';
import './Offers.css';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getImageSrc = (value, fallback) => {
  if (!value) return fallback;
  if (value.startsWith('http')) return value;
  return `${API_BASE_URL}${value}`;
};

const Offers = () => {
  const [data, setData] = useState({});
  const [firstCategorySlug, setFirstCategorySlug] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/content/Offers`)
      .then(res => setData(res.data.data || {}))
      .catch(err => console.error("Offers content error:", err));

    axios.get(`${API_BASE_URL}/categories/public`)
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const firstCat = res.data[0];
          const slug = firstCat.name.toLowerCase().replace(/\s+/g, '-');
          setFirstCategorySlug(`/${slug}`);
        }
      })
      .catch(err => console.error("Failed to fetch categories:", err));
  }, []);

  return (
    <div className='offers'>
      <div className="offers-left">
        <h1>{data.heading1 || 'Unmissable'}</h1>
        <h1>{data.heading2 || 'Deals Just for You'}</h1>
        <p>{data.offerText || 'Shop the Best Sellers Today!'}</p>

        {firstCategorySlug && (
          <Link to={firstCategorySlug}>
            <button>{data.buttonText || 'Shop Now'}</button>
          </Link>
        )}
      </div>

      <div className="offers-right">
        <img
          src={getImageSrc(data.offer_img, require('../Assets/exclusive_image.jpg'))}
          alt="offer"
        />
      </div>
    </div>
  );
};

export default Offers;
