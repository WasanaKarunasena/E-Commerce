import React, { useEffect, useState } from 'react';
import './Hero.css';
import { Link } from 'react-router-dom';
import arrow_icon from '../Assets/arrow_icon.png';
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const getImageSrc = (value, fallback) => {
  if (!value) return fallback;
  if (value.startsWith('http')) return value; // Cloudinary or other absolute URL
  return `${API_BASE_URL}${value}`; // Local upload path
};

const Hero = () => {
  const [data, setData] = useState({});
  const [firstCategorySlug, setFirstCategorySlug] = useState(null);

  useEffect(() => {
    axios.get(`${API_BASE_URL}/content/Hero`)
      .then(res => setData(res.data.data || {}))
      .catch(err => {
        console.error('Error loading Hero content:', err);
        setData({});
      });

    axios.get(`${API_BASE_URL}/categories/public`)
      .then(res => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          const firstCat = res.data[0];
          const slug = firstCat.name.toLowerCase().replace(/\s+/g, '-');
          setFirstCategorySlug(`/${slug}`);
        }
      })
      .catch(err => console.error('Failed to fetch categories:', err));
  }, []);

  return (
    <div className='hero'>
      <div className='hero-left'>
        <h2>{data.headline || 'NEW ARRIVALS ONLY'}</h2>

        <div>
          <div className='hero-newyear-icon'>
            <p>{data.subtext || 'THIS'}</p>
            <img
              src={getImageSrc(data.subtext_img, require('../Assets/newyear_icon.png'))}
              alt="New Year Icon"
            />
          </div>

          <p>{data.line2 || 'NEW YEAR'}</p>
          <p>{data.line3 || 'UPTO 50% OFF'}</p>
        </div>

        {firstCategorySlug && (
          <Link to={firstCategorySlug} className="hero-latest-btn">
            <div>{data.buttonText || 'Explore Now'}</div>
            <img src={arrow_icon} alt="Arrow Icon" />
          </Link>
        )}
      </div>

      <div className='hero-right'>
        <img
          src={getImageSrc(data.hero_img, require('../Assets/hero_img.jpg'))}
          alt="Hero"
        />
      </div>
    </div>
  );
};

export default Hero;
